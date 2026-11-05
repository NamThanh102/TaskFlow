import 'dotenv/config';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import User from './src/models/User.js';
import Project from './src/models/Project.js';
import Task from './src/models/Task.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow_db';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('[Seed] MongoDB Connected successfully.');

    // 1. Xóa sạch database cũ để tạo mới hoàn toàn
    console.log('[Seed] Dropping old database for a fresh start...');
    await mongoose.connection.dropDatabase();
    console.log('[Seed] Old database wiped clean.');

    // 2. Dọn sạch toàn bộ Redis cache
    try {
      const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, enableOfflineQueue: false });
      await redis.flushdb();
      await redis.quit();
      console.log('[Seed] Redis cache flushed.');
    } catch (redisErr) {
      console.warn('[Seed] Redis flush skipped (Redis offline or not reachable):', redisErr.message);
    }

    // 3. Khởi tạo tài khoản người dùng
    console.log('[Seed] Creating demo users...');
    const user1 = await User.create({
      name: 'Nguyen Thanh Nam',
      email: 'nam.nguyen@ptit.edu.vn',
      password: 'password123',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Tran Duc Anh',
      email: 'ducanh.tran@ptit.edu.vn',
      password: 'password123',
      role: 'user',
    });

    console.log(`[Seed] User 1 created: ${user1.name} (${user1.email})`);
    console.log(`[Seed] User 2 created: ${user2.name} (${user2.email})`);

    // 4. Khởi tạo 4 dự án đa dạng
    console.log('[Seed] Creating diverse projects...');
    const project1 = await Project.create({
      name: 'E-Commerce Microservices Platform',
      description: 'Hệ thống thương mại điện tử phân tán với Node.js, Redis Cache-Aside, giỏ hàng thời gian thực và cổng thanh toán VNPay.',
      color: '#4f46e5', // Indigo
      user: user1._id,
    });

    const project2 = await Project.create({
      name: 'AI Customer Support Portal',
      description: 'Hệ sinh thái phân loại ticket tự động, tích hợp mô hình phân tích cảm xúc (Sentiment Analysis) và phản hồi đa kênh.',
      color: '#7c3aed', // Purple
      user: user1._id,
    });

    const project3 = await Project.create({
      name: 'DevOps CI/CD Automation Pipeline',
      description: 'Quy trình đóng gói Docker multi-stage, kiểm thử tự động trên GitHub Actions và giám sát hạ tầng với Prometheus.',
      color: '#059669', // Emerald
      user: user1._id,
    });

    const project4 = await Project.create({
      name: 'Mobile Banking Application V2',
      description: 'Ứng dụng ngân hàng số hỗ trợ xác thực sinh trắc học, sao kê tài chính tức thì và quản lý chi tiêu thông minh.',
      color: '#d97706', // Amber
      user: user1._id,
    });

    // Dự án riêng cho User 2 (để kiểm tra phân quyền cô lập dữ liệu)
    await Project.create({
      name: 'Data Analytics & ETL Pipeline',
      description: 'Xử lý luồng dữ liệu clickstream thời gian thực với Apache Kafka và MongoDB Time Series.',
      color: '#dc2626',
      user: user2._id,
    });

    console.log('[Seed] Created 5 projects across 2 users.');

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // 5. Khởi tạo danh sách Task đa dạng cho Project 1 (E-Commerce)
    console.log('[Seed] Populating tasks for Project 1...');
    await Task.create([
      // To Do
      {
        title: 'Thiết kế lược đồ Database & Index tối ưu',
        description: 'Định nghĩa quan hệ Mongoose Schema cho Product, Order và áp dụng compound indexes tăng tốc truy vấn.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(now + 2 * day),
        dueTime: '10:00',
        project: project1._id,
        user: user1._id,
      },
      {
        title: 'Viết tài liệu Swagger API Specification',
        description: 'Tài liệu hóa 25+ RESTful endpoints phục vụ đối tác tích hợp frontend và mobile app.',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 5 * day),
        dueTime: '17:00',
        project: project1._id,
        user: user1._id,
      },
      {
        title: 'Tích hợp Webhook đồng bộ cổng VNPay / MoMo',
        description: 'Xử lý xác thực chữ ký HMAC-SHA512 và idempotent transaction để tránh xử lý trùng hóa đơn.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 3 * day),
        dueTime: '15:30',
        project: project1._id,
        user: user1._id,
      },
      // In Progress
      {
        title: 'Triển khai Redis Cache-Aside cho danh mục sản phẩm',
        description: 'Lưu đệm kết quả lọc và phân trang sản phẩm với TTL 10 phút, tự động xóa cache khi thêm/sửa sản phẩm.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now + 1 * day),
        dueTime: '14:00',
        project: project1._id,
        user: user1._id,
      },
      {
        title: 'Tối ưu hóa UI giỏ hàng với Optimistic Updates',
        description: 'Cho phép người dùng tăng giảm số lượng tức thì trên giao diện trước khi server phản hồi.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now + 2 * day),
        dueTime: '16:00',
        project: project1._id,
        user: user1._id,
      },
      // Done
      {
        title: 'Xây dựng module xác thực JWT & Bcrypt 10 rounds',
        description: 'Hoàn thành luồng đăng ký, đăng nhập và middleware bảo vệ token bearer an toàn.',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 1 * day),
        dueTime: '11:00',
        project: project1._id,
        user: user1._id,
      },
      {
        title: 'Thiết lập Dockerfile & Nginx Reverse Proxy',
        description: 'Đóng gói multi-stage build cho frontend và cấu hình reverse proxy điều hướng /api vào backend.',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 2 * day),
        dueTime: '18:00',
        project: project1._id,
        user: user1._id,
      },
    ]);

    // 6. Khởi tạo Task cho Project 2 (AI Customer Support)
    console.log('[Seed] Populating tasks for Project 2...');
    await Task.create([
      {
        title: 'Xây dựng luồng WebSocket nhận diện tin nhắn trực tiếp',
        description: 'Kết nối Socket.io với client để thông báo trạng thái phản hồi ticket theo thời gian thực.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now + 1 * day),
        dueTime: '13:30',
        project: project2._id,
        user: user1._id,
      },
      {
        title: 'Giao diện Chatbot Drawer hỗ trợ người dùng',
        description: 'Thiết kế khung chat pop-up góc phải màn hình tương thích tốt trên mobile.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 4 * day),
        dueTime: '16:45',
        project: project2._id,
        user: user1._id,
      },
      {
        title: 'Thu thập dataset 10.000 hội thoại mẫu huấn luyện mô hình',
        description: 'Làm sạch văn bản, chuẩn hóa tiếng Việt không dấu/có dấu và gán nhãn câu hỏi thường gặp.',
        status: 'done',
        priority: 'low',
        dueDate: new Date(now - 3 * day),
        dueTime: '09:00',
        project: project2._id,
        user: user1._id,
      },
    ]);

    // 7. Khởi tạo Task cho Project 3 (DevOps CI/CD)
    console.log('[Seed] Populating tasks for Project 3...');
    await Task.create([
      {
        title: 'Cấu hình GitHub Actions tự động chạy linter và unit test',
        description: 'Chạy kiểm thử mỗi khi có Pull Request vào nhánh main trước khi cho phép merge code.',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 4 * day),
        dueTime: '10:15',
        project: project3._id,
        user: user1._id,
      },
      {
        title: 'Thiết lập hệ thống log tập trung với Winston & Morgan',
        description: 'Lưu log lỗi ra file quay vòng (daily rotate) để tiện điều tra lỗi trong môi trường production.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now + 1 * day),
        dueTime: '15:00',
        project: project3._id,
        user: user1._id,
      },
    ]);

    // 8. Khởi tạo Task cho Project 4 (Mobile Banking)
    console.log('[Seed] Populating tasks for Project 4...');
    await Task.create([
      {
        title: 'Mã hóa dữ liệu tài khoản nhạy cảm bằng AES-256',
        description: 'Mã hóa số tài khoản và thông tin giao dịch trước khi ghi vào cơ sở dữ liệu.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(now + 3 * day),
        dueTime: '11:30',
        project: project4._id,
        user: user1._id,
      },
      {
        title: 'Biểu đồ trực quan hóa chi tiêu theo tháng',
        description: 'Dùng Recharts hiển thị tỷ lệ chi tiêu theo danh mục ăn uống, mua sắm, giải trí.',
        status: 'done',
        priority: 'medium',
        dueDate: new Date(now - 1 * day),
        dueTime: '17:00',
        project: project4._id,
        user: user1._id,
      },
    ]);

    // 9. Khởi tạo dữ liệu mẫu trong Thùng rác (Trash) để kiểm tra tính năng khôi phục/xóa
    console.log('[Seed] Creating trashed tasks for testing Recycle Bin lifecycle...');
    await Task.create([
      {
        title: 'Gặp khách hàng demo bản alpha (Task cũ đã bỏ)',
        description: 'Khách hàng dời lịch sang tháng sau nên đưa thẻ vào thùng rác lưu trữ 30 ngày.',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now - 5 * day),
        dueTime: '14:00',
        project: project1._id,
        user: user1._id,
        isDeleted: true,
        deletedAt: new Date(now - 2 * day), // Đã xóa cách đây 2 ngày
      },
      {
        title: 'Nghiên cứu thư viện biểu đồ cũ (Deprecated)',
        description: 'Thư viện không còn tương thích React 19, đã thay thế bằng giải pháp mới.',
        status: 'done',
        priority: 'low',
        dueDate: new Date(now - 10 * day),
        dueTime: '09:00',
        project: project1._id,
        user: user1._id,
        isDeleted: true,
        deletedAt: new Date(now - 5 * day), // Đã xóa cách đây 5 ngày
      },
    ]);

    console.log('[Seed] ==============================================');
    console.log('[Seed] Database seeded successfully!');
    console.log('[Seed] Default test credentials:');
    console.log('[Seed] Email:    nam.nguyen@ptit.edu.vn');
    console.log('[Seed] Password: password123');
    console.log('[Seed] ==============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
