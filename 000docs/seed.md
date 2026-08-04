# Dữ liệu Mẫu (Seed Data)

Tệp tin khởi tạo dữ liệu mẫu nằm tại: `be/src/utils/seedData.js`.

## 1. Hướng dẫn chạy Seeder

Mở cửa sổ terminal tại thư mục `be/`:
```bash
cd be
npm run seed
```

---

## 2. Thông tin Tài khoản Test có sẵn

| Trường | Giá trị |
| :--- | :--- |
| **Email** | `nam.nguyen@ptit.edu.vn` |
| **Mật khẩu** | `password123` |
| **Vai trò** | `user` |
| **Họ và tên** | Nguyễn Thành Nam |

*(Tại giao diện đăng nhập `LoginPage`, bạn chỉ cần bấm nút **Auto Fill** để tự động điền nhanh tài khoản này).*

---

## 3. Danh sách 4 Dự án Mẫu được khởi tạo

1. **E-Commerce Microservices Platform** (Màu xanh dương `#2563eb`)
   - Mô tả: Distributed shopping architecture with Express, MongoDB, and React client.
   - Số lượng: 7 công việc đang hoạt động và 2 công việc mẫu trong Thùng rác.

2. **AI Customer Support Portal** (Màu tím `#7c3aed`)
   - Mô tả: Intelligent ticket routing system with automated sentiment analysis and response triage.
   - Số lượng: 4 công việc trải đều các trạng thái To Do, In Progress, Done.

3. **DevOps CI/CD Automation Pipeline** (Màu xanh lục `#059669`)
   - Mô tả: Infrastructure containerization, automated testing workflows, and Kubernetes deployment.
   - Số lượng: 3 công việc với mức độ ưu tiên và hạn chót khác nhau.

4. **Mobile Banking Application V2** (Màu vàng hổ phách `#d97706`)
   - Mô tả: Biometric authentication, real-time transaction tracking, and monthly expense analytics.
   - Số lượng: 3 công việc với mức độ ưu tiên và hạn chót khác nhau.

---

## 4. Dữ liệu Thùng rác Mẫu (Để kiểm thử tính năng Trash 30 ngày)

Script seeder tự động tạo sẵn 2 công việc ở trạng thái đã xóa mềm (`isDeleted: true`):

1. **Legacy Session-Based Cookie Middleware**
   - Dự án gốc: `E-Commerce Microservices Platform`
   - Thời gian xóa giả lập: Cách đây 3 ngày (`deletedAt: now - 3 days`)
   - Số ngày lưu trữ còn lại: **27 ngày**.

2. **Old XML Export Endpoint for Invoices**
   - Dự án gốc: `E-Commerce Microservices Platform`
   - Thời gian xóa giả lập: Cách đây 5 ngày (`deletedAt: now - 5 days`)
   - Số ngày lưu trữ còn lại: **25 ngày**.

> Bạn có thể bấm vào mục **Trash** trên thanh điều hướng để kiểm thử ngay 2 chức năng: **Restore** (Khôi phục lại vào bảng dự án) và **Delete** (Xóa vĩnh viễn khỏi Database).
