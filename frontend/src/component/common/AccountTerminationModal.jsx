import React, { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Text,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Box,
} from '@chakra-ui/react'
import { GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"

function AccountTerminationModal({ isOpen, onClose, onConfirm, userEmail }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isValidating, setIsValidating] = useState(false)
    const [validationError, setValidationError] = useState('')
    const [isOAuthLoading, setIsOAuthLoading] = useState(false)
    const [authMethod, setAuthMethod] = useState('') // 'password' or 'google'
    const toast = useToast()

    const handleValidation = async () => {
        if (!email || !password) {
            setValidationError('Please enter both email and password')
            return
        }

        if (email !== userEmail) {
            setValidationError('Email does not match your account email')
            return
        }

        setIsValidating(true)
        setValidationError('')
        setAuthMethod('password')

        try {
            // Validate credentials by attempting to authenticate
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })

            const responseData = await response.json()
            console.log("🚀 ~ handleValidation ~ response:", responseData)

            if (response.ok) {
                // Credentials are valid, proceed to confirmation
                onConfirm()
                onClose()
            } else {
                setValidationError(responseData.message || 'Invalid email or password')
            }
        } catch (error) {
            console.error('Validation error:', error)
            setValidationError('An error occurred during validation. Please try again.')
        } finally {
            setIsValidating(false)
        }
    }

    const handleGoogleAuth = async (credentialResponse) => {
        try {
            setIsOAuthLoading(true)
            setValidationError('')
            setAuthMethod('google')

            const decodedCredential = jwtDecode(credentialResponse.credential)

            // Check if the Google email matches the user's account email
            if (decodedCredential.email !== userEmail) {
                setValidationError('Google account email does not match your account email')
                return
            }

            // Validate Google authentication by calling the Google validation endpoint
            const response = await fetch('/auth/google-validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: decodedCredential.email,
                    googleId: decodedCredential.sub,
                    name: decodedCredential.name,
                    profilePicture: decodedCredential.picture,
                    provider: 'google',
                    providerId: decodedCredential.sub
                })
            })

            const responseData = await response.json()

            if (response.ok) {
                // Google authentication successful, proceed to confirmation
                onConfirm()
                onClose()
            } else {
                setValidationError(responseData.message || 'Google authentication failed')
            }
        } catch (error) {
            console.error('Google auth error:', error)
            setValidationError('An error occurred during Google authentication. Please try again.')
        } finally {
            setIsOAuthLoading(false)
        }
    }

    const handleClose = () => {
        setEmail('')
        setPassword('')
        setValidationError('')
        setAuthMethod('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="red.600">⚠️ Terminate Account</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="warning">
                            <AlertIcon />
                            <Text fontSize="sm">
                                This action will permanently delete your account, school, and all related data.
                                This cannot be undone.
                            </Text>
                        </Alert>

                        <Text fontSize="sm" color="gray.600">
                            To confirm account termination, please authenticate using one of the methods below:
                        </Text>

                        <Alert status="info">
                            <AlertIcon />
                            <Text fontSize="sm">
                                <strong>Note:</strong> After validation, you will be shown a final confirmation dialog before any data is deleted.
                            </Text>
                        </Alert>

                        {/* Google OAuth Option */}
                        <Box textAlign="left">
                            <Text fontSize="sm" color="gray.600" mb={3}>
                                <strong>Option 1:</strong> Verify with Google
                            </Text>
                            <GoogleLogin
                                onSuccess={handleGoogleAuth}
                                onError={() => {
                                    console.log('Google OAuth Failed')
                                    setIsOAuthLoading(false)
                                    setValidationError('Google authentication failed. Please try again or use password verification.')
                                }}
                            />
                            {isOAuthLoading && authMethod === 'google' && (
                                <Box textAlign="center" mt={2}>
                                    <Text color="blue.400" fontSize="sm">
                                        Processing Google authentication...
                                    </Text>
                                </Box>
                            )}
                        </Box>

                        {/* Divider */}
                        <Box position="relative" my={2}>
                            <Box
                                position="absolute"
                                top="50%"
                                left="0"
                                right="0"
                                height="1px"
                                bg="gray.300"
                            />
                            <Text
                                position="relative"
                                bg="white"
                                px={4}
                                color="gray.500"
                                fontSize="sm"
                                textAlign="center"
                                display="inline-block"
                                left="50%"
                                transform="translateX(-50%)"
                            >
                                OR
                            </Text>
                        </Box>

                        {/* Password Option */}
                        <Box>
                            <Text fontSize="sm" color="gray.600" mb={3}>
                                <strong>Option 2:</strong> Verify with Password
                            </Text>
                            <VStack spacing={3}>
                                <FormControl isRequired>
                                    <FormLabel>Email Address</FormLabel>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        isDisabled={isValidating || isOAuthLoading}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        isDisabled={isValidating || isOAuthLoading}
                                    />
                                </FormControl>
                            </VStack>
                        </Box>

                        {validationError && (
                            <Alert status="error">
                                <AlertIcon />
                                {validationError}
                            </Alert>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isValidating || isOAuthLoading}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleValidation}
                        isLoading={isValidating}
                        loadingText="Validating..."
                        leftIcon={isValidating ? <Spinner size="sm" /> : undefined}
                        _hover={{ bg: 'red.600' }}
                        isDisabled={!email || !password || isOAuthLoading}
                    >
                        Validate & Continue
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default AccountTerminationModal
