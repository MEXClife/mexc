const MEXCToken = artifacts.require("MEXCToken");

module.exports = function(deployer) {
  deployer.deploy(MEXCToken);
};
