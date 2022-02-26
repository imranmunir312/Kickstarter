const Web3 = require("web3");
const ganache = require("ganache");

const web3 = new Web3(ganache.provider());

const { abi: FactoryABI, evm } = require("../build/FactoryCampaign.json");
const { abi } = require("../build/Campaign.json");

describe("Test Campaign", () => {
  let accounts, campaign, factory, campaignAddress;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(FactoryABI)
      .deploy({
        data: evm.bytecode.object,
        arguments: ["1000"],
      })
      .send({
        from: accounts[0],
        gas: "10000000",
      });

    await factory.methods.createCampaign(1000).send({
      from: accounts[0],
      gas: "10000000",
    });

    campaignAddress = await factory.methods.getCampaign(0).call();

    campaign = new web3.eth.Contract(abi, campaignAddress);
  });

  test("Should Check the manager of the Campaign", async () => {
    const manager = await campaign.methods.manager().call();
    expect(manager).toEqual(accounts[0]);
  });

  test("should contribute in campaign and should be added to approvers", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: "100000",
    });

    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    expect(isContributor).toEqual(true);
  });

  test("Require a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: "5",
      });
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("Should allow manager to make a payment request", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: "100000",
    });

    await campaign.methods
      .createRequest("Buy batteries", 10000, accounts[2])
      .send({
        from: accounts[0],
        gas: "10000000",
      });

    const request = await campaign.methods.requests(0).call();

    expect(request.description).toEqual("Buy batteries");
  });

  test("Process Request", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei("10", "ether"),
    });

    await campaign.methods
      .createRequest("Test", web3.utils.toWei("5", "ether"), accounts[2])
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    const prevBalance = parseFloat(
      web3.utils.fromWei(await web3.eth.getBalance(accounts[2]), "ether")
    );

    await campaign.methods.requestApproval(0).send({
      from: accounts[1],
      gas: "10000000",
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "10000000",
    });

    const newBalance = parseFloat(
      web3.utils.fromWei(await web3.eth.getBalance(accounts[2]), "ether")
    );

    expect(newBalance).toBeGreaterThan(prevBalance);
  });
});
