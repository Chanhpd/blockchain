#!/bin/bash

echo "🚀 Bắt đầu quá trình cài đặt dự án..."

# 1. Cài đặt các gói phụ thuộc (dependencies)
echo "📦 1/4: Đang cài đặt thư viện Node.js..."
npm install

# 2. Biên dịch Smart Contracts
echo "🔨 2/4: Đang biên dịch Smart Contracts..."
npx truffle compile

# Tạm dừng chờ người dùng kiểm tra Ganache
echo ""
echo "⚠️  CHÚ Ý: Ở bước tiếp theo dự án sẽ deploy Smart Contract."
echo "👉 Hãy chắc chắn rằng bạn đang mở Ganache (cổng 7545) trước khi tiếp tục."
read -p "Nhấn phím [Enter] khi Ganache của bạn đã sẵn sàng chạy..."

# 3. Deploy Smart Contracts (Migrate)
echo "🚀 3/4: Đang deploy Smart Contracts..."
npx truffle migrate --reset

# 4. Chạy dữ liệu mẫu (Seed)
echo "🌱 4/4: Đang tạo dữ liệu mẫu..."
npm run seed

echo ""
echo "✅ Cài đặt hoàn tất! Để khởi động web, hãy chạy lệnh:"
echo "   npm run dev"
echo ""
