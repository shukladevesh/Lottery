import logo from "./logo.svg";
import "./App.css";
import React from "react";
import web3 from "./web3";
import lottery from "./lottery";

class App extends React.Component {
  state = {
    manager: "",
    players: [],
    balance: "",
    value: "",
    message: "",
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "waiting on transaction success...." });
    await lottery.methods.entry().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, "ether"),
    });
    this.setState({ message: "you have been entered" });
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "picking a winner..." });
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });
    this.setState({ message: "winner selected" });
  };

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This Contract is managed by {this.state.manager}
          There are currently {this.state.players.length} people entered,
          competing to win
          {web3.utils.fromWei(this.state.balance, "ether")} ether.
        </p>
        <hr />
        <form action="" onSubmit={this.onSubmit}>
          <h4>want to try your luck?</h4>
          <div>
            <label htmlFor="">amount of ether to enter</label>
            <input
              type="text"
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>
        <hr />
        <h4>ready to pick a winner?</h4>
        <button onClick={this.onClick}>pick a winner!</button>
        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}
export default App;
