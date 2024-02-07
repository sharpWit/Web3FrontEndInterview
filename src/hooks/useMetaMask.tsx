import { useContext } from "react";
import { MetaMaskContext } from "./MetaMaskContextProvider";

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  // console.log("Context: ", context);
  if (context === undefined) {
    throw new Error(
      'useMetaMask must be used within a "MetaMaskContextProvider"'
    );
  }

  return context;
};
