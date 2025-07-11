import React from "react";
import { Box } from "@chakra-ui/react";

function Locker({ number, isBooked, onBook }) {
  return (
    <Box
      as="button"
      className="locker"
      border={"1px"}
      h={"200px"}
      w={"100px"}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg={isBooked ? "gray.300" : "white"}
      opacity={isBooked ? 0.5 : 1}
      borderRadius="md"
      boxShadow="md"
      p={2}
      cursor={isBooked ? "not-allowed" : "pointer"}
      onClick={!isBooked ? onBook : undefined}
      disabled={isBooked}
      _hover={!isBooked ? { bg: "blue.50" } : {}}
    >
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>Locker {number}</div>
      {isBooked && (
        <div style={{ color: "red", marginTop: "10px" }}>Booked</div>
      )}
    </Box>
  );
}

export default Locker;
