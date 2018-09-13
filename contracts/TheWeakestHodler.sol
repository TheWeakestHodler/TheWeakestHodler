pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract TheWeakestHodler {
    using SafeMath for uint256;

    address public creator = msg.sender;
    uint256 constant public percentRemaining = 90;

    uint256 public totalSupply;
    mapping(address => uint256) public shares;
    
    function () public payable {
        require(msg.sender == tx.origin);

        if (msg.value > 0) {
            // Deposit
            if (totalSupply == 0) {
                uint256 amount = msg.value;
            } else {
                amount = msg.value.mul(totalSupply).div(address(this).balance.sub(msg.value));
            }
            shares[msg.sender] = shares[msg.sender].add(amount);
            totalSupply = totalSupply.add(amount);
        } else {
            // Withdraw
            amount = balanceOf(msg.sender);
            totalSupply = totalSupply.sub(shares[msg.sender]);
            shares[msg.sender] = 0;
            msg.sender.send(amount);
            if (totalSupply > 0) {
                creator.send(amount.div(percentRemaining)); // 1%
            } else {
                creator.send(address(this).balance);
            }
        }
    }

    function balanceOf(address _account) public view returns(uint256) {
        if (totalSupply == 0) {
            return 0;
        }
        return address(this).balance.mul(shares[_account]).mul(percentRemaining).div(totalSupply).div(100);
    }
}
