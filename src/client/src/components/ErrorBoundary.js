'use client';

import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        // Log error to console (có thể gửi đến error tracking service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Đã xảy ra lỗi
                        </h1>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left overflow-auto max-h-40">
                                <p className="text-sm font-mono text-red-600 dark:text-red-400">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span>Thử lại</span>
                            </button>
                            
                            <Link
                                href="/dashboard"
                                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                <span>Về Dashboard</span>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
