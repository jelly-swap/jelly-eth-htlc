const { MAXIMUM_UNIX_TIMESTAMP } = require("./contants.js");

// Example mock data
const mockData = {
  secret: "0x3853485acd2bfc3c632026ee365279743af107a30492e3ceaa7aefc30c2a048a",
  id: "0xe76105ec40a9670cc92aa5c5ca4563dc6b18022c2605379e91aca7b96d0b73d6",

  mockNewContract: {
    outputAmount: 1,
    timestamp: MAXIMUM_UNIX_TIMESTAMP,
    hashLock:
      "0x3c335ba7f06a8b01d0596589f73c19069e21c81e5013b91f408165d1bf623d32",
    receiverAddress: "0xa3888DFAB8330aAF1A5C44038B482442c986966D",
    outputNetwork: "BTC",
    outputAddress: "1AcVYm7M3kkJQH28FXAvyBFQzFRL6xPKu8"
  }
};

module.exports = mockData;
