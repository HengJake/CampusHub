import React, { useEffect } from "react";
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
  useToast,
} from "@chakra-ui/react";
import RegisterBox from "../../../../component/common/registerBox";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { useBillingStore } from "../../../../store/billing.js";
import { useShowToast } from "../../../../store/utils/toast.js";

function selectPlan({
  userData,
  handleData,
  onBack,
  onNext,
  skipOtp,
  userPlan,
  setUserPlan,
  formData
}) {

  const showToast = useShowToast();
  const { getAllSubscription } = useBillingStore();
  const [subscriptionList, setSubscriptionList] = useState({});

  useEffect(() => {
    async function getSubs() {
      const { success, data } = await getAllSubscription();
      if (!success) return;
      const list = {};
      data.forEach((sub) => {
        const interval = sub.BillingInterval;
        if (!list[interval]) list[interval] = [];
        list[interval].push({ _id: sub._id, price: sub.Price, plan: sub.Plan });
      });
      setSubscriptionList(list);
    }
    getSubs();
  }, []);

  function getPrice(plan) {
    const interval = userPlan.billingInterval;
    if (!interval) return "-";
    const arr = subscriptionList[interval];
    if (!arr) return "-";
    const found = arr.find(item => item.plan === plan);
    return found ? `RM${found.price}` : "-";
  }


  const handlePlan = async () => {
    let id = subscriptionList[userPlan.billingInterval].find((item) => item.plan === userPlan.selectedPlan)._id;

    // Create the updated userPlan with planId
    const updatedUserPlan = { ...userPlan, planId: id };

    // Update the state
    setUserPlan(updatedUserPlan);

    // Pass the updated data to formData
    handleData(updatedUserPlan);

    showToast.success("Plan selected", "", "plan");
  };

  return (
    <RegisterBox
      formData={formData}
      heading={"Select a Plan"}
      onBack={onBack}
      buttonClick={handlePlan}
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
            colorScheme={userPlan.selectedPlan === "Basic" ? "blue" : "gray"}
            variant={userPlan.selectedPlan === "Basic" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, selectedPlan: "Basic" })}
            justifyContent="space-between"
            display="flex"
            color={"white"}
          >
            <Text fontSize="xl" flex="1" textAlign={"left"}>
              Basic
            </Text>
            <Text>{getPrice("Basic")}</Text>
          </Button>
          <Button
            w="100%"
            mb={2}
            colorScheme={userPlan.selectedPlan === "Standard" ? "blue" : "gray"}
            variant={userPlan.selectedPlan === "Standard" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, selectedPlan: "Standard" })}
            justifyContent="space-between"
            display="flex"
            color={"white"}
          >
            <Text fontSize="xl" flex="1" fontWeight={700} textAlign={"left"}>
              Standard
            </Text>
            <Text>{getPrice("Standard")}</Text>
          </Button>
          <Button
            w="100%"
            colorScheme={userPlan.selectedPlan === "Premium" ? "blue" : "gray"}
            variant={userPlan.selectedPlan === "Premium" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, selectedPlan: "Premium" })}
            justifyContent="space-between"
            display="flex"
            color={"white"}
          >
            <Text fontSize="xl" flex="1" textAlign={"left"}>
              Premium
            </Text>
            <Text>{getPrice("Premium")}</Text>
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
            colorScheme={userPlan.billingInterval === "Monthly" ? "blue" : "gray"}
            variant={userPlan.billingInterval === "Monthly" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, billingInterval: "Monthly" })}
            color={"white"}
          >
            <Text fontSize="xl">Monthly Billing</Text>
          </Button>
          <Button
            flex={1}
            colorScheme={userPlan.billingInterval === "Yearly" ? "blue" : "gray"}
            variant={userPlan.billingInterval === "Yearly" ? "solid" : "outline"}
            onClick={() => setUserPlan({ ...userPlan, billingInterval: "Yearly" })}
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
