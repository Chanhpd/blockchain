const ClothingMarketplace = artifacts.require("ClothingMarketplace");

module.exports = function (deployer) {
  deployer.deploy(ClothingMarketplace);
};
