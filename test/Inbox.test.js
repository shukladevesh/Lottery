const assert = require("assert"); //buit in node used for assertions
const ganache = require("ganache-cli");
const Web3 = require("web3"); // constructor function or class
const web3 = new Web3(ganache.provider()); // provider of the network in the ()
const { interface, bytecode } = require("../compile");

let accounts, lottery;
beforeEach(async () => {
  // every function we call with web3 is async in nature and returns a promise
  // get a list of all accounts
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("lottery contract", () => {
  it("deploys contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods.entry().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple account to enter", async () => {
    await lottery.methods.entry().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.entry().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.entry().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);

    assert.equal(3, players.length);
  });

  it("requires a minimum amount to enter", async () => {
    try {
      await lottery.methods.entry().send({
        from: accounts[0],
        value: 0,
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("only manager can call pickWinner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("sends money to the winner and resets array", async () => {
    await lottery.methods.entry().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    const initialBal = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBal = await web3.eth.getBalance(accounts[0]);
    const difference = finalBal - initialBal;

    assert(difference > web3.utils.toWei("1.8", "ether"));
  });
});
