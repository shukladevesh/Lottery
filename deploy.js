const HDwalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDwalletProvider(
  "ceiling taste become leopard crash front pill love slot ridge ripple tag",
  "https://rinkeby.infura.io/v3/2f51e493abf9476788a4f3903305406e"
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log(accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: "1000000", from: accounts[0] });

  console.log(interface);
  console.log("address:", result.options.address);
};

deploy();
