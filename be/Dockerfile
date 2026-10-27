# Sử dụng Node.js 20 trên nền Linux Alpine siêu nhẹ
FROM node:20-alpine

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy package.json để cài dependencies trước (tận dụng Docker Cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn còn lại
COPY . .

# Mở cổng 5001
EXPOSE 5001

# Lệnh khởi chạy server
CMD ["npm", "start"]