# Sử dụng image có sẵn của Node.js
FROM node:latest

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt dependencies
RUN yarn install

# Sao chép toàn bộ mã nguồn của dịch vụ
COPY . .

# Khai báo cổng mà dịch vụ lắng nghe
EXPOSE 1234

RUN yarn sequelize-auto -h localhost -d ecommerce -u root -x 1234 -p 3306  --dialect mysql -o src/Model/db -l esm

# Khởi chạy dịch vụ khi container được khởi động
CMD ["yarn", "start"]