'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';

export default function WarehouseMessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up polling for selected conversation
    if (selectedBranch) {
      fetchMessagesForBranch(selectedBranch);
      intervalRef.current = setInterval(() => {
        fetchMessagesForBranch(selectedBranch);
      }, 3000);
    }

    // Cleanup on unmount or when selectedBranch changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedBranch]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations');
    }
  };

  const selectConversation = (branch: any) => {
    setSelectedBranch(branch);
  };

  const fetchMessagesForBranch = async (branch: any) => {
    try {
      const ids = [session?.user.id, branch.userId].sort();
      const conversationId = `${ids[0]}_${ids[1]}`;
      
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await response.json();
      setMessages(data);
      
      // Auto-scroll to bottom on new messages
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to fetch messages');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedBranch) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedBranch.userId,
          message: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessagesForBranch(selectedBranch);
      }
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-bold">Branch Managers</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No conversations yet</p>
            ) : (
              conversations.map((conv: any) => (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedBranch?._id === conv._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="font-medium">{conv.branchName}</p>
                  <p className="text-sm text-gray-600">{conv.managerName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conv.lastMessage && new Date(conv.lastMessageDate).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="col-span-2 bg-white rounded-lg shadow">
          {!selectedBranch ? (
            <div className="flex items-center justify-center h-[500px] text-gray-500">
              Select a branch to start messaging
            </div>
          ) : (
            <>
              <div className="p-4 border-b">
                <h2 className="font-bold">{selectedBranch.branchName}</h2>
                <p className="text-sm text-gray-600">{selectedBranch.managerName}</p>
              </div>

              <div id="chat-container" className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500">No messages yet</p>
                ) : (
                  messages.map((msg: any) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderId._id === session?.user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.senderId._id === session?.user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.senderId.name}</p>
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={20} />
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}