// import { useState } from "react";
// import { ethers } from "ethers";
// import { Button, TextField, Typography } from "@mui/material";

// const ERC20TokenAddress = "0x65a5ba240CBd7fD75700836b683ba95EBb2F32bd";

// const App = () => {
//   const [step, setStep] = useState(1);
//   const [amount, setAmount] = useState("");
//   const [address, setAddress] = useState("");
//   const [message, setMessage] = useState("");

//   const mintTokens = async () => {
//     // Connect to the user's Ethereum wallet using MetaMask
//     // Call the ERC20 token contract's mint function
//     // Show a success message and proceed to the next step if the minting transaction is successful
//     // Display an error message if the transaction fails
//   };

//   const transferTokens = async () => {
//     // Call the ERC20 token contract's transfer function
//     // Show a success message if the transfer transaction is successful
//     // Display an error message if the transaction fails
//   };

//   return (
//     <div>
//       {step === 1 ? (
//         <div>
//           <TextField
//             label="Amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//           />
//           <Button onClick={mintTokens}>Mint Tokens</Button>
//         </div>
//       ) : (
//         <div>
//           <TextField
//             label="Recipient Address"
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//           />
//           <Button onClick={transferTokens}>Transfer Tokens</Button>
//         </div>
//       )}
//       <Typography>{message}</Typography>
//     </div>
//   );
// };

// export default App;

import "./App.global.css";
import styles from "./App.module.css";

import { Navigation } from "./components/Navigation";
import { Display } from "./components/Display";
import { MetaMaskError } from "./components/MetaMaskError";
import { MetaMaskContextProvider } from "./hooks/useMetaMask";

export const App = () => {
  return (
    <MetaMaskContextProvider>
      <div className={styles.appContainer}>
        <Navigation />
        <Display />
        <MetaMaskError />
      </div>
    </MetaMaskContextProvider>
  );
};
