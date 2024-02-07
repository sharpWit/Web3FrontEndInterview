import { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import styles from "./Form.module.css";
import { useMetaMask } from "../../hooks/useMetaMask";

const Form = () => {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const {
    wallet,
    hasProvider,
    getErc20Balance,
    transferErc20,
    error,
    errorMessage,
    clearError,
  } = useMetaMask();

  const mintTokens = async () => {
    clearError();
    if (
      !transferAmount ||
      isNaN(Number(transferAmount)) ||
      Number(transferAmount) <= 0
    ) {
      setMessage("Please enter a valid amount greater than zero.");
      return;
    }

    if (hasProvider && wallet.accounts.length <= 0) {
      console.error("Contract not initialized");
      setTransferAmount("");
      setMessage("First, you should connect to your wallet!");
      return;
    }

    if (hasProvider && wallet.accounts.length > 0) {
      try {
        const result = await getErc20Balance(transferAmount);

        // Check for error in the result
        if (result === null || error) {
          setMessage(errorMessage || "Failed to mint tokens.");
          setTransferAmount("");
          throw new Error("Failed to mint tokens.");
        } else {
          setMessage("Tokens minted successfully!");
          setStep(2);
        }
      } catch (error) {
        console.error("Error minting tokens:", error);
        setMessage("Failed to mint tokens. Please try again.");
      }
    }
  };

  const handleTransfer = async () => {
    if (!toAddress || !transferAmount) {
      setMessage("Please enter a valid Ethereum address.");
      return;
    }

    console.log("toAddress:", toAddress);

    try {
      await transferErc20(toAddress, transferAmount);

      // Check for errors in the transferErc20 function
      if (error) {
        setMessage(errorMessage || "Failed to transfer tokens.");
        throw new Error("Failed to transfer tokens.");
      } else {
        setMessage("Tokens transferred successfully!");
        setStep(1);
      }
    } catch (error) {
      console.error("Error transferring ERC20 tokens:", error);
      setMessage("Failed to transfer tokens. Please try again.");
    }
  };

  return (
    <main className={styles.form}>
      <div className={styles.innerForm}>
        {step === 1 ? (
          <div>
            <TextField
              label="Transfer Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              variant="standard"
            />
            <Button onClick={mintTokens}>Mint Tokens</Button>
          </div>
        ) : (
          <div>
            <TextField
              label="Recipient Address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
            <Button onClick={handleTransfer}>Transfer ERC20 Tokens</Button>
          </div>
        )}
        <Typography>{message}</Typography>
      </div>
    </main>
  );
};

export default Form;
