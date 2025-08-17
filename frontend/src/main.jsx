import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

localStorage.setItem("chakra-ui-color-mode", "light");


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <GoogleOAuthProvider clientId="863795022093-jj9pcoshoup362pll4l3tjqm29v1cj97.apps.googleusercontent.com">


          <App />

        </GoogleOAuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);
