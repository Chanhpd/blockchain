module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Cổng mặc định của Ganache
      network_id: "*" // Kết nối với bất kỳ network nào
    }
  },
  
  // Cấu hình compiler Solidity
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
