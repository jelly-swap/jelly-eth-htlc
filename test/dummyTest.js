const HashTimeLock = artifacts.require("HashTimeLock");

// Example mock data
const inputAmount = 1;
const outputNetwork = "BTC";
const outputAddress = "1AcVYm7M3kkJQH28FXAvyBFQzFRL6xPKu8";
const receiverAddress = "0xa3888DFAB8330aAF1A5C44038B482442c986966D";
const hashLock =
  "0x3c335ba7f06a8b01d0596589f73c19069e21c81e5013b91f408165d1bf623d32";
const secret =
  "0x3853485acd2bfc3c632026ee365279743af107a30492e3ceaa7aefc30c2a048a";
const id = "0xe76105ec40a9670cc92aa5c5ca4563dc6b18022c2605379e91aca7b96d0b73d6";

// Constants
// Year 2038
const MAXIMUM_UNIX_TIMESTAMP = "2147483648";
const SECONDS_IN_ONE_MINUTE = 60;
const ZERO = 0;

let txHash = "";

// Expiration field logic
const getTimestamp = async txHash => {
  const tx = await web3.eth.getTransaction(txHash);
  const blockNum = tx.blockNumber;
  const blockInfo = await web3.eth.getBlock(blockNum);
  currentTimestamp = blockInfo.timestamp;
  return currentTimestamp;
};

contract("HashTimeLock", async function() {
  it("should deploy contract successfully", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    assert(hashTimeLock.address !== "");
  });

  it("should return error, because contract doesn't exist yet", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    const res = await hashTimeLock.contractExists(id);
    assert(!res);
  });

  it("should create new contract", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    const res = await hashTimeLock.newContract(
      inputAmount,
      MAXIMUM_UNIX_TIMESTAMP,
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress,
      { value: 1 }
    );

    txHash = res.logs[0].transactionHash;

    const contractId = res.logs[0].args.id;
    const contractExists = await hashTimeLock.contractExists(contractId);
    assert(contractExists);
  });

  it("should withdraw", async () => {
    const timestamp = await getTimestamp(txHash);
    const hashTimeLock = await HashTimeLock.deployed();
    const newContract = await hashTimeLock.newContract(
      inputAmount,
      (timestamp + SECONDS_IN_ONE_MINUTE).toString(),
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress,
      { value: 1 }
    );

    const contractId = newContract.logs[0].args.id;
    const res = await hashTimeLock.withdraw(contractId, secret);
    assert(res);
  });

  it("should refund", async () => {
    const timestamp = await getTimestamp(txHash);
    const hashTimeLock = await HashTimeLock.deployed();
    const newContract = await hashTimeLock.newContract(
      inputAmount,
      (timestamp + 1).toString(),
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress,
      { value: 1 }
    );

    function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    await timeout(1000);
    const contractId = newContract.logs[0].args.id;
    const res = await hashTimeLock.refund(contractId);
    assert(res);
  });
});
