import React, { Children } from "react";
import { Tooltip } from "@chakra-ui/react";

function toolTips({ createdAccount, children, message }) {
  const defaultMessage = "You can change account details after logging in.";
  const tooltipMessage = message || defaultMessage;

  return (
    <Tooltip
      label={tooltipMessage}
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
