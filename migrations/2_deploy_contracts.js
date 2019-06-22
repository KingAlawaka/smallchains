const Vouchers = artifacts.require("Vouchers");
const Wallets = artifacts.require("Wallets");

module.exports = function(deployer) {
  deployer.deploy(Vouchers);
  deployer.deploy(Wallets);
};
