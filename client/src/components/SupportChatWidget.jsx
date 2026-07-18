import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

export default function SupportChatWidget() {
  const { isChatbotOpen: isOpen, setIsChatbotOpen: setIsOpen } = useAuthStore();
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! Ask me anything about carpooling policies, routes, or wallet payments.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/support/chat', { message: userText });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.data.response }]);
    } catch (err) {
      // Offline fallback
      let reply = "Sorry, I couldn't connect to LangChain support. Try asking about 'how to offer a ride' or 'wallet payments'.";
      const cleaned = userText.toLowerCase();
      if (cleaned.includes('offer') || cleaned.includes('publish') || cleaned.includes('ride')) {
        reply = "To offer a ride: Go to the Dashboard, choose the 'Offer Ride' tab, select your vehicle, enter pickup/destination, and set the price. 🚗";
      } else if (cleaned.includes('license') || cleaned.includes('verify')) {
        reply = "To verify your license, enter your Driving License number under Settings. An admin will verify it shortly, letting you offer rides.";
      } else if (cleaned.includes('wallet') || cleaned.includes('recharge') || cleaned.includes('pay')) {
        reply = "Go to Settings -> Payment Method (or click Wallet) to recharge your wallet balance securely via Razorpay.";
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white rounded-full p-4 shadow-lg cursor-pointer flex items-center justify-center transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-4">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-xs text-slate-700">AI Support Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[80%] ${
                  m.sender === 'user' ? 'bg-[#e85d4a] text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-400 p-3 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2 bg-slate-50">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-2 text-xs rounded focus:outline-none flex-1 focus:border-[#e85d4a]"
            />
            <button type="submit" className="bg-[#e85d4a] text-white p-2 rounded hover:bg-[#d94d3a]"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </div>
  );
}
