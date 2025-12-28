# QL Truyện - Nền Tảng Hỗ Trợ Tác Giả Quản Lý Truyện

Nền tảng web hỗ trợ tác giả quản lý nhân vật, bối cảnh và cốt truyện một cách hiệu quả.

## 📋 Giới Thiệu

QL Truyện là một ứng dụng web được xây dựng nhằm hỗ trợ các tác giả trong việc:
- Quản lý các dự án truyện
- Tạo và quản lý nhân vật với đầy đủ thông tin chi tiết
- Xây dựng bối cảnh/địa điểm cho câu chuyện
- Quản lý timeline sự kiện
- Viết và tổ chức các chương truyện
- Quản lý vật phẩm, khái niệm trong truyện
- Ghi chú ý tưởng và nghiên cứu

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **Next.js 14** - React Framework
- **React 18** - UI Library
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **React Quill** - Rich Text Editor
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MySQL 8.0** - Database
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Multer** - File Upload
- **Nodemailer** - Email Service

### DevOps
- **Docker & Docker Compose** - Containerization

## 📁 Cấu Trúc Dự Án

```
src/
├── client/                 # Frontend (Next.js)
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── public/            # Static files
├── server/                 # Backend (Express.js)
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   ├── scripts/           # Utility scripts
│   └── uploads/           # Uploaded files
└── database/              # Database scripts
    └── init.sql           # Database initialization
```

## 🚀 Cài Đặt & Chạy

### Yêu Cầu
- Docker & Docker Compose
- Node.js 18+ (nếu chạy không dùng Docker)

### Sử Dụng Docker (Khuyến nghị)

1. Clone repository:
```bash
git clone <repository-url>
cd <project-folder>
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp src/.env.example src/.env
```

3. Cấu hình các biến môi trường trong file `.env`

4. Khởi chạy với Docker Compose:
```bash
cd src
docker-compose up -d --build
```

5. Truy cập ứng dụng:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:3307

### Chạy Thủ Công (Development)

#### Database
Cài đặt MySQL 8.0 và chạy script `src/database/init.sql`

#### Backend
```bash
cd src/server
npm install
npm run dev
```

#### Frontend
```bash
cd src/client
npm install
npm run dev
```

## 🔐 Tài Khoản Admin Mặc Định

| Thông tin | Giá trị |
|-----------|---------|
| Email | admin@gmail.com |
| Mật khẩu | Admin@123 |

⚠️ **Lưu ý:** Hãy đổi mật khẩu ngay sau khi đăng nhập lần đầu!

## 📚 Tính Năng Chính

### Quản Lý Dự Án
- Tạo, sửa, xóa dự án truyện
- Theo dõi trạng thái: Planning, Writing, Completed, Paused
- Upload ảnh bìa

### Quản Lý Nhân Vật
- Thông tin chi tiết: tên, tuổi, giới tính, vai trò
- Mô tả ngoại hình, tính cách, background
- Quản lý mối quan hệ giữa các nhân vật
- Upload avatar nhân vật

### Quản Lý Bối Cảnh/Địa Điểm
- Phân cấp địa điểm (thế giới, lục địa, quốc gia, thành phố...)
- Mô tả chi tiết và lịch sử địa điểm
- Upload hình ảnh minh họa

### Timeline Sự Kiện
- Tạo và sắp xếp các sự kiện theo thứ tự
- Phân loại mức độ quan trọng
- Liên kết với địa điểm

### Quản Lý Chương Truyện
- Soạn thảo với Rich Text Editor
- Đếm số từ tự động
- Theo dõi trạng thái: Draft, Writing, Completed, Published

### Vật Phẩm & Khái Niệm
- Quản lý vũ khí, công cụ, phép thuật, công nghệ
- Phân loại độ hiếm

### Ghi Chú
- Lưu trữ ý tưởng, outline, nghiên cứu
- Gắn tags để dễ tìm kiếm

### Hệ Thống Người Dùng
- Đăng ký/Đăng nhập với xác thực OTP qua email
- Quản lý profile và avatar
- Cài đặt giao diện (Light/Dark/System)
- Phân quyền User/Admin

## 📝 API Endpoints

Backend API chạy tại `http://localhost:5000` với các endpoint chính:
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/projects` - Project management
- `/api/characters` - Character management
- `/api/locations` - Location management
- `/api/chapters` - Chapter management
- `/api/items` - Item management
- `/api/notes` - Note management
- `/api/timeline` - Timeline management
- `/api/feedbacks` - Feedback system

## 👨‍💻 Tác Giả

**Phan Đình Khải**
- MSSV: 110122089
- Lớp: DA22TTD
- Số điện thoại: 0374902422
- Email: 110122089@st.tvu.edu.vn
- Đơn vị: Đại học Trà Vinh

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.
