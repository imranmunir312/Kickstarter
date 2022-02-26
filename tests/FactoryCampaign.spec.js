const Web3 = require("web3");
const ganache = require("ganache");

const { abi, evm } = require("../build/FactoryCampaign.json");

const { abi: campaignAbi } = require("../build/Campaign.json");

const web3 = new Web3(ganache.provider());

let accounts, factory;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
      arguments: ["1000"],
    })
    .send({ from: accounts[0], gas: "10000000" });
});

describe("Deploy Factory Campaign Contract", () => {
  test("Check Contract is deployed", () => {
    expect(factory.options.address).toBeTruthy();
  });

  test("Should Create Campaign", async () => {
    await factory.methods
      .createCampaign(1000)
      .send({ from: accounts[1], gas: "10000000" });

    const campaignsCount = await factory.methods.getCampaignCount().call();

    expect(campaignsCount).toEqual("1");
  });

  test("Should Get Campaign", async () => {
    await factory.methods
      .createCampaign(1000)
      .send({ from: accounts[2], gas: "10000000" });

    const address = await factory.methods.getCampaign(0).call();

    const campaign = new web3.eth.Contract(campaignAbi, address);

    const manager = await campaign.methods.manager().call();

    expect(manager).toEqual(accounts[2]);
  });
});
