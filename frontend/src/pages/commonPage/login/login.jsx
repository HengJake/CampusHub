import React from "react";
import "./login.scss";
import { Box, Stack, Input } from "@chakra-ui/react";
import { redirect } from "react-router-dom";

function login() {
  return (
  <Box>
    <Stack spacing={3}>
      <Input
      bg={"red"}
        focusBorderColor="lime"
        placeholder="Here is a sample placeholder"
      />
      <Input
        focusBorderColor="pink.400"
        placeholder="Here is a sample placeholder"
      />
      <Input
        isInvalid
        errorBorderColor="red.300"
        placeholder="Here is a sample placeholder"
      />
      <Input
        isInvalid
        errorBorderColor="crimson"
        placeholder="Here is a sample placeholder"
      />
    </Stack>
  </Box>);
}

export default login;
