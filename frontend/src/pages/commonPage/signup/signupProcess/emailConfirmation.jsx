import React from "react";
import { CiLock } from "react-icons/ci";
import {
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  VStack,
  Text,
  Link,
  useToast,
} from "@chakra-ui/react";
import RegisterBox from "../../../../component/common/registerBox";
import { useAuthStore } from "../../../../store/auth";

function emailConfirmation({ formData, setFormData, onNext, onBack }) {
  const toast = useToast();

  const { verifyAccount, sendVerifyOtp } = useAuthStore();

  const handleVerify = async () => {
    const toastId = "verify";
    const { success, message } = await sendVerifyOtp();

    if (!success) {
      if (!toast.isActive(toastId)) {
        toast({
          toastId: toastId,
          title: "Error Signing Up",
          description: message,
          position: "top",
          status: "error",
          isClosable: true,
        });
      }
    } else {
      if (!toast.isActive(toastId)) {
        toast({
          toastId: toastId,
          title: "Sign Up successfully",
          description: message,
          position: "top",
          status: "success",
          isClosable: true,
        });
      }
      
      setTimeout(() => {
        onNext();
      }, 1500);
    }

    onNext();
  };

  return (
    <RegisterBox
      heading={"Two-Factor Authentication"}
      onBack={onBack}
      buttonClick={handleVerify}
      buttonText="Verify Code"
      footer={
        <Box w="100%" textAlign="left">
          <Text as={"span"} mr={3}>
            Didn't receive code?
          </Text>
          <Link color={"blue.100"} textDecor={"underline"}>
            Resend Code
          </Link>
        </Box>
      }
    >
      <VStack>
        <Text textAlign={"center"}>
          Please enter the 6-digit verification code that was sent to your
          registered email address.
        </Text>
        <Input placeholder="XXXXXX" _placeholder={{ color: "gray.300" }} />
      </VStack>
    </RegisterBox>
  );
}

export default emailConfirmation;
