import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  SimpleGrid,
  ModalFooter,
  Spinner,
  Text,
  Center,
} from "@chakra-ui/react";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import MasterCard from "/Mastercard_2019_logo.svg.png";
import Paypal from "/paypal.png";
import Visa from "/visa.png";
import { useState } from "react";
import { IoArrowBackCircle } from "react-icons/io5";
import RegisterBox from "../../../../component/common/registerBox";
import { useDisclosure } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { useBillingStore } from "../../../../store/billing.js";
import { useShowToast } from "../../../../store/utils/toast.js";
import ToolTips from "../../../../component/common/toolTips.jsx";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "../../../../../../backend/controllers/Billing/invoice.controllers.js";


// main
function payment({
  formData,
  handleData,
  onNext,
  onBack,
  userPayment,
  setUserPayment,
  isWaiting,
}) {

  // format object key
  const formatKey = (key) => {
    if (!Array.isArray(key.split(" "))) {
      return key.toUpperCase();
    }

    const withSpaces = key.replace(/([A-Z])/g, " $1"); // insert space before uppercase letters
    // const lowercased = withSpaces.toLowerCase();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1); // capitalize first letter
  };

  // for modal
  const navigate = useNavigate();

  // State for payment processing modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const toast = useToast();
  const { onOpen, onClose, isOpen } = useDisclosure();

  // change payment details in useState
  useEffect(() => {
    const { cardHolderName, last4Digit, expiryDate, bank, cardNumber, cvv, schoolId, paymentId } =
      formData;

    // Always update userPayment with available data
    setUserPayment(prev => ({
      ...prev,
      paymentId: paymentId || prev.paymentId || "",
      schoolId: schoolId || prev.schoolId || "",
      cardHolderName: cardHolderName || prev.cardHolderName || "",
      last4Digit: last4Digit || prev.last4Digit || "",
      expiryDate: expiryDate || prev.expiryDate || "",
      bank: bank || prev.bank || "",
      cardNumber: cardNumber || prev.cardNumber || "",
      cvv: cvv || prev.cvv || "",
    }));
  }, [formData]);


  const showToast = useShowToast();
  const { createPayment, getSubscription, createInvoice } = useBillingStore();
  // validate data
  const [cardNumberError, setCardNumberError] = useState(false);
  const [expiryError, setExpiryError] = useState(false);
  const [cvvError, setCvvError] = useState(false);

  const simulatePaymentProcessing = async () => {
    setIsProcessing(true);
    setProcessingStep(1);

    // Step 1: Validating payment details
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingStep(2);

    // Step 2: Processing payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessingStep(3);

    // Step 3: Confirming payment
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingStep(4);

    // Step 4: Redirecting to dashboard
    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.removeItem("accountCreated");
    localStorage.removeItem("schoolCreated");
    localStorage.removeItem("paymentCreated");
    localStorage.removeItem("signupFormData");
    localStorage.removeItem("signupStep");
    localStorage.removeItem("otpCooldownEnd");
    localStorage.removeItem("skipOtp");
    // Navigate to admin dashboard
    navigate("/admin-dashboard");
  };

  const handlePayment = async () => {

    const structPayment = {
      schoolID: userPayment.schoolId,
      cardHolderName: userPayment.cardHolderName,
      last4Digit: userPayment.last4Digit,
      expiryDate: userPayment.expiryDate,
      paymentMethod: userPayment.bank,
    }
    // create invoice
    const res = await createPayment(structPayment);

    const subRes = await getSubscription(formData.planId)

    const structInvoice = {
      paymentID: res.id,
      subscriptionID: formData.planId,
      amount: subRes.data.Price,
    }

    await createInvoice(structInvoice);

    if (res.success) {
      const updatedUserPayment = { ...userPayment, paymentId: res.id };

      setUserPayment(updatedUserPayment);

      // Pass only the paymentId to formData
      handleData(updatedUserPayment, false);

      showToast.success("Payment created", "", "payment")
      localStorage.setItem("paymentCreated", true);
      simulatePaymentProcessing();
    } else {
      showToast.error(res.message, "", "payment")
    }
  }

  const payCreated = localStorage.getItem("paymentCreated") === "true";

  const getProcessingMessage = () => {
    switch (processingStep) {
      case 1:
        return "Validating payment details...";
      case 2:
        return "Processing payment...";
      case 3:
        return "Confirming payment...";
      case 4:
        return "Redirecting to dashboard...";
      default:
        return "Initializing payment...";
    }
  };

  return (
    <RegisterBox
      heading={"Payment Information"}
      onBack={onBack}
      buttonClick={payCreated ? simulatePaymentProcessing : handlePayment}
      buttonText={payCreated ? "Confirm" : "Pay"}
      formData={formData}
      paymentId={formData.paymentId}
    >
      <VStack mt={3}>
        <ToolTips createdAccount={payCreated}>
          <HStack w="full" justify="space-between">
            <Button
              color={"white"}
              flex={1}
              colorScheme={userPayment.bank === "MasterCard" ? "blue" : "gray"}
              variant={userPayment.bank === "MasterCard" ? "solid" : "outline"}
              onClick={() =>
                setUserPayment({ ...userPayment, bank: "MasterCard" })
              }
              isDisabled={payCreated}
            >
              MasterCard
            </Button>

            <Button
              color={"white"}
              flex={1}
              colorScheme={userPayment.bank === "PayPal" ? "blue" : "gray"}
              variant={userPayment.bank === "PayPal" ? "solid" : "outline"}
              onClick={() => setUserPayment({ ...userPayment, bank: "PayPal" })}
              isDisabled={payCreated}
            >
              PayPal
            </Button>
            <Button
              color={"white"}
              flex={1}
              colorScheme={userPayment.bank === "VISA" ? "blue" : "gray"}
              variant={userPayment.bank === "VISA" ? "solid" : "outline"}
              onClick={() => setUserPayment({ ...userPayment, bank: "VISA" })}
              isDisabled={payCreated}
            >
              VISA
            </Button>
          </HStack>
        </ToolTips>

        <ToolTips createdAccount={payCreated}>
          <Input
            placeholder="Cardholder name"
            _placeholder={{ color: "gray.300" }}
            value={userPayment.cardHolderName}
            onChange={(e) => {
              setUserPayment({ ...userPayment, cardHolderName: e.target.value });
            }}
            isReadOnly={payCreated}
          />
        </ToolTips>

        <ToolTips createdAccount={payCreated}>
          <Input
            placeholder="Card Number"
            _placeholder={{ color: "gray.300" }}
            value={userPayment.cardNumber}
            onChange={(e) => {
              setUserPayment({ ...userPayment, cardNumber: e.target.value });
              setCardNumberError(false);
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const isValid = /^\d{16}$/.test(value);
              setCardNumberError(!isValid);
              if (!isValid) {
                toast({
                  title: "Invalid Card Number",
                  description: "Card number must be 16 digits.",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
            isInvalid={cardNumberError}
            borderColor={cardNumberError ? "red.500" : "gray.200"}
            focusBorderColor={cardNumberError ? "red.500" : "blue.300"}
            isReadOnly={payCreated}
          />
        </ToolTips>

        <HStack w="full" justify="space-between">
          <ToolTips createdAccount={payCreated}>
            <Input
              placeholder="Expiry Date"
              _placeholder={{ color: "gray.300" }}
              value={userPayment.expiryDate}
              onChange={(e) => {
                // Only allow numbers and slash, and max length 5 (MM/YY)
                let value = e.target.value.replace(/[^0-9/]/g, "");
                if (value.length === 2 && userPayment.expiryDate.length === 1) {
                  value += "/";
                }
                if (value.length > 5) value = value.slice(0, 5);
                setUserPayment({ ...userPayment, expiryDate: value });
                setExpiryError(false);
              }}
              onBlur={(e) => {
                const value = e.target.value;
                // MM/YY format only
                const isValidFormat = /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
                let isFuture = false;
                if (isValidFormat) {
                  const [mm, yy] = value.split("/");
                  const expMonth = parseInt(mm, 10);
                  const expYear = 2000 + parseInt(yy, 10); // 2-digit year to 4-digit
                  const now = new Date();
                  const thisMonth = now.getMonth() + 1;
                  const thisYear = now.getFullYear();
                  isFuture = expYear > thisYear || (expYear === thisYear && expMonth >= thisMonth);
                }
                setExpiryError(!(isValidFormat && isFuture));
                if (!isValidFormat) {
                  toast({
                    title: "Invalid Expiry Date",
                    description: "Expiry date must be in MM/YY format.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                } else if (!isFuture) {
                  toast({
                    title: "Invalid Expiry Date",
                    description: "Expiry date must be in the future.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
              isInvalid={expiryError}
              borderColor={expiryError ? "red.500" : "gray.200"}
              focusBorderColor={expiryError ? "red.500" : "blue.300"}
              isReadOnly={payCreated}
            />
          </ToolTips>
          <ToolTips createdAccount={payCreated}>
            <Input
              placeholder="CVV/CVC Code"
              _placeholder={{ color: "gray.300" }}
              value={userPayment.cvv}
              onChange={(e) => {
                setUserPayment({ ...userPayment, cvv: e.target.value });
                setCvvError(false);
              }}
              onBlur={(e) => {
                const value = e.target.value;
                const isValid = /^\d{3,4}$/.test(value);
                setCvvError(!isValid);
                if (!isValid) {
                  toast({
                    title: "Invalid CVV",
                    description: "CVV must be 3 or 4 digits.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
              isInvalid={cvvError}
              borderColor={cvvError ? "red.500" : "gray.200"}
              focusBorderColor={cvvError ? "red.500" : "blue.300"}
              isReadOnly={payCreated}
            />
          </ToolTips>
        </HStack>

      </VStack >

      {/* Payment Processing Modal */}
      <Modal isOpen={isProcessing} onClose={() => { }} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Processing Payment</ModalHeader>
          <ModalBody>
            <Center flexDirection="column" py={8}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
                mb={4}
              />
              <Text fontSize="lg" fontWeight="medium" mb={2}>
                {getProcessingMessage()}
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Please wait while we process your payment...
              </Text>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Payment Details?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={2} spacing={4} width="100%">
              {Object.entries(userPayment)
                .slice(0, 6)
                .map(([key, value]) => (
                  <Box key={key}>
                    <Text fontWeight={600}>{formatKey(key)}</Text>
                    <Text>{value}</Text>
                  </Box>
                ))}
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              isDisabled={isWaiting}
              colorScheme="blue"
              mr={3}
              onClick={() => {

              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </RegisterBox >
  );
}

export default payment;
