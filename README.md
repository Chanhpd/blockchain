# Blockchain Clothing Store 🛍️

Trang web mua bán quần áo sử dụng công nghệ Blockchain và Smart Contracts trên Ethereum.

## 🌟 Tính năng

- ✅ Đăng bán sản phẩm quần áo lên blockchain
- ✅ Mua sản phẩm trực tiếp bằng ETH
- ✅ Lịch sử mua hàng được lưu trên blockchain
- ✅ Giao dịch minh bạch, bảo mật với Smart Contracts
- ✅ Giao diện đẹp, responsive
- ✅ Quản lý sản phẩm cá nhân
- ✅ Lọc sản phẩm theo danh mục
- ✅ Tích hợp MetaMask wallet

## 🛠️ Công nghệ sử dụng

- **Blockchain**: Ethereum (Ganache)
- **Smart Contract**: Solidity ^0.8.0
- **Framework**: Truffle
- **Frontend**: HTML5, CSS3, JavaScript
- **Web3**: Web3.js
- **Wallet**: MetaMask

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, bạn cần cài đặt:

1. **Node.js** (v14 trở lên): https://nodejs.org/
2. **Ganache**: https://trufflesuite.com/ganache/
3. **MetaMask**: https://metamask.io/ (Extension cho trình duyệt)
4. **Truffle** (cài đặt global):
   ```bash
   npm install -g truffle
   ```

## 🚀 Hướng dẫn cài đặt

### Cách 1: Clone từ Git (Cho máy khác)

```bash
# Clone repository
git clone <repository-url>
cd blockchain

# Cài đặt dependencies
npm install

# Tiếp tục các bước 2, 3, 4, 5 bên dưới
```

### Cách 2: Setup từ đầu

### Bước 1: Cài đặt dependencies

```bash
# Di chuyển vào thư mục dự án
cd d:\Code\blockchain

# Cài đặt các package cần thiết
npm install
```

### Bước 2: Cấu hình Ganache

1. Mở ứng dụng **Ganache**
2. Tạo một workspace mới hoặc sử dụng Quickstart
3. Đảm bảo Ganache chạy trên cổng **7545** (mặc định)
4. Lưu lại các tài khoản và private keys

### Bước 3: Compile và Deploy Smart Contracts

```bash
# Compile smart contracts
truffle compile

# Deploy lên Ganache
truffle migrate --reset
```

Sau khi deploy thành công, bạn sẽ thấy địa chỉ contract được hiển thị.

### Bước 4: Cấu hình MetaMask

1. Mở MetaMask extension
2. Thêm network tùy chỉnh:
   - **Network Name**: Ganache Local
   - **RPC URL**: http://127.0.0.1:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH
3. Import tài khoản từ Ganache:
   - Copy Private Key từ Ganache
   - Vào MetaMask > Import Account > Paste Private Key

### Bước 5: Chạy ứng dụng

```bash
# Khởi động development server
npm run dev
```

Trình duyệt sẽ tự động mở tại: http://localhost:3000

### Bước 6: Thêm dữ liệu mẫu (Optional)

```bash
# Thêm 12 sản phẩm mẫu vào blockchain
npm run seed
```

## 📖 Hướng dẫn sử dụng

### Kết nối ví

1. Click nút **"Kết nối ví"** ở góc trên bên phải
2. MetaMask sẽ hiện lên, chọn tài khoản và confirm
3. Địa chỉ ví của bạn sẽ hiển thị sau khi kết nối thành công

### Đăng bán sản phẩm

1. Click vào menu **"Bán hàng"** để hiển thị form
2. Scroll xuống phần **"Đăng bán sản phẩm"**
3. Điền thông tin:
   - Tên sản phẩm
   - Danh mục (Áo, Quần, Váy, etc.)
   - Kích thước (S, M, L, XL, XXL)
   - Giá (tính bằng ETH)
   - Mô tả chi tiết
   - URL hình ảnh
3. Click **"Đăng bán sản phẩm"**
4. Confirm transaction trên MetaMask
5. Đợi transaction hoàn tất

### Mua sản phẩm

1. Xem danh sách sản phẩm ở phần **"Sản phẩm đang bán"**
2. Lọc theo danh mục nếu muốn
3. Click **"Mua ngay"** ở sản phẩm bạn muốn
4. Confirm transaction trên MetaMask (đảm bảo có đủ ETH)
5. Đợi transaction hoàn tất

### Xem sản phẩm của tôi

- Scroll xuống phần **"Sản phẩm của tôi"** để xem các sản phẩm bạn đã đăng bán

### Xem lịch sử mua hàng

- Scroll xuống phần **"Lịch sử mua hàng"** để xem tất cả sản phẩm bạn đã mua
- Lịch sử được lưu vĩnh viễn trên blockchain

## 📁 Cấu trúc dự án

```
blockchain/
├── contracts/              # Smart Contracts (Solidity)
│   ├── ClothingMarketplace.sol
│   └── Migrations.sol
├── migrations/             # Truffle migration scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
├── scripts/                # Utility scripts
│   └── seed.js            # Script thêm dữ liệu mẫu
├── src/                    # Frontend
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── build/                  # Compiled contracts (tự động tạo)
├── truffle-config.js       # Cấu hình Truffle
├── bs-config.json          # Cấu hình Browser-sync
├── package.json
└── README.md
```

## 🔧 Smart Contract Functions

### `createProduct()`
Tạo sản phẩm mới trên blockchain

**Parameters:**
- `name`: Tên sản phẩm
- `description`: Mô tả
- `imageUrl`: URL hình ảnh
- `category`: Danh mục
- `size`: Kích thước
- `price`: Giá (wei)

### `purchaseProduct(productId)`
Mua sản phẩm

**Parameters:**
- `productId`: ID của sản phẩm

### `getAvailableProducts()`
Lấy danh sách sản phẩm chưa bán

### `getMyProducts()`
Lấy danh sách sản phẩm của người dùng hiện tại

### `getMyPurchases()`
Lấy danh sách lịch sử mua hàng của người dùng

## 📝 Scripts có sẵn

```bash
# Compile smart contracts
npx truffle compile

# Deploy contracts lên Ganache
npx truffle migrate --reset

# Chạy development server
npm run dev

# Thêm dữ liệu mẫu
npm run seed
```

## 🔄 Hướng dẫn pull về máy khác

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd blockchain
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Khởi động Ganache

- Mở Ganache
- Tạo workspace mới hoặc Quickstart
- Đảm bảo port 7545

### Bước 4: Deploy smart contracts

```bash
# Compile contracts
npx truffle compile

# Deploy lên Ganache
npx truffle migrate --reset
```

### Bước 5: Cấu hình MetaMask

1. Thêm network Ganache Local (xem hướng dẫn trên)
2. Import account từ Ganache

### Bước 6: Chạy ứng dụng

```bash
# Chạy web server
npm run dev

# (Optional) Thêm dữ liệu mẫu
npm run seed
```

### Bước 7: Mở trình duyệt

- Truy cập http://localhost:3002
- Kết nối MetaMask
- Bắt đầu sử dụng!

## 🐛 Xử lý sự cố

### Lỗi "Contract not deployed"
- Đảm bảo Ganache đang chạy
- Chạy lại `truffle migrate --reset`

### MetaMask không kết nối
- Kiểm tra network trong MetaMask (phải là Ganache Local)
- Refresh trang và thử lại

### Transaction failed
- Kiểm tra số dư ETH trong tài khoản
- Đảm bảo gas limit đủ lớn

### Không thấy sản phẩm
- Mở Console (F12) để xem lỗi
- Kiểm tra contract đã deploy đúng chưa
- Refresh trang

## 🔐 Bảo mật

- Không bao giờ chia sẻ Private Key của bạn
- Chỉ sử dụng Ganache cho môi trường development
- Với production, cần thêm các biện pháp bảo mật khác

## 📝 Ghi chú

- Đây là dự án demo cho mục đích học tập
- Không sử dụng trực tiếp cho production
- Gas fees trên mainnet Ethereum sẽ cao hơn nhiều so với Ganache

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra lại các bước cài đặt
2. Xem Console log để debug
3. Đảm bảo tất cả dependencies đã được cài đặt đầy đủ

## 📄 License

MIT License - Sử dụng tự do cho mục đích học tập và phát triển.

---

**Chúc bạn thành công! 🎉**
# blockchain
