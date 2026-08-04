# Sơ đồ Cơ sở Dữ liệu & Thiết kế Schema

## 1. Sơ đồ quan hệ thực thể (Entity Relationship)

Hệ thống bao gồm 3 Collection chính với mối quan hệ 1 - Nhiều (One-to-Many):

- Một **User** có thể tạo nhiều **Project**.
- Một **Project** chứa nhiều **Task**.
- Khi xóa một **Project**, hệ thống sẽ tự động thực hiện **Cascade Delete** để xóa sạch toàn bộ các **Task** thuộc dự án đó.

```
+------------------+         1 - N         +------------------+         1 - N         +------------------+
|      Users       | --------------------> |     Projects     | --------------------> |      Tasks       |
+------------------+                       +------------------+                       +------------------+
| _id (ObjectId)   |                       | _id (ObjectId)   |                       | _id (ObjectId)   |
| name (String)    |                       | name (String)    |                       | title (String)   |
| email (String)   |                       | description (Str)|                       | description (Str)|
| password (Hash)  |                       | color (Hex Str)  |                       | status (Enum)    |
| role (String)    |                       | user (Ref: User) |                       | priority (Enum)  |
| createdAt (Date) |                       | createdAt (Date) |                       | dueDate (Date)   |
| updatedAt (Date) |                       | updatedAt (Date) |                       | dueTime (String) |
+------------------+                       +------------------+                       | isDeleted (Bool) |
                                                                                      | deletedAt (Date) |
                                                                                      | project (Ref)    |
                                                                                      | user (Ref: User) |
                                                                                      | createdAt (Date) |
                                                                                      | updatedAt (Date) |
                                                                                      +------------------+
```

---

## 2. Chi tiết các Collection

### 2.1. Users Collection (`be/src/models/User.js`)
Lưu trữ thông tin người dùng hệ thống.
- `_id`: ObjectId - Khóa chính tự sinh bởi MongoDB.
- `name`: String (Required, Trim) - Họ và tên người dùng.
- `email`: String (Required, Unique, Lowercase) - Địa chỉ email dùng để đăng nhập.
- `password`: String (Required, Select: false) - Mật khẩu đã được mã hóa một chiều bằng thư viện `bcryptjs` (salt rounds: 10).
- `role`: String (Enum: `['user', 'admin']`, Default: `'user'`) - Vai trò người dùng.
- `createdAt`, `updatedAt`: Timestamps tự động quản lý bởi Mongoose.

### 2.2. Projects Collection (`be/src/models/Project.js`)
Lưu trữ các dự án, đồ án hoặc môn học của người dùng.
- `_id`: ObjectId - Khóa chính tự sinh bởi MongoDB.
- `name`: String (Required, Trim, Max: 100) - Tên dự án.
- `description`: String (Trim, Max: 500) - Mô tả mục tiêu, phạm vi dự án.
- `color`: String (Default: `'#4f46e5'`) - Mã màu sắc nhận diện (Hex color).
- `user`: ObjectId (Ref: `'User'`, Required) - Khóa ngoại liên kết với User sở hữu.
- `createdAt`, `updatedAt`: Timestamps tự động.

### 2.3. Tasks Collection (`be/src/models/Task.js`)
Lưu trữ các đầu việc chi tiết trong từng dự án.
- `_id`: ObjectId - Khóa chính tự sinh bởi MongoDB.
- `title`: String (Required, Trim, Max: 150) - Tiêu đề công việc.
- `description`: String (Trim) - Mô tả chi tiết nội dung cần làm.
- `status`: String (Enum: `['todo', 'in_progress', 'done']`, Default: `'todo'`) - Trạng thái trên bảng Kanban.
- `priority`: String (Enum: `['low', 'medium', 'high']`, Default: `'medium'`) - Mức độ ưu tiên.
- `dueDate`: Date (Default: null) - Ngày hạn chót hoàn thành.
- `dueTime`: String (Trim, Default: '') - Giờ hạn chót hoàn thành (không bắt buộc, định dạng HH:mm).
- `project`: ObjectId (Ref: `'Project'`, Required) - Khóa ngoại trỏ tới dự án cha.
- `user`: ObjectId (Ref: `'User'`, Required) - Khóa ngoại trỏ tới User sở hữu.
- `isDeleted`: Boolean (Default: false) - Cờ đánh dấu công việc đã chuyển vào Thùng rác (Soft Delete).
- `deletedAt`: Date (Default: null) - Mốc thời gian công việc bị đưa vào Thùng rác.
- `createdAt`, `updatedAt`: Timestamps tự động.

---

## 3. Các cơ chế kỹ thuật đặc biệt

### 3.1. Thùng rác & TTL Index lưu trữ tối đa 30 ngày
- Khi công việc bị kéo ra ngoài 3 cột Kanban hoặc xóa, hệ thống thực hiện Soft Delete:
  - `isDeleted = true`
  - `deletedAt = new Date()`
- Schema của `Task` được đăng ký một MongoDB TTL (Time-To-Live) Index:
  ```javascript
  taskSchema.index(
    { deletedAt: 1 },
    {
      expireAfterSeconds: 30 * 24 * 60 * 60, // 30 ngày = 2.592.000 giây
      partialFilterExpression: { isDeleted: true },
    }
  );
  ```
- **Ưu điểm kiến trúc:** MongoDB daemon sẽ tự động chạy tiến trình ngầm định kỳ để quét và xóa vĩnh viễn các bản ghi có `deletedAt` quá 30 ngày mà không cần developer phải tự viết cron job hoặc server daemon phức tạp.

### 3.2. Cascade Delete triệt để khi xóa Project
Trong file controller `be/src/controllers/projectController.js`:
```javascript
await Task.deleteMany({ project: project._id });
await project.deleteOne();
```
Đảm bảo khi người dùng xóa một dự án thì tất cả các công việc con bên trong sẽ được dọn dẹp sạch sẽ, không để lại dữ liệu mồ côi (orphaned documents) trong database.
