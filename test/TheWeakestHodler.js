// @flow

const BigNumber = web3.BigNumber;
// const EVMRevert = require('./helpers/EVMRevert');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();

const TheWeakestHodler = artifacts.require('TheWeakestHodler');

contract('TheWeakestHodler', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {
    let hodl;

    beforeEach(async function () {
        hodl = await TheWeakestHodler.new();
    });

    describe('deposit', function () {
        it('should work at least once', async function () {
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(0);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(0);
            await web3.eth.sendTransaction({ to: hodl.address, value: 1000, from: wallet1 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(900);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(1000);
        });

        it('should work at least twice', async function () {
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(0);
            await web3.eth.sendTransaction({ to: hodl.address, value: 1000, from: wallet1 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(900);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(1000);

            await web3.eth.sendTransaction({ to: hodl.address, value: 500, from: wallet1 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(1350);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(1500);
        });
    });

    describe('withdrawal', function () {
        it('should not work without deposit', async function () {
            const preBalance = await web3.eth.getBalance(wallet1);
            const txHash = await web3.eth.sendTransaction({ to: hodl.address, value: 0, from: wallet1 });
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            const balance = await web3.eth.getBalance(wallet1);
            const fee = (new BigNumber(receipt.gasUsed)).mul(new BigNumber(web3.eth.gasPrice));

            balance.should.be.bignumber.equal(preBalance.sub(fee));
        });

        it('should work after deposit', async function () {
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(0);
            await web3.eth.sendTransaction({ to: hodl.address, value: 1000, from: wallet1 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(900);

            const preBalance = await web3.eth.getBalance(wallet1);
            const txHash = await web3.eth.sendTransaction({ to: hodl.address, value: 0, from: wallet1 });
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            const balance = await web3.eth.getBalance(wallet1);
            const fee = (new BigNumber(receipt.gasUsed)).mul(new BigNumber(web3.eth.gasPrice));

            balance.should.be.bignumber.equal(preBalance.sub(fee).add(900));
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(0);
        });
    });

    describe('reward', function () {
        it('should be send to last user', async function () {
            // First user deposit
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(0);
            (await hodl.balanceOf.call(wallet2)).should.be.bignumber.equal(0);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(0);
            await web3.eth.sendTransaction({ to: hodl.address, value: 1000, from: wallet1 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(900);
            (await hodl.balanceOf.call(wallet2)).should.be.bignumber.equal(0);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(1000);

            // Second user deposit
            await web3.eth.sendTransaction({ to: hodl.address, value: 2000, from: wallet2 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(900);
            (await hodl.balanceOf.call(wallet2)).should.be.bignumber.equal(1800);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(3000);

            // Second user withdrawal
            await web3.eth.sendTransaction({ to: hodl.address, value: 0, from: wallet2 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(Math.trunc((1000 + Math.trunc(200 * 0.9)) * 0.9));
            (await hodl.balanceOf.call(wallet2)).should.be.bignumber.equal(0);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(1000);

            // First user withdrawal
            await web3.eth.sendTransaction({ to: hodl.address, value: 0, from: wallet1 });
            (await hodl.balanceOf.call(wallet1)).should.be.bignumber.equal(0);
            (await hodl.balanceOf.call(wallet2)).should.be.bignumber.equal(0);
            (await hodl.totalSupply.call()).should.be.bignumber.equal(0);
        });
    });
});
