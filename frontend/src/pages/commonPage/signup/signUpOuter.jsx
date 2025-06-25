import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { useState } from "react";
import UserDetails from "./signupProcess/signup.jsx";
import Otp from "./signupProcess/emailConfirmation.jsx";
import SelectPlan from "./signupProcess/selectPlan.jsx";
import Payment from "./signupProcess/payment.jsx";
import SchoolDetails from "./signupProcess/schoolDetails.jsx";
import AutoFill from "../../../component/common/autoFill.jsx";
import { useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";

function signUpOuter() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ====== registration steps =====
  const [step, setStep] = useState(2);
  const nextStep = () => {
    // console.log(step);
    setStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setStep((prev) => prev - 1);
    // console.log(step);
  };


  useEffect(() => {
    onOpen();
    // console.log(formData);
  }, []);

  // firstName: "School",
  // lastName: "Admin1",
  // phoneNumber: "0103314886",
  // email: "schooltestacc818@gmail.com",
  // password: "P@ssw0rd",
  // confirmPassword: "P@ssw0rd",

  // add data
  const handleData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    nextStep();
  };

  const [formData, setFormData] = useState({
    // Step 1
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Step 2: Plan
    selectedPlan: "",
    billingInterval: "",

    // Step 3 : Payment
    last4Digit: "",
    expiryDate: "",
    cardHoldername: "",
    bank: "",

    // Step 4: School Details
    schoolName: "",
    address: "",
    city: "",
    country: "",
  });

  // disable user from spamming (if spam will skip to next 2 or more)
  const [isWaiting, setIsWaiting] = useState(false);

  const handleNextClick = () => {
    if (isWaiting) return;

    setIsWaiting(true);

    setTimeout(() => {
      setIsWaiting(false);
    }, 2000);
  };

  return (
    <Box m={"auto auto"} maxW={"md"}>
      {step === 1 && (
        <UserDetails
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          isWaiting={isWaiting}
          handleNextClick={handleNextClick}
        />
      )}
      {step === 2 && (
        <Otp userData={formData} onBack={prevStep} onNext={nextStep} />
      )}
      {step === 3 && (
        <SelectPlan
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {step === 4 && (
        <Payment
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {step === 5 && (
        <SchoolDetails
          formData={formData}
          setFormData={setFormData}
          onBack={prevStep}
        />
      )}

      <AutoFill
        isOpen={isOpen}
        onClose={onClose}
        setFormData={setFormData}
        step={step}
        formData={formData}
      ></AutoFill>
    </Box>
  );
}

export default signUpOuter;
