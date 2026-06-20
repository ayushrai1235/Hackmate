import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { getChats } from '../services/chatService';
import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';
import Navbar from '../components/Navbar';

const Chat = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'room'
  const [messagesCache, setMessagesCache] = useState({});

  const updateMessagesCache = (chatId, messages, hasMore, nextCursor) => {
    setMessagesCache((prev) => ({
      ...prev,
      [chatId]: { messages, hasMore, nextCursor },
    }));
  };

  // Load initial chats
  const fetchUserChats = async () => {
    try {
      setLoading(true);
      const data = await getChats();
      setChats(data);
    } catch (err) {
      console.error('Error fetching user chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChats();
  }, []);

  // Listen to global socket events for updates
  useEffect(() => {
    if (socket) {
      // 1. Listen for new messages globally to update previews / unread counts & cache
      const handleGlobalMessage = (payload) => {
        const message = payload.message || payload;
        const tempId = payload.tempId;

        setChats((prevChats) => {
          const chatIdx = prevChats.findIndex((c) => c._id === message.chatId);
          if (chatIdx === -1) return prevChats;

          const updatedChats = [...prevChats];
          const chat = { ...updatedChats[chatIdx] };

          // Update last message & lastActivity
          chat.lastMessage = message;
          chat.lastActivity = message.createdAt;

          // Increment unread count if we are not currently viewing this chat
          const isViewingThisChat = selectedChat && selectedChat._id === message.chatId;
          const isFromMe = message.sender?._id === currentUser?._id;
          if (!isViewingThisChat && !isFromMe) {
            chat.unreadCount = (chat.unreadCount || 0) + 1;
            
            // Play notification sound
            try {
              const AudioContext = window.AudioContext || window.webkitAudioContext;
              if (AudioContext) {
                const ctx = new AudioContext();
                if (ctx.state !== 'suspended') {
                  const osc = ctx.createOscillator();
                  const gainNode = ctx.createGain();
                  osc.type = 'sine';
                  osc.frequency.setValueAtTime(880, ctx.currentTime);
                  osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
                  gainNode.gain.setValueAtTime(0, ctx.currentTime);
                  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                  osc.connect(gainNode);
                  gainNode.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.3);
                }
              }
            } catch (err) {
              console.log("Audio play failed", err);
            }
          }

          // Remove from old position and push to top of the list
          updatedChats.splice(chatIdx, 1);
          return [chat, ...updatedChats];
        });

        // Update messagesCache if it exists for this chat
        setMessagesCache((prevCache) => {
          const chatCache = prevCache[message.chatId];
          if (!chatCache) return prevCache;

          let updatedMessages = [...chatCache.messages];
          if (tempId && updatedMessages.some((m) => m._id === tempId)) {
            updatedMessages = updatedMessages.map((m) => (m._id === tempId ? message : m));
          } else if (!updatedMessages.some((m) => m._id === message._id)) {
            updatedMessages.push(message);
          }

          return {
            ...prevCache,
            [message.chatId]: {
              ...chatCache,
              messages: updatedMessages,
            },
          };
        });
      };

      // 2. Listen for presence status changes live
      const handleUserStatusChange = ({ userId, status, lastActive }) => {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.isTeamChat) return chat;

            // Check if user is a participant in this DM
            const updatedParticipants = chat.participants.map((p) => {
              if (p._id === userId) {
                return { ...p, status, lastActive };
              }
              return p;
            });

            return { ...chat, participants: updatedParticipants };
          })
        );
      };

      // 3. Listen for message delivery updates
      const handleMessagesDelivered = ({ chatId, messageIds, userId }) => {
        setMessagesCache((prevCache) => {
          const chatCache = prevCache[chatId];
          if (!chatCache) return prevCache;

          const updatedMessages = chatCache.messages.map((m) => {
            if (messageIds.includes(m._id)) {
              const deliveredTo = [...(m.deliveredTo || [])];
              if (!deliveredTo.includes(userId)) {
                deliveredTo.push(userId);
              }
              return { ...m, deliveredTo };
            }
            return m;
          });

          return {
            ...prevCache,
            [chatId]: { ...chatCache, messages: updatedMessages },
          };
        });
      };

      // 4. Listen for read receipt events
      const handleChatRead = ({ chatId, userId, messageIds }) => {
        setMessagesCache((prevCache) => {
          const chatCache = prevCache[chatId];
          if (!chatCache) return prevCache;

          const updatedMessages = chatCache.messages.map((m) => {
            if (messageIds.includes(m._id)) {
              const readBy = [...(m.readBy || [])];
              if (!readBy.includes(userId)) readBy.push(userId);
              const deliveredTo = [...(m.deliveredTo || [])];
              if (!deliveredTo.includes(userId)) deliveredTo.push(userId);
              return { ...m, readBy, deliveredTo };
            }
            return m;
          });

          return {
            ...prevCache,
            [chatId]: { ...chatCache, messages: updatedMessages },
          };
        });
      };

      socket.on('message:new', handleGlobalMessage);
      socket.on('user:status', handleUserStatusChange);
      socket.on('messages:delivered', handleMessagesDelivered);
      socket.on('chat:read', handleChatRead);

      return () => {
        socket.off('message:new', handleGlobalMessage);
        socket.off('user:status', handleUserStatusChange);
        socket.off('messages:delivered', handleMessagesDelivered);
        socket.off('chat:read', handleChatRead);
      };
    }
  }, [socket, selectedChat, currentUser?._id]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMobileView('room');

    // Reset unread count for the selected chat locally
    setChats((prevChats) =>
      prevChats.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <Navbar />

      {/* App Body Viewport */}
      <div className="flex-grow flex overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 gap-6 relative z-10">
        {loading ? (
          <div className="flex-grow flex items-center justify-center glass-panel rounded-3xl border border-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              </div>
              <p className="text-xs font-outfit text-slate-400 font-semibold tracking-wider uppercase">Loading conversations...</p>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex glass-panel border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative bg-slate-950/20">
            {/* Chats Sidebar */}
            <div
              className={`w-full md:w-80 border-r border-white/5 shrink-0 bg-slate-950/40 backdrop-blur-md ${
                mobileView === 'room' ? 'hidden md:block' : 'block'
              }`}
            >
              <ChatList
                chats={chats}
                selectedChatId={selectedChat?._id}
                onSelectChat={handleSelectChat}
                currentUserId={currentUser?._id}
              />
            </div>

            {/* Chat Conversation Viewport */}
            <div
              className={`flex-grow flex flex-col overflow-hidden bg-slate-950/10 ${
                mobileView === 'list' ? 'hidden md:flex' : 'flex'
              }`}
            >
              {selectedChat ? (
                <div className="flex-grow flex flex-col overflow-hidden relative">
                  {/* Mobile Back Button Overlay inside room header */}
                  {mobileView === 'room' && (
                    <button
                      onClick={handleBackToList}
                      className="absolute top-[18px] left-4 md:hidden z-50 flex items-center justify-center p-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Active room */}
                  <ChatRoom
                    chat={selectedChat}
                    currentUserId={currentUser?._id}
                    cache={messagesCache[selectedChat._id]}
                    updateCache={(messages, hasMore, nextCursor) =>
                      updateMessagesCache(selectedChat._id, messages, hasMore, nextCursor)
                    }
                  />
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center p-6 text-center bg-slate-950/30">
                  <div className="max-w-xs flex flex-col items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5">
                      <svg className="w-8 h-8 animate-pulse text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-cabinet font-black text-white text-base mb-1.5">Your Inbox</h4>
                      <p className="text-xs font-sans text-slate-400 leading-relaxed">
                        Select a conversation from the sidebar to view messages, share designs, or coordinate with your teammates.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
