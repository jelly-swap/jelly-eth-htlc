const HashTimeLock = artifacts.require("HashTimeLock");

// Less important mock data
const inputAmount = 1;
const outputNetwork = "BTC";
const outputAddress = "1AcVYm7M3kkJQH28FXAvyBFQzFRL6xPKu8";
const receiverAddress = "0xa3888DFAB8330aAF1A5C44038B482442c986966D";
const hashLock =
  "0x3c335ba7f06a8b01d0596589f73c19069e21c81e5013b91f408165d1bf623d32";
const id = "0xe76105ec40a9670cc92aa5c5ca4563dc6b18022c2605379e91aca7b96d0b73d6";

contract("HashTimeLock", async function() {
  it("should deploy contract successfully", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    assert(hashTimeLock.address !== "");
  });

  it("should create new contract", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    const res = await hashTimeLock.newContract(
      inputAmount,
      "1676570714",
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress,
      { value: 1 }
    );
    assert(res);
  });

  it("should withdraw", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    await hashTimeLock.newContract(
      inputAmount,
      "1676570714",
      hashLock,
      receiverAddress,
      outputNetwork,
      outputAddress,
      { value: 1 }
    );

    const res = await hashTimeLock.withdraw(id, hashLock);
    assert(res);
  });
});
