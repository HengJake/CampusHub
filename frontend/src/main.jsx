import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

localStorage.setItem("chakra-ui-color-mode", "light");


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider>
   
          <App />

      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);
