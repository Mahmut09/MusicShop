import React from 'react';
import { ethers } from "ethers";

import ConnectWallet  from "./components/ConnectWallet";
import WaitingForTransactionMessage from "./components/WaitingForTransactionMessage";
import TransactionsErrorMessage from "./components/TransactionsErrorMessage";

import { MusicShop } from './typechain';
import { MusicShop__factory } from "./typechain/factories";

import MusicShopArtifact from "./contracts/MusicShop.json";

const HARDHAT_NETWORK_ID = "1337";

declare let window: any;

class App extends React.Component<any, any> {
  initialState: object;
  _provider!: ;

  constructor(props: any) {
    super(props);

    this.initialState = {
      selectedAccount: null,
      txBeingSent: null,
      networkError: null,
      transactionError: null,
      balance: null,
    };

    this.state = this.initialState;
  }

  _connectWallet = async() => {
    if(window.ethereum === undefined) {
      this.setState({
        networkError: "Please install Metamask!"
      });

      return;
    }
    
    const [selectedAccount] = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if(!this._checkNetwork()) { return }

    this._initialize(selectedAccount);

    window.ethereum.on('accountsChanged', ([newAddress]: [newAddress: string]) => {
      if(newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(selectedAccount);
    });

    window.ethereum.on('chainChanged', ([_networkId]: any) => {
      this._resetState();
    });
  }

  _resetState() {
    this.setState(this.initialState);
  }

  _checkNetwork() {
    if(window.ethereum.networkVersion === HARDHAT_NETWORK_ID) { return true }
    
    this.setState({
      networkError: "Please connect to Hardhat network (localhost:8545)"
    });

    return false;
  }

  _dismissNetworkError = () => {
    this.setState({
      networkError: null,
    });
  }

  _dismissTransactionError = () => {
    this.setState({
      transactionError: null,
    });
  }

  _getRpcErrorMessage(error: any) {
    if(error.data) {
      return error.data.message;
    }

    return error.message;
  }

  async _initialize(selectedAccount: string) {
    this._provider = new ethers.providers.Web3Provider(window.ethereum)
  }

  render() {
    if(!this.state.selectedAccount) {
      return <ConnectWallet 
        connectWallet = {this._connectWallet}
        networkError = {this.state.networkError}
        dismiss = {this._dismissNetworkError}
      />
    }

    return(
      <>
        {this.state.txBeingSent && (
          <WaitingForTransactionMessage txHash = {this.state.txBeingSent} />
        )}

        {this.state.transactionError && (
          <TransactionsErrorMessage 
            message = {this._getRpcErrorMessage(this.state.transactionError)}
            dismiss = {this._dismissTransactionError}
          />
        )}
      </>
    )
  }
}

export default App;