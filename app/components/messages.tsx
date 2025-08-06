"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus,
  Users,
  Clock,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  UserPlus,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'file' | 'image';
  attachments?: string[];
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  avatar?: string;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real Firebase queries
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: ['user1', 'user2'],
        participantNames: ['Dr. Sarah Johnson'],
        lastMessage: {
          id: '1',
          content: 'Hey, did you finish the cardiology assignment?',
          senderId: 'user2',
          senderName: 'Dr. Sarah Johnson',
          timestamp: new Date('2025-08-06T10:30:00'),
          read: false,
          type: 'text'
        },
        unreadCount: 2,
        isGroup: false
      },
      {
        id: '2',
        participants: ['user1', 'user3', 'user4', 'user5'],
        participantNames: ['Study Group Alpha'],
        lastMessage: {
          id: '2',
          content: 'Meeting tomorrow at 3 PM in the library',
          senderId: 'user3',
          senderName: 'Michael Chen',
          timestamp: new Date('2025-08-06T09:15:00'),
          read: true,
          type: 'text'
        },
        unreadCount: 0,
        isGroup: true,
        groupName: 'Cardiology Study Group'
      },
      {
        id: '3',
        participants: ['user1', 'user6'],
        participantNames: ['Dr. Emily Rodriguez'],
        lastMessage: {
          id: '3',
          content: 'I uploaded the lecture notes to the shared folder',
          senderId: 'user6',
          senderName: 'Dr. Emily Rodriguez',
          timestamp: new Date('2025-08-05T16:45:00'),
          read: true,
          type: 'text'
        },
        unreadCount: 0,
        isGroup: false
      }
    ];

    setConversations(mockConversations);
    setLoading(false);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) {
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user?.uid || 'current-user',
      senderName: user?.displayName || 'You',
      timestamp: new Date(),
      read: true,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // TODO: Send to Firebase
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participantNames.some(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || 
    (conv.groupName && conv.groupName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-purple-100">Stay connected with your study community</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
              <Plus className="h-5 w-5" />
              New Message
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] flex">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-purple-50 border-purple-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.isGroup ? (
                        <Users className="h-6 w-6" />
                      ) : (
                        conversation.participantNames[0]?.[0] || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.isGroup ? conversation.groupName : conversation.participantNames[0]}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {conversations.find(c => c.id === selectedConversation)?.isGroup ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          conversations.find(c => c.id === selectedConversation)?.participantNames[0]?.[0] || 'U'
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {conversations.find(c => c.id === selectedConversation)?.isGroup 
                            ? conversations.find(c => c.id === selectedConversation)?.groupName
                            : conversations.find(c => c.id === selectedConversation)?.participantNames[0]
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {conversations.find(c => c.id === selectedConversation)?.isGroup 
                            ? `${conversations.find(c => c.id === selectedConversation)?.participants.length} members`
                            : 'Active now'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.uid
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        {message.senderId !== user?.uid && (
                          <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                        )}
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.uid ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                        <Smile className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;