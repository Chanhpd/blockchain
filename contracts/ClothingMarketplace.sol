// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ClothingMarketplace {
    
    // Cấu trúc sản phẩm quần áo
    struct Product {
        uint256 id;
        string name;
        string description;
        string imageUrl;
        string category; // áo, quần, váy, etc.
        string size;
        uint256 price;
        address payable seller;
        address buyer;
        bool sold;
        bool exists;
    }
    
    // Mapping lưu trữ sản phẩm
    mapping(uint256 => Product) public products;
    uint256 public productCount = 0;
    
    // Events
    event ProductCreated(
        uint256 id,
        string name,
        uint256 price,
        address seller
    );
    
    event ProductPurchased(
        uint256 id,
        string name,
        uint256 price,
        address seller,
        address buyer
    );
    
    // Tạo sản phẩm mới
    function createProduct(
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        string memory _category,
        string memory _size,
        uint256 _price
    ) public {
        require(bytes(_name).length > 0, "Product name is required");
        require(_price > 0, "Price must be greater than 0");
        
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _description,
            _imageUrl,
            _category,
            _size,
            _price,
            payable(msg.sender),
            address(0),
            false,
            true
        );
        
        emit ProductCreated(productCount, _name, _price, msg.sender);
    }
    
    // Mua sản phẩm
    function purchaseProduct(uint256 _id) public payable {
        Product storage product = products[_id];
        
        require(product.exists, "Product does not exist");
        require(!product.sold, "Product already sold");
        require(msg.value >= product.price, "Insufficient payment");
        require(msg.sender != product.seller, "Seller cannot buy own product");
        
        // Chuyển tiền cho người bán
        product.seller.transfer(msg.value);
        
        // Cập nhật thông tin sản phẩm
        product.buyer = msg.sender;
        product.sold = true;
        
        emit ProductPurchased(_id, product.name, product.price, product.seller, msg.sender);
    }
    
    // Lấy tất cả sản phẩm
    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](productCount);
        
        for (uint256 i = 1; i <= productCount; i++) {
            allProducts[i - 1] = products[i];
        }
        
        return allProducts;
    }
    
    // Lấy sản phẩm chưa bán
    function getAvailableProducts() public view returns (Product[] memory) {
        uint256 availableCount = 0;
        
        // Đếm số sản phẩm chưa bán
        for (uint256 i = 1; i <= productCount; i++) {
            if (!products[i].sold) {
                availableCount++;
            }
        }
        
        Product[] memory availableProducts = new Product[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (!products[i].sold) {
                availableProducts[index] = products[i];
                index++;
            }
        }
        
        return availableProducts;
    }
    
    // Lấy sản phẩm của người bán
    function getMyProducts() public view returns (Product[] memory) {
        uint256 myProductCount = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].seller == msg.sender) {
                myProductCount++;
            }
        }
        
        Product[] memory myProducts = new Product[](myProductCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].seller == msg.sender) {
                myProducts[index] = products[i];
                index++;
            }
        }
        
        return myProducts;
    }
    
    // Lấy lịch sử mua hàng của người dùng
    function getMyPurchases() public view returns (Product[] memory) {
        uint256 purchaseCount = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].buyer == msg.sender) {
                purchaseCount++;
            }
        }
        
        Product[] memory myPurchases = new Product[](purchaseCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].buyer == msg.sender) {
                myPurchases[index] = products[i];
                index++;
            }
        }
        
        return myPurchases;
    }
}
