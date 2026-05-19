import React from 'react';
import { useLocation } from 'react-router-dom';

const CustomerChat = () => {
    const location = useLocation();

    // Hide on the full-screen support page
    if (location.pathname === '/customer-support') {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">
            {/* Zalo */}
            <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="w-14 h-14 bg-[#0068ff] rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
                title="Chat Zalo"
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
                    className="w-full h-full object-cover p-1.5"
                    alt="Zalo"
                />
                <span className="absolute right-16 bg-white text-gray-800 text-[13px] font-bold px-4 py-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100 pointer-events-none">
                    Chat Zalo
                </span>
            </a>

            {/* Messenger */}
            <a
                href="https://m.me"
                target="_blank"
                rel="noreferrer"
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
                title="Chat Messenger"
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg"
                    className="w-full h-full object-cover p-2"
                    alt="Messenger"
                />
                <span className="absolute right-16 bg-white text-gray-800 text-[13px] font-bold px-4 py-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100 pointer-events-none">
                    Chat Messenger
                </span>
            </a>
        </div>
    );
};

export default CustomerChat;
