import React, { useState } from "react";
// Pricing plans are hardcoded to match pricing.jsx - no database fetching required
import {
    Box,
    VStack,
    Text,
    HStack,
    Input,
    Button,
    InputGroup,
    InputLeftElement,
    SimpleGrid,

    Select,
    Textarea,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Badge,
    Divider,
    useToast,
} from "@chakra-ui/react";
import {
    CheckIcon
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/auth.js";
import { useBillingStore } from "../../../store/billing.js";
import { useShowToast } from "../../../store/utils/toast.js";
import { CiLogout } from "react-icons/ci";
import ToolTips from "../../../component/common/toolTips.jsx";

import { TbSchool } from "react-icons/tb";

const SchoolSetup = () => {
    const { getCurrentUserWithAuth, logout } = useAuthStore();
    const showToast = useShowToast();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({});

    const [formData, setFormData] = useState({
        // Step 1: School Basic Information
        schoolName: "",
        address: "",
        city: "",
        country: "Malaysia",



        // Step 3: Plan Selection
        selectedPlan: "",

        // Step 4: Payment Information
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
    });

    const [errors, setErrors] = useState({});

    // Hardcoded subscription plans matching pricing.jsx
    // These plans and prices are synchronized with the pricing page
    // Update both files if pricing changes are needed
    const subscriptionPlans = [
        {
            id: "basic",
            name: "Basic",
            price: 99,
            period: "per month",
            features: [
                "Secure User Authentication with MFA option",
                "Personalized Dashboard",
                "Course & Material Management",
                "Student Communication Tools",
                "Grading & Feedback System",
                "View Timetable and Consultation Bookings"
            ],
            color: "blue"
        },
        {
            id: "standard",
            name: "Standard",
            price: 249,
            period: "per month",
            features: [
                "Advanced Assessment & Grading Tools",
                "Student Performance Analytics Dashboard",
                "Teaching Assistant Management & Oversight",
                "Professional Development & Workload Overview",
                "Consultation Booking Management",
                "Internal Academic Messaging System"
            ],
            color: "green"
        },
        {
            id: "premium",
            name: "Premium",
            price: 499,
            period: "per month",
            features: [
                "Research Management Portal",
                "Curriculum Development & Review Access",
                "Career Services Hub",
                "Integrated Grant Application Tracker",
                "Workload Prediction & Balancing Tools",
                "Full Integrated Library Services",
                "Cross-Faculty Collaboration Tools"
            ],
            color: "purple"
        }
    ];

    const steps = [
        "School Information",
        "Plan Selection",
        "Payment & Setup"
    ];



    const malaysianStates = [
        "Johor",
        "Kedah",
        "Kelantan",
        "Melaka",
        "Negeri Sembilan",
        "Pahang",
        "Perak",
        "Perlis",
        "Pulau Pinang",
        "Sabah",
        "Sarawak",
        "Selangor",
        "Terengganu",
        "Kuala Lumpur",
        "Labuan",
        "Putrajaya"
    ];

    const handleLogout = async () => {
        const res = await logout();
        if (res.success) {
            showToast.success(
                "Logged out successfully",
                res.message
            );
            navigate("/login");
        } else {
            showToast.error(
                "Failed to log out",
                res.message
            );
        }
    };

    const validateField = (name, value) => {
        switch (name) {
            case "schoolName":
                return value.length < 3 ? "School name must be at least 3 characters" : "";
            case "cardNumber":
                if (!value.trim()) return "Card number is required";
                const cleanCardNumber = value.replace(/\s/g, '');
                if (!/^\d{13,19}$/.test(cleanCardNumber)) {
                    return "Card number must be 13-19 digits";
                }
                return "";
            case "expiryDate":
                if (!value.trim()) return "Expiry date is required";
                if (!/^\d{2}\/\d{2}$/.test(value)) {
                    return "Use MM/YY format";
                }
                const [month, year] = value.split('/');
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear() % 100;
                const currentMonth = currentDate.getMonth() + 1;

                if (parseInt(month) < 1 || parseInt(month) > 12) {
                    return "Invalid month";
                }
                if (parseInt(year) < currentYear ||
                    (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                    return "Card has expired";
                }
                return "";
            case "cvv":
                if (!value.trim()) return "CVV is required";
                if (!/^\d{3,4}$/.test(value)) {
                    return "CVV must be 3-4 digits";
                }
                return "";
            case "cardholderName":
                if (!value.trim()) return "Cardholder name is required";
                if (value.length < 2) return "Cardholder name must be at least 2 characters";
                return "";
            default:
                return value.trim() === "" ? "This field is required" : "";
        }
    };



    const handleInputChange = (name, value) => {
        let formattedValue = value;

        // Format card number with spaces
        if (name === "cardNumber") {
            const cleanValue = value.replace(/\s/g, '');
            if (cleanValue.length <= 19) {
                formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
            }
        }

        // Format expiry date
        if (name === "expiryDate") {
            const cleanValue = value.replace(/\D/g, '');
            if (cleanValue.length <= 4) {
                if (cleanValue.length >= 2) {
                    formattedValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
                } else {
                    formattedValue = cleanValue;
                }
            }
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        if (touched[name]) {
            const error = validateField(name, formattedValue);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const canProceedToNext = () => {
        const currentStepFields = getCurrentStepFields();
        return currentStepFields.every(field => {
            const value = formData[field];
            return value.trim() !== "" && !errors[field];
        });
    };

    const getCurrentStepFields = () => {
        switch (currentStep) {
            case 1:
                return ["schoolName", "address", "city", "country"];
            case 2:
                return ["selectedPlan"];
            case 3:
                return ["cardNumber", "expiryDate", "cvv", "cardholderName"];
            default:
                return [];
        }
    };

    const nextStep = () => {
        if (canProceedToNext()) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            console.log('Starting school setup process...');
            const currentUser = await getCurrentUserWithAuth();
            console.log('User ID:', currentUser.user.id);
            console.log('Form data:', formData);

            // Check if school already exists for this user
            let schoolId;
            schoolId = await useAuthStore.getState().getSchoolId();

            if (schoolId) {

                // Check if subscription exists
                const existingSubscriptions = await useBillingStore.getState().getSubscriptionsBySchoolId(schoolId);

                if (existingSubscriptions.success && existingSubscriptions.data.length > 0) {
                    // Setup is already complete
                    showToast.success(
                        "School setup already completed!",
                        "Your school is already set up and ready to use."
                    );
                    navigate("/admin-dashboard");
                    return;
                }

                // School exists but no subscription - continue with subscription creation
                console.log('Resuming setup for existing school:', schoolId);
            } else {
                // Step 1: Create the school record
                const schoolData = {
                    userId: currentUser.user.id,
                    name: formData.schoolName,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    status: "Active"
                };

                const schoolResponse = await useBillingStore.getState().createSchool(schoolData);
                if (!schoolResponse.success) {
                    throw new Error(schoolResponse.message);
                }
                console.log('School created:', schoolResponse);
                schoolId = schoolResponse.id;
            }

            // Step 2: Create the subscription record
            const selectedPlan = subscriptionPlans.find(p => p.id === formData.selectedPlan);
            const subscriptionData = {
                schoolId: schoolId,
                plan: selectedPlan.name, // Changed from planName to plan
                price: selectedPlan.price,
                billingInterval: "Monthly", // Changed from duration to billingInterval with proper casing
                status: 'Active',
                startDate: new Date().toISOString()
            };

            const subscriptionResponse = await useBillingStore.getState().createSubscription(subscriptionData);
            if (!subscriptionResponse.success) {
                throw new Error(subscriptionResponse.message);
            }
            console.log('Subscription created:', subscriptionResponse);
            const subscriptionId = subscriptionResponse.id;

            console.log('Creating payment with schoolId:', schoolId);
            // Step 3: Create the payment record
            const paymentData = {
                schoolId: schoolId,
                cardHolderName: formData.cardholderName,
                last4Digit: formData.cardNumber.slice(-4),
                expiryDate: formData.expiryDate,
                paymentMethod: formData.cardNumber.startsWith('4') ? 'VISA' : 'MasterCard',
                status: 'success'
            };

            const paymentResponse = await useBillingStore.getState().createPayment(paymentData);
            if (!paymentResponse.success) {
                throw new Error(paymentResponse.message);
            }
            console.log('Payment created:', paymentResponse);
            const paymentId = paymentResponse.id;

            console.log('Creating invoice with subscriptionId:', subscriptionId);
            // Step 4: Create the invoice record with subscription ID
            const invoiceData = {
                paymentId: paymentId,
                subscriptionId: subscriptionId, // Use the created subscription ID
                schoolId: schoolId,
                amount: selectedPlan.price
            };

            const invoiceResponse = await useBillingStore.getState().createInvoice(invoiceData);
            if (!invoiceResponse.success) {
                throw new Error(invoiceResponse.message);
            }

            console.log('All records created successfully!');
            showToast.success(
                "School setup completed successfully!",
                "Your school has been set up and is ready to use."
            );
            navigate("/admin-dashboard");

        } catch (error) {
            console.error('School setup error:', error);

            // If we created a school but failed later, offer to retry
            if (error.message.includes('school') || error.message.includes('School')) {
                showToast.error(
                    "School setup failed",
                    "The school was created but other steps failed. You can retry the setup."
                );
            } else {
                showToast.error(
                    "Failed to complete school setup",
                    error.message || "Please try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <VStack spacing={6} align="stretch">
            <Heading size="md" textAlign="center" color="blue.600">
                Basic School Information
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="stretch">
                    <Text fontWeight="semibold">School Name *</Text>
                    <Input
                        placeholder="Enter school name"
                        value={formData.schoolName}
                        onChange={(e) => handleInputChange("schoolName", e.target.value)}
                        onBlur={() => handleBlur("schoolName")}
                        isInvalid={errors.schoolName}
                        errorBorderColor="red.300"
                    />
                    {errors.schoolName && <Text color="red.500" fontSize="sm">{errors.schoolName}</Text>}
                </VStack>



                <VStack align="stretch">
                    <Text fontWeight="semibold">Address *</Text>
                    <Textarea
                        placeholder="Enter full address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        onBlur={() => handleBlur("address")}
                        isInvalid={errors.address}
                        errorBorderColor="red.300"
                    />
                    {errors.address && <Text color="red.500" fontSize="sm">{errors.address}</Text>}
                </VStack>

                <VStack align="stretch">
                    <Text fontWeight="semibold">City/State *</Text>
                    <Select
                        placeholder="Select city/state"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        onBlur={() => handleBlur("city")}
                        isInvalid={errors.city}
                        errorBorderColor="red.300"
                    >
                        {malaysianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </Select>
                    {errors.city && <Text color="red.500" fontSize="sm">{errors.city}</Text>}
                </VStack>

                <VStack align="stretch">
                    <Text fontWeight="semibold">Country *</Text>
                    <ToolTips
                        createdAccount={true}
                        message="CampusHub is only available within Malaysia"
                    >
                        <Input
                            value={formData.country}
                            isReadOnly
                            bg="gray.100"
                            _readOnly={{ bg: "gray.100" }}
                            cursor="help"
                        />
                    </ToolTips>
                </VStack>


            </SimpleGrid>
        </VStack>
    );



    const renderStep2 = () => (
        <VStack spacing={6} align="stretch">
            <Heading size="md" textAlign="center" color="blue.600">
                Choose Your Subscription Plan
            </Heading>

            <Text textAlign="center" color="gray.600">
                Select a plan that best fits your school's needs
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {subscriptionPlans.map((plan) => (
                    <Card
                        key={plan.id}
                        border={formData.selectedPlan === plan.id ? `3px solid ${plan.color}.500` : "1px solid"}
                        borderColor={formData.selectedPlan === plan.id ? `${plan.color}.500` : "gray.200"}
                        bg={formData.selectedPlan === plan.id ? `${plan.color}.50` : "white"}
                        cursor="pointer"
                        onClick={() => handleInputChange("selectedPlan", plan.id)}
                        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                        transition="all 0.2s"
                        position="relative"
                        overflow="hidden"
                    >
                        {formData.selectedPlan === plan.id && (
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                h={1}
                                bg={`${plan.color}.500`}
                            />
                        )}
                        <CardBody textAlign="center">
                            <Badge
                                colorScheme={plan.color}
                                mb={3}
                                p={2}
                                borderRadius="full"
                                position="relative"
                            >
                                {formData.selectedPlan === plan.id && (
                                    <CheckIcon
                                        position="absolute"
                                        top={-1}
                                        right={-1}
                                        color="white"
                                        bg="green.500"
                                        borderRadius="full"
                                        p={1}
                                        boxSize={4}
                                    />
                                )}
                                {plan.name}
                            </Badge>
                            <Heading size="lg" color={`${plan.color}.600`} mb={2}>
                                RM {plan.price}
                            </Heading>
                            <Text color="gray.500" mb={2}>
                                {plan.period}
                            </Text>
                            <Divider mb={4} />
                            <VStack align="stretch" spacing={2}>
                                {plan.features.map((feature, index) => (
                                    <Text key={index} fontSize="sm" color="gray.600">
                                        ✓ {feature}
                                    </Text>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>

            {errors.selectedPlan && (
                <Text color="red.500" fontSize="sm" textAlign="center">
                    {errors.selectedPlan}
                </Text>
            )}
        </VStack>
    );

    const renderStep3 = () => (
        <VStack spacing={6} align="stretch">
            <Heading size="md" textAlign="center" color="blue.600">
                Payment Information
            </Heading>

            <Text textAlign="center" color="gray.600">
                Complete your school setup with secure payment
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="stretch">
                    <Text fontWeight="semibold">Card Number *</Text>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <TbSchool color="gray.300" />
                        </InputLeftElement>
                        <Input
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                            onBlur={() => handleBlur("cardNumber")}
                            isInvalid={errors.cardNumber}
                            errorBorderColor="red.300"
                            maxLength={23}
                        />
                    </InputGroup>
                    {errors.cardNumber && <Text color="red.500" fontSize="sm">{errors.cardNumber}</Text>}
                    {!errors.cardNumber && formData.cardNumber && (
                        <Text color="green.500" fontSize="sm">✓ Valid card number</Text>
                    )}
                </VStack>

                <VStack align="stretch">
                    <Text fontWeight="semibold">Cardholder Name *</Text>
                    <Input
                        placeholder="Enter cardholder name"
                        value={formData.cardholderName}
                        onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                        onBlur={() => handleBlur("cardholderName")}
                        isInvalid={errors.cardholderName}
                        errorBorderColor="red.300"
                    />
                    {errors.cardholderName && <Text color="red.500" fontSize="sm">{errors.cardholderName}</Text>}
                </VStack>

                <VStack align="stretch">
                    <Text fontWeight="semibold">Expiry Date *</Text>
                    <Input
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        onBlur={() => handleBlur("expiryDate")}
                        isInvalid={errors.expiryDate}
                        errorBorderColor="red.300"
                        maxLength={5}
                    />
                    {errors.expiryDate && <Text color="red.500" fontSize="sm">{errors.expiryDate}</Text>}
                    {!errors.expiryDate && formData.expiryDate && formData.expiryDate.length === 5 && (
                        <Text color="green.500" fontSize="sm">✓ Valid expiry date</Text>
                    )}
                </VStack>

                <VStack align="stretch">
                    <Text fontWeight="semibold">CVV *</Text>
                    <Input
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        onBlur={() => handleBlur("cvv")}
                        isInvalid={errors.cvv}
                        errorBorderColor="red.300"
                        maxLength={4}
                    />
                    {errors.cvv && <Text color="red.500" fontSize="sm">{errors.cvv}</Text>}
                    {!errors.cvv && formData.cvv && (formData.cvv.length === 3 || formData.cvv.length === 4) && (
                        <Text color="green.500" fontSize="sm">✓ Valid CVV</Text>
                    )}
                </VStack>
            </SimpleGrid>

            <Box bg="blue.50" p={4} borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800" textAlign="center">
                    <strong>Selected Plan:</strong> {subscriptionPlans.find(p => p.id === formData.selectedPlan)?.name || 'None'}
                </Text>
            </Box>
        </VStack>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return renderStep1();
        }
    };

    return (
        <Box flex={1}>
            <Button
                leftIcon={<CiLogout />}
                position="absolute"
                colorScheme="red"
                top={4}
                right={4}
                onClick={() => handleLogout()}
            >
                Log Out
            </Button>
            <Box maxW="6xl" mx="auto" px={4}>
                {/* Header */}
                <VStack spacing={6} mb={8}>
                    <Heading size="xl" color="blue.600" textAlign="center">
                        Complete Your School Setup
                    </Heading>
                    <Text color="gray.600" textAlign="center" maxW="2xl">
                        Welcome to CampusHub! Let's get your school set up and running.
                        Complete the following steps to start managing your campus efficiently.
                    </Text>
                </VStack>

                {/* Progress Steps */}
                <Box mb={8}>
                    <HStack spacing={4} justify="center" flexWrap="wrap">
                        {steps.map((step, index) => (
                            <HStack
                                key={index}
                                spacing={2}
                                p={3}
                                borderRadius="full"
                                bg={currentStep > index + 1 ? "green.100" : currentStep === index + 1 ? "blue.100" : "gray.100"}
                                color={currentStep > index + 1 ? "green.700" : currentStep === index + 1 ? "blue.700" : "gray.600"}
                                border={currentStep === index + 1 ? "2px solid" : "1px solid"}
                                borderColor={currentStep === index + 1 ? "blue.500" : "transparent"}
                            >
                                <Box
                                    w={6}
                                    h={6}
                                    borderRadius="full"
                                    bg={currentStep > index + 1 ? "green.500" : currentStep === index + 1 ? "blue.500" : "gray.400"}
                                    color="white"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    fontSize="sm"
                                    fontWeight="bold"
                                >
                                    {currentStep > index + 1 ? "✓" : index + 1}
                                </Box>
                                <Text fontWeight="semibold" fontSize="sm">
                                    {step}
                                </Text>
                            </HStack>
                        ))}
                    </HStack>
                </Box>

                {/* Main Content */}
                <Card>
                    <CardBody p={8}>
                        {renderCurrentStep()}
                    </CardBody>
                </Card>

                {/* Navigation Buttons */}
                <HStack spacing={4} justify="center" mt={8}>
                    {currentStep > 1 && (
                        <Button
                            onClick={prevStep}
                            variant="outline"
                            size="lg"
                            px={8}
                        >
                            Previous
                        </Button>
                    )}

                    {currentStep < steps.length ? (
                        <Button
                            onClick={nextStep}
                            colorScheme="blue"
                            size="lg"
                            px={8}
                            isDisabled={!canProceedToNext()}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            colorScheme="green"
                            size="lg"
                            px={8}
                            isLoading={isLoading}
                            loadingText="Setting up..."
                            isDisabled={!canProceedToNext()}
                        >
                            Complete Setup
                        </Button>
                    )}
                </HStack>
            </Box>
        </Box>
    );
};

export default SchoolSetup;
