# TaskFlow - MERN Stack Project & Task Management

Du an web quan ly du an va cong viec ca nhan theo mo hinh Kanban (To Do / In Progress / Done) su dung MERN Stack (MongoDB, Express.js, React, Node.js). 

Kien truc he thong tach biet ro rang giua Backend (`be`) va Frontend (`fe`), logic CRUD ro rang, de doc va de bao tri.

---

## 1. Tinh nang chinh

- Quan ly Du an (Project): Tao moi, chinh sua, doi mau nhan dien va xoa du an (ho tro cascade delete toan bo task con).
- Bang Kanban truc quan: Ho tro keo tha cong viec (Native HTML5 Drag & Drop) giua 3 cot To Do, In Progress va Done.
- Thung rac (Trash) luu tru 30 ngay: Keo tha cong viec ra ngoai pham vi 3 cot de chuyen vao thung rac khong can hop thoai xac nhan. Du lieu rac duoc luu toi da 30 ngay va tu dong xoa thong qua MongoDB TTL Index. Nguoi dung co the khoi phuc (Restore) hoac xoa vinh vien bat ky luc nao.
- Sap xep rieng tung cot: Ho tro sap xep cong viec theo Thu tu tao, Do uu tien (Cao/Thap) va Han chot (Gan/Xa).
- Tim kiem & Loc nhanh: Tim kiem cong viec theo tieu de hoac mo ta theo thoi gian thuc; loc theo muc do uu tien.
- Cai dat nguoi dung: Doi mat khau, cap nhat ho ten/email va tuy chinh phong to/thu nho co chu giao dien (Scale 85% - 125%) luu tren localStorage.
- Xac thuc & Bao mat: Dang ky, dang nhap bang JWT Bearer Token va ma hoa mat khau voi Bcrypt.

---

## 2. Cau truc thu muc

```
taskflow-mern/
├── 000docs/                 # Tai lieu chi tiet ve Schema va Seed data
│   ├── schema.md            # Mo ta cac collection va quan he database
│   └── seed.md              # Huong dan va thong tin tai khoan test
├── be/                      # Backend (Node.js + Express.js + MongoDB)
│   ├── src/
│   │   ├── config/          # Ket noi MongoDB (db.js)
│   │   ├── controllers/     # Controller xu ly logic API (auth, project, task)
│   │   ├── middlewares/     # Middleware bao mat JWT va bat loi tap trung
│   │   ├── models/          # Mongoose schema (User, Project, Task)
│   │   ├── routes/          # RESTful API routes
│   │   └── utils/           # Helper JWT va file seedData.js
│   ├── .env                 # Bien moi truong Backend
│   ├── server.js            # Entrypoint Backend
│   └── package.json
├── fe/                      # Frontend (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/      # UI components (TaskCard, TaskModal, ProjectModal...)
│   │   ├── context/         # AuthContext quan ly session dang nhap
│   │   ├── pages/           # DashboardPage, ProjectDetailPage, TrashPage, LoginPage...
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # Router & ProtectedRoute
│   │   └── main.jsx         # Entrypoint React
│   ├── vite.config.js       # Vite configuration
│   └── package.json
└── README.md
```

Chi tiet them ve Database va Du lieu mau:
- Xem tai lieu Schema tai: [000docs/schema.md](000docs/schema.md)
- Xem thong tin du lieu mau tai: [000docs/seed.md](000docs/seed.md)

---

## 3. Huong dan cai dat va chay du an

### Yeu cau moi truong
- Node.js (phien ban 18 tro len)
- MongoDB dang chay cuc bo tai `mongodb://127.0.0.1:27017` (hoac link ket noi MongoDB Atlas)

---

### Buoc 1: Cai dat va chay Backend

Mo mot cua so terminal moi:
```bash
cd be
npm install
```

Khoi tao du lieu mau (Seeding):
```bash
npm run seed
```
> Lenh tren se tao san tai khoan demo:
> - Email: `nam.nguyen@ptit.edu.vn`
> - Mat khau: `password123`
> Va tu dong tao 4 du an mau kem cac cong viec thuc te.

Khoi chay Backend server:
```bash
npm run dev
```
Backend se lang nghe tai: `http://localhost:5001`

---

### Buoc 2: Cai dat va chay Frontend

Mo mot cua so terminal khac:
```bash
cd fe
npm install
npm run dev
```
Frontend se chay tai: `http://localhost:5173`

---

### Buoc 3: Trai nghiem ung dung
1. Mo trinh duyet truy cap: `http://localhost:5173`
2. Bam nut **Auto Fill** tai trang dang nhap (hoac nhap `nam.nguyen@ptit.edu.vn` / `password123`) va bam **Sign In**.
3. Trai nghiem keo tha cac the cong viec giua cac cot hoac keo ra ngoai 3 cot de chuyen vao **Trash**.
