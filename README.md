# TaskFlow - Nền Tảng Quản Lý Dự Án & Công Việc Kanban Trực Quan

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D.svg)](https://redis.io/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg)](https://tailwindcss.com/)

**TaskFlow** là ứng dụng web quản lý dự án và công việc theo phương pháp bảng Kanban hiện đại, xây dựng trên nền tảng **MERN Stack** kết hợp tầng lưu trữ đệm **Redis Cache-Aside** và đóng gói toàn bộ hệ sinh thái dịch vụ qua **Docker Compose & Nginx Reverse Proxy**.

Dự án tập trung vào tính tương tác cao, phản hồi giao diện tức thì (Sub-second UI Transitions), bảo vệ toàn vẹn dữ liệu quan hệ (Relational Integrity), tự động hóa vòng đời dọn dẹp dữ liệu rác bằng **MongoDB TTL Indexes**, và tăng cường an ninh API bằng thuật toán giới hạn tần suất truy cập nguyên tử trên Redis (**Atomic Rate Limiter**).

---

## Tính Năng & Kiến Trúc Nổi Bật

- **Đóng gói đa dịch vụ (Containerized Multi-Service):** Cô lập 4 dịch vụ độc lập (Frontend Nginx, Backend Node.js, MongoDB 7, Redis 7 Alpine) trong mạng nội bộ Docker, điều phối đồng bộ qua Docker Compose.
- **Tầng Redis Cache-Aside & Graceful Degradation:** Lưu đệm danh sách dự án và công việc theo từng tài khoản; tự động xóa cache khi có thay đổi dữ liệu (Event-driven Invalidation). Tích hợp cơ chế **Graceful Fallback**: nếu Redis bị mất kết nối hoặc sập đột ngột, hệ thống tự động truy vấn trực tiếp xuống MongoDB, đảm bảo **100% Uptime** không văng lỗi 500.
- **Bảo mật Rate Limiting nguyên tử (Atomic Rate Limiter):** Ngăn chặn tấn công Brute-force và DoS vào các endpoint xác thực (`/login`, `/register`) thông qua các lệnh nguyên tử `INCR` và `EXPIRE` của Redis.
- **Bảng Kanban kéo thả Native HTML5 & Optimistic UI:** Trải nghiệm kéo thả thẻ công việc mượt mà giữa các cột trạng thái (*To Do*, *In Progress*, *Done*) kết hợp cơ chế cập nhật giao diện lạc quan (Optimistic Updates) giúp thay đổi trạng thái ngay lập tức trên UI trước khi API phản hồi.
- **Thùng rác 30 ngày tự động hóa bằng MongoDB TTL Index:** Hỗ trợ kéo thả công việc ra ngoài phạm vi 3 cột để chuyển nhanh vào thùng rác. Sử dụng chỉ mục thời gian thực `expireAfterSeconds: 2592000` (30 ngày) trên trường `deletedAt`, MongoDB background daemon tự động quét và xóa vĩnh viễn các thẻ task quá hạn mà không cần setup cron job phức tạp.
- **Toàn vẹn dữ liệu quan hệ (Cascade Deletion):** Tích hợp Mongoose Pre-remove middleware, khi người dùng xóa một dự án, hệ thống sẽ tự động quét và xóa sạch toàn bộ các công việc con liên quan.
- **Bộ lọc & Sắp xếp độc lập từng cột:** Hỗ trợ tìm kiếm theo từ khóa thời gian thực; lọc theo độ ưu tiên (High, Medium, Low); sắp xếp độc lập từng cột theo ngày tạo, mức độ ưu tiên hoặc hạn chót.
- **Tùy biến kích thước giao diện & Font chữ (Accessibility Controller):** Cho phép người dùng thu phóng giao diện từ 85% đến 125%, lưu trữ trạng thái bền vững trong `localStorage`.
- **Axios Interceptors & Phục hồi phiên (401 Handling):** Tự động đính kèm JWT Bearer token vào mỗi request và bắt lỗi 401 khi token hết hạn để xóa session và điều hướng về trang đăng nhập an toàn.

---

## Kiến Trúc Hệ Thống (Containerized Architecture)

```
[ Client Browser ]
        │ (Port 81)
        ▼
┌────────────────────────────────────────┐
│   taskflow-frontend (Nginx Proxy)      │
│   ├── Static SPA Hosting (/usr/share)  │
│   └── Reverse Proxy (/api -> backend)  │
└──────────────────┬─────────────────────┘
                   │ Internal Network (Port 5001)
                   ▼
┌────────────────────────────────────────┐
│   taskflow-backend (Node.js/Express)   │
│   ├── RESTful API (Auth, Project, Task)│
│   └── Cache-Aside & Graceful Fallback  │
└──────────┬──────────────────┬──────────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│  taskflow-mongo  │  │  taskflow-redis  │
│  (MongoDB 7.0)   │  │  (Redis 7 Alpine)│
└──────────────────┘  └──────────────────┘
```

---

## Cấu Trúc Thư Mục

```text
TaskFlow/
├── docker-compose.yml       # Điều phối 4 container: frontend, backend, mongo, redis
├── .env.example             # File mẫu cấu hình biến môi trường toàn cục
├── be/                      # Backend (Node.js + Express.js + MongoDB + Redis)
│   ├── Dockerfile           # Image cho Node.js backend
│   ├── .env.example         # File mẫu cấu hình biến môi trường Backend
│   ├── server.js            # Điểm khởi chạy Express server & middleware pipeline
│   └── src/
│       ├── config/          # Cấu hình MongoDB (db.js) và Redis client (redis.js)
│       ├── controllers/     # Controller tiếp nhận request (auth, project, task)
│       ├── middlewares/     # JWT Auth, Redis rate limiter, Error handler
│       ├── models/          # Mongoose Schema & hooks (User, Project, Task)
│       ├── routes/          # Định tuyến RESTful API
│       └── utils/           # Helper JWT và script nạp dữ liệu (seedData.js)
└── fe/                      # Frontend (React 19 + Vite + Tailwind CSS)
    ├── Dockerfile           # Multi-stage build Vite sang static Nginx container
    ├── nginx.conf           # Cấu hình Nginx reverse proxy /api và SPA routing fallback
    ├── .env.example         # File mẫu cấu hình endpoint API Frontend
    └── src/
        ├── components/      # UI components (TaskCard, KanbanColumn, Modals, Navbar...)
        ├── context/         # AuthContext quản lý session đăng nhập toàn cục
        ├── pages/           # DashboardPage, ProjectDetailPage, TrashPage, LoginPage...
        └── services/        # Axios API client & Interceptors (api.js, auth, project, task)
```

---

## Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Tiên Quyết
- Máy tính đã cài đặt [Docker](https://www.docker.com/) & Docker Compose (Khuyến nghị).
- Hoặc nếu chạy thủ công: [Node.js](https://nodejs.org/) v18+, [MongoDB](https://www.mongodb.com/) v6+, [Redis](https://redis.io/) v6+.

---

### Bước 1: Chuẩn Bị File Môi Trường

```bash
cd TaskFlow

# Tạo file cấu hình từ file mẫu cho backend
cp be/.env.example be/.env
```

> **Ghi chú về biến môi trường (`.env`):**
> - Mặc định file `be/.env.example` đã trỏ sẵn vào cổng local (`mongodb://127.0.0.1:27017/taskflow_db` và `redis://localhost:6379`).
> - Khi khởi chạy bằng Docker Compose, các biến kết nối này được tự động thiết lập qua `docker-compose.yml` (kết nối qua tên dịch vụ `mongo:27017` và `redis:6379`).

---

### Cách 1: Khởi Chạy Bằng Docker Compose (Khuyến Nghị)

Chỉ cần một câu lệnh duy nhất để khởi động toàn bộ cụm dịch vụ:

```bash
# Build và chạy 4 containers ngầm
docker compose up -d --build
```

Kiểm tra trạng thái các container:
```bash
docker compose ps
```

Khởi tạo dữ liệu mẫu (Seeding Database) bên trong container backend:
```bash
docker compose exec backend npm run seed
```

Sau khi chạy xong:
- **Ứng dụng Web (Frontend Nginx):** `http://localhost:81`
- **Backend API:** `http://localhost:81/api`
- **Tài khoản đăng nhập mẫu:**
  - Email: `nam.nguyen@ptit.edu.vn`
  - Mật khẩu: `password123`
---

### Cách 2: Khởi Chạy Thủ Công (Local Development)

Nếu bạn muốn chạy trực tiếp trên máy và sửa code với Hot Reload (`nodemon` và `vite`):

1. **Khởi chạy Backend:**
   ```bash
   cd be
   npm install
   npm run seed    # Nạp tài khoản và dữ liệu mẫu
   npm run dev     # Khởi chạy server tại http://localhost:5001
   ```

2. **Khởi chạy Frontend (mở terminal thứ hai):**
   ```bash
   cd fe
   npm install
   npm run dev     # Khởi chạy Vite dev server tại http://localhost:5173
   ```

---