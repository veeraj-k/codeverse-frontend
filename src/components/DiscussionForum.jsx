import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaUser, FaClock, FaComments, FaSpinner } from "react-icons/fa";

const DiscussionForum = ({ problemName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const username = localStorage.getItem("username") || "Anonymous";

  const isCentralForum = !problemName;

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const endpoint = isCentralForum 
          ? `${import.meta.env.VITE_DJ_URL}/message_api/message/central`
          : `${import.meta.env.VITE_DJ_URL}/message_api/message/${problemName.toLowerCase().replace(/\s+/g, "_")}`;
        
        const res = await axios.get(endpoint);
        const formattedMessages = res.data.map((msg) => ({
          sender: msg.user_name.username,
          message: msg.content,
          timestamp: msg.timestamp,
        }));
        setMessages(formattedMessages);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [problemName, isCentralForum]);

  useEffect(() => {
    const endpoint = isCentralForum 
      ? `${import.meta.env.VITE_WEB_SOCKET_URL}/ws/chat/central/`
      : `${import.meta.env.VITE_WEB_SOCKET_URL}/ws/chat/${problemName.toLowerCase().replace(/\s+/g, "_")}/`;
    
    const socket = new WebSocket(endpoint);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newMsg = {
        sender: data.sender,
        message: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
    };

    return () => socket.close();
  }, [problemName, isCentralForum]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketRef.current.send(JSON.stringify({ message: newMessage, sender: username }));
      setNewMessage("");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-h-[calc(100vh-4rem)] bg-base-100"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-base-300">
          <FaComments className="text-3xl text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Discussion Forum
          </h2>
        </div>

        <div className={`grid ${isCentralForum ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'} gap-8`}>
          {/* Main Discussion Area */}
          <div className={isCentralForum ? 'lg:col-span-3' : ''}>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-16"
              >
                <FaSpinner className="text-4xl text-primary animate-spin" />
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="alert alert-error shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </motion.div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-base-200 rounded-xl"
              >
                <FaComments className="text-5xl text-base-content/30 mx-auto mb-4" />
                <p className="text-xl text-base-content/70">
                  Be the first to start the discussion for this problem!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-base-200 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaUser className="text-primary text-lg" />
                          </div>
                          <div>
                            <span className="font-semibold text-primary text-lg">{msg.sender}</span>
                            <div className="flex items-center gap-1 text-base-content/50 text-sm">
                              <FaClock className="text-xs" />
                              <span>{formatDate(msg.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-base-content/80 text-base whitespace-pre-wrap pl-13">
                        {msg.message}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={sendMessage}
              className="mt-6 sticky bottom-0 bg-base-100 pt-4 border-t border-base-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full bg-base-200 border border-base-300 text-base-content p-4 pr-14 rounded-xl placeholder-base-content/50 focus:outline-none focus:border-primary transition-colors duration-300 text-lg"
                    placeholder="Write your message..."
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-primary hover:text-primary-focus transition-colors duration-300"
                  >
                    <FaPaperPlane className="text-xl" />
                  </motion.button>
                </div>
              </div>
            </motion.form>
          </div>

          {/* Guidelines Section - Only show in central forum */}
          {isCentralForum && (
            <div className="lg:col-span-1">
              <div className="bg-base-200 rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4 text-primary">About Discussion</h3>
                <div className="space-y-4 text-base-content/80">
                  <p>
                    Join the discussion Forum. Share your thoughts, ask questions, or help others with their solutions.
                  </p>
                  <div className="bg-base-100 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Guidelines:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Be respectful and constructive</li>
                      <li>Share your approach and insights</li>
                      <li>Ask clear and specific questions</li>
                      <li>Help others understand your solution</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--bc) / 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--bc) / 0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default DiscussionForum;
