// Expiration field logic
const getTimestamp = async txHash => {
  const tx = await web3.eth.getTransaction(txHash);
  const blockNum = tx.blockNumber;
  const blockInfo = await web3.eth.getBlock(blockNum);
  currentTimestamp = blockInfo.timestamp;
  return currentTimestamp;
};

module.exports = {
  getTimestamp
};
