const HashTimeLock = artifacts.require("HashTimeLock");

contract("HashTimeLock", async function() {
  it("should deploy contract successfully", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    assert(hashTimeLock.address !== "");
  });

  it("should create new contract successfully", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    const res = await hashTimeLock.newContract(
      1,
      "1676570714",
      "0x3853485acd2bfc3c632026ee365279743af107a30492e3ceaa7aefc30c2a048a",
      "0xa3888DFAB8330aAF1A5C44038B482442c986966D",
      "BTC",
      "1AcVYm7M3kkJQH28FXAvyBFQzFRL6xPKu8",
      { value: 1 }
    );
    assert(true);
  });
});
