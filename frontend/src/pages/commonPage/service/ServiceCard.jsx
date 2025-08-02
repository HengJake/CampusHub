import { Box, Text, Button } from "@chakra-ui/react";
import React from "react";

const ServiceCard = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <Box
      width={"100%"}
      height={"fit-content"}
      minH={"351px"}
      p={"20px"}
      display={"flex"}
      flexDirection={"column"}
      alignContent={"center"}
      bgColor={"#F8F9FA"}
      boxShadow="0px 4px 10px rgba(0, 0, 0, 0.15)"
    >
      <Box paddingTop={"40px"} fontWeight={"medium"} fontSize={"20px"}>
        {icon}
        <br />
        {title}
        <Text
          fontSize={"16px"}
          paddingTop={"5px"}
          fontWeight={"normal"}
          color={"rgba(0, 0, 0, 0.46)"}
        >
          {description}
        </Text>
        <br />
        <Box width={"100%"}>
          <Button
            width={"100%"}
            height={"40px"}
            fontSize={"16px"}
            fontWeight={"normal"}
            borderRadius={"0px"}
            bgColor={"#FF5656"}
            color={"white"}
            _hover={{ bg: "#D34949" }}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ServiceCard;
