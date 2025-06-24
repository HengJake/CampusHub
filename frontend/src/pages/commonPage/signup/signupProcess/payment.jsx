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
function payment({ formData, setFormData, onNext, onBack }) {
  const options = ["MasterCard", "PayPal", "VISA"];

  const [selectedPay, setSelectedPay] = useState({});

  const handlePay = async () => {
    onNext();
  };

  return (
    <RegisterBox heading={"Payment Information"} onBack={onBack} buttonClick={handlePay} buttonText="Pay">
      <RadioGroup onChange={setSelectedPay} value={selectedPay} w={"full"}>
        <HStack w={"full"} justify={"space-between"}>
          <Radio value="MasterCard">MasterCard</Radio>
          <Radio value="PayPal">PayPal</Radio>
          <Radio value="VISA">VISA</Radio>
        </HStack>
      </RadioGroup>

      <VStack>
        <Input
          placeholder="Cardholder name"
          _placeholder={{ color: "gray.300" }}
        />

        <Input placeholder="Card Number" _placeholder={{ color: "gray.300" }} />

        <HStack>
          <Input
            placeholder="Expiry Date"
            _placeholder={{ color: "gray.300" }}
          />
          <Input
            placeholder="CVV/CVC Code"
            _placeholder={{ color: "gray.300" }}
          />
        </HStack>
      </VStack>
    </RegisterBox>
  );
}

export default payment;
