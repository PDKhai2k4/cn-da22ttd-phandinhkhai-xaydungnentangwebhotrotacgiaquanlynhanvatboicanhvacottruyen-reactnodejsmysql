'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [devOtp, setDevOtp] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { email });
            toast.success('Mã OTP đã được gửi đến email của bạn');
            
            // Nếu có devOtp (development mode), tự động điền
            if (response.data.devOtp) {
                setDevOtp(response.data.devOtp);
                setOtp(response.data.devOtp);
            }
            
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể gửi OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success('Đặt lại mật khẩu thành công!');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                <Link 
                    href="/login" 
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại đăng nhập</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
                            <p className="text-gray-600 text-sm">Khôi phục quyền truy cập tài khoản</p>
                        </div>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <p className="text-gray-600">
                                Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <p className="text-gray-600">
                                Nhập mã OTP đã gửi đến <strong>{email}</strong> và mật khẩu mới.
                            </p>
                            
                            {/* Development mode notice */}
                            {devOtp && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>🔧 Development Mode:</strong> OTP đã được tự động điền.
                                    </p>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Tối thiểu 6 ký tự"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full py-3 text-gray-600 hover:text-primary-600 font-medium"
                            >
                                Gửi lại mã OTP
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Thành công!</h2>
                            <p className="text-gray-600 mb-6">Mật khẩu đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.</p>
                            <Link
                                href="/login"
                                className="inline-block px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
