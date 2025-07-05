import React from "react";
import { Box, Button, Image } from "@chakra-ui/react";
import { useState } from "react";
import UserDetails from "./signupProcess/signup.jsx";
import Otp from "./signupProcess/emailConfirmation.jsx";
import SelectPlan from "./signupProcess/selectPlan.jsx";
import Payment from "./signupProcess/payment.jsx";
import SchoolDetails from "./signupProcess/schoolDetails.jsx";
import AutoFill from "../../../component/common/autoFill.jsx";
import { useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";
import LoginBackground from "/LoginBackground.png";
import { useAuthStore } from "../../../store/auth.js";
import { useUserStore } from "../../../store/user.js";

function signUpOuter() {
  const { isOpen, onOpen, onClose } = useDisclosure();


  const skipOtpFromStorage = localStorage.getItem("skipOtp");
  const [skipOtp, setSkipOtp] = useState(
    skipOtpFromStorage ? skipOtpFromStorage : false
  );

  // ====== registration steps =====
  const storedStep = localStorage.getItem("signupStep");
  const accountCreated = localStorage.getItem("accountCreated") === "true";
  const schoolCreated = localStorage.getItem("schoolCreated") === "true";

  const [step, setStep] = useState(storedStep ? parseInt(storedStep) : 1);

  const nextStep = () => {
    setStep((prev) => prev + 1);
    localStorage.setItem("signupStep", step + 1);
  };
  const prevStep = () => {
    setStep((prev) => prev - 1);
    localStorage.setItem("signupStep", step - 1);
  };

  useEffect(() => {
    if ((!schoolCreated && step == 2)) {
      onOpen();
    }

    if ((!accountCreated && step == 1)) {
      onOpen();
    }
  }, [step]);

  // ====== user data =====
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [userPlan, setUserPlan] = useState({
    selectedPlan: "",
    billingInterval: "",
  });

  const [userPayment, setUserPayment] = useState({
    cardHolderName: "",
    cardNumber: "",
    last4Digit: "",
    cvv: "",
    expiryDate: "",
    bank: "",
  });

  const [userSchoolDetails, setUserSchoolDetails] = useState({
    schoolName: "",
    address: "",
    city: "",
    country: "Malaysia",
  });

  const [formData, setFormData] = useState({
    // Step 1
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Step 2: Plan
    planId: "",
    selectedPlan: "",
    billingInterval: "",

    // Step 3 : Payment
    last4Digit: "",
    expiryDate: "",
    cardHolderName: "",
    bank: "",
    // does not store in DB
    cvv: "",
    cardNumber: "",

    // Step 4: School Details
    schoolId: "",
    schoolName: "",
    address: "",
    city: "",
    country: "Malaysia",
  });

  useEffect(() => {
    const storedData = localStorage.getItem("signupFormData");

    if (storedData) {
      const parsed = JSON.parse(storedData);

      setFormData(parsed);

      setUserDetails({
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        phoneNumber: parsed.phoneNumber || "",
        email: parsed.email || "",
        password: parsed.password || "",
        confirmPassword: parsed.confirmPassword || "",
      });

      setUserPlan({
        planId: parsed.planId || "",
        selectedPlan: parsed.selectedPlan || "",
        billingInterval: parsed.billingInterval || "",
      });

      setUserPayment({
        cardHolderName: parsed.cardHolderName || "",
        cardNumber: parsed.cardNumber || "",
        last4Digit: parsed.last4Digit || "",
        cvv: parsed.cvv || "",
        expiryDate: parsed.expiryDate || "",
        bank: parsed.bank || "",
      });

      setUserSchoolDetails({
        schoolName: parsed.schoolName || "",
        address: parsed.address || "",
        city: parsed.city || "",
        country: parsed.country || "Malaysia",
      });
    }

    if ((!schoolCreated && step == 2) || (!accountCreated && step == 1)) {
      onOpen();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("signupStep", step.toString());
  }, [step]);

  // add data
  const handleData = (data, proceed = true) => {

    const updated = { ...formData, ...data };

    console.log("asd", updated);

    setFormData(updated);
    localStorage.setItem("signupFormData", JSON.stringify(updated));

    console.log(JSON.stringify(updated));

    if (proceed) {
      nextStep();
    }
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

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
          handleData={handleData}
          onNext={nextStep}
          isWaiting={isWaiting}
          handleNextClick={handleNextClick}
          skipOtp={skipOtp}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          setSkipOtp={setSkipOtp}
        />
      )}

      {step === 2 && (
        <SchoolDetails
          isWaiting={isWaiting}
          handleNextClick={handleNextClick}
          formData={formData}
          handleData={handleData}
          onBack={prevStep}
          userSchoolDetails={userSchoolDetails}
          setUserSchoolDetails={setUserSchoolDetails}
          onNext={nextStep}
        />
      )}

      {step === 3 && (
        <SelectPlan
          formData={formData}
          handleData={handleData}
          onNext={nextStep}
          onBack={prevStep}
          skipOtp={skipOtp}
          userPlan={userPlan}
          setUserPlan={setUserPlan}
        />
      )}

      {step === 4 && (
        <Payment
          formData={formData}
          handleData={handleData}
          onNext={nextStep}
          onBack={prevStep}
          userPayment={userPayment}
          setUserPayment={setUserPayment}
          isWaiting={isWaiting}
        />
      )}


      <AutoFill
        onOpen={onOpen}
        isOpen={isOpen}
        onClose={onClose}
        step={step}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        setUserPayment={setUserPayment}
        setUserSchoolDetails={setUserSchoolDetails}
      ></AutoFill>
      <Image
        objectFit={"cover"}
        position={"fixed"}
        top={0}
        right={0}
        display={"flex"}
        height={"100%"}
        width={"100%"}
        src={LoginBackground}
        alt="Login Background"
      />
    </Box>
  );
}

export default signUpOuter;
