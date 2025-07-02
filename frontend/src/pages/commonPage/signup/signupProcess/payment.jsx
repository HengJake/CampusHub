import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  VStack,
} from "@chakra-ui/react";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import MasterCard from "/Mastercard_2019_logo.svg.png";
import Paypal from "/paypal.png";
import Visa from "/visa.png";
import { useState } from "react";
import { IoArrowBackCircle } from "react-icons/io5";
import RegisterBox from "../../../../component/common/registerBox";

// main
function payment({
  formData,
  handleData,
  onNext,
  onBack,
  userPayment,
  setUserPayment,
}) {
  const options = ["MasterCard", "PayPal", "VISA"];

  useEffect(() => {
    const { cardHoldername, last4Digit, expiryDate, bank, cardNumber, cvv } =
      formData;
    if (
      cardHoldername &&
      last4Digit &&
      expiryDate &&
      bank &&
      cardNumber &&
      cvv
    ) {
      setUserPayment({
        cardHoldername,
        last4Digit,
        expiryDate,
        bank,
        cardNumber,
        cvv,
      });
    }
  }, [formData]);

  return (
    <RegisterBox
      heading={"Payment Information"}
      onBack={onBack}
      buttonClick={() => handleData(userPayment)}
      buttonText="Pay"
    >
      <VStack mt={3}>
        <HStack w="full" justify="space-between">
          <Button
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
            flex={1}
            colorScheme={userPayment.bank === "PayPal" ? "blue" : "gray"}
            variant={userPayment.bank === "PayPal" ? "solid" : "outline"}
            onClick={() => setUserPayment({ ...userPayment, bank: "PayPal" })}
          >
            PayPal
          </Button>
          <Button
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
          value={userPayment.cardHoldername}
          onChange={(e) => {
            setUserPayment({ ...userPayment, cardHoldername: e.target.value });
          }}
        />

        <Input
          placeholder="Card Number"
          _placeholder={{ color: "gray.300" }}
          value={userPayment.cardNumber}
          onChange={(e) => {
            setUserPayment({ ...userPayment, cardNumber: e.target.value });
          }}
        />

        <HStack>
          <Input
            placeholder="Expiry Date"
            _placeholder={{ color: "gray.300" }}
            value={userPayment.expiryDate}
            onChange={(e) => {
              setUserPayment({ ...userPayment, expiryDate: e.target.value });
            }}
          />
          <Input
            placeholder="CVV/CVC Code"
            _placeholder={{ color: "gray.300" }}
            value={userPayment.cvv}
            onChange={(e) => {
              setUserPayment({ ...userPayment, cvv: e.target.value });
            }}
          />
        </HStack>
      </VStack>
    </RegisterBox>
  );
}

export default payment;
