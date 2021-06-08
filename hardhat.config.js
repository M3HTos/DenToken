require("@nomiclabs/hardhat-waffle");

const ALCHEMY_API_KEY = "qjqEAA-LQOFxskESEnaTgXnnLogu-zTe";
const ROPSTEN_PRIVATE_KEY = "b81c742be8bb4cfe79c34660a6b4828bac2a0dd0029c017c43652b932a205dc5";

module.exports = {
  solidity: "0.7.3",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
    }
  }
};