import "./App.global.css";
import styles from "./App.module.css";
import Form from "./components/Form/Form";
import { Display } from "./components/Display";
import { Navigation } from "./components/Navigation";
import { MetaMaskError } from "./components/MetaMaskError";
import { MetaMaskContextProvider } from "./hooks/MetaMaskContextProvider";

export const App = () => {
  return (
    <MetaMaskContextProvider>
      <div className={styles.appContainer}>
        <Navigation />
        <Display />
        <div className={styles.outerForm}>
          <Form />
        </div>
        <MetaMaskError />
      </div>
    </MetaMaskContextProvider>
  );
};
