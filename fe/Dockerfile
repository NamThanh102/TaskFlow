# Giai đoạn 1: Build source code bằng Node
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Phục vụ bằng Web Server Nginx
FROM nginx:alpine
# Copy sản phẩm build từ giai đoạn 1 sang thư mục của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]