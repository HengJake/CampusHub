import React from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  VStack,
  Select,
  Tooltip,
} from "@chakra-ui/react";
import { IoArrowBackCircle } from "react-icons/io5";
import RegisterBox from "../../../../component/common/registerBox";
import { useEffect } from "react";
import { useBillingStore } from "../../../../store/billing";
import { useAuthStore } from "../../../../store/auth";
import { useShowToast } from "../../../../store/utils/toast";
import ToolTips from "../../../../component/common/toolTips.jsx";

function schoolDetails({
  handleData,
  onBack,
  userSchoolDetails,
  setUserSchoolDetails,
  onNext
}) {
  const useToast = useShowToast();
  const schoolCreated = localStorage.getItem("schoolCreated") === "true";
  const { createSchool } = useBillingStore();
  const { authorizeUser } = useAuthStore();
  const handleInputChange = (e) => {
    console.log(e);
    if (schoolCreated) return;
    const { name, value } = e.target;
    setUserSchoolDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSchool = async () => {
    if (schoolCreated) {
      onNext();
      return;
    } else {

      const res = await authorizeUser();

      if (!res.success) {
        useToast.error("Invalid User", "Please create an account", "create-acc")
        onBack();
      }

      const structSchool = {
        UserID: res.id,
        Name: userSchoolDetails.schoolName,
        Address: userSchoolDetails.address,
        City: userSchoolDetails.city,
        Country: userSchoolDetails.country
      }

      const res2 = await createSchool(structSchool);
      handleData({
        schoolId: res2.id,
        schoolName: userSchoolDetails.schoolNam,
        address: userSchoolDetails.address,
        city: userSchoolDetails.city,
        country: userSchoolDetails.country,
      });
      if (!res2.success) {
        useToast.error("Error creating school", res2.message, "create-sch")
      } else {
        useToast.success("School Created", res2.message, "create-sch2")
        localStorage.setItem("schoolCreated", true);
      }
    }
  }


  let buttonText;
  if (!schoolCreated) {
    buttonText = "Enter School";
  } else {
    buttonText = "Next";
  }

  return (
    <RegisterBox
      heading={"School Information"}
      onBack={onBack}
      buttonClick={handleSchool}
      buttonText={buttonText}
    >
      <VStack>
        <ToolTips createdAccount={schoolCreated}>
          <Input
            name="schoolName"
            placeholder="School Name"
            _placeholder={{ color: "gray.300" }}
            value={userSchoolDetails.schoolName}
            onChange={handleInputChange}
            isReadOnly={schoolCreated}
          />
        </ToolTips>
        <HStack>
          {/* Locked country input */}
          <Tooltip
            label="Country is fixed to Malaysia"
            hasArrow
            placement="top"
          >
            <Input
              name="country"
              value="Malaysia"
              isReadOnly
              _placeholder={{ color: "gray.300" }}
              bg="red.300"
              color="white"
              _hover={{ cursor: "not-allowed" }}
            />
          </Tooltip>

          {/* Selectable city */}
          <Select
            name="city"
            placeholder="Select City"
            _placeholder={{ color: "gray.300" }}
            value={userSchoolDetails.city}
            onChange={handleInputChange}
            isDisabled={schoolCreated}
          >
            <option value="Johor" style={{ color: "black" }}>
              Johor
            </option>
            <option value="Kedah" style={{ color: "black" }}>
              Kedah
            </option>
            <option value="Kelantan" style={{ color: "black" }}>
              Kelantan
            </option>
            <option value="Melaka" style={{ color: "black" }}>
              Melaka
            </option>
            <option value="Negeri Sembilan" style={{ color: "black" }}>
              Negeri Sembilan
            </option>
            <option value="Pahang" style={{ color: "black" }}>
              Pahang
            </option>
            <option value="Perak" style={{ color: "black" }}>
              Perak
            </option>
            <option value="Perlis" style={{ color: "black" }}>
              Perlis
            </option>
            <option value="Penang" style={{ color: "black" }}>
              Penang
            </option>
            <option value="Sabah" style={{ color: "black" }}>
              Sabah
            </option>
            <option value="Sarawak" style={{ color: "black" }}>
              Sarawak
            </option>
            <option value="Selangor" style={{ color: "black" }}>
              Selangor
            </option>
            <option value="Terengganu" style={{ color: "black" }}>
              Terengganu
            </option>
            <option value="Kuala Lumpur" style={{ color: "black" }}>
              Kuala Lumpur
            </option>
            <option value="Labuan" style={{ color: "black" }}>
              Labuan
            </option>
            <option value="Putrajaya" style={{ color: "black" }}>
              Putrajaya
            </option>
          </Select>
        </HStack>
        <Input
          name="address"
          placeholder="School Address"
          _placeholder={{ color: "gray.300" }}
          value={userSchoolDetails.address}
          onChange={handleInputChange}
          isReadOnly={schoolCreated}
        />
      </VStack>
    </RegisterBox>
  );
}

export default schoolDetails;
