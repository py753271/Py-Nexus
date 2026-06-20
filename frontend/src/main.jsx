import React from "react";
import ReactDOM from "react-dom/client";
import AuthGate from "./AuthGate";
import { ThemeProvider } from "./shared/utils/ThemeContext";
import { UserProvider } from "./context/UserContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <ThemeProvider>
        <AuthGate />
      </ThemeProvider>
    </UserProvider>
  </React.StrictMode>
);