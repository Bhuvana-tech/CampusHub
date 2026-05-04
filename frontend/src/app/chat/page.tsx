"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { socket } = useSocket();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCurrentUser(parsed);
      fetchConnections(parsed._id);
    }
  }, []);

  const fetchConnections = async (userId: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/users/${userId}`);
      if (res.data.connections) {
        setConnections(res.data.connections);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (peerId: string) => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`http://localhost:5001/api/messages/${currentUser._id}/${peerId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (msg: any) => {
      if (activeChat && (msg.sender._id === activeChat._id || msg.sender === activeChat._id)) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      } else {
        // Here we could update an unread badge on the connection list
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !currentUser) return;

    const newMsg = {
      sender: currentUser._id,
      receiver: activeChat._id,
      content: inputText
    };

    try {
      const res = await axios.post('http://localhost:5001/api/messages', newMsg);
      // Optimistically add to UI if sender matches
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Sidebar: Connections List */}
      <div className="w-1/3 min-w-[250px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {connections.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No connections yet.</p>
          ) : (
            connections.map(conn => (
              <button 
                key={conn._id}
                onClick={() => setActiveChat(conn)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all ${activeChat?._id === conn._id ? 'bg-brand-50 dark:bg-brand-900/40 border border-brand-100 dark:border-brand-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
              >
                <div className="relative">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conn.name}`} alt={conn.name} className="w-10 h-10 rounded-full bg-white border border-slate-200 dark:border-slate-700" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-sm">{conn.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{conn.branch}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeChat.name}`} alt={activeChat.name} className="w-12 h-12 rounded-full bg-slate-100" />
              <div>
                <h3 className="font-bold text-lg">{activeChat.name}</h3>
                <p className="text-xs text-brand-600 font-medium">Online</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  // If populated sender, use _id, else msg.sender
                  const senderId = msg.sender._id || msg.sender;
                  const isMe = senderId === currentUser?._id;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg._id || i} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] px-5 py-3 rounded-2xl ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
                />
                <button type="submit" disabled={!inputText.trim()} className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <UserIcon className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-700" />
            <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Select a connection to chat</h3>
          </div>
        )}
      </div>
    </div>
  );
}
