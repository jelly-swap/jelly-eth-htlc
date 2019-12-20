const HashTimeLock = artifacts.require("HashTimeLock");
const { SECONDS_IN_ONE_MINUTE } = require("./contants.js");
const { id, secret, mockNewContract } = require("./mockData.js");
const { getTimestamp } = require("./helpers");

// Tests wrapper
contract("HashTimeLock", () => {
  let contractInstance;
  let txHash;

  beforeEach(async () => {
    contractInstance = await HashTimeLock.new();
  });

  // Deploy contract
  it("should deploy contract", async () => {
    assert(
      contractInstance.address !== "",
      `Expected empty string for address, got ${contractInstance.address} instead`
    );
  });

  // Contract exists
  it("should return error, because contract doesn't exist yet", async () => {
    const contractExists = await contractInstance.contractExists(id);
    assert(!contractExists, `Expected "false", got ${contractExists} instead`);
  });

  // New contract
  it("should create new contract", async () => {
    const newContract = await contractInstance.newContract(
      ...Object.values(mockNewContract),
      { value: 1 }
    );

    txHash = newContract.logs[0].transactionHash;

    const contractId = newContract.logs[0].args.id;
    const contractExists = await contractInstance.contractExists(contractId);
    assert(contractExists, `Expected "true", got ${contractExists} instead`);
  });

  // Get one status
  it("should get one status", async () => {
    const newContract = await contractInstance.newContract(
      ...Object.values(mockNewContract),
      { value: 1 }
    );

    const contractId = newContract.logs[0].args.id;
    const getOneStatus = await contractInstance.methods["getStatus(bytes32)"](
      contractId
    );

    assert(
      parseInt(getOneStatus) === 1,
      `Expected status code to equal 1, got ${parseInt(getOneStatus)} instead`
    );
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
    const withdraw = await contractInstance.withdraw(contractId, secret);

    //TODO: check contracts status
    assert(withdraw);
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
    const refund = await contractInstance.refund(contractId);

    //TODO: check contracts status
    assert(refund);
  });
});
