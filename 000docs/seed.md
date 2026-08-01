# Du lieu mau (Seed Data)

Tap lenh khoi tao du lieu mau nam tai: `be/src/utils/seedData.js`.

## 1. Huong dan chay Seeder

Mo terminal tai thu muc `be/`:
```bash
cd be
npm run seed
```

---

## 2. Thong tin Tai khoan Test

| Truong | Gia tri |
| :--- | :--- |
| **Email** | `nam.nguyen@ptit.edu.vn` |
| **Mat khau** | `password123` |
| **Vai tro** | `user` |
| **Ho va ten** | Nguyen Thanh Nam |

*(Trang dang nhap `LoginPage` co san nut "Auto Fill" de dien nhanh thong tin nay)*

---

## 3. Danh sach Du an Mau duoc khoi tao

1. **E-Commerce Microservices Platform** (Mau xanh duong `#2563eb`)
   - Mo ta: Distributed shopping architecture with Express, MongoDB, and React client.
   - Tong so task: 7 task dang hoat dong + 2 task mau trong Thung rac.

2. **AI Customer Support Portal** (Mau tim `#7c3aed`)
   - Mo ta: Intelligent ticket routing system with automated sentiment analysis and response triage.
   - Tong so task: 4 task trai deu cac trang thai To Do, In Progress, Done.

3. **DevOps CI/CD Automation Pipeline** (Mau xanh luc `#059669`)
   - Mo ta: Infrastructure containerization, automated testing workflows, and Kubernetes deployment.
   - Tong so task: 3 task voi han chot va muc uu tien khac nhau.

4. **Mobile Banking Application V2** (Mau vang ho phach `#d97706`)
   - Mo ta: Biometric authentication, real-time transaction tracking, and monthly expense analytics.
   - Tong so task: 3 task voi han chot va muc uu tien khac nhau.

---

## 4. Danh sach Task mau trong Thung rac (De test chuc nang Trash 30 ngay)

Seeder tu dong nap 2 cong viec da bi xoa (soft-deleted) vao muc Trash:

1. **Legacy Session-Based Cookie Middleware**
   - Du an goc: `E-Commerce Microservices Platform`
   - Ngay xoa gia lap: Cach day 3 ngay (`deletedAt: now - 3 days`)
   - Thoi gian luu tru con lai: **27 ngay**.

2. **Old XML Export Endpoint for Invoices**
   - Du an goc: `E-Commerce Microservices Platform`
   - Ngay xoa gia lap: Cach day 5 ngay (`deletedAt: now - 5 days`)
   - Thoi gian luu tru con lai: **25 ngay**.

> Ban co the truy cap vao muc **Trash** tren thanh Menu de test ngay 2 tinh nang: **Restore** (Khoi phuc ve du an) va **Delete** (Xoa vinh vien).
