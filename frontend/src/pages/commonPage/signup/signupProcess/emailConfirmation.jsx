import React, { useEffect } from "react";
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalFooter,
} from "@chakra-ui/react";
import RegisterBox from "../../../../component/common/registerBox";
import { useAuthStore } from "../../../../store/auth";
import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";

function emailConfirmation({ formData, setFormData, onNext, onBack }) {
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure()


  const { verifyAccount, sendVerifyOtp } = useAuthStore();
  const [otpCode, setOtpCode] = useState(0);

  const [cooldownTime, setCooldownTime] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);

  const handleSendOtp = async () => {
    try {
      const res = await sendVerifyOtp(); // Call to server
      toast({
        title: "OTP sent",
        description: res.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Start cooldown
      setIsCooldown(true);
      setCooldownTime(60);

      const interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send OTP",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleVerify = async () => {
    const toastId = "verify";
    const { success, message } = await verifyAccount(otpCode);

    if (!success) {
      if (!toast.isActive(toastId)) {
        toast({
          toastId: toastId,
          title: "Invalid OTP Code",
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
          title: "Verification successful",
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
          <Link color={"blue.100"} textDecor={"underline"} onClick={onOpen}>
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
        <Input
          placeholder="XXXXXX"
          _placeholder={{ color: "gray.300" }}
          onChange={(e) => {
            setOtpCode(e.target.value);
          }}
        />
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Button onClick={handleSendOtp} isDisabled={isCooldown}>
              {isCooldown ? `Resend OTP in ${cooldownTime}s` : "Resend OTP"}
            </Button>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


    </RegisterBox>
  );
}

export default emailConfirmation;
