import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  SimpleGrid,
  Box,
} from "@chakra-ui/react";

function autoFill({ isOpen, onClose, setFormData, formData, step }) {
  const getAutoFillPreview = () => {
    switch (step) {
      case 1:
        return {
          firstName: "School",
          lastName: "Admin1",
          phoneNumber: "0103314886",
          email: "schooltestacc818@gmail.com",
          password: "P@ssw0rd",
          confirmPassword: "P@ssw0rd",
        };
      case 3:
        return {
          selectedPlan: "standard",
          billingInterval: "monthly",
        };
      case 4:
        return {
          last4Digit: "1234",
          expiryDate: "12/26",
          cardHoldername: "School Admin",
          bank: "Maybank",
        };
      case 5:
        return {
          schoolName: "Sekolah Demo",
          address: "123 Jalan Sekolah",
          city: "Kuala Lumpur",
          country: "Malaysia",
        };
      default:
        return {};
    }
  };

  const formatKey = (key) => {
    const withSpaces = key.replace(/([A-Z])/g, " $1"); // insert space before uppercase letters
    const lowercased = withSpaces.toLowerCase();
    return lowercased.charAt(0).toUpperCase() + lowercased.slice(1); // capitalize first letter
  };

  const handleAutoFill = () => {
    switch (step) {
      case 1:
        setFormData((prev) => ({
          ...prev,
          firstName: "School",
          lastName: "Admin1",
          phoneNumber: "0103314886",
          email: "schooltestacc818@gmail.com",
          password: "P@ssw0rd",
          confirmPassword: "P@ssw0rd",
        }));
        break;
      case 3:
        setFormData((prev) => ({
          ...prev,
          selectedPlan: "standard",
          billingInterval: "monthly",
        }));
        break;
      case 4:
        setFormData((prev) => ({
          ...prev,
          last4Digit: "1234",
          expiryDate: "12/26",
          cardHoldername: "School Admin",
          bank: "Maybank",
        }));
        break;
      case 5:
        setFormData((prev) => ({
          ...prev,
          schoolName: "Sekolah Demo",
          address: "123 Jalan Sekolah",
          city: "Kuala Lumpur",
          country: "Malaysia",
        }));
        break;
      default:
        break;
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent position={"absolute"} right={"0"} top={"0"} margin={4}>
        <ModalHeader>
          <Text>Auto Fill Info?</Text>
          <Text fontSize={"13"}>This will be strictly for demo only</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={2} spacing={4} width="100%">
            {Object.entries(getAutoFillPreview( ))
              .slice(0, 6)
              .map(([key, value]) => (
                <Box key={key}>
                  <Text fontWeight={600}>{formatKey(key)}</Text>
                  <Text>{value}</Text>
                </Box>
              ))}
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost" onClick={handleAutoFill}>
            Auto Fill
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default autoFill;
