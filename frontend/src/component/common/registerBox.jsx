import React, { useEffect } from "react";
import { Box, Heading, Button } from "@chakra-ui/react";
import { IoArrowBackCircle } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { Tooltip } from "@chakra-ui/react";
import { useAuthStore } from "../../store/auth";
import { useUserStore } from "../../store/user";
import { useBillingStore } from "../../store/billing";


const RegisterBox = ({
  heading,
  children,
  onBack = null,
  buttonText = "Next",
  buttonClick = null,
  footer = null,
  isWaiting,
  skipOtp = false,
  formData,
  paymentId = "",
  ...props
}) => {
  const { authorizeUser, logout } = useAuthStore();
  const { deleteUser } = useUserStore();
  const { deleteSchool, deletePayment } = useBillingStore();

  const cancelSignup = async () => {

    const accountCreated = localStorage.getItem("accountCreated") === "true";
    const schoolCreated = localStorage.getItem("schoolCreated") === "true";
    const paymentCreated = localStorage.getItem("paymentCreated") === "true";

    if (accountCreated) {
      const { id } = await authorizeUser();
      deleteUser(id);
    }

    if (schoolCreated) {
      await deleteSchool(formData.schoolId);
    }

    if (paymentCreated) {
      await deletePayment(formData.paymentId);
    }

    localStorage.removeItem("accountCreated");
    localStorage.removeItem("schoolCreated");
    localStorage.removeItem("paymentCreated");
    localStorage.removeItem("signupFormData");
    localStorage.removeItem("signupStep");
    localStorage.removeItem("otpCooldownEnd");
    localStorage.removeItem("skipOtp");

    logout();
    window.location.href = "/";
  };


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
      {onBack != null ? (
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
      <Tooltip label="Cancel" hasArrow placement="top">
        <Button
          onClick={cancelSignup}
          position={"absolute"}
          top={0}
          right={0}
          zIndex={1000}
          _hover={{ bg: "transparent", color: "blue.500" }}
          bg={"transparent"}
          color={"white"}
          p={0}
          m={0}
          fontSize={"30px"}
        >
          <MdCancel />
        </Button>
      </Tooltip>

      <Heading
        color="white"
        as="h2"
        display="inline-block"
        px={{ base: 4, md: 8 }} // Responsive horizontal padding
        textAlign="center"
        width="auto"
        maxW="100%"
      >
        {heading}
      </Heading>
      {children}
      <Button
        w="100%"
        bgGradient="linear(to-r, blue.400,  red.400)"
        bgSize="200% 200%" // Make the gradient large enough to animate
        color="white"
        mt={5}
        transition="all 0.3s ease-in-out"
        _hover={{
          bgGradient: "linear(to-r, blue.400,red.400)",
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
