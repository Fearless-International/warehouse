'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [warehouseManagerId, setWarehouseManagerId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWarehouseManager();
  }, []);

  const fetchWarehouseManager = async () => {
    try {
      const response = await fetch('/api/users/warehouse-manager');
      const data = await response.json();
      if (data._id) {
        setWarehouseManagerId(data._id);
        fetchMessages(data._id);
        
        // Poll messages every 3 seconds
        const interval = setInterval(() => {
          fetchMessages(data._id);
        }, 3000);
        
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error('Failed to fetch warehouse manager');
    }
  };

  const fetchMessages = async (managerId: string) => {
    try {
      const ids = [session?.user.id, managerId].sort();
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
    if (!newMessage.trim() || !warehouseManagerId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: warehouseManagerId,
          message: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(warehouseManagerId);
      }
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Messages with Warehouse Manager</h1>

      <div className="bg-white rounded-lg shadow">
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
      </div>
    </div>
  );
}