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
  const toast = useToast();
  const { onOpen, onClose, isOpen } = useDisclosure();

  // change payment details in useState
  useEffect(() => {
    const { cardHolderName, last4Digit, expiryDate, bank, cardNumber, cvv } =
      formData;
    if (
      cardHolderName &&
      last4Digit &&
      expiryDate &&
      bank &&
      cardNumber &&
      cvv
    ) {
      setUserPayment({
        cardHolderName,
        last4Digit,
        expiryDate,
        bank,
        cardNumber,
        cvv,
      });
    }
  }, [formData]);

  // validate data
  const [cardNumberError, setCardNumberError] = useState(false);
  const [expiryError, setExpiryError] = useState(false);
  const [cvvError, setCvvError] = useState(false);

  const handlePayment = async () => {
    
    console.log(userPayment)

    // handleData(userPayment);
    // localStorage.setItem("paymentCreated", true)
  }

  const paymentCreated = localStorage.getItem("paymentCreated") === "true";

  return (
    <RegisterBox
      heading={"Payment Information"}
      onBack={onBack}
      buttonClick={handlePayment}
      buttonText="Pay"
    >
      <VStack mt={3}>
        <HStack w="full" justify="space-between">
          <Button
            color={"white"}
            flex={1}
            colorScheme={userPayment.bank === "MasterCard" ? "blue" : "gray"}
            variant={userPayment.bank === "MasterCard" ? "solid" : "outline"}
            onClick={() =>
              setUserPayment({ ...userPayment, bank: "MasterCard" })
            }
          >
            MasterCard
          </Button>
          <Button
            color={"white"}
            flex={1}
            colorScheme={userPayment.bank === "PayPal" ? "blue" : "gray"}
            variant={userPayment.bank === "PayPal" ? "solid" : "outline"}
            onClick={() => setUserPayment({ ...userPayment, bank: "PayPal" })}
          >
            PayPal
          </Button>
          <Button
            color={"white"}
            flex={1}
            colorScheme={userPayment.bank === "VISA" ? "blue" : "gray"}
            variant={userPayment.bank === "VISA" ? "solid" : "outline"}
            onClick={() => setUserPayment({ ...userPayment, bank: "VISA" })}
          >
            VISA
          </Button>
        </HStack>

        <Input
          placeholder="Cardholder name"
          _placeholder={{ color: "gray.300" }}
          value={userPayment.cardHolderName}
          onChange={(e) => {
            setUserPayment({ ...userPayment, cardHolderName: e.target.value });
          }}
        />

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
        />

        <HStack>
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
          />
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
          />
        </HStack>
      </VStack>

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
    </RegisterBox>
  );
}

export default payment;
