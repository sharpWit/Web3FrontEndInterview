/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useEffect,
  createContext,
  PropsWithChildren,
  useCallback,
} from "react";

import { ethers, BrowserProvider } from "ethers";

import { formatBalance } from "../utils/index.ts";

import ERC20_ABI from "../data/ERC20ABI.json";

interface WalletState {
  accounts: any[];
  balance: string;
  chainId: string;
}

interface MetaMaskContextData {
  wallet: WalletState;
  provider: ethers.Provider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnecting: boolean;
  hasProvider: boolean | null;
  error: boolean;
  errorMessage: string;
  clearError: () => void;
  connectWallet: () => void;
  getErc20Balance: (amountToken: string) => Promise<string | null>;
  transferErc20: (to: string, amount: string) => Promise<void>;
}

const disconnectedState: WalletState = {
  accounts: [],
  balance: "",
  chainId: "",
};

// Parse the ABI string into a ContractInterface
const ERC20TokenABI: ethers.InterfaceAbi = JSON.parse(ERC20_ABI.result);
// console.log("ERC20TokenABI: ", ERC20TokenABI);

export const MetaMaskContext = createContext<MetaMaskContextData>(
  {} as MetaMaskContextData
);

export const MetaMaskContextProvider = ({ children }: PropsWithChildren) => {
  const [wallet, setWallet] = useState(disconnectedState);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // useCallback ensures that we don't uselessly re-create the _updateWallet function on every render
  const _updateWallet = useCallback(async (providedAccounts?: any) => {
    const accounts =
      providedAccounts ||
      (await window.ethereum.request({ method: "eth_accounts" }));

    if (accounts.length === 0) {
      // If there are no accounts, then the user is disconnected
      setWallet(disconnectedState);
      return;
    }
    // Requesting user permission to connect
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const newProvider = new ethers.BrowserProvider(window.ethereum);

    setProvider(newProvider);
    setSigner(await newProvider.getSigner());

    const balance = formatBalance(
      await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })
    );
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    setWallet({ accounts, balance, chainId });
  }, []);

  const updateWalletAndAccounts = useCallback(
    () => _updateWallet(),
    [_updateWallet]
  );
  const updateWallet = useCallback(
    (accounts: any) => _updateWallet(accounts),
    [_updateWallet]
  );

  const clearError = () => setErrorMessage("");

  // * Function to get ERC20 token balance
  const getErc20Balance = async (
    amountToken: string
  ): Promise<string | null> => {
    try {
      const contract = new ethers.Contract(
        import.meta.env.VITE_ERC20_ADDRESS,
        ERC20TokenABI,
        signer
      );

      // Fetch decimals using the appropriate method
      const decimals = await contract.decimals();

      // Convert user input to BigNumber (assuming it's in the same unit as the contract)
      const userBalance = ethers.parseUnits(amountToken, decimals);

      // Mint the tokens
      const tx = await contract.mint(userBalance);

      // Wait for the transaction receipt
      const receipt = await tx.wait();

      // Check if the transaction was successful
      if (receipt.status !== 1) {
        throw new Error("Transaction failed or was rejected by the user.");
      }

      return receipt.transactionHash; // You can return any relevant information if needed
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        console.error("Error getting ERC20 balance:", error);
      } else {
        console.error("Error getting ERC20 balance", error);
      }
      return null;
    }
  };

  // * Function to transfer ERC20 tokens
  const transferErc20 = async (to: string, amount: string): Promise<void> => {
    try {
      const contractWithSigner = new ethers.Contract(
        import.meta.env.VITE_ERC20_ADDRESS,
        ERC20TokenABI,
        signer
      );
      await contractWithSigner.transfer(to, amount);
    } catch (error) {
      console.error("Error transferring ERC20 tokens:", error);
    }
  };

  // * Function to connect to MetaMask
  const connectWallet = async () => {
    setIsConnecting(true);
    if (window.ethereum) {
      try {
        // Requesting user permission to connect
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
        setSigner(await newProvider.getSigner());
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.error("MetaMask not found. Please install MetaMask extension.");
    }
    setIsConnecting(false);
  };

  /**
   * This logic checks if MetaMask is installed. If it is, then we setup some
   * event handlers to update the wallet state when MetaMask changes.
   * The function returned from useEffect is used as a "clean-up": in there, we remove the event
   * handlers whenever the MetaMaskProvider is unmounted.
   */

  useEffect(() => {
    // Check if MetaMask is already connected when the component mounts
    const fetchData = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setHasProvider(Boolean(provider));

      if (provider instanceof BrowserProvider) {
        updateWalletAndAccounts();
        window.ethereum.on("accountsChanged", updateWallet);
        window.ethereum.on("chainChanged", updateWalletAndAccounts);
      }
    };

    fetchData();
    return () => {
      window.ethereum?.removeListener("accountsChanged", updateWallet);
      window.ethereum?.removeListener("chainChanged", updateWalletAndAccounts);
    };
  }, [updateWallet, updateWalletAndAccounts]);

  // Ensure that contract is defined before accessing properties or methods
  if (hasProvider && wallet.accounts.length > 0) {
    console.log("Provider in component:", provider);
  } else {
    console.log("Provider is not yet initialized.");
  }

  return (
    <MetaMaskContext.Provider
      value={{
        wallet,
        provider,
        signer,
        hasProvider,
        isConnecting,
        error: !!errorMessage,
        errorMessage,
        connectWallet,
        getErc20Balance,
        transferErc20,
        clearError,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};
