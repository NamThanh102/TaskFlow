# TaskFlow - MERN Stack Project & Task Management

Dự án web quản lý dự án và công việc cá nhân theo mô hình bảng Kanban (To Do / In Progress / Done) xây dựng trên nền tảng MERN Stack (MongoDB, Express.js, React 19, Node.js).

Kiến trúc hệ thống tách biệt độc lập giữa Backend (`be`) và Frontend (`fe`), logic CRUD chuẩn chỉ, mã nguồn sạch sẽ, dễ đọc và dễ bảo trì.

---

## 1. Tính năng chính

- Quản lý Dự án (Project): Tạo mới, chỉnh sửa, đổi màu nhận diện thương hiệu và xóa dự án (tự động cascade delete toàn bộ task con liên quan).
- Bảng Kanban trực quan: Kéo thả công việc mượt mà (Native HTML5 Drag & Drop) giữa 3 cột trạng thái: To Do, In Progress và Done.
- Thùng rác (Trash) lưu trữ 30 ngày: Kéo thả công việc ra ngoài phạm vi 3 cột để chuyển vào thùng rác không cần hộp thoại xác nhận phiền phức. Dữ liệu rác được lưu tối đa 30 ngày và tự động dọn dẹp thông qua MongoDB TTL Index. Người dùng có thể khôi phục (Restore) hoặc xóa vĩnh viễn (Delete Permanently) bất cứ lúc nào.
- Sắp xếp độc lập từng cột: Hỗ trợ sắp xếp công việc theo Thứ tự tạo (Mới nhất / Cũ nhất), Độ ưu tiên (Cao đến Thấp / Thấp đến Cao) và Hạn chót (Gần nhất / Xa nhất).
- Tìm kiếm & Lọc nhanh: Tìm kiếm công việc theo tiêu đề hoặc mô tả theo thời gian thực; lọc nhanh theo các mức độ ưu tiên (High, Medium, Low).
- Cài đặt người dùng: Chỉnh sửa thông tin cá nhân (Họ tên, Email), đổi mật khẩu và tùy biến phóng to/thu nhỏ cỡ chữ giao diện (Scale 85% - 125%) lưu trữ bền vững trên `localStorage`.
- Xác thực & Bảo mật: Đăng ký, đăng nhập an toàn bằng JWT Bearer Token và mã hóa mật khẩu với thư viện Bcrypt.

---

## 2. Cấu trúc thư mục dự án

```
taskflow-mern/
├── be/                      # Backend (Node.js + Express.js + MongoDB)
│   ├── src/
│   │   ├── config/          # Cấu hình kết nối MongoDB (db.js)
│   │   ├── controllers/     # Controller xử lý nghiệp vụ API (auth, project, task)
│   │   ├── middlewares/     # Middleware xác thực JWT và xử lý lỗi tập trung
│   │   ├── models/          # Mongoose Schema (User, Project, Task)
│   │   ├── routes/          # Khai báo các RESTful API routes
│   │   └── utils/           # Helper JWT và script khởi tạo dữ liệu (seedData.js)
│   ├── .env                 # Biến môi trường Backend (PORT, MONGO_URI, JWT_SECRET)
│   ├── server.js            # Điểm khởi chạy Backend server
│   └── package.json         # Quản lý dependencies độc lập của Backend
├── fe/                      # Frontend (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/      # UI components (TaskCard, TaskModal, ProjectModal...)
│   │   ├── context/         # AuthContext quản lý session đăng nhập toàn ứng dụng
│   │   ├── pages/           # DashboardPage, ProjectDetailPage, TrashPage, LoginPage...
│   │   ├── services/        # Axios API client tương tác với Backend
│   │   ├── App.jsx          # Cấu hình Router và ProtectedRoute
│   │   └── main.jsx         # Điểm khởi chạy React DOM
│   ├── vite.config.js       # Cấu hình Vite và reverse proxy API
│   └── package.json         # Quản lý dependencies độc lập của Frontend
├── .gitignore               # Cấu hình bỏ qua file nhạy cảm và node_modules duy nhất
└── README.md                # Tài liệu hướng dẫn sử dụng dự án
```
---

## 3. Hướng dẫn cài đặt và chạy dự án

### Yêu cầu môi trường
- Đã cài đặt **Node.js** (phiên bản 18 trở lên).
- Dịch vụ **MongoDB** đang chạy trên máy cục bộ tại `mongodb://127.0.0.1:27017` (hoặc cấu hình chuỗi kết nối MongoDB Atlas trong `be/.env`).

---

### Bước 1: Cài đặt và khởi chạy Backend

Mở một cửa sổ terminal tại thư mục dự án:
```bash
cd be
npm install
```

Khởi tạo dữ liệu mẫu (Seeding Database):
```bash
npm run seed
```
> Lệnh trên sẽ kết nối MongoDB, tự động tạo cơ sở dữ liệu `taskflow_db`, tạo 3 collections (`users`, `projects`, `tasks`), thiết lập MongoDB TTL Index cho thùng rác 30 ngày và nạp sẵn tài khoản test cùng 4 dự án mẫu thực tế:
> - Email: `nam.nguyen@ptit.edu.vn`
> - Mật khẩu: `password123`

Khởi chạy máy chủ Backend:
```bash
npm run dev
```
Backend API sẽ hoạt động tại: `http://localhost:5001`

---

### Bước 2: Cài đặt và khởi chạy Frontend

Mở một cửa sổ terminal riêng biệt thứ hai:
```bash
cd fe
npm install
npm run dev
```
Frontend Web sẽ hoạt động tại: `http://localhost:5173`

---

### Bước 3: Trải nghiệm ứng dụng
1. Mở trình duyệt truy cập: `http://localhost:5173`
2. Bấm nút **Auto Fill** tại trang Đăng nhập (hoặc nhập `nam.nguyen@ptit.edu.vn` / `password123`) và bấm **Sign In**.
3. Trải nghiệm tính năng kéo thả công việc giữa 3 cột hoặc kéo thả ra ngoài 3 cột để chuyển vào mục **Trash**.
