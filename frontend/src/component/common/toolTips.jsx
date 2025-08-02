import React, { Children } from "react";
import { Tooltip } from "@chakra-ui/react";

function toolTips({ createdAccount, children }) {
  return (
    <Tooltip
      label="You can change account details after logging in."
      isDisabled={!createdAccount}
      hasArrow
      placement="top"
      bg="gray.700"
      color="white"
    >
      {children}
    </Tooltip>
  );
}

export default toolTips;
