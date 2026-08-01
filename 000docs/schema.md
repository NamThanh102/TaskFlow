# Database Schema & Data Models

## 1. So do quan he du lieu (Entity Relationship)

He thong gom 3 collection chinh voi quan he 1 - Nhieu (One-to-Many):

- Mot **User** co the tao nhieu **Project**.
- Mot **Project** chua nhieu **Task**.
- Khi xoa mot **Project**, he thong se thuc hien **Cascade Delete** de xoa toan bo cac **Task** thuoc project do.

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

## 2. Chi tiet cac Collection

### 2.1. Users Collection (`be/src/models/User.js`)
Luu tru thong tin nguoi dung he thong.
- `_id`: ObjectId - Khoa chinh tu sinh.
- `name`: String (Required, Trim) - Ho va ten.
- `email`: String (Required, Unique, Lowercase) - Email dang nhap.
- `password`: String (Required, Select: false) - Mat khau da duoc hash bang `bcryptjs` (salt rounds: 10).
- `role`: String (Enum: `['user', 'admin']`, Default: `'user'`).
- `createdAt`, `updatedAt`: Timestamps tu dong.

### 2.2. Projects Collection (`be/src/models/Project.js`)
Luu tru cac du an / mon hoc / do an cua nguoi dung.
- `_id`: ObjectId - Khoa chinh tu sinh.
- `name`: String (Required, Trim, Max: 100) - Ten du an.
- `description`: String (Trim, Max: 500) - Mo ta du an.
- `color`: String (Default: `'#4f46e5'`) - Ma mau dai dien (Hex).
- `user`: ObjectId (Ref: `'User'`, Required) - Khoa ngoai lien ket voi User so huu.
- `createdAt`, `updatedAt`: Timestamps tu dong.

### 2.3. Tasks Collection (`be/src/models/Task.js`)
Luu tru cac cong viec trong tung du an.
- `_id`: ObjectId - Khoa chinh tu sinh.
- `title`: String (Required, Trim, Max: 150) - Tieu de cong viec.
- `description`: String (Trim) - Mo ta chi tiet cong viec.
- `status`: String (Enum: `['todo', 'in_progress', 'done']`, Default: `'todo'`).
- `priority`: String (Enum: `['low', 'medium', 'high']`, Default: `'medium'`).
- `dueDate`: Date (Default: null) - Ngay han chot.
- `dueTime`: String (Trim, Default: '') - Gio han chot (tuy chon, format HH:mm).
- `project`: ObjectId (Ref: `'Project'`, Required) - Khoa ngoai toi du an.
- `user`: ObjectId (Ref: `'User'`, Required) - Khoa ngoai toi User so huu.
- `isDeleted`: Boolean (Default: false) - Co danh dau cong viec da bi xoa (chuyen vao Thung rac).
- `deletedAt`: Date (Default: null) - Thoi diem dua vao Thung rac.
- `createdAt`, `updatedAt`: Timestamps tu dong.

---

## 3. Co che dac biet (Key Logic)

### 3.1. Thung rac & TTL Index luu tru toi da 30 ngay
- Khi task bi keo ra ngoai 3 cot Kanban hoac an Xoa, he thong thuc hien Soft Delete:
  - `isDeleted = true`
  - `deletedAt = new Date()`
- Schema cua `Task` duoc khai bao MongoDB TTL (Time-To-Live) Index:
  ```javascript
  taskSchema.index(
    { deletedAt: 1 },
    {
      expireAfterSeconds: 30 * 24 * 60 * 60, // 30 ngay
      partialFilterExpression: { isDeleted: true },
    }
  );
  ```
- Co che nay giup MongoDB service tu dong xoa vinh vien cac ban ghi co `deletedAt` vuot qua 30 ngay ma khong can viet them cron job phuc tap.

### 3.2. Cascade Delete khi xoa Project
Trong `be/src/controllers/projectController.js`:
```javascript
await Task.deleteMany({ project: project._id });
await project.deleteOne();
```
Dam bao khi xoa du an thi toan bo task con deu duoc don sach, tranh gay orphaned data trong co so du lieu.
