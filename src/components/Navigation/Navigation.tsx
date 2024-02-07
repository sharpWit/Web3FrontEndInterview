import { Button } from "@mui/material";
import { useMetaMask } from "../../hooks/useMetaMask";
import { formatAddress } from "../../utils";
import styles from "./Navigation.module.css";

export const Navigation = () => {
  const { wallet, hasProvider, isConnecting, connectWallet } = useMetaMask();

  return (
    <div className={styles.navigation}>
      <div className={styles.flexContainer}>
        <div className={styles.leftNav}>Web3.0 React dApp & MetaMask</div>
        <div className={styles.rightNav}>
          {!hasProvider && (
            <a href="https://metamask.io" target="_blank" rel="noreferrer">
              Install MetaMask
            </a>
          )}
          {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
            <Button onClick={connectWallet} disabled={isConnecting}>
              Connect MetaMask
            </Button>
          )}
          {hasProvider && wallet.accounts.length > 0 && (
            <a
              className="text_link tooltip-bottom"
              href={`https://etherscan.io/address/${wallet.accounts}`}
              target="_blank"
              data-tooltip="Open in Block Explorer"
              rel="noreferrer"
            >
              {`Access to your blockchain data => ${formatAddress(
                wallet.accounts[0]
              )}`}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
