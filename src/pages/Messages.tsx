import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Image, MoreVertical, ArrowLeft, Search, 
  Phone, Video, Info, Check, CheckCheck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

// Mock data for demo
const mockConversations: Conversation[] = [
  {
    id: "1",
    other_user: {
      id: "seller-1",
      username: "thrift_queen",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    listing: {
      id: "listing-1",
      title: "Vintage Levi's 501 Jeans",
      images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100"],
      price: 1499,
    },
    last_message: "Is this still available?",
    last_message_at: new Date().toISOString(),
    unread_count: 2,
  },
  {
    id: "2",
    other_user: {
      id: "seller-2",
      username: "vintage_vault",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    },
    listing: {
      id: "listing-2",
      title: "Band Tee - Nirvana",
      images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100"],
      price: 899,
    },
    last_message: "Yes! I can ship it tomorrow 📦",
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 0,
  },
];

const mockMessages: Message[] = [
  { id: "1", content: "Hi! Is this still available?", sender_id: "me", created_at: new Date(Date.now() - 7200000).toISOString(), is_read: true },
  { id: "2", content: "Yes it is! Are you interested?", sender_id: "seller-1", created_at: new Date(Date.now() - 3600000).toISOString(), is_read: true },
  { id: "3", content: "Absolutely! Can you do ₹1200?", sender_id: "me", created_at: new Date(Date.now() - 1800000).toISOString(), is_read: true },
  { id: "4", content: "I can do ₹1350, that's my best price 🙏", sender_id: "seller-1", created_at: new Date(Date.now() - 900000).toISOString(), is_read: false },
];

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (selectedConvo) {
      setMessages(mockMessages);
    }
  }, [selectedConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const msg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: "me",
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
    toast.success("Message sent!");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting with sellers!</p>
                </div>
              ) : (
                conversations.map((convo) => (
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
                      <p className="text-sm text-muted-foreground truncate">{convo.last_message}</p>
                      {convo.listing && (
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={convo.listing.images[0]}
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
                        src={selectedConvo.listing.images[0]}
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
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender_id === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          msg.sender_id === "me"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          msg.sender_id === "me" ? "justify-end" : "justify-start"
                        }`}>
                          <span className="text-[10px] opacity-70">{formatTime(msg.created_at)}</span>
                          {msg.sender_id === "me" && (
                            msg.is_read ? (
                              <CheckCheck className="w-3 h-3 opacity-70" />
                            ) : (
                              <Check className="w-3 h-3 opacity-70" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
