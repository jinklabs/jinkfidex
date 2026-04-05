import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { wagmiConfig, queryClient, supportedChains } from "./config/privy";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID ?? ""}
      config={{
        loginMethods: ["wallet", "email", "google", "twitter"],
        appearance: {
          theme: "dark",
          accentColor: "#7c5cfc",
          logo: `${window.location.origin}/logo.png`,
        },
        supportedChains: [...supportedChains],
        defaultChain: supportedChains[0],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  </StrictMode>
);
