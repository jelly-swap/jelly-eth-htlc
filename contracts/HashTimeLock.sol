pragma experimental ABIEncoderV2;
pragma solidity >=0.5.0 <0.6.0;

contract HashTimeLock {

    mapping (bytes32 => LockContract) contracts;

    struct LockContract {
        uint256 inputAmount;
        uint256 outputAmount;
        uint256 expiration;

        bool withdrawn;
        bool refunded;

        bytes32 hashLock;

        address payable sender;
        address payable receiver;

        string preimage;
        string outputNetwork;
        string outputAddress;
    }

    event Withdraw(
        bytes32 indexed id,
        address indexed sender,
        address indexed receiver,
        string secret
    );

    event Refund(
        bytes32 indexed id,
        address indexed sender,
        address indexed receiver
    );

    event NewContract(
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 expiration,

        bytes32 indexed id,
        bytes32 hashLock,

        address indexed sender,
        address indexed receiver,

        string outputNetwork,
        string outputAddress
    );

    modifier hashLockMatches(bytes32 id, string memory secret) {
        require(
            contracts[id].hashLock == sha256(abi.encodePacked(secret)),
            "INVALID_HASH_LOCK"
        );
        _;
    }

    modifier withdrawable(bytes32 id) {
        LockContract memory tempContract = contracts[id];
        require(tempContract.withdrawn == false, "ALREADY_WITHDRAWN");
        require(tempContract.expiration > block.number,"WITHDRAW_INVALID_TIME");
        _;
    }

    modifier refundable(bytes32 id) {
        LockContract memory tempContract = contracts[id];
        require(tempContract.sender == msg.sender, "REFUND_NOT_SENDER");
        require(tempContract.refunded == false, "ALREADY_REFUNDED");
        require(tempContract.withdrawn == false, "ALREADY_WITHDRAWN");
        require(tempContract.expiration <= block.number, "REFUND_INVALID_TIME");
        _;
    }

    function newContract(
        uint256 outputAmount,
        uint256 expiration,
        bytes32 hashLock,
        address payable receiver,
        string memory outputNetwork,
        string memory outputAddress
    )
        public
        payable
    {
        address payable sender = msg.sender;
        uint256 inputAmount = msg.value;

        require(expiration > block.number, "NEW_CONTRACT_INVALID_TIME");

        require(inputAmount > 0, "NEW_CONTRACT_INVALID_AMOUNT");

        bytes32 id = sha256(abi.encodePacked(sender, receiver, inputAmount, hashLock, expiration));

        contracts[id] = LockContract(
            inputAmount,
            outputAmount,
            expiration,
            false,
            false,
            hashLock,
            sender,
            receiver,
            "",
            outputNetwork,
            outputAddress
        );

        emit NewContract(
            inputAmount,
            outputAmount,
            expiration,
            id,
            hashLock,
            sender,
            receiver,
            outputNetwork,
            outputAddress
        );
    }

    function withdraw(bytes32 id, string memory preimage)
        public
        withdrawable(id)
        hashLockMatches(id, preimage)
        returns (bool)
    {
        LockContract storage c = contracts[id];
        contractExists(c.sender);
        c.preimage = preimage;
        c.withdrawn = true;
        c.receiver.transfer(c.inputAmount);
        emit Withdraw(id, c.sender, c.receiver, c.preimage);
        return true;
    }

    function refund(bytes32 id)
        external
        refundable(id)
        returns (bool)
    {
        LockContract storage c = contracts[id];
        contractExists(c.sender);
        c.refunded = true;
        c.sender.transfer(c.inputAmount);
        emit Refund(id, c.sender, c.receiver);
        return true;
    }

    function getContract(bytes32 id)
        public
        view
        returns (LockContract memory)
    {
        LockContract memory c = contracts[id];
        return c;
    }

    function contractExists(bytes32 id)
        public
        view
        returns (bool)
    {
        return contracts[id].sender != address(0);
    }

    function contractExists(address sender)
        private
        pure
    {
        require(sender != address(0), "CONTRACT_DOES_NOT_EXISTS");
    }
}