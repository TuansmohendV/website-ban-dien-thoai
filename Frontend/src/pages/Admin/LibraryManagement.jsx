import React, { useState, useRef } from 'react';
import { Image as ImageIcon, MousePointer2, Sparkles, FolderOpen, Layers, Upload, Plus } from 'lucide-react';
import MediaManagement from './MediaManagement';
import IconManagement from './IconManagement';

const LibraryManagement = () => {
    const [activeTab, setActiveTab] = useState('media');
    const [uploadTrigger, setUploadTrigger] = useState(0);

    const handleGlobalUpload = () => {
        // Increment trigger to notify children
        setUploadTrigger(prev => prev + 1);
    };

    return (
        <div className="library-premium-container">
            {/* Elegant Header with Ambient Glow */}
            <div className="premium-header">
                <div className="header-content">
                    <div className="header-left-side">
                        <div className="header-icon-box">
                            <FolderOpen size={32} className="main-icon" />
                        </div>
                        <div className="title-section">
                            <div className="badge-premium">
                                <Sparkles size={12} />
                                <span>Quản lý Tài nguyên</span>
                            </div>
                            <h1 className="premium-title">Trung tâm Thư viện</h1>
                            <p className="premium-subtitle">
                                Không gian lưu trữ tập trung và quản lý tài sản kỹ thuật số cho hệ thống PhoneSin.
                            </p>
                        </div>
                    </div>
                    
                    {/* Integrated Upload Button */}
                    <div className="header-right-side">
                        <button className="premium-upload-btn" onClick={handleGlobalUpload}>
                            <div className="btn-icon-wrapper">
                                <Plus size={20} />
                            </div>
                            <span>Tải lên {activeTab === 'media' ? 'Media' : 'Icon'} mới</span>
                        </button>
                    </div>
                </div>

                {/* Glassmorphism Navigation Tab */}
                <div className="navigation-wrapper">
                    <div className="glass-nav">
                        <button 
                            className={`nav-pill ${activeTab === 'media' ? 'active' : ''}`}
                            onClick={() => setActiveTab('media')}
                        >
                            <ImageIcon size={18} />
                            <span>Kho Media</span>
                            {activeTab === 'media' && <div className="pill-glow" />}
                        </button>
                        <button 
                            className={`nav-pill ${activeTab === 'icons' ? 'active' : ''}`}
                            onClick={() => setActiveTab('icons')}
                        >
                            <Layers size={18} />
                            <span>Thư viện Icon</span>
                            {activeTab === 'icons' && <div className="pill-glow" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Transition Area */}
            <div className="library-content-area">
                <div key={activeTab} className="content-container animate-fade-up">
                    {activeTab === 'media' ? (
                        <MediaManagement isEmbedded={true} uploadTrigger={uploadTrigger} />
                    ) : (
                        <IconManagement isEmbedded={true} uploadTrigger={uploadTrigger} />
                    )}
                </div>
            </div>

            <style jsx="true">{`
                .library-premium-container {
                    padding-bottom: 40px;
                    background: #fdfdfe;
                    min-height: calc(100vh - 100px);
                }

                .premium-header {
                    position: relative;
                    padding: 40px 0 60px 0;
                    background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
                    border-radius: 0 0 40px 40px;
                    margin-bottom: 40px;
                    box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.05);
                    border-bottom: 1px solid rgba(37, 99, 235, 0.08);
                    overflow: hidden;
                }

                .premium-header::before {
                    content: '';
                    position: absolute;
                    top: -100px;
                    right: -100px;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
                    border-radius: 50%;
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header-left-side {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                }

                .header-icon-box {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
                    color: #2563eb;
                }

                .badge-premium {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    background: rgba(37, 99, 235, 0.1);
                    color: #2563eb;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }

                .premium-title {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 8px 0;
                    letter-spacing: -1px;
                }

                .premium-subtitle {
                    color: #64748b;
                    font-size: 16px;
                    max-width: 600px;
                }

                .premium-upload-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 16px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
                }

                .premium-upload-btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.5);
                }

                .premium-upload-btn:active {
                    transform: translateY(0);
                }

                .btn-icon-wrapper {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 6px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .navigation-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 35px;
                }

                .glass-nav {
                    display: flex;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.1);
                    gap: 8px;
                }

                .nav-pill {
                    padding: 12px 28px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 15px;
                    border-radius: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .nav-pill:hover {
                    color: #1e293b;
                    background: rgba(0, 0, 0, 0.02);
                }

                .nav-pill.active {
                    background: #2563eb;
                    color: white;
                    box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
                }

                .pill-glow {
                    position: absolute;
                    bottom: -5px;
                    left: 20%;
                    right: 20%;
                    height: 10px;
                    background: #2563eb;
                    filter: blur(10px);
                    opacity: 0.4;
                    z-index: -1;
                }

                .library-content-area {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 30px;
                }

                .animate-fade-up {
                    animation: fadeUp 0.5s ease-out;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Override sub-component styles */
                :global(.embedded-mode .header-actions) {
                    display: none !important;
                }
                
                :global(.embedded-mode .management-container) {
                    padding: 0 !important;
                    background: transparent !important;
                }

                :global(.embedded-mode .card) {
                    border: 1px solid #f1f5f9 !important;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important;
                }
            `}</style>
        </div>
    );
};

export default LibraryManagement;
