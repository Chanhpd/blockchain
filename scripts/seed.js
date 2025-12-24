const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Kết nối với Ganache
const web3 = new Web3('http://127.0.0.1:7545');

// Đọc contract đã deploy
const contractPath = path.join(__dirname, '../build/contracts/ClothingMarketplace.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

// Mock products - Sản phẩm mẫu
const mockProducts = [
    {
        name: 'Áo Thun Nam Basic',
        description: 'Áo thun nam chất liệu cotton 100%, thoáng mát, form regular fit phù hợp mọi dáng người',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        category: 'Áo',
        size: 'L',
        price: '0.05'
    },
    {
        name: 'Quần Jean Slim Fit',
        description: 'Quần jean nam form slim fit, chất liệu denim cao cấp, bền đẹp theo thời gian',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        category: 'Quần',
        size: 'M',
        price: '0.08'
    },
    {
        name: 'Váy Maxi Hoa Nhí',
        description: 'Váy maxi họa tiết hoa nhí dịu dàng, chất liệu voan mềm mại, phù hợp dạo phố',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
        category: 'Váy',
        size: 'M',
        price: '0.12'
    },
    {
        name: 'Áo Sơ Mi Trắng Oxford',
        description: 'Áo sơ mi trắng chất liệu oxford cao cấp, phong cách lịch lãm cho văn phòng',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
        category: 'Áo',
        size: 'XL',
        price: '0.06'
    },
    {
        name: 'Quần Short Kaki',
        description: 'Quần short kaki nam form rộng, thoải mái cho mùa hè, nhiều túi tiện dụng',
        imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
        category: 'Quần',
        size: 'L',
        price: '0.04'
    },
    {
        name: 'Áo Khoác Hoodie',
        description: 'Áo khoác hoodie unisex chất nỉ ngoại cao cấp, ấm áp và phong cách streetwear',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        category: 'Áo khoác',
        size: 'XL',
        price: '0.15'
    },
    {
        name: 'Váy Công Sở Đen',
        description: 'Váy công sở đen cổ điển, thiết kế thanh lịch, phù hợp môi trường làm việc chuyên nghiệp',
        imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500',
        category: 'Váy',
        size: 'S',
        price: '0.09'
    },
    {
        name: 'Áo Polo Nam Premium',
        description: 'Áo polo nam chất liệu pique cao cấp, thấm hút mồ hôi tốt, thích hợp chơi golf',
        imageUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500',
        category: 'Áo',
        size: 'M',
        price: '0.07'
    },
    {
        name: 'Quần Tây Âu',
        description: 'Quần tây âu nam may theo form châu âu, chất liệu vải tốt, phù hợp đi làm',
        imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500',
        category: 'Quần',
        size: 'L',
        price: '0.10'
    },
    {
        name: 'Áo Khoác Jean',
        description: 'Áo khoác jean unisex phong cách vintage, chất liệu denim dày dặn, bền màu',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        category: 'Áo khoác',
        size: 'L',
        price: '0.13'
    },
    {
        name: 'Áo Thun Nữ Croptop',
        description: 'Áo thun nữ croptop năng động, chất liệu cotton co giãn, nhiều màu sắc trẻ trung',
        imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
        category: 'Áo',
        size: 'S',
        price: '0.04'
    },
    {
        name: 'Váy Dạ Hội Sang Trọng',
        description: 'Váy dạ hội thiết kế sang trọng, chất liệu lụa cao cấp, phù hợp sự kiện quan trọng',
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500',
        category: 'Váy',
        size: 'M',
        price: '0.25'
    }
];

async function seedProducts() {
    try {
        console.log('🚀 Bắt đầu thêm sản phẩm mẫu...\n');
        
        // Lấy network ID
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = contractJson.networks[networkId];
        
        if (!deployedNetwork) {
            console.error('❌ Contract chưa được deploy trên network này!');
            process.exit(1);
        }
        
        // Khởi tạo contract
        const contract = new web3.eth.Contract(
            contractJson.abi,
            deployedNetwork.address
        );
        
        // Lấy danh sách accounts
        const accounts = await web3.eth.getAccounts();
        console.log(`📋 Sử dụng account: ${accounts[0]}\n`);
        
        // Thêm từng sản phẩm
        for (let i = 0; i < mockProducts.length; i++) {
            const product = mockProducts[i];
            const priceInWei = web3.utils.toWei(product.price, 'ether');
            
            console.log(`${i + 1}. Đang thêm: ${product.name}...`);
            
            try {
                const result = await contract.methods
                    .createProduct(
                        product.name,
                        product.description,
                        product.imageUrl,
                        product.category,
                        product.size,
                        priceInWei
                    )
                    .send({ 
                        from: accounts[0],
                        gas: 500000
                    });
                
                console.log(`   ✅ Thành công! TX: ${result.transactionHash.substring(0, 10)}...`);
            } catch (error) {
                console.log(`   ❌ Lỗi: ${error.message}`);
            }
        }
        
        console.log('\n✨ Hoàn tất! Đã thêm tất cả sản phẩm mẫu.');
        console.log('🌐 Refresh trang web để xem sản phẩm mới!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

// Chạy seed
seedProducts();
