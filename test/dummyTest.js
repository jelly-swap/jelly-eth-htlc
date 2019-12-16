const HashTimeLock = artifacts.require("HashTimeLock");

contract("HashTimeLock", function() {
  it("Should deploy contract successfully", async () => {
    const hashTimeLock = await HashTimeLock.deployed();
    assert(hashTimeLock.address !== "");
  });
});
