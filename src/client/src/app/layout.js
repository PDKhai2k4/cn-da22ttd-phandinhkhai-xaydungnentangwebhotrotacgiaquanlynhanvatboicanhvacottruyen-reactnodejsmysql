import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata = {
  title: 'QL Truyện - Nền tảng Quản lý Sáng tác',
  description: 'Nền tảng web hỗ trợ tác giả quản lý nhân vật, bối cảnh và cốt truyện',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                {children}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#fff',
                      color: '#333',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                    },
                  }}
                />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
