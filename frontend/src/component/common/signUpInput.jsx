import React, { useState } from 'react';
import { VStack, Input, InputGroup, InputLeftAddon, InputRightElement, Button } from '@chakra-ui/react';
import { HiOutlineMail } from 'react-icons/hi';
import { FaPhoneAlt } from 'react-icons/fa';
import Tooltips from "../../component/common/toolTips.jsx";
import { useShowToast } from '../../store/utils/toast';

function signUpInput({ accountCreated,
    userDetails,
    setUserDetails,
    emailError,
    setEmailError,
    phoneError,
    setPhoneError,
    passwordError,
    setPasswordError,
    cpasswordError,
    setCPasswordError }) {

    const [show, setShow] = React.useState(false);
    const showToast = useShowToast();
    const handleClick = () => setShow(!show);
    const validatePassword = (password) => {
        const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
            password
        );
        return isValid;
    };

    return (
        <VStack>
            <InputGroup gap={2}>
                <Tooltips createdAccount={accountCreated}>
                    <Input
                        type="text"
                        placeholder="First Name"
                        _placeholder={{ color: "gray.300" }}
                        value={userDetails.firstName}
                        onChange={(e) => {
                            const value = e.target.value;
                            const toastId = "no-digits-toast";

                            if (/\d/.test(value)) {
                                showToast.error(
                                    "Invalid input",
                                    "Numbers are not allowed in the name.",
                                    toastId
                                );
                                return;
                            }

                            setUserDetails((prev) => ({ ...prev, firstName: value }));
                        }}
                        isReadOnly={accountCreated}
                    />
                </Tooltips>
                <Tooltips createdAccount={accountCreated}>
                    <Input
                        type="text"
                        placeholder="Last Name"
                        _placeholder={{ color: "gray.300" }}
                        value={userDetails.lastName}
                        onChange={(e) => {
                            const value = e.target.value;
                            const toastId = "no-digits-toast";

                            if (/\d/.test(value)) {
                                showToast.error(
                                    "Invalid input",
                                    "Numbers are not allowed in the name.",
                                    toastId
                                );
                                return;
                            }

                            setUserDetails((prev) => ({ ...prev, lastName: value }));
                        }}
                        isReadOnly={accountCreated}
                    />
                </Tooltips>
            </InputGroup>

            <InputGroup>
                <InputLeftAddon bg={"gray.300"} color={"black"}>
                    +60
                </InputLeftAddon>
                <InputRightElement pointerEvents="none">
                    <FaPhoneAlt size={15} color="gray.500" />
                </InputRightElement>

                <Tooltips createdAccount={accountCreated}>
                    <Input
                        type="tel"
                        placeholder="Phone Number"
                        _placeholder={{ color: "gray.300" }}
                        value={userDetails.phoneNumber}
                        onChange={(e) =>
                            setUserDetails((prev) => ({
                                ...prev,
                                phoneNumber: e.target.value,
                            }))
                        }
                        onBlur={(e) => {
                            const toastId = "no-phone-toast";
                            let value = e.target.value;

                            if (value.startsWith("0")) {
                                value = value.slice(1);
                            }

                            const isValid = /^1\d{8,9}$/.test(value);

                            setPhoneError(!isValid);

                            if (!isValid) {
                                showToast.error(
                                    "Invalid phone number",
                                    "Please enter a valid Malaysian phone number starting with 1 and 9 digits.",
                                    toastId
                                );
                            }

                            if (value === "" || isValid) {
                                setUserDetails((prev) => ({ ...prev, phoneNumber: value }));
                            }
                        }}
                        maxLength={10} // Only 9 digits after +60
                        isInvalid={phoneError}
                        borderColor={phoneError ? "red.500" : "gray.200"}
                        focusBorderColor={phoneError ? "red.500" : "blue.300"}
                        isReadOnly={accountCreated}
                    />
                </Tooltips>
            </InputGroup>

            <InputGroup>
                <InputRightElement pointerEvents="none">
                    <HiOutlineMail size={25} color="gray.500" />
                </InputRightElement>

                <Tooltips createdAccount={accountCreated}>
                    <Input
                        type="email"
                        placeholder="Email"
                        _placeholder={{ color: "gray.300" }}
                        value={userDetails.email}
                        onChange={(e) =>
                            setUserDetails((prev) => ({ ...prev, email: e.target.value }))
                        }
                        onBlur={() => {
                            const toastId = "no-email-toast";
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            const isValid = emailRegex.test(userDetails.email);

                            setEmailError(!isValid);

                            if (
                                !isValid &&
                                userDetails.email !== "" &&
                                !toast.isActive(toastId)
                            ) {
                                showToast.error(
                                    "Invalid email address",
                                    "Please enter a valid email like example@email.com",
                                    toastId
                                );
                            }
                        }}
                        isInvalid={emailError}
                        borderColor={emailError ? "red.500" : "gray.200"}
                        focusBorderColor={emailError ? "red.500" : "blue.300"}
                        isReadOnly={accountCreated}
                    />
                </Tooltips>
            </InputGroup>

            <InputGroup size="md">
                <Tooltips createdAccount={accountCreated}>
                    <Input
                        pr="4.5rem"
                        type={show ? "text" : "password"}
                        placeholder="Password"
                        _placeholder={{ color: "gray.300" }}
                        value={userDetails.password}
                        onChange={(e) => {
                            const value = e.target.value;
                            setUserDetails((prev) => ({ ...prev, password: value }));
                        }}
                        onBlur={(e) => {
                            const value = e.target.value;
                            const toastId = "invalid-password";

                            const isValid = validatePassword(value);

                            setPasswordError(!isValid);

                            if (!isValid && value.length > 0) {
                                showToast.error(
                                    "Weak Password",
                                    "Must be 8+ characters with uppercase, lowercase, number, and symbol.",
                                    toastId
                                );
                            }
                        }}
                        isInvalid={passwordError}
                        borderColor={passwordError ? "red.500" : "gray.200"}
                        focusBorderColor={passwordError ? "red.500" : "blue.300"}
                        isReadOnly={accountCreated}
                    />
                </Tooltips>
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>

            <InputGroup size="md">
                <Tooltips createdAccount={accountCreated}>
                    <Input
                        pr="4.5rem"
                        type={show ? "text" : "password"}
                        placeholder="Confirm password"
                        _placeholder={{ color: "gray.300" }}
                        value={userDetails.confirmPassword}
                        onChange={(e) => {
                            const value = e.target.value;
                            setUserDetails((prev) => ({ ...prev, confirmPassword: value }));
                        }}
                        onBlur={(e) => {
                            const value = e.target.value;
                            const toastId = "invalid-password";

                            const isValid = validatePassword(value);

                            setCPasswordError(!isValid);

                            if (!isValid && value.length > 0) {
                                showToast.error(
                                    "Weak Password",
                                    "Must be 8+ characters with uppercase, lowercase, number, and symbol.",
                                    toastId
                                );
                                return;
                            }
                        }}
                        isInvalid={cpasswordError}
                        borderColor={cpasswordError ? "red.500" : "gray.200"}
                        focusBorderColor={cpasswordError ? "red.500" : "blue.300"}
                        isReadOnly={accountCreated}
                    />
                </Tooltips>
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </VStack>
    )
}

export default signUpInput