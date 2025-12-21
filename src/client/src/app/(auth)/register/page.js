'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name
            });
            toast.success('Đăng ký thành công!');
            router.push('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">
            {/* Left Side - Decoration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-purple-700 items-center justify-center p-12">
                <div className="text-center text-white max-w-lg">
                    <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                        <BookOpen className="w-16 h-16 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Bắt đầu hành trình sáng tác</h2>
                    <p className="text-lg text-white/80 leading-relaxed">
                        Tạo tài khoản miễn phí và khám phá các công cụ mạnh mẽ 
                        giúp bạn quản lý tác phẩm một cách chuyên nghiệp.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Link 
                        href="/" 
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Về trang chủ</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
                        <p className="text-gray-600">Điền thông tin để bắt đầu</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập *</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Tối thiểu 6 ký tự"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu *</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Đang tạo tài khoản...</span>
                                </span>
                            ) : 'Đăng ký'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
