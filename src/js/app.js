// Khai báo biến
let web3;
let contract;
let currentAccount;
let currentFilter = 'all';
let pendingProductId = null;
let allAvailableProducts = [];
let currentSearch = '';
let currentSort = 'newest';

// Contract ABI và địa chỉ (sẽ được cập nhật sau khi deploy)
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Thay đổi sau khi deploy
const contractABI = []; // ABI sẽ được tạo tự động sau khi compile
const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="360" height="260" viewBox="0 0 360 260"%3E%3Crect width="360" height="260" fill="%23e2e8f0"/%3E%3Ctext x="180" y="132" text-anchor="middle" font-family="Arial" font-size="18" fill="%2364748b"%3ENo Image%3C/text%3E%3C/svg%3E';

function shortAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setTransactionStatus(message, type = 'info', details = '') {
    const panel = document.getElementById('transactionStatus');
    if (!panel) return;

    panel.className = `transaction-status ${type}`;
    panel.innerHTML = `
        <strong>${escapeHtml(message)}</strong>
        ${details ? `<small>${escapeHtml(details)}</small>` : ''}
    `;
}

function clearTransactionStatus() {
    const panel = document.getElementById('transactionStatus');
    if (!panel) return;

    panel.className = 'transaction-status';
    panel.innerHTML = '<strong>Chưa có giao dịch mới</strong><small>Kết nối ví, đăng bán hoặc mua sản phẩm để xem trạng thái transaction.</small>';
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function getNetworkName(networkId) {
    const networks = {
        1: 'Ethereum Mainnet',
        5: 'Goerli',
        11155111: 'Sepolia',
        1337: 'Ganache Local',
        5777: 'Ganache Local'
    };

    return networks[Number(networkId)] || `Chain ${networkId}`;
}

async function updateWalletDashboard() {
    if (!web3 || !currentAccount) {
        setText('walletStatus', 'Chưa kết nối');
        setText('networkDisplay', 'Chưa xác định');
        setText('balanceDisplay', '-- ETH');
        return;
    }

    try {
        const [networkId, balanceWei] = await Promise.all([
            web3.eth.net.getId(),
            web3.eth.getBalance(currentAccount)
        ]);
        const balance = Number(web3.utils.fromWei(balanceWei, 'ether')).toFixed(4);

        setText('walletStatus', `Đã kết nối ${shortAddress(currentAccount)}`);
        setText('networkDisplay', getNetworkName(networkId));
        setText('balanceDisplay', `${balance} ETH`);
    } catch (error) {
        console.error('Không thể cập nhật thông tin ví:', error);
        setText('walletStatus', 'Lỗi ví');
        setText('networkDisplay', 'Không đọc được');
        setText('balanceDisplay', '-- ETH');
    }
}

function getReceiptStorageKey() {
    return currentAccount ? `purchaseReceipts:${currentAccount.toLowerCase()}` : 'purchaseReceipts:guest';
}

function getSavedPurchaseReceipts() {
    try {
        return JSON.parse(localStorage.getItem(getReceiptStorageKey())) || {};
    } catch (error) {
        console.error('Không thể đọc receipt đã lưu:', error);
        return {};
    }
}

function savePurchaseReceipt(productId, receipt) {
    const receipts = getSavedPurchaseReceipts();
    receipts[productId] = {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        from: receipt.from,
        to: receipt.to
    };
    localStorage.setItem(getReceiptStorageKey(), JSON.stringify(receipts));
}

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
        setText('contractDisplay', 'Chưa tải');
        updateWalletDashboard();
    } else {
        currentAccount = accounts[0];
        document.getElementById('accountDisplay').textContent = shortAddress(currentAccount);
        document.getElementById('connectWallet').textContent = 'Đã kết nối';
        clearTransactionStatus();
        updateWalletDashboard();
        loadContract();
        loadPurchaseHistory();
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
            setText('contractDisplay', shortAddress(deployedNetwork.address));
            console.log('Contract đã được tải thành công');
            await loadProducts();
            await loadMyProducts();
            await loadPurchaseHistory();
        } else {
            setText('contractDisplay', 'Sai network');
            setTransactionStatus('Contract chưa deploy trên network hiện tại', 'error', 'Kiểm tra Ganache network trong MetaMask và chạy truffle migrate --reset.');
            alert('Contract chưa được deploy trên network này!');
        }
    } catch (error) {
        console.error('Lỗi tải contract:', error);
        setText('contractDisplay', 'Lỗi tải');
        setTransactionStatus('Không thể tải smart contract', 'error', 'Hãy chạy truffle compile, truffle migrate --reset rồi refresh trang.');
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

        setTransactionStatus('Đang chờ xác nhận trên MetaMask...', 'pending', 'Vui lòng kiểm tra popup MetaMask để ký giao dịch đăng bán.');

        const receipt = await contract.methods
            .createProduct(name, description, imageUrl, category, size, priceInWei)
            .send({ from: currentAccount })
            .once('transactionHash', (hash) => {
                setTransactionStatus('Transaction đăng bán đã được gửi', 'pending', `Hash: ${hash}`);
            });

        setTransactionStatus('Đăng sản phẩm thành công', 'success', `Hash: ${receipt.transactionHash} | Block: ${receipt.blockNumber}`);
        document.getElementById('addProductForm').reset();
        updateProductPreview();
        await loadProducts();
        await loadMyProducts();
        await updateWalletDashboard();
    } catch (error) {
        console.error('Lỗi tạo sản phẩm:', error);
        setTransactionStatus('Giao dịch đăng bán không thành công', 'error', error.message || 'Vui lòng thử lại.');
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
        pendingProductId = String(productId);
        loadProducts();
        setTransactionStatus('Đang chờ xác nhận trên MetaMask...', 'pending', 'Vui lòng kiểm tra đúng giá ETH trước khi confirm.');

        const receipt = await contract.methods
            .purchaseProduct(productId)
            .send({ 
                from: currentAccount,
                value: price
            })
            .once('transactionHash', (hash) => {
                setTransactionStatus('Transaction mua hàng đã được gửi', 'pending', `Hash: ${hash}`);
            });

        savePurchaseReceipt(productId, receipt);
        setTransactionStatus('Mua hàng thành công', 'success', `Hash: ${receipt.transactionHash} | Block: ${receipt.blockNumber}`);
        await loadProducts();
        await loadMyProducts();
        await loadPurchaseHistory();
        await updateWalletDashboard();
    } catch (error) {
        console.error('Lỗi mua sản phẩm:', error);
        setTransactionStatus('Giao dịch mua không thành công', 'error', error.message || 'Vui lòng thử lại.');
        alert('Không thể mua sản phẩm. Vui lòng thử lại!');
    } finally {
        pendingProductId = null;
        await loadProducts();
    }
}

// Tải tất cả sản phẩm
async function loadProducts() {
    if (!contract) return;
    
    try {
        const products = await contract.methods.getAvailableProducts().call();
        allAvailableProducts = products;
        displayProducts(products, 'productsList');
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        document.getElementById('productsList').innerHTML = 
            '<div class="loading">Không thể tải sản phẩm</div>';
    }
}

function buildEmptyState(title, message) {
    return `
        <div class="empty-state">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
}

function getComparablePrice(product) {
    return Number(web3.utils.fromWei(product.price, 'ether'));
}

function filterAndSortProducts(products, isMyProducts) {
    let filteredProducts = products;

    if (currentFilter !== 'all' && !isMyProducts) {
        filteredProducts = filteredProducts.filter(p => p.category === currentFilter);
    }

    if (currentSearch && !isMyProducts) {
        const keyword = currentSearch.toLowerCase();
        filteredProducts = filteredProducts.filter(product => {
            return [
                product.name,
                product.description,
                product.category,
                product.size,
                product.seller
            ].some(value => String(value || '').toLowerCase().includes(keyword));
        });
    }

    return [...filteredProducts].sort((a, b) => {
        if (currentSort === 'price-asc') return getComparablePrice(a) - getComparablePrice(b);
        if (currentSort === 'price-desc') return getComparablePrice(b) - getComparablePrice(a);
        if (currentSort === 'name-asc') return String(a.name).localeCompare(String(b.name), 'vi');
        return Number(b.id) - Number(a.id);
    });
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

// Tải lịch sử mua hàng
async function loadPurchaseHistory() {
    if (!contract || !currentAccount) {
        document.getElementById('purchaseHistoryList').innerHTML = 
            '<div class="loading">Kết nối ví để xem lịch sử mua hàng</div>';
        return;
    }
    
    try {
        const products = await contract.methods.getMyPurchases().call({ from: currentAccount });
        displayPurchaseHistory(products);
    } catch (error) {
        console.error('Lỗi tải lịch sử mua hàng:', error);
        document.getElementById('purchaseHistoryList').innerHTML = 
            '<div class="loading">Không thể tải lịch sử mua hàng</div>';
    }
}

// Hiển thị sản phẩm
function displayProducts(products, containerId, isMyProducts = false) {
    const container = document.getElementById(containerId);
    
    if (products.length === 0) {
        container.innerHTML = buildEmptyState(
            isMyProducts ? 'Bạn chưa đăng sản phẩm nào' : 'Chưa có sản phẩm đang bán',
            isMyProducts ? 'Mở mục Bán hàng để tạo sản phẩm đầu tiên.' : 'Chạy seed hoặc đăng sản phẩm mới để bắt đầu demo.'
        );
        return;
    }
    
    const filteredProducts = filterAndSortProducts(products, isMyProducts);

    if (filteredProducts.length === 0) {
        container.innerHTML = buildEmptyState('Không có sản phẩm phù hợp', 'Thử đổi từ khóa tìm kiếm, danh mục hoặc kiểu sắp xếp.');
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
        const priceInEth = web3.utils.fromWei(product.price, 'ether');
        const isSold = product.sold;
        const isOwner = currentAccount && product.seller.toLowerCase() === currentAccount.toLowerCase();
        const isPending = pendingProductId === String(product.id);
        const name = escapeHtml(product.name);
        const description = escapeHtml(product.description);
        const imageUrl = escapeHtml(product.imageUrl);
        const category = escapeHtml(product.category);
        const size = escapeHtml(product.size);
        const seller = shortAddress(product.seller);
        
        return `
            <div class="product-card" data-category="${category}">
                <img src="${imageUrl}" alt="${name}" class="product-image" 
                     onerror="this.onerror=null;this.src='${fallbackImage}'">
                <div class="product-info">
                    <span class="product-category">${category}</span>
                    <h3 class="product-name">${name}</h3>
                    <p class="product-description">${description}</p>
                    <div class="product-details">
                        <span>Size: <span class="product-size">${size}</span></span>
                        <span>ID: #${product.id}</span>
                    </div>
                    <div class="product-price">${priceInEth} ETH</div>
                    <div class="product-seller">
                        Người bán: ${seller}
                    </div>
                    <div class="product-status ${isSold ? 'status-sold' : 'status-available'}">
                        ${isPending ? 'Đang xử lý...' : (isSold ? '✓ Đã bán' : '✓ Còn hàng')}
                    </div>
                    ${!isSold && !isOwner ? `
                        <div class="product-actions">
                            <button class="btn-success" onclick="purchaseProduct(${product.id}, '${product.price}')" ${isPending ? 'disabled' : ''}>
                                ${isPending ? 'Đang mua...' : 'Mua ngay'}
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

// Hiển thị lịch sử mua hàng
function displayPurchaseHistory(products) {
    const container = document.getElementById('purchaseHistoryList');
    
    if (products.length === 0) {
        container.innerHTML = buildEmptyState('Bạn chưa mua sản phẩm nào', 'Sau khi mua thành công, lịch sử sẽ hiển thị sản phẩm kèm tx hash và block nếu có receipt.');
        return;
    }
    
    const receipts = getSavedPurchaseReceipts();

    container.innerHTML = products.map(product => {
        const priceInEth = web3.utils.fromWei(product.price, 'ether');
        const receipt = receipts[product.id] || {};
        const name = escapeHtml(product.name);
        const description = escapeHtml(product.description);
        const imageUrl = escapeHtml(product.imageUrl);
        const category = escapeHtml(product.category);
        const size = escapeHtml(product.size);
        const seller = shortAddress(product.seller);
        
        return `
            <div class="product-card">
                <img src="${imageUrl}" alt="${name}" class="product-image" 
                     onerror="this.onerror=null;this.src='${fallbackImage}'">
                <div class="product-info">
                    <span class="product-category">${category}</span>
                    <h3 class="product-name">${name}</h3>
                    <p class="product-description">${description}</p>
                    <div class="product-details">
                        <span>Size: <span class="product-size">${size}</span></span>
                        <span>ID: #${product.id}</span>
                    </div>
                    <div class="product-price">${priceInEth} ETH</div>
                    <div class="product-seller">
                        Người bán: ${seller}
                    </div>
                    <div class="product-status status-sold">
                        ✓ Đã mua
                    </div>
                    <div class="purchase-info">
                        <small>Mã sản phẩm: #${product.id}</small>
                        ${receipt.transactionHash ? `<small>Tx hash: ${escapeHtml(receipt.transactionHash)}</small>` : ''}
                        ${receipt.blockNumber ? `<small>Block: ${escapeHtml(receipt.blockNumber)}</small>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateProductPreview() {
    const name = document.getElementById('productName').value || 'Tên sản phẩm';
    const description = document.getElementById('productDescription').value || 'Mô tả sản phẩm sẽ hiển thị tại đây.';
    const imageUrl = document.getElementById('productImage').value || fallbackImage;
    const category = document.getElementById('productCategory').value || 'Danh mục';
    const price = document.getElementById('productPrice').value || '0';

    document.getElementById('previewName').textContent = name;
    document.getElementById('previewDescription').textContent = description;
    document.getElementById('previewCategory').textContent = category;
    document.getElementById('previewPrice').textContent = `${price} ETH`;
    document.getElementById('imagePreview').src = imageUrl;
}

// Xử lý form đăng sản phẩm
document.addEventListener('DOMContentLoaded', async () => {
    // Khởi tạo Web3
    await initWeb3();
    
    // Xử lý nút kết nối ví
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    ['productName', 'productDescription', 'productImage', 'productCategory', 'productPrice'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateProductPreview);
        document.getElementById(id).addEventListener('change', updateProductPreview);
    });

    document.getElementById('imagePreview').addEventListener('error', function() {
        this.onerror = null;
        this.src = fallbackImage;
    });
    updateProductPreview();
    
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
            displayProducts(allAvailableProducts, 'productsList');
        });
    });

    document.getElementById('productSearch').addEventListener('input', function() {
        currentSearch = this.value.trim();
        displayProducts(allAvailableProducts, 'productsList');
    });

    document.getElementById('sortProducts').addEventListener('change', function() {
        currentSort = this.value;
        displayProducts(allAvailableProducts, 'productsList');
    });
    
    // Xử lý link "Bán hàng" để hiện/ẩn form
    document.getElementById('sellLink').addEventListener('click', function(e) {
        e.preventDefault();
        const sellSection = document.getElementById('sell');
        if (sellSection.style.display === 'none') {
            sellSection.style.display = 'block';
            requestAnimationFrame(() => sellSection.classList.add('is-open'));
            sellSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            sellSection.classList.remove('is-open');
            setTimeout(() => {
                sellSection.style.display = 'none';
            }, 220);
        }
    });
    
    // Xử lý smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.id === 'sellLink') return;

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
            loadPurchaseHistory();
        }
    }
}, 10000);
