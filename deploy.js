const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const { evm, abi } = require("./build/FactoryCampaign.json");

const mnemonic =
  "lobster announce museum snake asset primary lawsuit punch pitch second same cause";

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonic,
  },
  providerOrUrl:
    "https://rinkeby.infura.io/v3/9f3b35d192e648a4990b73f7aca0013d",
});

const web3 = new Web3(provider);

const deployContract = async () => {
  const accounts = await web3.eth.getAccounts();

  const contract = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
    })
    .send({
      accounts: accounts[0],
      gas: "1000000",
    });

  console.log("Deployed Contract Address", contract.options.address);
};

deployContract();
