'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, MapPin, Clock, FileText, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const features = [
        { icon: Users, title: 'Quản lý Nhân vật', desc: 'Tạo và theo dõi chi tiết từng nhân vật, mối quan hệ phức tạp' },
        { icon: MapPin, title: 'Bối cảnh & Địa điểm', desc: 'Xây dựng thế giới với cấu trúc cây thư mục trực quan' },
        { icon: Clock, title: 'Dòng thời gian', desc: 'Sắp xếp sự kiện theo trình tự, phát triển mạch truyện logic' },
        { icon: FileText, title: 'Soạn thảo Chương', desc: 'Viết và quản lý các chương truyện với editor mạnh mẽ' },
    ];

    const benefits = [
        'Tổ chức ý tưởng khoa học',
        'Duy trì tính nhất quán',
        'Tra cứu nhanh chóng',
        'Đồng bộ mọi thiết bị',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">QL Truyện</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/login" 
                                className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link 
                                href="/register" 
                                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
                            >
                                Bắt đầu miễn phí
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Nền tảng hỗ trợ sáng tác chuyên nghiệp</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                            Biến ý tưởng thành
                            <span className="gradient-text block">tác phẩm hoàn chỉnh</span>
                        </h1>
                        
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Công cụ toàn diện giúp tác giả quản lý nhân vật, bối cảnh, cốt truyện 
                            và dòng thời gian một cách khoa học và hiệu quả.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href="/register" 
                                className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:scale-105"
                            >
                                <span>Tạo tài khoản miễn phí</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/login" 
                                className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-300"
                            >
                                Đã có tài khoản
                            </Link>
                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="mt-16 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
                        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden mx-4 lg:mx-20">
                            <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-[300px] flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Giao diện quản lý dự án trực quan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Mọi thứ bạn cần để sáng tác
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Các công cụ mạnh mẽ giúp bạn tập trung vào việc viết
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className="group p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 card-hover"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-12 md:p-16 text-white">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                    Tại sao chọn QL Truyện?
                                </h2>
                                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                                    Được thiết kế dành riêng cho tác giả Việt Nam, giúp bạn quản lý 
                                    tác phẩm một cách chuyên nghiệp và hiệu quả.
                                </p>
                                <div className="space-y-4">
                                    {benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                            <span className="text-lg">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-64 h-64 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                                    <BookOpen className="w-32 h-32 text-white/50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Sẵn sàng bắt đầu hành trình sáng tác?
                    </h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Tham gia cùng hàng nghìn tác giả đang sử dụng QL Truyện
                    </p>
                    <Link 
                        href="/register" 
                        className="inline-flex items-center space-x-2 px-10 py-5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                        <span>Đăng ký ngay - Miễn phí</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-800">QL Truyện</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            © 2024 QL Truyện. Nền tảng hỗ trợ sáng tác truyện.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
