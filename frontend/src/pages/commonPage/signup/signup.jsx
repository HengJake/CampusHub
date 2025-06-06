// SignUp component
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  RadioGroup,
  HStack,
  Radio,
  Input,
  Flex,
  Select,
  Button,
} from "@chakra-ui/react";

function SignUp() {

  const handleSignUp = () => {
    // Handle sign-up logic here
    console.log("Sign-up button clicked");
  }

  return (
    <Flex
      minH="calc(100vh - 64px)"
      justify="center"
      align="center"
      bg="gray.50" // Optional: background for the full screen
    >
      <FormControl
        as="fieldset"
        bgGradient="linear(to-b, blue.500, blue.700)"
        p={4}
        borderRadius="md"
        flexDirection="column"
        gap={4}
        width={"fit-content"}
      >
        <Input
          placeholder="Enter your name"
          size="md"
          variant="filled"
          colorScheme="blue"
          borderColor="blue.500"
          _hover={{ borderColor: "blue.600" }}
          _focus={{ borderColor: "blue.700", boxShadow: "0 0 0 1px blue.300" }}
          _placeholder={{ color: "blue.400" }}
          mb={4}
        />
        <Input
          placeholder="Enter your email"
          size="md"
          variant="filled"
          colorScheme="blue"
          borderColor="blue.500"
          _hover={{ borderColor: "blue.600" }}
          _focus={{ borderColor: "blue.700", boxShadow: "0 0 0 1px blue.300" }}
          _placeholder={{ color: "blue.400" }}
        />
        <FormLabel mt={2} color="white">
          Select University
        </FormLabel>
        <Select
          placeholder="Select your university"
          variant="filled"
          size="md"
          bg="white"
          color="black"
          mb={4}
        >
          <option value="utm">Universiti Teknologi Malaysia (UTM)</option>
          <option value="um">University of Malaya (UM)</option>
          <option value="ukm">Universiti Kebangsaan Malaysia (UKM)</option>
          <option value="usm">Universiti Sains Malaysia (USM)</option>
          <option value="uitm">Universiti Teknologi MARA (UiTM)</option>
        </Select>

        <Button mt={4} colorScheme="teal" type="submit" onClick={handleSignUp}>
          Submit
        </Button>
      </FormControl>
    </Flex>
  );
}

export default SignUp;
