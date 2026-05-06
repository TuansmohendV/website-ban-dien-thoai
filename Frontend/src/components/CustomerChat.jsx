import React, { useState } from 'react';
import { MessageCircle, X, Send, Phone, MessageSquare, Maximize2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const CustomerChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatLogs, setChatLogs] = useState([
        { id: 1, sender: 'bot', text: 'Chào bạn! PhoneSin có thể giúp gì cho bạn hôm nay? Đừng ngần ngại đặt câu hỏi nhé! 😊', time: '01:25 PM' }
    ]);
    const location = useLocation();

    // Hide chat bubble on the full-screen support page
    if (location.pathname === '/customer-support') {
        return null;
    }

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = () => {
        if (!message.trim()) return;
        const newMessage = {
            id: Date.now(),
            sender: 'me',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatLogs([...chatLogs, newMessage]);
        setMessage('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999] flex flex-col items-end max-w-[calc(100vw-2rem)]">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[460px] h-[min(600px,calc(100vh-8rem))] bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-500">
                    {/* Header - Premium Blue */}
                    <div className="bg-[#0068ff] p-4 sm:p-5 text-white flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="relative">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/30">
                                    <img 
                                        src="https://cdn-icons-png.flaticon.com/512/4712/4712038.png" 
                                        alt="CSKH Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-[#0068ff] rounded-full"></div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-[16px] sm:text-[18px] truncate">Hỗ trợ PhoneSin</h3>
                                <p className="text-[13px] opacity-80 uppercase font-black tracking-widest">Trực tuyến 24/7</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link to="/customer-support" className="p-2 hover:bg-white/10 rounded-full transition-colors group/max relative" title="Mở trang tin nhắn">
                                <Maximize2 size={20} />
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/max:opacity-100 whitespace-nowrap">Phóng to</span>
                            </Link>
                            <button onClick={toggleChat} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-gray-50 flex flex-col gap-5 scroll-smooth custom-scrollbar">
                        <style dangerouslySetInnerHTML={{ __html: `
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                        `}} />
                        
                        {chatLogs.map((log) => (
                            <div key={log.id} className={`flex gap-4 max-w-[90%] ${log.sender === 'me' ? 'self-end flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.sender === 'me' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {log.sender === 'me' ? '👤' : <img src="https://cdn-icons-png.flaticon.com/512/4712/4712038.png" className="w-6 h-6" alt="bot" />}
                                </div>
                                <div className={`flex flex-col ${log.sender === 'me' ? 'items-end' : 'items-start'} gap-1.5`}>
                                    <div className={`p-4 rounded-2xl shadow-sm border ${log.sender === 'me' ? 'bg-[#0068ff] text-white rounded-tr-none border-[#0056d2]' : 'bg-white text-gray-700 rounded-tl-none border-gray-100'}`}>
                                        <p className="text-[15px] font-medium leading-relaxed">{log.text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{log.time}</span>
                                </div>
                            </div>
                        ))}

                        {/* Quick Suggestions (Only if just starting) */}
                        {chatLogs.length < 3 && (
                            <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in duration-700">
                                <button className="text-[14px] font-bold p-3 bg-white border border-blue-100 text-[#0068ff] rounded-2lg hover:bg-blue-50 transition-colors shadow-sm rounded-xl">
                                    🛠️ Bảo hành
                                </button>
                                <button className="text-[14px] font-bold p-3 bg-white border border-blue-100 text-[#0068ff] rounded-2lg hover:bg-blue-50 transition-colors shadow-sm rounded-xl">
                                    📱 Mua máy
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 sm:p-5 bg-white border-t border-gray-100">
                        <div className="relative flex items-center gap-3">
                            <input 
                                type="text" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-[#0068ff] transition-all outline-none"
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="w-12 h-12 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Send size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Support Buttons Stack (Icons) */}
            <div className="flex flex-col gap-3 items-end">
                {/* Zalo & Messenger Shortcuts */}
                {!isOpen && (
                    <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
                        <a href="https://zalo.me" target="_blank" rel="noreferrer" className="w-14 h-14 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group relative overflow-hidden">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" className="w-full h-full object-cover p-1.5" alt="Zalo" />
                            <span className="absolute right-16 bg-white text-gray-800 text-[13px] font-bold px-4 py-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100 pointer-events-none">Chat Zalo</span>
                        </a>
                        <a href="https://m.me" target="_blank" rel="noreferrer" className="w-14 h-14 bg-white text-[#1877f2] rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group relative overflow-hidden">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" className="w-full h-full object-cover p-2" alt="Messenger" />
                            <span className="absolute right-16 bg-white text-gray-800 text-[13px] font-bold px-4 py-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100 pointer-events-none">Chat Messenger</span>
                        </a>
                    </div>
                )}

                {/* Main Chat Bubble */}
                <button 
                    onClick={toggleChat}
                    className={`h-16 flex items-center gap-3 px-5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,104,255,0.5)] transition-all duration-500 group ${isOpen ? 'bg-red-500 text-white w-16 px-0 justify-center rotate-90 scale-90' : 'bg-[#0068ff] text-white'}`}
                >
                    {isOpen ? (
                        <X size={32} />
                    ) : (
                        <>
                            <div className="relative">
                                <MessageSquare size={30} strokeWidth={2.5} />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#0068ff] rounded-full animate-bounce"></div>
                            </div>
                            <div className="flex flex-col items-start leading-none group-hover:translate-x-1 transition-transform">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Chat ngay</span>
                                <span className="text-sm font-black italic">Hỗ Trợ Online</span>
                            </div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CustomerChat;
