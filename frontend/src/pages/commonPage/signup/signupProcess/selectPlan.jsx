import React from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  VStack,
  Select,
  Link as ChakraLink,
  RadioGroup,
  Radio,
  Text,
} from "@chakra-ui/react";
import RegisterBox from "../../../../component/common/registerBox";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";

function selectPlan({
  userData,
  handleData,
  onBack,
  onNext,
  skipOtp,
  userPlan,
  setUserPlan,
}) {


  const priceList = {
    basic: {
      month: "$99",
    },
    standard: {
      month: "$199",
    },
    premium: {
      month: "$499",
    },
  };

  const handlePlan = async () => {
    // onNext();
  };

  return (
    <RegisterBox
      heading={"Select a Plan"}
      onBack={onBack}
      buttonClick={() => handleData(userPlan)}
      skipOtp={skipOtp}
    >
      <VStack>
        <ChakraLink
          as={RouterLink}
          to="/pricing"
          alignSelf={"start"}
          textDecor={"underline"}
          color={"blue.300"}
          target="_blank"
        >
          View Plans
        </ChakraLink>

        {/* Plan selection */}
        <Box w="100%">
          <Button
            w="100%"
            mb={2}
            colorScheme={userPlan.selectedPlan === "basic" ? "blue" : "gray"}
            variant={userPlan.selectedPlan === "basic" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, selectedPlan: "basic" })}
            justifyContent="space-between"
            display="flex"
            color={"white"}
          >
            <Text fontSize="xl" flex="1" textAlign={"left"}>
              Basic
            </Text>
            <Text>{priceList.basic.month}</Text>
          </Button>
          <Button
            w="100%"
            mb={2}
            colorScheme={userPlan.selectedPlan === "standard" ? "blue" : "gray"}
            variant={userPlan.selectedPlan === "standard" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, selectedPlan: "standard" })}
            justifyContent="space-between"
            display="flex"
            color={"white"}
          >
            <Text fontSize="xl" flex="1" fontWeight={700} textAlign={"left"}>
              Standard
            </Text>
            <Text>{priceList.standard.month}</Text>
          </Button>
          <Button
            w="100%"
            colorScheme={userPlan.selectedPlan === "premium" ? "blue" : "gray"}
            variant={userPlan.selectedPlan === "premium" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, selectedPlan: "premium" })}
            justifyContent="space-between"
            display="flex"
            color={"white"}
          >
            <Text fontSize="xl" flex="1" textAlign={"left"}>
              Premium
            </Text>
            <Text>{priceList.premium.month}</Text>
          </Button>
        </Box>

        {/* Billing interval selection */}
        <Box
          width="100%"
          bg="blue.800"
          p={3}
          borderRadius="10"
          mt={3}
          display="flex"
          gap={3}
        >
          <Button
            flex={1}
            colorScheme={userPlan.billingInterval === "monthly" ? "blue" : "gray"}
            variant={userPlan.billingInterval === "monthly" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, billingInterval: "monthly" })}
            color={"white"}
          >
            <Text fontSize="xl">Monthly Billing</Text>
          </Button>
          <Button
            flex={1}
            colorScheme={userPlan.billingInterval === "yearly" ? "blue" : "gray"}
            variant={userPlan.billingInterval === "yearly" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, billingInterval: "yearly" })}
            color={"white"}
          >
            <Text fontSize="xl">Yearly Billing</Text>
          </Button>
        </Box>
      </VStack>
    </RegisterBox>
  );
}

export default selectPlan;
