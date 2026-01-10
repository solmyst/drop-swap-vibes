import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Image, MoreVertical, ArrowLeft, Search, Check, CheckCheck 
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  listing?: {
    id: string;
    title: string;
    images: string[];
    price: number;
  };
  last_message?: string;
  last_message_at: string;
  unread_count: number;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
      const { data: convos, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(id, title, images, price)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
        return;
      }

      // Fetch other users' profiles and unread counts
      const enrichedConvos = await Promise.all((convos || []).map(async (convo) => {
        const otherUserId = convo.buyer_id === user.id ? convo.seller_id : convo.buyer_id;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', otherUserId)
          .maybeSingle();

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convo.id)
          .neq('sender_id', user.id)
          .eq('is_read', false);

        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', convo.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...convo,
          other_user: {
            id: otherUserId,
            username: profile?.username || 'User',
            avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
          },
          listing: convo.listing,
          last_message: lastMsg?.content,
          unread_count: count || 0,
        };
      }));

      setConversations(enrichedConvos);
      setLoading(false);

      // Auto-select conversation if seller param provided
      const sellerId = searchParams.get('seller');
      const listingId = searchParams.get('listing');
      if (sellerId && user) {
        const existing = enrichedConvos.find(c => 
          (c.seller_id === sellerId && c.buyer_id === user.id) ||
          (c.buyer_id === sellerId && c.seller_id === user.id)
        );
        if (existing) {
          setSelectedConvo(existing);
        } else if (listingId) {
          // Create new conversation
          createNewConversation(sellerId, listingId);
        }
      }
    };

    fetchConversations();
  }, [user, searchParams]);

  // Create new conversation
  const createNewConversation = async (sellerId: string, listingId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        buyer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId,
      })
      .select(`
        *,
        listing:listings(id, title, images, price)
      `)
      .single();

    if (error) {
      if (error.message.includes('row-level security')) {
        toast.error('You need an active pass to start conversations');
        navigate('/pricing');
      } else {
        toast.error('Failed to start conversation');
      }
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('user_id', sellerId)
      .maybeSingle();

    const newConvo: Conversation = {
      ...data,
      other_user: {
        id: sellerId,
        username: profile?.username || 'User',
        avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerId}`,
      },
      unread_count: 0,
    };

    setConversations(prev => [newConvo, ...prev]);
    setSelectedConvo(newConvo);
  };

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConvo || !user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConvo.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        
        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', selectedConvo.id)
          .neq('sender_id', user.id);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${selectedConvo.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConvo.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          
          // Mark as read if not from current user
          if (newMsg.sender_id !== user.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvo, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvo || !user) return;
    
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConvo.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });

    if (error) {
      toast.error('Failed to send message');
      return;
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', selectedConvo.id);

    setNewMessage("");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.listing?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-20 h-screen flex">
        <div className="container mx-auto flex h-[calc(100vh-5rem)] overflow-hidden">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`w-full md:w-96 border-r border-border flex flex-col ${
              selectedConvo ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <h1 className="font-display text-xl font-bold mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted border-0 rounded-xl"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting with sellers!</p>
                </div>
              ) : (
                filteredConversations.map((convo) => (
                  <motion.button
                    key={convo.id}
                    onClick={() => setSelectedConvo(convo)}
                    className={`w-full p-4 flex gap-3 hover:bg-muted/50 transition-colors text-left ${
                      selectedConvo?.id === convo.id ? "bg-muted" : ""
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="relative">
                      <img
                        src={convo.other_user.avatar_url}
                        alt={convo.other_user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {convo.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground font-bold">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold truncate">{convo.other_user.username}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(convo.last_message_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{convo.last_message || 'No messages yet'}</p>
                      {convo.listing && (
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={convo.listing.images?.[0] || '/placeholder.svg'}
                            alt=""
                            className="w-6 h-6 rounded object-cover"
                          />
                          <span className="text-xs text-muted-foreground truncate">
                            {convo.listing.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedConvo ? "hidden md:flex" : "flex"}`}>
            {selectedConvo ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConvo(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <img
                    src={selectedConvo.other_user.avatar_url}
                    alt={selectedConvo.other_user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <span className="font-semibold">{selectedConvo.other_user.username}</span>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Listing Preview */}
                {selectedConvo.listing && (
                  <div className="p-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedConvo.listing.images?.[0] || '/placeholder.svg'}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{selectedConvo.listing.title}</p>
                        <p className="text-primary font-bold">₹{selectedConvo.listing.price}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                            msg.sender_id === user?.id
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            msg.sender_id === user?.id ? "justify-end" : "justify-start"
                          }`}>
                            <span className="text-[10px] opacity-70">{formatTime(msg.created_at)}</span>
                            {msg.sender_id === user?.id && (
                              msg.is_read ? (
                                <CheckCheck className="w-3 h-3 opacity-70" />
                              ) : (
                                <Check className="w-3 h-3 opacity-70" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-3">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Image className="w-5 h-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="bg-muted border-0 rounded-xl"
                    />
                    <Button
                      variant="hero"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <p className="font-display font-semibold text-lg">Your Messages</p>
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
