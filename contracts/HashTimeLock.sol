pragma solidity >=0.5.0 <0.6.0;

contract HashTimeLock {

    mapping (bytes32 => LockContract) contracts;

    struct LockContract {
        uint timeLock;
        uint amount;
        bytes32 hashLock;
        address payable sender;
        address payable receiver;
        bool withdrawn;
        bool refunded;
        string preimage;
    }

    event Withdraw(bytes32 indexed id);
    event Refund(bytes32 indexed id);
    event NewContract(
        bytes32 indexed id,
        address indexed sender,
        address indexed receiver,
        uint amount,
        bytes32 hashLock,
        uint timeLock
    );

    modifier hashLockMatches(bytes32 id, string memory secret) {
        require(
            contracts[id].hashLock == keccak256(abi.encodePacked(secret)),
            "INVALID_HASH_LOCK"
        );
        _;
    }

    modifier withdrawable(bytes32 id) {
        LockContract memory tempContract = contracts[id];
        require(tempContract.receiver  == msg.sender, "WITHDRAW_NOT_RECEIVER");
        require(tempContract.withdrawn == false,      "ALREADY_WITHDRAWN");
        require(tempContract.timeLock  >  now,        "WITHDRAW_INVALID_TIME");
        _;
    }

    modifier refundable(bytes32 id) {
        LockContract memory tempContract = contracts[id];
        require(tempContract.sender    == msg.sender, "REFUND_NOT_SENDER");
        require(tempContract.refunded  == false,      "ALREADY_REFUNDED");
        require(tempContract.withdrawn == false,      "ALREADY_WITHDRAWN");
        require(tempContract.timeLock  <= now,        "REFUND_INVALID_TIME");
        _;
    }

    function newContract(address payable receiver, bytes32 hashLock, uint timeLock)
        external
        payable
        returns (bytes32)
    {
        address payable sender = msg.sender;
        uint256 amount = msg.value;

        require(timeLock > now, "NEW_CONTRACT_INVALID_TIME");

        require(amount > 0, "NEW_CONTRACT_INVALID_AMOUNT");

        bytes32 id = sha256(abi.encodePacked(sender, receiver, amount, hashLock, timeLock));

        contracts[id] = LockContract(timeLock, amount, hashLock, sender, receiver, false, false, "");

        emit NewContract(id, msg.sender, receiver, msg.value, hashLock, timeLock);

        return id;
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
        c.receiver.transfer(c.amount);
        emit Withdraw(id);
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
        c.sender.transfer(c.amount);
        emit Refund(id);
        return true;
    }

    function getContract(bytes32 id)
        public
        view
        returns (
            uint timeLock,
            uint amount,
            bytes32 hashLock,
            address sender,
            address receiver,
            bool withdrawn,
            bool refunded,
            string memory preimage
        )
    {
        LockContract memory c = contracts[id];
        return (c.timeLock, c.amount, c.hashLock, c.sender, c.receiver, c.withdrawn, c.refunded, c.preimage);
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