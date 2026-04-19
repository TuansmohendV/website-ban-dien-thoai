import React, { useState, useEffect } from 'react';
import { Send, Image, Paperclip, Smile, MoreVertical, Search, Phone, Video, Info, X, MessageSquare } from 'lucide-react';

const CustomerSupportPage = () => {
    const [message, setMessage] = useState('');
    const [selectedId, setSelectedId] = useState(1);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const [chatLogs, setChatLogs] = useState([
        { id: 1, sender: 'bot', text: 'Chào mừng quý khách đến với trung tâm hỗ trợ của **PhoneSin**!', time: '14:40', status: 'sent' },
        { id: 2, sender: 'me', text: 'Mình quan tâm dịch vụ này 🔥. Bạn hỗ trợ nhé!', time: '14:45', status: 'sent' },
    ]);

    const conversations = [
        { id: 1, name: 'Hỗ trợ kỹ thuật', lastMsg: 'Chào bạn, chúng tôi đã nhận được...', time: '5 phút trước', unread: 1, online: true, icon: '👩‍💻' },
        { id: 2, name: 'Tư vấn bán hàng', lastMsg: 'Dạ, iPhone 15 Pro Max hiện còn hàng...', time: '1 giờ trước', unread: 0, online: true, icon: '🛍️' },
        { id: 3, name: 'Chăm sóc khách hàng', lastMsg: 'Cảm ơn quý khách đã tin dùng...', time: 'Hôm qua', unread: 0, online: false, icon: '🥰' },
    ];

    const emojis = ['😊', '😂', '🥰', '😍', '🤔', '👍', '🔥', '📍', '📱', '📦', '💯', '🙏'];
    const activeConv = conversations.find(c => c.id === selectedId) || conversations[0];

    const handleEmojiClick = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = () => {
        if (!message.trim() && !previewImage) return;
        
        const newMessage = {
            id: Date.now(),
            sender: 'me',
            text: message,
            image: previewImage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };
        setChatLogs([...chatLogs, newMessage]);
        setMessage('');
        setPreviewImage(null);
        setShowEmojiPicker(false);
    };

    const handleRecallMessage = (id) => {
        setChatLogs(chatLogs.map(log => 
            log.id === id ? { ...log, text: 'Tin nhắn đã được thu hồi', image: null, status: 'recalled' } : log
        ));
    };

    const handleStartEdit = (log) => {
        setEditingId(log.id);
        setEditText(log.text);
    };

    const handleSaveEdit = () => {
        setChatLogs(chatLogs.map(log => 
            log.id === editingId ? { ...log, text: editText, status: 'edited' } : log
        ));
        setEditingId(null);
        setEditText('');
    };

    const handleDeleteLocal = (id) => {
        setChatLogs(chatLogs.filter(log => log.id !== id));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <div className="w-full h-[850px] bg-gray-50 flex overflow-hidden border-b border-gray-100">
            {/* Custom Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
            
            {/* 1. SIDEBAR - Interactive */}
            <div className="w-[380px] bg-white border-r border-gray-100 flex flex-col shadow-sm z-20 overflow-hidden">
                <div className="p-8 pb-6 bg-gradient-to-br from-white to-blue-50/30">
                    <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        Hội thoại
                        <span className="w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                    </h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0068ff] transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm..." 
                            className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0068ff]/40 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 custom-scrollbar">
                    {conversations.map((conv) => (
                        <div 
                            key={conv.id} 
                            onClick={() => setSelectedId(conv.id)}
                            className={`flex gap-4 p-5 rounded-[28px] cursor-pointer transition-all relative group ${selectedId === conv.id ? 'bg-white shadow-xl shadow-blue-900/5 border border-blue-100' : 'hover:bg-white hover:shadow-lg hover:shadow-gray-200/50'}`}
                        >
                            <div className="relative shrink-0">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 ${selectedId === conv.id ? 'bg-[#0068ff] text-white border-white shadow-md' : 'bg-gray-100 text-gray-400 border-transparent'}`}>
                                    {conv.icon}
                                </div>
                                {conv.online && (
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-gray-900 text-[16px] truncate group-hover:text-[#0068ff] transition-colors">{conv.name}</h4>
                                    <span className="text-[11px] font-bold text-gray-400">{conv.time}</span>
                                </div>
                                <p className="text-[13px] text-gray-500 truncate leading-relaxed font-medium">{conv.lastMsg}</p>
                            </div>
                            {conv.unread > 0 && selectedId !== conv.id && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0068ff] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    {conv.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white relative z-10 shadow-sm shadow-gray-100/30">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-tr from-[#0068ff] to-[#00a3ff] rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-500/30 transform rotate-3 transition-transform duration-500">
                            {activeConv.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-black text-gray-900 text-xl tracking-tight">{activeConv.name} PhoneSin</h3>
                                <span className="px-2 py-0.5 bg-blue-100 text-[#0068ff] text-[10px] font-black rounded uppercase">Admin</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 ${activeConv.online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'} rounded-full`}></div>
                                <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{activeConv.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-[#0068ff] rounded-2xl transition-all"><Phone size={22} /></button>
                        <button className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-[#0068ff] rounded-2xl transition-all"><Video size={22} /></button>
                        <div className="w-px h-8 bg-gray-100 mx-1"></div>
                        <button className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-[#0068ff] rounded-2xl transition-all"><Info size={22} /></button>
                    </div>
                </div>

                {/* ChatContent - Now with Actions */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/30 font-inter scroll-smooth custom-scrollbar">
                    {chatLogs.map((log) => (
                        <div key={log.id} className={`flex ${log.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
                            <div className={`flex gap-4 max-w-[75%] ${log.sender === 'me' ? 'flex-row-reverse' : ''} relative`}>
                                
                                {/* Message Actions (Hover Menu) */}
                                {log.status !== 'recalled' && (
                                    <div className={`absolute top-0 ${log.sender === 'me' ? '-left-24' : '-right-24'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-md border border-gray-100 rounded-lg p-1 z-10`}>
                                        {log.sender === 'me' && (
                                            <>
                                                <button onClick={() => handleStartEdit(log)} className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded transition-colors" title="Chỉnh sửa"><MessageSquare size={14} /></button>
                                                <button onClick={() => handleRecallMessage(log.id)} className="p-1.5 hover:bg-orange-50 text-gray-500 hover:text-orange-600 rounded transition-colors" title="Thu hồi"><Paperclip size={14} /></button>
                                            </>
                                        )}
                                        <button onClick={() => handleDeleteLocal(log.id)} className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded transition-colors" title="Xóa phía tôi"><X size={14} /></button>
                                    </div>
                                )}

                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${log.sender === 'me' ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
                                    {log.sender === 'me' ? '👤' : activeConv.icon}
                                </div>
                                <div className={`flex flex-col ${log.sender === 'me' ? 'items-end' : 'items-start'} gap-2`}>
                                    <div className={`p-4 rounded-[24px] shadow-lg border relative ${log.sender === 'me' ? 'bg-gradient-to-br from-[#0068ff] to-[#008dff] text-white rounded-tr-none border-white/10' : 'bg-white text-gray-800 rounded-tl-none border-gray-100'}`}>
                                        {log.status === 'recalled' ? (
                                            <p className="text-[14px] italic opacity-60 flex items-center gap-2">
                                                <Info size={14} /> Tin nhắn đã được thu hồi
                                            </p>
                                        ) : (
                                            <>
                                                {editingId === log.id ? (
                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <textarea 
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            className="w-full bg-white/10 border border-white/30 rounded-lg p-2 text-[15px] focus:outline-none focus:ring-1 focus:ring-white"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end gap-2 text-[12px]">
                                                            <button onClick={() => setEditingId(null)} className="hover:underline">Hủy</button>
                                                            <button onClick={handleSaveEdit} className="bg-white text-[#0068ff] px-2 py-0.5 rounded font-bold">Lưu</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {log.text && <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{log.text}</p>}
                                                        {log.image && <img src={log.image} alt="Sent" className="mt-2 max-w-[300px] rounded-xl border border-white/20 shadow-md" />}
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {log.status === 'edited' && log.status !== 'recalled' && (
                                            <span className="absolute bottom-1 right-3 text-[9px] opacity-70 font-bold uppercase italic">Đã chỉnh sửa</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.time} {log.sender === 'me' ? `• ${log.status === 'recalled' ? 'Đã thu hồi' : 'Đã gửi'}` : ''}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-8 bg-white border-t border-gray-100 relative">
                    {/* Emoji Picker Pop-up */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-[100%] left-10 mb-2 bg-white shadow-2xl border border-gray-100 rounded-2xl p-4 flex gap-3 z-50 animate-in fade-in slide-in-from-bottom-2">
                            {emojis.map(e => (
                                <button key={e} onClick={() => handleEmojiClick(e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                            ))}
                        </div>
                    )}

                    {/* Image Upload Preview Bubble */}
                    {previewImage && (
                        <div className="max-w-[1100px] mx-auto mb-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="relative inline-block group">
                                <img src={previewImage} alt="Preview" className="w-[120px] h-[120px] object-cover rounded-2xl shadow-lg border-2 border-blue-100" />
                                <button 
                                    onClick={() => setPreviewImage(null)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="max-w-[1100px] mx-auto relative group">
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-[32px] p-2 pl-6 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white focus-within:border-blue-200 transition-all duration-300">
                            <button className="p-3 hover:bg-white hover:shadow-md rounded-2xl text-gray-400 transition-all"><Paperclip size={22} /></button>
                            <input 
                                type="text" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    setShowEmojiPicker(false);
                                    if (editingId)  { /* keep focus if editing? no, editing is inline */ }
                                }}
                                placeholder={editingId ? "Đang chỉnh sửa bản nháp..." : `Nhắn tin cho ${activeConv.name}...`}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] font-semibold text-gray-800 py-4"
                            />
                            <div className="flex items-center gap-2 pr-2">
                                <label className="p-3 hover:bg-white hover:shadow-md rounded-2xl text-gray-400 transition-all cursor-pointer">
                                    <Image size={22} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                
                                <button 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all ${showEmojiPicker ? 'text-[#0068ff] bg-blue-50 shadow-inner' : 'text-gray-400'}`}
                                >
                                    <Smile size={22} />
                                </button>
                                
                                <button 
                                    onClick={handleSendMessage}
                                    className="w-14 h-14 bg-gradient-to-tr from-[#0068ff] to-[#00a3ff] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all group-focus-within:rotate-3"
                                >
                                    <Send size={24} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                        {editingId && (
                            <div className="absolute -top-10 left-0 right-0 flex justify-center">
                                <span className="bg-blue-100 text-[#0068ff] px-4 py-1 rounded-full text-[12px] font-bold shadow-sm border border-blue-200 animate-bounce">
                                    💡 Vui lòng hoàn thành chỉnh sửa bên trên hoặc nhấn Hủy
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSupportPage;
