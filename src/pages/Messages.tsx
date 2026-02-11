import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Image, ArrowLeft, Search, Check, CheckCheck, X 
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
  image_url: string | null;
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
  
  // Sanitize search input
  const sanitizeSearchQuery = (query: string): string => {
    return query.trim().slice(0, 100);
  };
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          .select('content, image_url')
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
          last_message: lastMsg?.image_url ? '📷 Photo' : lastMsg?.content,
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
          createNewConversation(sellerId, listingId);
        }
      }
    };

    fetchConversations();

    // Real-time subscription for conversations updates
    const conversationsChannel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `buyer_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `seller_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, searchParams]);

  // Create new conversation
  const createNewConversation = async (sellerId: string, listingId: string) => {
    if (!user) return;

    // COMMENTED OUT - Pass system disabled
    // // First ensure user has usage record
    // const { data: existingUsage } = await supabase
    //   .from('user_usage')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .maybeSingle();

    // if (!existingUsage) {
    //   await supabase
    //     .from('user_usage')
    //     .insert({ user_id: user.id, total_chats_started: 0, total_listings_created: 0 });
    // }

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
      // COMMENTED OUT - Pass system disabled
      // if (error.message.includes('row-level security')) {
      //   toast.error('You have reached your chat limit. Upgrade your pass to chat with more sellers!');
      //   navigate('/pricing');
      // } else {
        toast.error('Failed to start conversation');
      // }
      return;
    }

    // COMMENTED OUT - Pass system disabled
    // // Update usage count
    // await supabase
    //   .from('user_usage')
    //   .update({ total_chats_started: (existingUsage?.total_chats_started || 0) + 1 })
    //   .eq('user_id', user.id);

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

      if (error) {
        console.error('❌ Error fetching messages:', error);
        return;
      }

      if (data) {
        setMessages(data);
        console.log(`📨 Fetched ${data.length} messages for conversation ${selectedConvo.id}`);
        
        // Mark messages as read
        const unreadMessages = data.filter(m => m.sender_id !== user.id && !m.is_read);
        console.log(`📖 Marking ${unreadMessages.length} messages as read`);
        
        if (unreadMessages.length > 0) {
          const { error: updateError } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', selectedConvo.id)
            .neq('sender_id', user.id)
            .eq('is_read', false);

          if (updateError) {
            console.error('❌ Error marking messages as read:', updateError);
          } else {
            console.log('✅ Messages marked as read successfully');
          }
        }
      }
    };

    fetchMessages();

    // Subscribe to new messages in real-time
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
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
          
          // Mark as read if not from current user
          if (newMsg.sender_id !== user.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConvo.id}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const cancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if ((!newMessage.trim() && !selectedImage) || !selectedConvo || !user) return;
    
    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - add message immediately to UI
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent || '',
      image_url: null,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(""); // Clear input immediately
    
    let imageUrl: string | null = null;

    // Upload image if selected
    if (selectedImage) {
      setUploadingImage(true);
      try {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}/${selectedConvo.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, selectedImage);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast.error('Failed to upload image. Please try again.');
        setUploadingImage(false);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setNewMessage(messageContent); // Restore message
        cancelImage();
        return;
      }
      setUploadingImage(false);
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConvo.id,
        sender_id: user.id,
        content: messageContent || (imageUrl ? '' : ''),
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Message send error:', error);
      toast.error('Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageContent); // Restore message
      return;
    }

    // Replace optimistic message with real one
    if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data as Message : m));
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', selectedConvo.id);

    cancelImage();
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
    <div className="fixed inset-0 bg-background dark flex flex-col">
      <Navbar />
      <main className="flex-1 flex overflow-hidden pt-16 md:pt-20 pb-16 md:pb-0">
        <div className="container mx-auto px-0 md:px-4 flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`w-full md:w-96 border-r border-border flex flex-col bg-background ${
              selectedConvo ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-border">
              <h1 className="font-display text-lg md:text-xl font-bold mb-3 md:mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
                  className="pl-10 bg-muted border-0 rounded-xl h-9 md:h-10"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
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
                    className={`w-full p-3 md:p-4 flex gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 ${
                      selectedConvo?.id === convo.id ? "bg-muted" : ""
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={convo.other_user.avatar_url}
                        alt={convo.other_user.username}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover"
                      />
                      {convo.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground font-bold">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-semibold truncate text-sm md:text-base">{convo.other_user.username}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">{formatTime(convo.last_message_at)}</span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{convo.last_message || 'No messages yet'}</p>
                      {convo.listing && (
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={convo.listing.images?.[0] || '/placeholder.svg'}
                            alt=""
                            className="w-5 h-5 md:w-6 md:h-6 rounded object-cover"
                          />
                          <span className="text-[10px] md:text-xs text-muted-foreground truncate">
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
          <div className={`flex-1 flex flex-col bg-background overflow-hidden ${!selectedConvo ? "hidden md:flex" : "flex"}`}>
            {selectedConvo ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Chat Header */}
                <div className="p-3 md:p-4 border-b border-border flex items-center gap-3 md:gap-4 bg-background flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 h-9 w-9"
                    onClick={() => setSelectedConvo(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <button
                    onClick={() => {
                      // Navigate to the other user's profile, not your own
                      if (selectedConvo.other_user.id !== user?.id) {
                        navigate(`/profile?user=${selectedConvo.other_user.id}`);
                      }
                    }}
                    className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={selectedConvo.other_user.avatar_url}
                      alt={selectedConvo.other_user.username}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-semibold text-sm md:text-base block truncate">{selectedConvo.other_user.username}</span>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Tap to view profile</p>
                    </div>
                  </button>
                  {/* Removed non-functional 3-dot menu button */}
                </div>

                {/* Listing Preview */}
                {selectedConvo.listing && (
                  <div className="p-2 md:p-3 border-b border-border bg-muted/30 flex-shrink-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <img
                        src={selectedConvo.listing.images?.[0] || '/placeholder.svg'}
                        alt=""
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs md:text-sm truncate">{selectedConvo.listing.title}</p>
                        <p className="text-primary font-bold text-sm md:text-base">₹{selectedConvo.listing.price}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-background scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
                          className={`max-w-[85%] md:max-w-[75%] rounded-2xl overflow-hidden ${
                            msg.sender_id === user?.id
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          {msg.image_url && (
                            <img
                              src={msg.image_url}
                              alt="Shared image"
                              className="w-full max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.image_url!, '_blank')}
                            />
                          )}
                          {msg.content && (
                            <div className="px-3 py-2 md:px-4 md:py-2.5">
                              <p className="text-sm md:text-base break-words whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          )}
                          <div className={`flex items-center gap-1 px-3 pb-1.5 md:px-4 md:pb-2 ${
                            msg.sender_id === user?.id ? "justify-end" : "justify-start"
                          }`}>
                            <span className="text-[9px] md:text-[10px] opacity-70">{formatTime(msg.created_at)}</span>
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

                {/* Image Preview */}
                <AnimatePresence>
                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="p-3 border-t border-border bg-muted/30"
                    >
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <button
                          onClick={cancelImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-destructive-foreground" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input */}
                <div className="p-3 md:p-4 border-t border-border bg-background/95 backdrop-blur-xl flex-shrink-0 md:bg-background">
                  <div className="flex gap-2 items-center max-w-4xl mx-auto">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0 h-10 w-10 rounded-full hover:bg-muted"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Image className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="bg-muted/50 border-0 rounded-full h-11 px-4 text-sm md:text-base pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                    <Button
                      variant="hero"
                      size="icon"
                      className="shrink-0 h-10 w-10 rounded-full shadow-lg"
                      onClick={handleSendMessage}
                      disabled={(!newMessage.trim() && !selectedImage) || uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h2 className="font-display text-xl font-semibold mb-2">Select a conversation</h2>
                  <p>Choose from your existing conversations or start a new one</p>
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
