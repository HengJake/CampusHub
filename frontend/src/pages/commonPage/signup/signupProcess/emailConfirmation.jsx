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

function emailConfirmation({ onNext, onBack, setSkipOtp }) {
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { verifyAccount, sendVerifyOtp, authorizeUser } = useAuthStore();
  const [otpCode, setOtpCode] = useState(0);

  const [cooldownTime, setCooldownTime] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);

  // on open user will be greeted with a modal to resend OTP
  // then verify when OTP is enter (rmb to check for error)

  // to initiate the cool down timer
  const startCooldownInterval = (startTime = 60) => {
    setIsCooldown(true);
    setCooldownTime(startTime);
    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCooldown(false);
          localStorage.removeItem("otpCooldownEnd");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    setTimeout(async () => {
      const res = await authorizeUser();

      // Handle if no account first
      if (!res.success) {
        toast({
          title: "Please create an account at sign up page",
          description: res.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          onBack(); // go to Step 1
        }, 1000);
        return;
      }

      // if verified, skip OTP
      if (res.twoFA_enabled) {
        setSkipOtp(true); // skip OTP verification if already verified
        localStorage.setItem("skipOtp", "true");
        const toastId = "accountVerified";
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: "Account already verified",
            description: "Proceeding to next step",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          setTimeout(() => {
            onNext();
          }, 1500);
          return;
        }
      } else {
        const cooldownEnd = localStorage.getItem("otpCooldownEnd");
        if (cooldownEnd) {
          const remaining = Math.floor(
            (parseInt(cooldownEnd) - Date.now()) / 1000
          );

          if (remaining > 0) {
            setIsCooldown(true);
            setCooldownTime(remaining);
            startCooldownInterval(remaining);
            return;
          }
        } else {
          handleSendOtp();
          const toastId = "otpCooldown";
          if (!toast.isActive(toastId)) {
            toast({
              id: toastId,
              title: "OTP have been sent",
              description: "Please check your email for the OTP",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          }
        }
      }

      if (!res.success) {
        toast({
          title: "Please create an account at sign up page",
          description: res.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          onBack(); // go to Step 1
        }, 1000);
        return;
      }
    }, 1000);
  }, []);

  const handleSendOtp = async () => {
    // Start cooldown
    const cooldownEnd = Date.now() + 60 * 1000;
    localStorage.setItem("otpCooldownEnd", cooldownEnd.toString());
    startCooldownInterval(60);

    try {
      const res = await sendVerifyOtp(); // Call to server

      if (res.success) {
        toast({
          title: "OTP sent",
          description: res.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to send OTP",
          description: res.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        timeout(() => {
          onNext();
        }, 1500);
      }

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
        setSkipOtp(true); // skip OTP verification if already verified
        localStorage.setItem("skipOtp", "true");
        localStorage.removeItem("otpCooldownEnd");
      }

      setTimeout(() => {
        onNext();
      }, 1500);
    }
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
            Send Code
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
        <ModalContent margin={"auto auto"}>
          <ModalCloseButton />
          <Box
            padding={2}
            width={"100%"}
            display={"flex"}
            justifyContent={"center"}
          >
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSendOtp}
              isDisabled={isCooldown}
            >
              {isCooldown ? `Resend OTP in ${cooldownTime}s` : "Resend OTP"}
            </Button>
          </Box>
        </ModalContent>
      </Modal>
    </RegisterBox>
  );
}

export default emailConfirmation;
