// Khai báo biến
let web3;
let contract;
let currentAccount;
let currentFilter = 'all';

// Contract ABI và địa chỉ (sẽ được cập nhật sau khi deploy)
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Thay đổi sau khi deploy
const contractABI = []; // ABI sẽ được tạo tự động sau khi compile

// Khởi tạo Web3 và kết nối
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        console.log('Web3 đã được khởi tạo');
        
        // Lắng nghe sự thay đổi tài khoản
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
        
        return true;
    } else {
        alert('Vui lòng cài đặt MetaMask để sử dụng ứng dụng này!');
        return false;
    }
}

// Kết nối ví
async function connectWallet() {
    try {
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        handleAccountsChanged(accounts);
    } catch (error) {
        console.error('Lỗi kết nối ví:', error);
        alert('Không thể kết nối ví. Vui lòng thử lại!');
    }
}

// Xử lý thay đổi tài khoản
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        currentAccount = null;
        document.getElementById('accountDisplay').textContent = '';
        document.getElementById('connectWallet').textContent = 'Kết nối ví';
    } else {
        currentAccount = accounts[0];
        document.getElementById('accountDisplay').textContent = 
            `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
        document.getElementById('connectWallet').textContent = 'Đã kết nối';
        loadContract();
    }
}

// Tải smart contract
async function loadContract() {
    try {
        // Lấy ABI từ file build (sau khi compile)
        const response = await fetch('/ClothingMarketplace.json');
        const contractData = await response.json();
        
        // Lấy địa chỉ contract từ network hiện tại
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = contractData.networks[networkId];
        
        if (deployedNetwork) {
            contract = new web3.eth.Contract(
                contractData.abi,
                deployedNetwork.address
            );
            console.log('Contract đã được tải thành công');
            await loadProducts();
            await loadMyProducts();
        } else {
            alert('Contract chưa được deploy trên network này!');
        }
    } catch (error) {
        console.error('Lỗi tải contract:', error);
        // Nếu không thể tải từ file, sử dụng contract address thủ công
        console.log('Đang sử dụng địa chỉ contract thủ công...');
    }
}

// Tạo sản phẩm mới
async function createProduct(name, description, imageUrl, category, size, price) {
    if (!contract || !currentAccount) {
        alert('Vui lòng kết nối ví trước!');
        return;
    }
    
    try {
        const priceInWei = web3.utils.toWei(price.toString(), 'ether');
        
        await contract.methods
            .createProduct(name, description, imageUrl, category, size, priceInWei)
            .send({ from: currentAccount });
        
        alert('Đăng sản phẩm thành công!');
        document.getElementById('addProductForm').reset();
        await loadProducts();
        await loadMyProducts();
    } catch (error) {
        console.error('Lỗi tạo sản phẩm:', error);
        alert('Không thể đăng sản phẩm. Vui lòng thử lại!');
    }
}

// Mua sản phẩm
async function purchaseProduct(productId, price) {
    if (!contract || !currentAccount) {
        alert('Vui lòng kết nối ví trước!');
        return;
    }
    
    try {
        await contract.methods
            .purchaseProduct(productId)
            .send({ 
                from: currentAccount,
                value: price
            });
        
        alert('Mua hàng thành công!');
        await loadProducts();
        await loadMyProducts();
    } catch (error) {
        console.error('Lỗi mua sản phẩm:', error);
        alert('Không thể mua sản phẩm. Vui lòng thử lại!');
    }
}

// Tải tất cả sản phẩm
async function loadProducts() {
    if (!contract) return;
    
    try {
        const products = await contract.methods.getAvailableProducts().call();
        displayProducts(products, 'productsList');
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        document.getElementById('productsList').innerHTML = 
            '<div class="loading">Không thể tải sản phẩm</div>';
    }
}

// Tải sản phẩm của tôi
async function loadMyProducts() {
    if (!contract || !currentAccount) {
        document.getElementById('myProductsList').innerHTML = 
            '<div class="loading">Kết nối ví để xem sản phẩm của bạn</div>';
        return;
    }
    
    try {
        const products = await contract.methods.getMyProducts().call({ from: currentAccount });
        displayProducts(products, 'myProductsList', true);
    } catch (error) {
        console.error('Lỗi tải sản phẩm của tôi:', error);
        document.getElementById('myProductsList').innerHTML = 
            '<div class="loading">Không thể tải sản phẩm của bạn</div>';
    }
}

// Hiển thị sản phẩm
function displayProducts(products, containerId, isMyProducts = false) {
    const container = document.getElementById(containerId);
    
    if (products.length === 0) {
        container.innerHTML = '<div class="loading">Chưa có sản phẩm nào</div>';
        return;
    }
    
    // Lọc sản phẩm theo category
    let filteredProducts = products;
    if (currentFilter !== 'all' && !isMyProducts) {
        filteredProducts = products.filter(p => p.category === currentFilter);
    }
    
    container.innerHTML = filteredProducts.map(product => {
        const priceInEth = web3.utils.fromWei(product.price, 'ether');
        const isSold = product.sold;
        const isOwner = currentAccount && product.seller.toLowerCase() === currentAccount.toLowerCase();
        
        return `
            <div class="product-card" data-category="${product.category}">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-details">
                        <span>Size: <span class="product-size">${product.size}</span></span>
                        <span>ID: #${product.id}</span>
                    </div>
                    <div class="product-price">${priceInEth} ETH</div>
                    <div class="product-seller">
                        Người bán: ${product.seller.substring(0, 6)}...${product.seller.substring(38)}
                    </div>
                    <div class="product-status ${isSold ? 'status-sold' : 'status-available'}">
                        ${isSold ? '✓ Đã bán' : '✓ Còn hàng'}
                    </div>
                    ${!isSold && !isOwner ? `
                        <div class="product-actions">
                            <button class="btn-success" onclick="purchaseProduct(${product.id}, '${product.price}')">
                                Mua ngay
                            </button>
                        </div>
                    ` : ''}
                    ${isOwner ? `
                        <div class="product-actions">
                            <button class="btn-primary" disabled>Sản phẩm của bạn</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Xử lý form đăng sản phẩm
document.addEventListener('DOMContentLoaded', async () => {
    // Khởi tạo Web3
    await initWeb3();
    
    // Xử lý nút kết nối ví
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Xử lý form thêm sản phẩm
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const imageUrl = document.getElementById('productImage').value;
        const category = document.getElementById('productCategory').value;
        const size = document.getElementById('productSize').value;
        const price = document.getElementById('productPrice').value;
        
        await createProduct(name, description, imageUrl, category, size, price);
    });
    
    // Xử lý filter tabs
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            loadProducts();
        });
    });
    
    // Xử lý smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Helper function cho smooth scroll
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Load sản phẩm định kỳ (mỗi 10 giây)
setInterval(() => {
    if (contract) {
        loadProducts();
        if (currentAccount) {
            loadMyProducts();
        }
    }
}, 10000);
