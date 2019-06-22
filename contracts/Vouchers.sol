pragma solidity ^0.5.0;

contract Vouchers{

    uint public voucherCount = 0;
    uint public purchasedVoucherCount = 0;
    uint public activatedVoucherCount = 0;
    uint public usedVoucherCount = 0;

    struct Voucher {
        uint id;
        string voucherHeading;
        string voucherContent;
        uint totalVoucherCount;
        uint cost;
        string voucherImgUrl;
        bool voucherDisable;
    }

    constructor() public{
        createVoucher("Welcome to smallchains","Welcome gift for everyone... 5% discount on all shops",1200,2,"6.png");
    }

    mapping(uint => Voucher) public voucherList; //voucher list that holds original vouchers in the system
    mapping(uint => Voucher) public purchasedVoucherList; //purchased voucher list
    mapping(uint => Voucher) public activatedVoucherList; //user activated voucher list waiting for shopowner confirmation
    mapping(uint => Voucher) public usedVoucherList;    //vouchers that shop owners marked as valid and redeemed

    event VoucherCreated(
        uint id,
        string voucherHeading,
        string voucherContent,
        uint totalVoucherCount,
        uint cost,
        string voucherImgUrl,
        bool voucherDisable
    );

    event voucherPurchased(
        uint id,
        uint totalVoucherCount
    );

    event activatedVoucher(
        uint id,
        bool voucherDisable
    );

    event markedActivatedVoucher(
        uint id,
        bool voucherDisable
    );

    function createVoucher(string memory _vouHead, string memory _vouCont, uint _totVouCount, uint _cost,string memory _voucherImgUrl) public {
        voucherCount++;
        voucherList[voucherCount] = Voucher(voucherCount,_vouHead,_vouCont,_totVouCount,_cost,_voucherImgUrl,false);
        emit VoucherCreated(voucherCount,_vouHead,_vouCont,_totVouCount,_cost,_voucherImgUrl,false);
    }

    function voucherPurchase(uint _id) public {
        Voucher memory _voucher = voucherList[_id];
        purchasedVoucherCount++;
        _voucher.totalVoucherCount = _voucher.totalVoucherCount - 1;
        voucherList[_id] = _voucher;    //update existing voucherList with new total voucher count
        _voucher.id = purchasedVoucherCount;    //vocher info transfering to new list and assigning new id
        purchasedVoucherList[purchasedVoucherCount] = _voucher;
        emit voucherPurchased(_id,_voucher.totalVoucherCount);
    }

    function activateVoucher(uint _id) public {
        Voucher memory _voucher = purchasedVoucherList[_id];
        activatedVoucherCount++;
        _voucher.id = activatedVoucherCount;
        activatedVoucherList[activatedVoucherCount] = _voucher;

        for (uint i = _id; i<purchasedVoucherCount; i++){
            Voucher memory tempVoucher = purchasedVoucherList[i+1];
            tempVoucher.id = i;
            purchasedVoucherList[i] = tempVoucher;
        }
        purchasedVoucherCount--;
        emit activatedVoucher(_id,_voucher.voucherDisable);
    }

    function markActivatedVoucher(uint _id) public {
        Voucher memory _voucher = activatedVoucherList[_id];
        usedVoucherCount++;
        _voucher.id = usedVoucherCount;
        usedVoucherList[usedVoucherCount] = _voucher;

        for (uint i = _id; i<activatedVoucherCount; i++){
            Voucher memory tempVoucher = activatedVoucherList[i+1];
            tempVoucher.id = i;
            activatedVoucherList[i] = tempVoucher;
        }
        activatedVoucherCount--;
        emit markedActivatedVoucher(_id,_voucher.voucherDisable);
    }
}