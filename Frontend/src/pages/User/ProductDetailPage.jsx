import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ChevronRight, ChevronLeft, Star, Heart, Share2, ShieldCheck, Truck, RefreshCw, 
    MapPin, Video, Image as ImageIcon, Info, Plus, ShoppingCart, Settings, 
    FileText, Wallet, Check, Cpu, Monitor, HardDrive, Smartphone, X, Box
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProductCard from '../../components/ProductCard';
import BuyNowModal from '../../components/BuyNowModal';
import api, { getApiErrorMessage } from '../../lib/api';
import socket from '../../lib/socket';
import {
    inflateProducts,
    normalizeProduct,
    normalizeProductDetail,
} from '../../lib/products';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, formatPrice } = useLanguage();
    const { addToCart } = useCart();
    const { user } = useAuth();
    
    // Zoom State (Legacy)
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
    const imgRef = useRef(null);
    const resultRef = useRef(null);
    const specsRef = useRef(null);
    const descriptionRef = useRef(null);
    const videoRef = useRef(null);

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });

    const [selectedStorage, setSelectedStorage] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [wishlistNotice, setWishlistNotice] = useState('');
    const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isPromoExpanded, setIsPromoExpanded] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(0);
    const [showBuyModal, setShowBuyModal] = useState(false);

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewImages, setReviewImages] = useState([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState('');
    const [editingReviewContent, setEditingReviewContent] = useState('');
    const [editingReviewRating, setEditingReviewRating] = useState(0);
    const [reviewActionLoadingId, setReviewActionLoadingId] = useState('');
    const [reviewNotice, setReviewNotice] = useState({ type: '', message: '' });
    const [showSpecsModal, setShowSpecsModal] = useState(false);

    const loadProductReviews = async (productId) => {
        try {
            const response = await api.get(`/api/reviews/${productId}`, {
                params: { page: 1, limit: 20 },
            });
            const items = Array.isArray(response.data?.data) ? response.data.data : [];
            setReviews(items);
            setReviewStats({
                average: Number(response.data?.product?.rating || 0),
                total: Number(response.data?.product?.numReviews || items.length),
            });
        } catch {
            setReviews([]);
            setReviewStats({ average: 0, total: 0 });
        }
    };

    const paymentOffers = [
        { name: "Techcombank", logo: "https://cdn.hoanghamobile.vn/Uploads/2025/10/15/techcombank-logo.png", desc: "Tưng bừng đón hè - Giảm sốc 500.000đ khi trả góp Techcombank 0% Lãi - 0% Phí!" },
        { name: "VPBank", logo: "https://cdn.hoanghamobile.vn/Uploads/2025/10/15/vpbank.png", desc: "Ưu đãi chủ thẻ VPBank: Giảm thêm 300.000đ khi thanh toán đơn hàng từ 10 triệu đồng." },
        { name: "VIB", logo: "https://cdn.hoanghamobile.vn/Uploads/2025/10/15/vib.png", desc: "Hoàn tiền lên đến 1.000.000đ cho chủ thẻ tín dụng VIB mở mới và thanh toán ngay." },
        { name: "Trả góp 0%", logo: "https://cdn.hoanghamobile.vn/Uploads/2026/01/23/icon-2_639047641516424460.png", desc: "Trả góp 0% lãi suất thông qua hơn 20 ngân hàng liên kết trên toàn quốc." },
        { name: "H-Care", logo: "https://cdn.hoanghamobile.vn/Uploads/2026/03/14/h-cacre.png", desc: "Đặc quyền bảo hành mở rộng và rơi vỡ chỉ dành riêng cho khách hàng sử dụng H-Care." },
        { name: "TPBank", logo: "https://cdn.hoanghamobile.vn/Uploads/2022/06/13/tpbank.png", desc: "Mở tài khoản TPBank - Nhận ngay voucher giảm giá 200.000đ khi mua iPhone." },
        { name: "ZaloPay", logo: "https://cdn.hoanghamobile.vn/Uploads/2025/10/15/zalopay.png", desc: "Nhập mã PHONESINZLP: Giảm ngay 2% (tối đa 500k) khi thanh toán qua ví ZaloPay." },
        { name: "Home PayLater", logo: "https://cdn.hoanghamobile.vn/Uploads/2025/10/15/hpl-logo.png", desc: "Mua trước trả sau với Home PayLater: Ưu đãi giảm lến đến 1.000.000đ cho đơn đầu tiên." }
    ];

    const [crossSellTab, setCrossSellTab] = useState('Tất cả');
    const [crossSellIndex, setCrossSellIndex] = useState(0);
    const [hotIndex, setHotIndex] = useState(0);

    useEffect(() => {
        let ignore = false;

        const loadProduct = async () => {
            setIsLoading(true);

            try {
                const detailResponse = await api.get(`/api/products/${id}`);
                const normalizedDetail = normalizeProductDetail(
                    detailResponse.data?.product || {},
                    detailResponse.data?.recentReviews || []
                );

                const listResponse = await api.get('/api/products', {
                    params: { limit: 50 },
                });

                const normalizedList = (listResponse.data?.data || []).map(normalizeProduct);
                const relatedFirst = normalizedList.filter(
                    (item) =>
                        item.routeId !== normalizedDetail.routeId &&
                        (item.brandKey === normalizedDetail.brandKey ||
                            item.category === normalizedDetail.category)
                );
                const fallbackProducts = normalizedList.filter(
                    (item) => item.routeId !== normalizedDetail.routeId
                );
                const dedupedProducts = [...relatedFirst, ...fallbackProducts].filter(
                    (item, index, array) =>
                        array.findIndex(
                            (candidate) =>
                                candidate.routeId === item.routeId ||
                                candidate.backendId === item.backendId
                        ) === index
                );

                if (!ignore) {
                    setProduct(normalizedDetail);
                    setRelatedProducts(dedupedProducts);
                    setReviews(Array.isArray(detailResponse.data?.recentReviews) ? detailResponse.data.recentReviews : []);
                    setReviewStats({
                        average: Number(detailResponse.data?.product?.rating || 0),
                        total: Number(detailResponse.data?.product?.numReviews || 0),
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setProduct(null);
                    setRelatedProducts([]);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        loadProduct();

        // Load Vouchers


        // Socket.io Real-time Stock Update
        socket.emit('join_product', id);
        
        const handleStockUpdate = (data) => {
            if (data.productId === id) {
                setProduct(prev => {
                    if (!prev) return prev;
                    
                    const next = { ...prev };
                    if (data.variantId) {
                        next.variants = next.variants.map(v => 
                            v.id === data.variantId ? { ...v, stock: data.newStock } : v
                        );
                    } else {
                        next.countInStock = data.newStock;
                    }
                    return next;
                });
            }
        };

        socket.on('stock_update', handleStockUpdate);

        return () => {
            ignore = true;
            socket.off('stock_update', handleStockUpdate);
        };
    }, [id]);

    useEffect(() => {
        if (!product?.backendId) {
            return;
        }
        loadProductReviews(product.backendId);
    }, [product?.backendId]);

    const tradeInProducts = useMemo(
        () => relatedProducts.slice(0, 8).map((item) => item.name),
        [relatedProducts]
    );

    const filteredCrossSellProducts = useMemo(() => {
        let filtered = relatedProducts;

        if (crossSellTab === 'Tai nghe') {
            filtered = relatedProducts.filter((item) => item.category === 'am-thanh');
        } else if (crossSellTab === 'Đồng hồ thông minh') {
            filtered = relatedProducts.filter((item) => item.category === 'dong-ho');
        }

        const source = filtered;
        return inflateProducts(source, 4, `detail-cross-sell-${crossSellTab}`);
    }, [crossSellTab, relatedProducts]);

    const hotProducts = useMemo(
        () => inflateProducts(relatedProducts, 8, 'detail-hot'),
        [relatedProducts]
    );

    const comparisonProducts = useMemo(
        () => inflateProducts(relatedProducts, 5, 'detail-compare'),
        [relatedProducts]
    );

    const tradeInMatches = useMemo(
        () =>
            tradeInProducts.filter((item) =>
                item.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [searchQuery, tradeInProducts]
    );

    const videoUrls = useMemo(() => {
        let urls = [];
        
        // Priority 1: Use dedicated videoUrl array field
        if (Array.isArray(product?.videoUrl) && product.videoUrl.length > 0) {
            product.videoUrl.forEach(url => {
                let embedId = '';
                if (url.includes('v=')) {
                    embedId = url.split('v=')[1].split('&')[0];
                } else if (url.includes('be/')) {
                    embedId = url.split('be/')[1].split('?')[0];
                } else if (url.includes('embed/')) {
                    embedId = url.split('embed/')[1].split('?')[0];
                }
                
                if (embedId) urls.push(`https://www.youtube-nocookie.com/embed/${embedId}`);
                else if (url.includes('youtube') && url.includes('embed')) urls.push(url);
            });
        }

        // Priority 2: Fallback to extracting from description if array is empty
        if (urls.length === 0 && product?.description) {
            const matches = [...product.description.matchAll(/src="([^"]+youtube(?:-nocookie)?\.com\/embed\/([^"\s?]+)[^"]*)"/gi)];
            matches.forEach(match => {
                urls.push(match[1].replace('youtube.com', 'youtube-nocookie.com'));
            });
        }
        
        return [...new Set(urls)]; // Remove duplicates
    }, [product?.videoUrl, product?.description]);

    const cleanDescription = useMemo(() => {
        if (!product?.description) return '';
        // Remove iframe tags to avoid double video display and link-leak issues
        return product.description.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    }, [product?.description]);

    // Auto-slide for cross-sell
    useEffect(() => {
        const timer = setInterval(() => {
            setCrossSellIndex(prev => (prev + 1) % 2); // 2 pages
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextImage = () => {
        const nextIndex = (activeImageIndex + 1) % product.images.length;
        setActiveImageIndex(nextIndex);
        if (product.colors[nextIndex]) {
            setSelectedColor(product.colors[nextIndex]);
        }
    };

    const prevImage = () => {
        const prevIndex = (activeImageIndex - 1 + product.images.length) % product.images.length;
        setActiveImageIndex(prevIndex);
        if (product.colors[prevIndex]) {
            setSelectedColor(product.colors[prevIndex]);
        }
    };

    useEffect(() => {
        if (product) {
            setSelectedStorage(product.variants[0]);
            setSelectedColor(product.colors[0]);
            setActiveImageIndex(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [product]);

    const currentStock = useMemo(() => {
        if (!product || !selectedStorage || !selectedColor) return 0;
        
        const exactVariant = product.variants.find(
            v => v.storage === selectedStorage.storage && v.color === selectedColor.name
        );
        if (exactVariant) return exactVariant.stock;

        return selectedStorage.stock || product.countInStock || 0;
    }, [product, selectedStorage, selectedColor]);

    const handleAddToCart = async () => {
        try {
            await addToCart(product, selectedStorage, selectedColor);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            if (error.message === 'AUTH_REQUIRED') {
                navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
                return;
            }
            // Optional: show error message for other errors
        }
    };

    const handleAddCrossSellToCart = async (p) => {
        try {
            // For cross-sell products, we use default variants/colors if not specified
            await addToCart(p, { id: 'default', storage: '', price: p.priceNum }, { name: 'Mặc định', image: p.image });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            if (error.message === 'AUTH_REQUIRED') {
                navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
                return;
            }
        }
    };

    const handleAddWishlist = async () => {
        if (!product?.backendId) {
            setWishlistNotice('San pham khong hop le de them yeu thich.');
            setTimeout(() => setWishlistNotice(''), 2500);
            return;
        }

        try {
            await api.post('/api/user/wishlist', { productId: product.backendId });
            setWishlistNotice('Da them vao danh sach yeu thich.');
        } catch (error) {
            if (error?.response?.status === 401) {
                navigate('/login');
                return;
            }
            setWishlistNotice(
                getApiErrorMessage(error, 'Khong the them vao danh sach yeu thich.')
            );
        } finally {
            setTimeout(() => setWishlistNotice(''), 2500);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (reviewImages.length + files.length > 3) {
            alert('Bạn chỉ có thể tải lên tối đa 3 hình ảnh.');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReviewImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const showReviewNotice = (type, message) => {
        setReviewNotice({ type, message });
        setTimeout(() => setReviewNotice({ type: '', message: '' }), 3000);
    };

    const submitReview = async () => {
        const trimmedComment = String(reviewContent || '').trim();
        const safeRating = Number(reviewRating || 0);

        if (!product?.backendId) {
            showReviewNotice('error', 'Không tìm thấy sản phẩm để gửi đánh giá.');
            return;
        }

        if (trimmedComment.length < 15) {
            showReviewNotice('error', 'Vui lòng nhập nội dung tối thiểu 15 ký tự.');
            return;
        }

        if (safeRating < 1 || safeRating > 5) {
            showReviewNotice('error', 'Vui lòng chọn số sao từ 1 đến 5.');
            return;
        }

        setIsSubmittingReview(true);
        try {
            await api.post('/api/reviews', {
                productId: product.backendId,
                rating: safeRating,
                title: `Đánh giá ${safeRating} sao`,
                comment: trimmedComment,
                images: reviewImages
            });
            showReviewNotice('success', 'Gửi đánh giá thành công! Đánh giá của bạn đang được chờ duyệt.');
            setReviewContent('');
            setReviewRating(5);
            setReviewImages([]);
            await loadProductReviews(product.backendId);
        } catch (error) {
            if (error?.response?.status === 401) {
                navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
                return;
            }
            showReviewNotice(
                'error',
                getApiErrorMessage(error, 'Không thể gửi đánh giá lúc này.')
            );
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const formatReviewDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString('vi-VN');
    };

    const getCurrentUserId = () => String(user?.backendId || user?.id || '');

    const isOwnReview = (item) => {
        const reviewUserId = String(item?.user?._id || item?.user?.id || '');
        const currentUserId = getCurrentUserId();
        return Boolean(currentUserId) && reviewUserId === currentUserId;
    };

    const handleStartEditReview = (item) => {
        setEditingReviewId(item._id);
        setEditingReviewContent(item.comment || '');
        setEditingReviewRating(Number(item.rating || 0));
    };

    const handleCancelEditReview = () => {
        setEditingReviewId('');
        setEditingReviewContent('');
        setEditingReviewRating(0);
    };

    const handleSaveEditReview = async (reviewId) => {
        const nextComment = String(editingReviewContent || '').trim();
        const nextRating = Number(editingReviewRating || 0);

        if (nextComment.length < 3) {
            showReviewNotice('error', 'Nội dung đánh giá tối thiểu 3 ký tự.');
            return;
        }

        if (nextRating < 1 || nextRating > 5) {
            showReviewNotice('error', 'Vui lòng chọn số sao từ 1 đến 5.');
            return;
        }

        setReviewActionLoadingId(reviewId);
        try {
            await api.patch(`/api/reviews/${reviewId}`, {
                rating: nextRating,
                comment: nextComment,
                title: `Đánh giá ${nextRating} sao`,
            });
            showReviewNotice('success', 'Đã cập nhật đánh giá.');
            handleCancelEditReview();
            await loadProductReviews(product.backendId);
        } catch (error) {
            if (error?.response?.status === 401) {
                navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
                return;
            }
            showReviewNotice('error', getApiErrorMessage(error, 'Không thể cập nhật đánh giá.'));
        } finally {
            setReviewActionLoadingId('');
        }
    };

    const handleDeleteMyReview = async (reviewId) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        setReviewActionLoadingId(reviewId);
        try {
            await api.delete(`/api/reviews/${reviewId}`);
            showReviewNotice('success', 'Đã xóa đánh giá.');
            await loadProductReviews(product.backendId);
        } catch (error) {
            if (error?.response?.status === 401) {
                navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
                return;
            }
            showReviewNotice('error', getApiErrorMessage(error, 'Không thể xóa đánh giá.'));
        } finally {
            setReviewActionLoadingId('');
        }
    };

    if (isLoading || !product || !selectedStorage || !selectedColor) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Info className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {isLoading
                        ? 'Đang tải thông tin sản phẩm'
                        : 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh'}
                </h2>
                <Link to="/" className="bg-[#00917a] text-white px-6 py-2 rounded-lg font-bold">Quay lại trang chủ</Link>
            </div>
        );
    }

    // Interactive Star Rating Picker
    const StarRatingPicker = ({ value, onChange }) => {
        const [hovered, setHovered] = React.useState(0);
        return (
            <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(s)}
                        className="transition-transform hover:scale-125"
                    >
                        <svg className={`w-7 h-7 transition-colors ${s <= (hovered || value) ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-10 font-sans text-gray-800">
            <div className="max-w-[1600px] mx-auto px-4 pt-6">
                <Breadcrumbs />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 pt-4">
                
                {/* Product Title Banner */}
                <div className="mb-4">
                    <h1 className="text-[26px] font-bold text-[#333] tracking-tight mb-2">{product.name}</h1>
                    
                    {/* Product Tags (Hashtags) */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {product.tags.map((tag, idx) => (
                                <Link 
                                    key={idx} 
                                    to={`/search?keyword=${encodeURIComponent(tag)}`}
                                    className="text-[13px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* LEFT COLUMN: Media & Description */}
                    <div className="flex-1 min-w-0 space-y-6">
                        
                        <div className="bg-white rounded-xl shadow-sm p-4 overflow-hidden relative group">
                            <div className="aspect-[4/3] flex items-center justify-center relative">
                                <img 
                                    src={product.images[activeImageIndex]} 
                                    className="max-h-full max-w-full object-contain transition-all duration-500"
                                    alt={product.name}
                                />

                                {/* NAVIGATION ARROWS */}
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-50/80 hover:bg-emerald-100 text-[#00917a] rounded-full flex items-center justify-center shadow-md transition-all z-10"
                                >
                                    <ChevronLeft size={28} strokeWidth={3} />
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-50/80 hover:bg-emerald-100 text-[#00917a] rounded-full flex items-center justify-center shadow-md transition-all z-10"
                                >
                                    <ChevronRight size={28} strokeWidth={3} />
                                </button>

                                <button
                                    onClick={handleAddWishlist}
                                    className="absolute top-4 right-4 p-2.5 bg-white/90 rounded-full shadow-md text-[#cc0000] hover:scale-110 transition-transform"
                                >
                                    <Heart size={22} />
                                </button>
                                <div className="absolute top-4 right-16 p-2.5 bg-white/90 rounded-full shadow-md text-gray-600 hover:scale-110 transition-transform">
                                    <Share2 size={22} />
                                </div>
                            </div>
                            
                            {/* Action Buttons below image */}
                            <div className="flex justify-center gap-4 mt-6">
                                <button 
                                    onClick={() => {
                                        if (videoRef.current) {
                                            videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        } else {
                                            const videoElement = descriptionRef.current?.querySelector('.video-wrapper');
                                            if (videoElement) {
                                                videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                if (!isDescriptionExpanded) setIsDescriptionExpanded(true);
                                            } else {
                                                descriptionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1 group"
                                    style={{ display: videoUrls.length > 0 ? 'flex' : 'none' }}
                                >
                                    <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center group-hover:border-[#00917a] group-hover:text-[#00917a] transition-all">
                                        <Video size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase">Video</span>
                                </button>
                                {product.colors.map((c, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => { setSelectedColor(c); setActiveImageIndex(i % product.images.length); }}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden transition-all ${selectedColor.name === c.name ? 'border-[#00917a]' : 'border-gray-200'}`}>
                                            <img src={c.image} className="w-8 h-8 object-contain" alt={c.name} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${selectedColor.name === c.name ? 'text-[#00917a]' : ''}`}>{c.name}</span>
                                    </button>
                                ))}
                                <button 
                                    onClick={() => specsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center group-hover:border-[#00917a] transition-all">
                                        <Settings size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-center leading-tight">Thông số<br/>kỹ thuật</span>
                                </button>
                                <button 
                                    onClick={() => descriptionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center group-hover:border-[#00917a] transition-all">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-center leading-tight">Thông tin<br/>sản phẩm</span>
                                </button>
                            </div>
                        </div>

                        {/* PRODUCT COMMITMENT */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-[#00917a]">
                            <h3 className="text-center font-bold text-[15px] text-[#333] uppercase mb-4 tracking-wider">Cam kết sản phẩm</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Truck className="text-[#00917a] shrink-0" size={20} />
                                    <p className="text-[13px] leading-snug">Miễn phí vận chuyển toàn quốc <span className="text-[#00917a] font-bold">(Xem chi tiết)</span></p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="text-[#00917a] shrink-0" size={20} />
                                    <p className="text-[13px] leading-snug">Bảo hành chính hãng 12 tháng <span className="text-[#00917a] font-bold">(Xem chi tiết)</span></p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <RefreshCw className="text-[#00917a] shrink-0" size={20} />
                                    <p className="text-[13px] leading-snug">Lỗi Đổi Liền trong 12 tháng, miễn phí 30 ngày đầu <span className="text-[#00917a] font-bold">(Xem chi tiết)</span></p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Info className="text-[#00917a] shrink-0" size={20} />
                                    <p className="text-[13px] leading-snug">Giá đã bao gồm VAT, xuất hóa đơn ngay <span className="text-[#00917a] font-bold">(Xem chi tiết)</span></p>
                                </div>
                            </div>
                        </div>

                        {/* STORE AVAILABILITY */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-6 py-3 flex items-center gap-3">
                                <MapPin size={20} className="text-[#333]" />
                                <h3 className="font-bold text-[14px] uppercase text-[#333]">Địa chỉ còn hàng</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <select 
                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-[13px] outline-none focus:border-[#00917a]"
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                    >
                                        <option>Hồ Chí Minh</option>
                                        <option>Hà Nội</option>
                                        <option>Đà Nẵng</option>
                                    </select>
                                    <select className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-[13px] outline-none focus:border-[#00917a]">
                                        <option>Quận/Huyện</option>
                                    </select>
                                </div>
                                <p className="text-[12px] font-bold text-gray-500">Có <span className="text-[#00917a]">23</span> Cửa hàng còn hàng</p>
                                <div className="max-h-[350px] overflow-y-auto hh-scrollbar pr-2 space-y-4">
                                    {[
                                        { phone: "0965868348", addr: "348 Hồ Tùng Mậu, Phường Phú Diễn, Hà Nội", note: "(Có hàng trải nghiệm)" },
                                        { phone: "0973790122", addr: "122 Thái Hà, Phường Đống Đa, Hà Nội", note: "" },
                                        { phone: "0968668995", addr: "126 Phố Huế, Phường Hai Bà Trưng, Hà Nội", note: "" },
                                        { phone: "0902289339", addr: "182 Cao Lỗ, Xã Đông Anh, Hà Nội", note: "(Có hàng trải nghiệm)" },
                                        { phone: "0782468368", addr: "330 Nguyễn Trãi, Phường Thanh Xuân, Hà Nội", note: "(Có hàng trải nghiệm)" },
                                        { phone: "0979246877", addr: "77 Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội", note: "(Có hàng trải nghiệm)" },
                                        { phone: "0886868101", addr: "101 Kim Mã, Phường Giảng Võ, Hà Nội", note: "(Có hàng trải nghiệm)" }
                                    ].map((store, i) => (
                                        <div key={i} className="flex items-center gap-6 py-1 overflow-hidden group">
                                            {/* Zalo & Phone */}
                                            <div className="flex items-center gap-2 w-[160px] shrink-0">
                                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center p-1 shrink-0 shadow-sm">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="zalo" className="w-full h-full invert brightness-0" />
                                                </div>
                                                <span className="text-[14px] font-bold text-gray-700 tracking-tight">{store.phone}</span>
                                            </div>

                                            {/* Pin Icon */}
                                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 shadow-md">
                                                <MapPin size={16} className="text-white" />
                                            </div>

                                            {/* Address & Note */}
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-[14px] font-medium text-[#00917a] hover:underline cursor-pointer truncate">
                                                    {store.addr}
                                                </p>
                                                {store.note && (
                                                    <span className="text-[13px] text-[#00917a] font-bold leading-none mt-1">{store.note}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CROSS-SELL SECTION: COMPACT AUTO-SLIDER CAROUSEL */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                            <h3 className="text-[18px] font-bold text-[#333]">Sản phẩm mua cùng</h3>
                            
                            <div className="flex gap-2">
                                {['Tất cả', 'Tai nghe', 'Đồng hồ thông minh'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setCrossSellTab(tab)}
                                        className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all border ${
                                            crossSellTab === tab 
                                            ? 'bg-[#00917a] text-white border-[#00917a]' 
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-[#00917a] hover:text-[#00917a]'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="relative overflow-hidden group/cs">
                                <div 
                                    className="flex transition-transform duration-1000 ease-in-out" 
                                    style={{ transform: `translateX(-${crossSellIndex * 100}%)` }}
                                >
                                    {[0, 1].map(page => (
                                        <div key={page} className="min-w-full grid grid-cols-2 gap-4">
                                            {filteredCrossSellProducts.slice(page * 2, page * 2 + 2).map((p) => (
                                                <div key={p.uiKey || p.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 group/card bg-white">
                                                    <div className="relative w-full aspect-square flex items-center justify-center mb-4 overflow-hidden">
                                                        <img src={p.image} className="max-h-[80%] max-w-[80%] object-contain group-hover/card:scale-105 transition-transform duration-700" alt={p.name} />
                                                        {p.discount && (
                                                            <div className="absolute top-0 right-0 bg-[#cc0000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{String(p.discount).replace(/^-+/, '')}</div>
                                                        )}
                                                    </div>
                                                    <div className="w-full space-y-3">
                                                        <h4 className="text-[13px] font-bold text-[#333] line-clamp-2 h-9 leading-snug">{p.name}</h4>
                                                        <div className="space-y-0.5">
                                                            {p.oldPriceNum ? (
                                                                <div className="flex items-center gap-2 text-[12px] text-gray-300 line-through">
                                                                    {formatPrice(p.oldPriceNum)}
                                                                </div>
                                                            ) : null}
                                                            <div className="text-[#cc0000] font-black text-[18px] tracking-tight">{formatPrice(p.priceNum)}</div>
                                                        </div>
                                                        <div className="bg-[#f0faf7] rounded-lg px-3 py-1.5 flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-[#00917a]">Giá Member</span>
                                                            <span className="text-[#00917a] font-black text-[14px]">{formatPrice(p.memberPrice || p.priceNum)}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleAddCrossSellToCart(p)}
                                                            className="w-full bg-[#cc0000] hover:bg-[#b00000] text-white py-2.5 rounded-xl text-[12px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                                                        >
                                                            <ShoppingCart size={16} /> Thêm giỏ hàng
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center gap-2">
                                {[0, 1].map(i => (
                                    <div 
                                        key={i}
                                        onClick={() => setCrossSellIndex(i)}
                                        className={`h-1 rounded-full transition-all cursor-pointer ${crossSellIndex === i ? 'w-10 bg-[#00917a]' : 'w-6 bg-emerald-100'}`}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>



                    {/* RIGHT COLUMN: Selection & Sidebar */}
                    <div className="w-full lg:w-[700px] space-y-6">
                        
                        {/* VERSION SELECTION */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                            <div className="flex flex-wrap items-end gap-3">
                                <span className="text-[#cc0000] text-[28px] font-black">{formatPrice(selectedStorage.price)}</span>
                                <span className="text-gray-400 line-through text-[14px] mb-1">{formatPrice(selectedStorage.price * 1.2)}</span>
                            </div>

                            
                            <div className="space-y-4">
                                <h4 className="text-[13px] font-bold">Lựa chọn phiên bản</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.variants.map((v) => (
                                        <button 
                                            key={v.id}
                                            onClick={() => setSelectedStorage(v)}
                                            className={`p-3 rounded-lg border-2 text-left transition-all relative ${selectedStorage.id === v.id ? 'border-[#00917a] bg-emerald-50' : 'border-gray-100 bg-white'}`}
                                        >
                                            <p className="text-[14px] font-bold">{v.storage}</p>
                                            <p className="text-[#cc0000] text-[14px] font-black">{formatPrice(v.price)}</p>
                                            {selectedStorage.id === v.id && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#00917a] text-white rounded-tl-lg p-0.5">
                                                    <ShieldCheck size={12} fill="white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[13px] font-bold">Lựa chọn màu sắc</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.colors.map((c, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setSelectedColor(c)}
                                            className={`p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2 relative ${selectedColor.name === c.name ? 'border-[#00917a] bg-emerald-50' : 'border-gray-100 bg-white'}`}
                                        >
                                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100">
                                                <img src={c.image} className="w-full h-full object-contain" alt={c.name} />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold leading-none mb-1">{c.name}</p>
                                                <p className="text-[#cc0000] text-[13px] font-black leading-none">{formatPrice(selectedStorage.price)}</p>
                                            </div>
                                            {selectedColor.name === c.name && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#00917a] text-white rounded-tl-lg p-0.5">
                                                    <ShieldCheck size={12} fill="white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* DYNAMIC STOCK INDICATOR */}
                                <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                                    <span className="text-[13px] font-bold text-gray-600">Tình trạng kho:</span>
                                    {currentStock > 0 ? (
                                        <div className="flex items-center gap-1.5 text-[#00917a] bg-emerald-50 px-3 py-1 rounded-full font-black text-[13px]">
                                            <ShieldCheck size={14} />
                                            <span>Còn {currentStock} sản phẩm</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[#cc0000] bg-red-50 px-3 py-1 rounded-full font-black text-[13px]">
                                            <Info size={14} />
                                            <span>Tạm hết hàng</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PRICE BOXES (Member & Trade-in) */}
                            <div className="space-y-3">
                                <div className="bg-[#f0faf7] border border-[#d0ede7] rounded-xl p-5 flex justify-between items-center relative overflow-hidden group">
                                     <div className="relative z-10">
                                        <p className="text-[13px] text-gray-600 font-bold mb-1">Mức giá dành riêng cho hạng MEMBER chỉ còn</p>
                                        <p className="text-[#008d71] font-black text-[26px] tracking-tight">{formatPrice(selectedStorage.price - 500000)}</p>
                                        <div className="bg-white/80 border border-emerald-100 rounded-full px-4 py-1 mt-2 flex items-center gap-2 w-fit">
                                            <Star size={14} className="fill-amber-400 text-amber-400" />
                                            <span className="text-[12px] font-bold text-gray-700">+26,000 Điểm thưởng</span>
                                        </div>
                                     </div>
                                     {!user ? (
                                        <Link to="/login" className="absolute top-2 right-4 text-[12px] text-blue-600 font-bold hover:underline">Đăng nhập ngay</Link>
                                     ) : (
                                        <div className="absolute top-2 right-4 flex items-center gap-1.5 text-[11px] text-[#008d71] font-black uppercase bg-emerald-100/50 px-2 py-0.5 rounded-full">
                                            <ShieldCheck size={14} /> Member
                                        </div>
                                     )}
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-[13px] text-gray-600 font-bold mb-1">Thu cũ lên đời chỉ từ</p>
                                        <p className="text-[#333] font-black text-[24px]">{formatPrice(selectedStorage.price - 3000000)}</p>
                                        <p className="text-[13px] text-[#cc0000] font-bold mt-1">Trợ giá đến 3.000.000 đ</p>
                                    </div>
                                    <button className="text-blue-600 text-[12px] font-bold hover:underline">Định giá ngay</button>
                                </div>
                            </div>

                            {/* BUY BUTTONS */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={currentStock <= 0}
                                    className={`flex-1 bg-white border-2 p-4 rounded-xl flex items-center justify-center transition-all ${currentStock > 0 ? 'border-[#cc0000] text-[#cc0000] hover:bg-red-50' : 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'}`}
                                >
                                    <ShoppingCart size={24} />
                                </button>
                                <button 
                                    onClick={() => currentStock > 0 && setShowBuyModal(true)} 
                                    disabled={currentStock <= 0}
                                    className={`flex-[4] p-4 rounded-xl font-black text-[18px] uppercase transition-all ${currentStock > 0 ? 'bg-[#cc0000] text-white shadow-lg shadow-red-200 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                >
                                    {currentStock > 0 ? 'Mua ngay' : 'Hết hàng'}
                                    {currentStock > 0 && <span className="block text-[11px] font-medium normal-case opacity-80">(Giao tận nhà hoặc nhận tại cửa hàng)</span>}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="bg-[#00917a] text-white py-3 rounded-xl font-bold text-[13px] uppercase">Trả góp 0%</button>
                                <button className="bg-[#00917a] text-white py-3 rounded-xl font-bold text-[14px] uppercase">Trả góp qua thẻ</button>
                            </div>

                            {/* TRADE-IN BOX - REFINED SINGLE LINE LAYOUT */}
                            <div className="bg-[#f2f2f2] border border-gray-200 rounded-xl p-3 flex items-center gap-4 shadow-sm">
                                {/* Left: Icon & Title Group */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-11 h-11 bg-[#ff424e] rounded-lg flex items-center justify-center text-white shadow-md">
                                        <RefreshCw size={22} className="animate-spin-slow" />
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-black text-[15px] text-[#333]">Thu cũ lên đời</span>
                                        <span className="text-[12px] text-gray-500 font-bold">Trợ giá đến: <span className="text-[#008d71] underline font-black">500.000 đ</span></span>
                                    </div>
                                </div>
                                
                                {/* Middle: Searchable Autocomplete Input */}
                                <div className="flex-1 relative group/search">
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            placeholder="Tìm sản phẩm muốn thu cũ"
                                            className="w-full bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2.5 text-[13px] font-bold text-gray-700 outline-none focus:border-[#ff424e] focus:ring-2 focus:ring-red-100 transition-all h-[42px] placeholder:text-gray-400"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <ChevronRight size={14} className="rotate-90" />
                                        </div>
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && searchQuery.length > 0 && (
                                        <div className="absolute bottom-full left-0 w-full bg-white border border-gray-100 rounded-t-xl shadow-2xl z-50 mb-1 max-h-[250px] overflow-y-auto hh-scrollbar p-2 ring-1 ring-gray-200 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="text-[11px] font-bold text-gray-400 px-3 py-1 uppercase">Gợi ý sản phẩm ({tradeInMatches.length})</div>
                                            {tradeInMatches.length > 0 ? (
                                                tradeInMatches
                                                    .map((p, idx) => (
                                                        <div 
                                                            key={idx}
                                                            onClick={() => {
                                                                setSearchQuery(p);
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="px-3 py-2.5 hover:bg-red-50 hover:text-[#ff424e] cursor-pointer rounded-lg text-[13px] font-bold transition-all border-b border-gray-50 last:border-0"
                                                        >
                                                            {p}
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className="px-3 py-4 text-center text-gray-400 text-[12px] italic">
                                                    Không tìm thấy sản phẩm phù hợp
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Action Button */}
                                <button className="bg-[#ff424e] hover:bg-[#e63946] text-white px-4 py-2.5 rounded-lg text-[13px] font-black flex items-center gap-1 transition-all active:scale-95 shrink-0 shadow-md h-[42px]">
                                    Kiểm tra ngay <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* PROMO SIDEBAR 1: ƯU ĐÃI PHONESIN */}
                        <div className="bg-red-50 rounded-xl shadow-sm overflow-hidden border border-red-100">
                             <div className="bg-red-100/50 px-4 py-2 flex items-center gap-2">
                                <Star size={16} className="text-[#cc0000] fill-[#cc0000]" />
                                <h4 className="font-bold text-[13px] text-[#cc0000] uppercase tracking-wide">Ưu đãi PhoneSin</h4>
                             </div>
                             <div className="p-4 space-y-5">
                                {[
                                    "Trả góp lên đến 18 tháng qua Samsung Finance",
                                    "Tặng gói dịch vụ đặc quyền (Google AI Pro 6 tháng, VIEON VIP 6 tháng...)",
                                    "Nhận ngay gói data 5G – Ưu đãi độc quyền cho chủ sở hữu Samsung Galaxy",
                                    "Giảm ngay 10% khi mua điện thoại phím 4G kèm Smart Phone/Máy tính bảng/Laptop",
                                    "Thu cũ đổi mới trợ giá lên đến 2.000.000đ",
                                    "Giao hàng nhanh miễn phí trong 2 giờ"
                                ].slice(0, isPromoExpanded ? 10 : 3).map((promo, idx) => (
                                    <div key={idx} className="flex gap-4 items-start group">
                                        <div className="w-6 h-6 rounded-full bg-[#cc0000] text-white flex items-center justify-center text-[12px] font-black shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                            {idx + 1}
                                        </div>
                                        <p className="text-[15px] text-gray-700 font-medium leading-tight group-hover:text-[#cc0000] transition-colors">
                                            {promo}
                                        </p>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => setIsPromoExpanded(!isPromoExpanded)}
                                    className="w-full text-center text-[13px] font-black text-[#555] uppercase flex items-center justify-center gap-1 mt-2 hover:text-[#cc0000] transition-colors"
                                >
                                    {isPromoExpanded ? (
                                        <>Thu gọn ưu đãi <ChevronLeft size={14} className="rotate-90" /></>
                                    ) : (
                                        <>Xem thêm ưu đãi sản phẩm <ChevronLeft size={14} className="-rotate-90" /></>
                                    )}
                                </button>
                             </div>
                        </div>

                        {/* PROMO SIDEBAR 2: ƯU ĐÃI THANH TOÁN - INTERACTIVE LOGO GRID */}
                        <div className="bg-emerald-50 rounded-xl shadow-sm overflow-hidden border border-emerald-100">
                             <div className="bg-emerald-100/50 px-4 py-3 flex items-center gap-2 border-b border-emerald-100">
                                <div className="bg-[#00917a] p-1.5 rounded-lg text-white shadow-sm">
                                   <Wallet size={18} />
                                </div>
                                <h4 className="font-black text-[15px] text-[#00917a] uppercase tracking-tight">Ưu đãi thanh toán</h4>
                             </div>
                             <div className="p-4 space-y-5 bg-white">
                                <div className="grid grid-cols-4 gap-2">
                                   {paymentOffers.map((offer, idx) => (
                                       <button 
                                           key={idx}
                                           onClick={() => setSelectedPayment(idx)}
                                           className={`relative h-[55px] border rounded-lg p-1.5 flex items-center justify-center transition-all ${
                                               selectedPayment === idx 
                                               ? 'border-[#00917a] bg-emerald-50/30' 
                                               : 'border-gray-200 hover:border-[#00917a]'
                                           }`}
                                       >
                                           <img src={offer.logo} alt={offer.name} className="max-w-full max-h-full object-contain" />
                                           {selectedPayment === idx && (
                                               <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#00917a]"></div>
                                           )}
                                       </button>
                                   ))}
                                </div>

                                <div className="pt-2">
                                   <p className="text-[14px] leading-relaxed text-gray-700 font-medium italic">
                                       {paymentOffers[selectedPayment].desc} <span className="text-[#00917a] font-black cursor-pointer hover:underline">(Xem chi tiết)</span>
                                   </p>
                                </div>
                             </div>
                        </div>

                        {/* TECHNICAL SPECS SECTION - REDESIGNED */}
                        <div ref={specsRef} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
                            <div className="bg-[#f8fafc] px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#00917a] p-2 rounded-lg text-white shadow-sm">
                                        <Settings size={18} />
                                    </div>
                                    <h4 className="font-black text-[16px] uppercase text-[#333] tracking-tight">Thông số kỹ thuật</h4>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {/* Main Specs Grid - Modern Cards */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[
                                        { label: 'Màn hình', value: product.specs?.screen || '6.7"', icon: <Monitor size={20} />, color: 'bg-blue-50 text-blue-600' },
                                        { label: 'CPU', value: product.specs?.chip || 'Apple A17', icon: <Cpu size={20} />, color: 'bg-purple-50 text-purple-600' },
                                        { label: 'RAM', value: product.specs?.ram || '8GB', icon: <Box size={20} />, color: 'bg-amber-50 text-amber-600' },
                                        { label: 'Bộ nhớ', value: product.rom || product.storage || '256GB', icon: <HardDrive size={20} />, color: 'bg-emerald-50 text-emerald-600' }
                                    ].map((s, idx) => (
                                        <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#00917a] hover:shadow-md transition-all group">
                                            <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                {s.icon}
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-400 uppercase mb-1">{s.label}</span>
                                            <span className="text-[14px] font-black text-[#333] text-center line-clamp-1">{s.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Preview Specs List */}
                                <div className="space-y-3 mb-6">
                                    {product.specs_detailed.slice(0, 5).map((spec, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-dashed border-gray-100 last:border-0">
                                            <span className="text-[13px] font-bold text-gray-500">{spec.label}</span>
                                            <span className="text-[13px] font-black text-[#333]">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setShowSpecsModal(true)}
                                    className="w-full bg-white border-2 border-gray-200 text-[#333] hover:border-[#00917a] hover:text-[#00917a] py-3 rounded-xl text-[14px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                                >
                                    Cấu hình chi tiết <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Technical Specs Modal */}
                        {showSpecsModal && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSpecsModal(false)}></div>
                                <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#00917a] p-2 rounded-lg text-white">
                                                <Settings size={20} />
                                            </div>
                                            <h3 className="text-[18px] font-black text-[#333] uppercase">Thông số kỹ thuật chi tiết</h3>
                                        </div>
                                        <button 
                                            onClick={() => setShowSpecsModal(false)}
                                            className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                    
                                    <div className="p-6 max-h-[70vh] overflow-y-auto hh-scrollbar">
                                        <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                            {product.specs_detailed.map((spec, i) => (
                                                <div key={i} className={`flex items-start px-6 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} border-b border-gray-100 last:border-0`}>
                                                    <span className="text-[14px] font-bold text-gray-500 w-1/3 shrink-0">{spec.label}</span>
                                                    <span className="text-[14px] font-black text-[#333] flex-1">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                                        <button 
                                            onClick={() => setShowSpecsModal(false)}
                                            className="w-full bg-[#333] text-white py-3.5 rounded-xl font-black uppercase text-[14px] shadow-lg hover:bg-black transition-all active:scale-95"
                                        >
                                            Đóng lại
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* VIDEO SECTION - Dynamic Rendering */}
                {videoUrls.length > 0 && (
                    <section ref={videoRef} className="mt-10">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-[18px] font-bold text-[#333] mb-5">
                                {videoUrls.length > 1 ? `Danh sách Video về ${product.name}` : `Video về ${product.name}`}
                            </h2>
                            <div className={`grid gap-6 ${videoUrls.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'max-w-[900px] mx-auto'}`}>
                                {videoUrls.map((url, index) => (
                                    <div key={index} className="video-wrapper">
                                        <iframe 
                                            src={url} 
                                            title={`Video ${product.name} ${index + 1}`}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* PRODUCT INFO SECTION - FULL WIDTH BENEATH COLUMNS */}
                <div className="mt-10">
                    <div ref={descriptionRef} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative group">
                        <div className="bg-[#f2f2f2] px-6 py-3 flex items-center gap-3 border-b border-gray-200">
                            <FileText size={20} className="text-[#333]" />
                            <h4 className="font-extrabold text-[15px] uppercase text-[#333] tracking-wide">Thông tin sản phẩm</h4>
                        </div>
                        
                        <div className={`p-8 transition-all duration-1000 ease-in-out overflow-hidden ${!isDescriptionExpanded ? 'max-h-[700px]' : 'max-h-[5000px]'}`}>
                            {/* Box: Nội dung chính */}
                            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-8 mb-10">
                                <h2 className="text-[24px] font-bold text-[#333] mb-8">Nội dung chính</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 text-[16px] text-gray-700 font-medium">
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 rounded-full border-2 border-[#333] mt-2 shrink-0"></div>
                                        <span>Đánh giá chi tiết điện thoại {product.name}</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 rounded-full border-2 border-[#333] mt-2 shrink-0"></div>
                                        <span>Thiết kế hiện đại, đỉnh cao công nghệ tương lai</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 rounded-full border-2 border-[#333] mt-2 shrink-0"></div>
                                        <span>Hiệu năng vượt trội, đa nhiệm không giới hạn</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 rounded-full border-2 border-[#333] mt-2 shrink-0"></div>
                                        <span>Hệ thống Camera AI sắc nét ấn tượng, quay phim 8K</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 rounded-full border-2 border-[#333] mt-2 shrink-0"></div>
                                        <span>Thời lượng pin ấn tượng, công nghệ sạc nhanh thần tốc</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 rounded-full border-2 border-[#333] mt-2 shrink-0"></div>
                                        <span>Tính năng bảo mật tối tân và hệ sinh thái thông minh</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Content Area - Rendering Real Product Description */}
                            <div className="space-y-8 max-w-[1200px] mx-auto px-4 md:px-10 pb-20">
                                <div 
                                    className="product-description-content"
                                    dangerouslySetInnerHTML={{ __html: cleanDescription }}
                                    style={{ 
                                        fontSize: '17px', 
                                        lineHeight: '1.8', 
                                        color: '#374151'
                                    }}
                                />
                                
                                {/* Fallback if description is very short or missing images */}
                                {!product.description?.includes('<img') && (
                                    <div className="text-center space-y-6 mt-10">
                                        <img src={product.image} className="w-full max-w-[800px] mx-auto rounded-3xl shadow-xl border border-gray-100" alt="Product Detail" />
                                        <p className="text-[15px] italic text-gray-500 font-medium">Hình ảnh minh họa sản phẩm {product.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${!isDescriptionExpanded 
                            ? 'absolute bottom-0 left-0 w-full flex justify-center pb-10 pt-40 bg-gradient-to-t from-white via-white/95 to-transparent z-20 pointer-events-none' 
                            : 'relative flex justify-center py-10 bg-white border-t border-gray-50 z-20'}`}>
                            <button 
                                onClick={() => {
                                    setIsDescriptionExpanded(!isDescriptionExpanded);
                                    if(isDescriptionExpanded) {
                                        descriptionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="bg-white border-2 border-gray-300 text-[#333] px-20 py-3.5 rounded-xl text-[15px] font-black uppercase flex items-center gap-6 hover:bg-black hover:text-white hover:border-black transition-all shadow-xl active:scale-95 group pointer-events-auto"
                            >
                                {isDescriptionExpanded ? (
                                    <><span>Thu gọn nội dung bài viết</span> <ChevronLeft className="rotate-90" size={20} /></>
                                ) : (
                                    <><span>Xem toàn bộ bài viết chi tiết</span> <ChevronLeft size={20} className="-rotate-90" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* HOT PRODUCTS SECTION */}
                <section className="mt-10">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-[17px] font-black text-[#333] uppercase tracking-tight">
                                Có thể bạn quan tâm - <span className="text-[#cc0000]">Top sản phẩm hot</span> trong tầm giá
                            </h2>
                        </div>

                        {/* Carousel */}
                        <div className="relative px-6 py-5">
                            {/* Left Arrow */}
                            <button 
                                onClick={() => setHotIndex(prev => Math.max(0, prev - 1))}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-30"
                                disabled={hotIndex === 0}
                            >
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>

                            {/* Products Grid */}
                            <div className="overflow-hidden mx-8">
                                <div 
                                    className="flex transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${hotIndex * 25}%)` }}
                                >
                                    {hotProducts.map((p, i) => (
                                        <div key={p.uiKey || p.id || i} className="min-w-[25%] px-2">
                                            <Link to={`/product/${p.routeId || p.id}`} className="block border border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 group bg-white hover:border-gray-200">
                                                
                                                {/* Spec Badges */}
                                                <div className="text-[11px] text-gray-400 space-y-1 mb-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.5"/><path d="M8 21h8M12 17v4" strokeWidth="1.5"/></svg>
                                                        <span className="truncate">{p.specs?.chip || 'Snapdragon 8 Gen 3'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="1.5"/></svg>
                                                        <span>{p.specs?.resolution || '2400 × 1080'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="4" width="12" height="18" rx="2" strokeWidth="1.5"/><path d="M10 2h4" strokeWidth="1.5"/></svg>
                                                        <span>{p.specs?.pin || '5000mAh'}</span>
                                                    </div>
                                                </div>

                                                {/* Product Image */}
                                                <div className="flex items-center justify-center h-[140px] mb-3 overflow-hidden">
                                                    <img 
                                                        src={p.image} 
                                                        alt={p.name}
                                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>

                                                {/* Product Name */}
                                                <h3 className="text-[13px] font-bold text-[#333] line-clamp-2 mb-2 leading-snug min-h-[36px]">{p.name}</h3>

                                                {/* Price */}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[12px] text-gray-400 line-through">{formatPrice(p.oldPriceNum || Math.round((p.priceNum || 0) * 1.1))}</span>
                                                    <span className="text-[12px] font-black text-[#cc0000]">-{String(p.discount || '10%').replace(/^-+/, '')}</span>
                                                </div>
                                                <p className="text-[18px] font-black text-[#cc0000] mb-3">{formatPrice(p.priceNum)}</p>

                                                {/* Badges */}
                                                <div className="space-y-1.5 mb-4">
                                                    <div className="bg-[#e8f8f4] text-[#00917a] text-[11px] font-bold px-2 py-1 rounded-md">
                                                        PhoneSin Member giảm thêm tới <strong>{formatPrice(Math.max((p.priceNum || 0) - (p.memberPrice || p.priceNum), 0))}</strong>
                                                    </div>
                                                    <div className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-1 rounded-md">
                                                        PhoneSin Edu giảm thêm <strong>-200.000đ</strong>
                                                    </div>
                                                    <div className="bg-orange-400 text-white text-[11px] font-bold px-2 py-1 rounded-md inline-flex items-center gap-1">
                                                        Tích điểm <strong>+{13 - i}000 Điểm</strong>
                                                    </div>
                                                </div>

                                                {/* CTA Buttons */}
                                                <div className="flex items-center gap-2">
                                                    <button className="flex-1 bg-[#00917a] hover:bg-[#00795f] text-white py-2.5 rounded-lg text-[12px] font-black uppercase tracking-wide transition-all active:scale-95">
                                                        Mua ngay
                                                    </button>
                                                    <span className="text-[13px] font-bold text-gray-500 hover:text-[#00917a] flex items-center gap-0.5 shrink-0 transition-colors cursor-pointer">
                                                        Chi tiết <ChevronRight size={14} />
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Arrow */}
                            <button 
                                onClick={() => setHotIndex(prev => Math.min(4, prev + 1))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-30"
                                disabled={hotIndex >= 4}
                            >
                                <ChevronRight size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 pb-5">
                            {[0,1,2,3,4].map(i => (
                                <button 
                                    key={i} 
                                    onClick={() => setHotIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${hotIndex === i ? 'w-8 bg-[#00917a]' : 'w-4 bg-gray-200 hover:bg-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* COMPARE SIMILAR PRODUCTS */}
                <section className="mt-10">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {/* Title */}
                        <h2 className="text-[20px] font-black text-[#333] uppercase mb-5">So sánh sản phẩm tương tự</h2>

                        {/* Search Bar */}
                        <div className="relative mb-8">
                            <input
                                type="text"
                                placeholder="Nhập tên sản phẩm cần so sánh"
                                className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-[14px] outline-none focus:border-[#00917a] focus:ring-2 focus:ring-emerald-100 transition-all text-gray-600 placeholder:text-gray-400"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00917a] hover:bg-[#00795f] transition-colors rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Product Comparison Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {comparisonProducts.map((p, i) => {
                                const savings = [1000000, 1800000, 1200000, 2400000, 2100000][i] || 1000000;
                                const originalPrice = (p.priceNum || 5000000) + savings;
                                return (
                                    <div key={p.uiKey || p.id || i} className="border border-gray-100 rounded-xl p-4 flex flex-col items-center hover:shadow-md transition-all duration-300 group">
                                        {/* Image */}
                                        <div className="w-full flex items-center justify-center h-[160px] mb-3 overflow-hidden">
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-[13px] font-bold text-[#333] text-center line-clamp-2 mb-3 min-h-[36px] leading-snug">{p.name}</h3>

                                        {/* Final Price Badge */}
                                        <div className="w-full bg-[#fff0f0] border border-red-100 rounded-lg px-3 py-2 text-center mb-2">
                                            <p className="text-[11px] font-bold text-[#cc0000] uppercase">Giá cuối:</p>
                                            <p className="text-[15px] font-black text-[#cc0000]">{formatPrice(p.priceNum)}</p>
                                        </div>

                                        {/* Savings */}
                                        <div className="w-full bg-[#e8f8f4] border border-emerald-100 rounded-lg px-3 py-1.5 text-center mb-3">
                                            <p className="text-[12px] font-bold text-[#00917a]">
                                                Đã tiết kiệm <strong>{formatPrice(savings)}</strong>
                                            </p>
                                        </div>

                                        {/* Compare Button */}
                                        <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#cc0000] hover:text-[#a00000] transition-colors group/btn">
                                            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center shrink-0 group-hover/btn:bg-[#cc0000] group-hover/btn:text-white transition-all">
                                                <Plus size={11} />
                                            </div>
                                            So sánh
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>




                {/* NEWS SECTION */}
                <section className="mt-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-[18px] font-black text-[#333] uppercase mb-5">Tin {product.name}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: `So sánh ${product.name} vs phiên bản tiền nhiệm: Có gì đáng để nâng cấp`,
                                    date: '08-04-2026',
                                    img: product.image,
                                },
                                {
                                    title: `So sánh top 3 smartphone ${product.name.split(' ').slice(0,3).join(' ')} Series: Mẫu nào đáng mua đầu năm 2026`,
                                    date: '08-04-2026',
                                    img: product.image,
                                },
                                {
                                    title: `${product.name} chính thức ra mắt toàn cầu`,
                                    date: '15-12-2025',
                                    img: null,
                                },
                                {
                                    title: `${product.name} ra mắt cùng bộ đôi Pro và Ultra`,
                                    date: '24-10-2025',
                                    img: null,
                                },
                            ].map((article, i) => (
                                <div key={i} className="flex flex-col gap-2 group cursor-pointer">
                                    {/* Thumbnail */}
                                    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#e8f4f1] flex items-center justify-center">
                                        {article.img ? (
                                            <img
                                                src={article.img}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full">
                                                <svg viewBox="0 0 64 64" className="w-14 h-14 text-[#00917a]" fill="currentColor">
                                                    <rect x="4" y="8" width="30" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
                                                    <rect x="30" y="8" width="30" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
                                                    <rect x="4" y="32" width="30" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
                                                    <rect x="30" y="32" width="30" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {/* Title */}
                                    <h3 className="text-[13px] font-bold text-[#333] leading-snug line-clamp-3 group-hover:text-[#00917a] transition-colors">
                                        {article.title}
                                    </h3>
                                    {/* Date */}
                                    <p className="text-[12px] text-gray-400 font-medium">{article.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* RATING SECTION */}
                <section className="mt-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-4 mb-5">
                            <h2 className="text-[18px] font-bold text-[#333]">Đánh giá về {product.name}</h2>
                            <div className="flex items-center gap-2">
                                {/* Average stars */}
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => (
                                        <svg
                                            key={s}
                                            className={`w-5 h-5 ${s <= Math.round(reviewStats.average) ? 'text-amber-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-[13px] text-gray-400 font-medium">
                                    ({reviewStats.average.toFixed(1)} / {reviewStats.total} lượt đánh giá)
                                </span>
                            </div>
                        </div>

                        {/* Body: Textarea + Star picker */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Textarea */}
                            <div className="flex-1 flex flex-col gap-3">
                                <textarea
                                    rows={4}
                                    placeholder="Nội dung. Tối thiểu 15 ký tự (Cấm hình ảnh và ngôn từ nhạy cảm)"
                                    value={reviewContent}
                                    onChange={(event) => setReviewContent(event.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#00917a] focus:ring-2 focus:ring-emerald-100 transition-all resize-none bg-gray-50/50"
                                />
                                
                                {/* Image Upload Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    {reviewImages.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                            <button 
                                                onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {reviewImages.length < 3 && (
                                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#00917a] hover:bg-emerald-50 transition-all text-gray-400 hover:text-[#00917a]">
                                            <ImageIcon size={20} />
                                            <span className="text-[10px] font-bold">Thêm ảnh</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} multiple />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Star picker */}
                            <div className="flex flex-col items-start lg:items-end justify-center gap-2 shrink-0">
                                <span className="text-[14px] font-bold text-[#333]">Đánh giá của bạn:</span>
                                <StarRatingPicker value={reviewRating} onChange={setReviewRating} />
                                <button
                                    type="button"
                                    onClick={() => submitReview()}
                                    disabled={isSubmittingReview}
                                    className="mt-2 bg-[#00917a] hover:bg-[#00795f] disabled:opacity-60 disabled:cursor-not-allowed transition-all text-white font-black text-[12px] uppercase px-5 py-2 rounded-lg"
                                >
                                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                                <p className="text-[10px] text-gray-400 italic max-w-[150px] text-right mt-1">Lưu ý: Mọi hình ảnh nhạy cảm sẽ bị xóa và khóa tài khoản.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* REVIEW LIST */}
                <section className="mt-6 mb-10">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-[18px] font-bold text-[#333] mb-5">Danh sách đánh giá</h2>
                        <div className="space-y-3">
                            {reviews.length === 0 ? (
                                <div className="text-sm text-gray-400 italic">Chưa có đánh giá nào cho sản phẩm này.</div>
                            ) : (
                                reviews.map((item) => (
                                    <div key={item._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/40">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="font-bold text-sm text-gray-800">
                                                {item.user?.fullName || 'Khách hàng'}
                                            </div>
                                            <div className="text-xs text-gray-400">{formatReviewDate(item.createdAt)}</div>
                                        </div>
                                        {editingReviewId === item._id ? (
                                            <div className="mt-3">
                                                <StarRatingPicker value={editingReviewRating} onChange={setEditingReviewRating} />
                                                <textarea
                                                    rows={3}
                                                    value={editingReviewContent}
                                                    onChange={(event) => setEditingReviewContent(event.target.value)}
                                                    className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00917a]"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveEditReview(item._id)}
                                                        disabled={reviewActionLoadingId === item._id}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#00917a] text-white disabled:opacity-60"
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEditReview}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex gap-0.5 mt-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= Number(item.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-700 mt-2">{item.comment || item.title || 'Đánh giá sản phẩm'}</p>
                                                
                                                {/* Customer Images */}
                                                {item.images && item.images.length > 0 && (
                                                    <div className="flex gap-2 mt-3">
                                                        {item.images.map((img, idx) => (
                                                            <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                                                                <img src={img} className="w-full h-full object-cover" alt="Customer" onClick={() => window.open(img, '_blank')} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {item.reply && (
                                                    <div className="mt-4 p-4 bg-[#f1fcf9] border-l-4 border-[#00917a] rounded-r-xl shadow-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-6 h-6 rounded-full bg-[#00917a] flex items-center justify-center">
                                                                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-[12px] font-black text-[#00917a] uppercase tracking-wider">Phản hồi từ PhoneSin</span>
                                                        </div>
                                                        <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                                            {item.reply}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {isOwnReview(item) && editingReviewId !== item._id && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartEditReview(item)}
                                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700"
                                                >
                                                    Sửa đánh giá
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMyReview(item._id)}
                                                    disabled={reviewActionLoadingId === item._id}
                                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 disabled:opacity-60"
                                                >
                                                    Xóa đánh giá
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

            </div>

            {/* STICKY COMPARE BUTTON (Bottom Left) */}
            <div className="fixed bottom-6 left-6 z-[100]">
                <button className="bg-[#00917a] text-white px-6 py-3 rounded-full font-bold flex items-center gap-3 shadow-2xl shadow-[#00917a]/30 active:scale-95 transition-all text-[13px]">
                    <RefreshCw size={18} /> So sánh (0)
                </button>
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#00917a] text-white px-8 py-4 rounded-2xl shadow-2xl z-[200] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Check size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-bold text-[15px]">Đã thêm vào giỏ hàng thành công!</p>
                        <Link to="/cart" className="text-[13px] underline font-medium opacity-90">Xem giỏ hàng ngay</Link>
                    </div>
                    <button onClick={() => setShowToast(false)} className="ml-4 hover:scale-110 transition-transform">
                         <Plus className="rotate-45" size={20} />
                    </button>
                </div>
            )}

            {/* Buy Now Modal */}
            <BuyNowModal
                product={product}
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
            />

            {wishlistNotice && (
                <div className="fixed top-24 right-6 z-[210] bg-white border border-[#008d71]/30 text-[#008d71] px-4 py-2 rounded-xl shadow-lg text-sm font-bold">
                    {wishlistNotice}
                </div>
            )}

            {reviewNotice.message && (
                <div
                    className={`fixed top-40 right-6 z-[210] px-4 py-2 rounded-xl shadow-lg text-sm font-bold ${
                        reviewNotice.type === 'success'
                            ? 'bg-white border border-[#008d71]/30 text-[#008d71]'
                            : 'bg-white border border-[#ef4444]/30 text-[#ef4444]'
                    }`}
                >
                    {reviewNotice.message}
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
