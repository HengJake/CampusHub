import React from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  VStack,
} from "@chakra-ui/react";
import RegisterBox from "../../../../component/common/registerBox";

function selectPlan({ userData, setFormData, onBack, onNext }) {
  const handlePlan = async () => {
    onNext();
  };

  return (
    <RegisterBox
      heading={"Select a Plan"}
      onBack={onBack}
      buttonClick={handlePlan}
    >
      <VStack>
        <InputGroup>
          <Input placeholder="Plan Type" _placeholder={{ color: "gray.300" }} />
          <Input
            placeholder="Billing Interval"
            _placeholder={{ color: "gray.300" }}
          />
        </InputGroup>
      </VStack>
    </RegisterBox>
  );
}

export default selectPlan;
