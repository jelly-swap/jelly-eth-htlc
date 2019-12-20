const {
  MAXIMUM_UNIX_TIMESTAMP,
  SECONDS_IN_ONE_MINUTE
} = require("./contants.js");
const HashTimeLock = artifacts.require("HashTimeLock");

// Example mock data
const secret =
  "0x3853485acd2bfc3c632026ee365279743af107a30492e3ceaa7aefc30c2a048a";
const id = "0xe76105ec40a9670cc92aa5c5ca4563dc6b18022c2605379e91aca7b96d0b73d6";

const mockNewContract = {
  outputAmount: 1,
  timestamp: MAXIMUM_UNIX_TIMESTAMP,
  hashLock:
    "0x3c335ba7f06a8b01d0596589f73c19069e21c81e5013b91f408165d1bf623d32",
  receiverAddress: "0xa3888DFAB8330aAF1A5C44038B482442c986966D",
  outputNetwork: "BTC",
  outputAddress: "1AcVYm7M3kkJQH28FXAvyBFQzFRL6xPKu8"
};

// Init empty txHash
let txHash;

// Expiration field logic
const getTimestamp = async txHash => {
  const tx = await web3.eth.getTransaction(txHash);
  const blockNum = tx.blockNumber;
  const blockInfo = await web3.eth.getBlock(blockNum);
  currentTimestamp = blockInfo.timestamp;
  return currentTimestamp;
};

// Tests wrapper

contract("HashTimeLock", () => {
  // Deploy contract
  let contractInstance;

  beforeEach(async () => {
    contractInstance = await HashTimeLock.new();
  });

  it("should deploy contract", async () => {
    assert(contractInstance.address !== "");
  });

  // Contract exists
  it("should return error, because contract doesn't exist yet", async () => {
    const res = await contractInstance.contractExists(id);
    assert(!res);
  });

  // New contract
  it("should create new contract", async () => {
    const res = await contractInstance.newContract(
      ...Object.values(mockNewContract),
      { value: 1 }
    );

    txHash = res.logs[0].transactionHash;

    const contractId = res.logs[0].args.id;
    const contractExists = await contractInstance.contractExists(contractId);
    assert(contractExists);
  });

  // Get one status
  it("should get one status", async () => {
    const newContract = await contractInstance.newContract(
      ...Object.values(mockNewContract),

      { value: 1 }
    );

    const contractId = newContract.logs[0].args.id;
    const res = await contractInstance.methods["getStatus(bytes32)"](
      contractId
    );

    assert(parseInt(res) === 1);
  });

  // Withdraw
  it("should withdraw", async () => {
    const timestamp = await getTimestamp(txHash);
    const {
      outputAmount,
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress
    } = mockNewContract;

    const newContract = await contractInstance.newContract(
      outputAmount,
      (timestamp + SECONDS_IN_ONE_MINUTE).toString(),
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress,
      { value: 1 }
    );

    const contractId = newContract.logs[0].args.id;
    const res = await contractInstance.withdraw(contractId, secret);
    assert(res);
  });

  // Refund
  it("should refund", async () => {
    const timestamp = await getTimestamp(txHash);
    const {
      outputAmount,
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress
    } = mockNewContract;
    const newContract = await contractInstance.newContract(
      outputAmount,
      (timestamp + 2).toString(),
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress,
      { value: 1 }
    );

    function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    await timeout(2000);
    
    const contractId = newContract.logs[0].args.id;
    const res = await contractInstance.refund(contractId);
    assert(res);
  });
});
