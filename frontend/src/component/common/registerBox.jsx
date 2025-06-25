import React from "react";
import { Box, Heading, Button } from "@chakra-ui/react";
import { IoArrowBackCircle } from "react-icons/io5";

const RegisterBox = ({
  heading,
  children,
  onBack = null,
  buttonText = "Next",
  buttonClick = null,
  footer = null,
  isWaiting,
  ...props
}) => {
  return (
    <Box
      p={5}
      backdropFilter="blur(10px)"
      bg="rgba(0, 0, 0, 0.5)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      boxShadow="lg"
      borderRadius="lg"
      color="#DAD7CD"
      zIndex={100}
      position="relative"
      {...props}
    >
      {onBack ? (
        <Button
          position={"absolute"}
          top={0}
          left={0}
          zIndex={101}
          onClick={onBack}
          bg={"transparent"}
          color={"white"}
          fontSize={"30px"}
          p={0}
          m={0}
          _hover={{ bg: "transparent", color: "blue.500" }}
        >
          <IoArrowBackCircle />
        </Button>
      ) : (
        ""
      )}
      <Heading color={"white"} textAlign={"center"} mb={5}>
        {heading}
      </Heading>
      {children}
      <Button
        w="100%"
        bgGradient="linear(to-r, blue.300, blue.400, blue.300)"
        bgSize="200% 200%" // Make the gradient large enough to animate
        color="white"
        mt={5}
        transition="all 0.3s ease-in-out"
        _hover={{
          bgGradient: "linear(to-r, blue.300, blue.400, blue.300)",
          backgroundPosition: "100% 50%",
          boxShadow: "lg",
        }}
        onClick={buttonClick}
        isDisabled={isWaiting}
      >
        {buttonText}
      </Button>

      {footer && <Box>{footer}</Box>}
    </Box>
  );
};

export default RegisterBox;
