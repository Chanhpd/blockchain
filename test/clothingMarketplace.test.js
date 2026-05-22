const ClothingMarketplace = artifacts.require("ClothingMarketplace");

contract("ClothingMarketplace", (accounts) => {
  const [seller, buyer] = accounts;
  const price = web3.utils.toWei("0.1", "ether");

  let marketplace;

  beforeEach(async () => {
    marketplace = await ClothingMarketplace.new();
  });

  async function createSampleProduct(from = seller) {
    return marketplace.createProduct(
      "Ao thun demo",
      "San pham demo cho mon blockchain",
      "https://example.com/shirt.jpg",
      "Ao",
      "L",
      price,
      { from }
    );
  }

  async function expectRevert(promise, expectedMessage) {
    try {
      await promise;
      assert.fail("Expected transaction to revert");
    } catch (error) {
      assert(
        error.message.includes(expectedMessage),
        `Expected "${expectedMessage}", got "${error.message}"`
      );
    }
  }

  it("creates a product", async () => {
    await createSampleProduct();

    const product = await marketplace.products(1);

    assert.equal(product.id.toString(), "1");
    assert.equal(product.name, "Ao thun demo");
    assert.equal(product.price.toString(), price);
    assert.equal(product.seller, seller);
    assert.equal(product.sold, false);
  });

  it("rejects zero price products", async () => {
    await expectRevert(
      marketplace.createProduct(
        "Ao loi",
        "Gia khong hop le",
        "https://example.com/error.jpg",
        "Ao",
        "M",
        0,
        { from: seller }
      ),
      "Price must be greater than 0"
    );
  });

  it("rejects seller buying their own product", async () => {
    await createSampleProduct();

    await expectRevert(
      marketplace.purchaseProduct(1, { from: seller, value: price }),
      "Seller cannot buy own product"
    );
  });

  it("requires exact payment", async () => {
    await createSampleProduct();
    const overpayment = web3.utils.toWei("0.2", "ether");

    await expectRevert(
      marketplace.purchaseProduct(1, { from: buyer, value: overpayment }),
      "Payment must equal product price"
    );
  });

  it("marks product sold after purchase and emits purchase event", async () => {
    await createSampleProduct();

    const receipt = await marketplace.purchaseProduct(1, { from: buyer, value: price });
    const product = await marketplace.products(1);
    const event = receipt.logs.find((log) => log.event === "ProductPurchased");

    assert.equal(product.sold, true);
    assert.equal(product.buyer, buyer);
    assert.equal(event.args.id.toString(), "1");
    assert.equal(event.args.price.toString(), price);
    assert.equal(event.args.seller, seller);
    assert.equal(event.args.buyer, buyer);
  });

  it("rejects buying an already sold product", async () => {
    await createSampleProduct();
    await marketplace.purchaseProduct(1, { from: buyer, value: price });

    await expectRevert(
      marketplace.purchaseProduct(1, { from: accounts[2], value: price }),
      "Product already sold"
    );
  });
});
