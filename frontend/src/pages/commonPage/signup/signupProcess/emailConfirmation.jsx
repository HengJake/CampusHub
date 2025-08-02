import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
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
  useDisclosure,
} from "@chakra-ui/react";
import { useAuthStore } from "../../../../store/auth";
import { useShowToast } from "../../../../store/utils/toast";


function emailConfirmation({ setSkipOtp, isOpen, onClose }) {
  const showToast = useShowToast();

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
        showToast.info(
          "OTP have been sent",
          "Please check your email for the OTP",
          toastId
        );
      }


      // If you have a response from authorizeUser, handle error
      // if (!res.success) {
      //   showToast.error(
      //     "Please create an account at sign up page",
      //     res.message,
      //     "no-account"
      //   );
      //   setTimeout(() => {
      //     onBack(); // go to Step 1
      //   }, 1000);
      //   return;
      // }
    }, 1000);
  }, []);

  const handleSendOtp = async () => {
    // Start cooldown
    const cooldownEnd = Date.now() + 60 * 1000;
    localStorage.setItem("otpCooldownEnd", cooldownEnd.toString());
    startCooldownInterval(60);

    try {
      const res = await sendVerifyOtp(); // Call to server

      setOtpCode(res.otp);

      if (res.success) {
        showToast.success(
          "OTP sent",
          res.message,
          "otp-sent"
        );
      } else {
        showToast.error(
          "Failed to send OTP",
          res.message,
          "otp-fail"
        );

        timeout(() => {
          onNext();
        }, 1500);
      }


    } catch (err) {
      showToast.error(
        "Error",
        "Failed to send OTP",
        "otp-error"
      );
    }
  };

  const handleVerify = async () => {
    const toastId = "verify";
    const { success, message } = await verifyAccount(otpCode);

    if (!success) {
      showToast.error(
        "Invalid OTP Code",
        message,
        toastId
      );
    } else {
      showToast.success(
        "Verification successful",
        message,
        toastId
      );
      setSkipOtp(true); // skip OTP verification if already verified
      localStorage.setItem("skipOtp", "true");
      localStorage.removeItem("otpCooldownEnd");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Two-Factor Authentication</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
              value={otpCode}
            />
          </VStack>
          <Box w="100%" textAlign="left" mt={4}>
            <Text as={"span"} mr={3}>
              Didn't receive code?
            </Text>
            <Link color={"blue.300"} textDecor={"underline"} onClick={isCooldown ? undefined : handleSendOtp} style={{ pointerEvents: isCooldown ? "disable" : "auto", opacity: isCooldown ? 0.5 : 1 }}>
              {isCooldown ? `Resend OTP in ${cooldownTime}s` : "Send Code"}
            </Link>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleVerify}>
            Verify Code
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default emailConfirmation;
