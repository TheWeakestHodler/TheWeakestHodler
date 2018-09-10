const TheWeakestHodler = artifacts.require('TheWeakestHodler');

module.exports = async function (deployer) {
    deployer.deploy(TheWeakestHodler);
};
