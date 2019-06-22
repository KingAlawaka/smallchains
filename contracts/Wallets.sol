pragma solidity ^0.5.0;

contract Wallets {

    uint public walletCount = 0;

    struct Wallet{
        uint id;
        uint coinCount;
    }

    constructor() public{
        //createWallet();
    }

    mapping(uint => Wallet) public walletsList;

    event WalletCreated(
        uint id,
        uint coinCount
    );

    event addCoins(
        uint id,
        uint amount
    );

    event deductCoins(
        uint id,
        uint amount
    );

    function createWallet() public {
        walletCount++;
        walletsList[walletCount] = Wallet(walletCount,1500);
        emit WalletCreated(walletCount,0);
    }

    function addCoinsToWallet(uint amount) public {
        Wallet memory _wallet = walletsList[1];
        _wallet.coinCount = _wallet.coinCount+amount;
        walletsList[1] = _wallet;
        emit addCoins(1,amount);
    }

    function deductCoinsFromWallet(uint amount) public returns (bool) {
        Wallet memory _wallet = walletsList[1];
        _wallet.coinCount = _wallet.coinCount - amount;
        walletsList[1] = _wallet;
        emit addCoins(1,amount);
        return true;
    }
}