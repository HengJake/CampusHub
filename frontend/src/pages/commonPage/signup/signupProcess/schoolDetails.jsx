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

function schoolDetails({
  handleData,
  onBack,
  userSchoolDetails,
  setUserSchoolDetails,
}) {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserSchoolDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <RegisterBox
      heading={"School Information"}
      onBack={onBack}
      buttonClick={() => handleData(userSchoolDetails)}
      buttonText="Complete Registration"
    >
      <VStack>
        <Input
          name="schoolName"
          placeholder="School Name"
          _placeholder={{ color: "gray.300" }}
          value={userSchoolDetails.schoolName}
          onChange={handleInputChange}
        />
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
        />
      </VStack>
    </RegisterBox>
  );
}

export default schoolDetails;
