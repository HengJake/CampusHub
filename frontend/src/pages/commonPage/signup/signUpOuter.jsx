import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { useState } from "react";
import UserDetails from "./signupProcess/signup.jsx";
import Otp from "./signupProcess/emailConfirmation.jsx";
import SelectPlan from "./signupProcess/selectPlan.jsx";
import Payment from "./signupProcess/payment.jsx";
import SchoolDetails from "./signupProcess/schoolDetails.jsx";

function signUpOuter() {
  // ====== registration steps =====
  const [step, setStep] = useState(2);
  const nextStep = () => {
    console.log(step);
    setStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setStep((prev) => prev - 1);
    console.log(step);
  };

  const handleData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    nextStep();
  };

  const [formData, setFormData] = useState({
    // Step 1
    firstName: "School",
    lastName: "Admin1",
    phoneNumber: "0103314886",
    email: "schooltestacc818@gmail.com",
    password: "P@ssw0rd",
    confirmPassword: "P@ssw0rd",

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

  return (
    <Box m={"auto auto"} maxW={"md"}>
      {step === 1 && (
        <UserDetails
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
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
    </Box>
  );
}

export default signUpOuter;
