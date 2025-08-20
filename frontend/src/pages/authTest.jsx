import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Grid,
    GridItem,
    Card,
    CardBody,
    CardHeader,
    useToast,
    Badge,
    Divider,
    List,
    ListItem,
    ListIcon
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import { useAuthStore } from '../store/auth.js';

const AuthTest = () => {
    const [status, setStatus] = useState({ message: '', type: 'info' });
    const [cookieInfo, setCookieInfo] = useState('No cookies found');
    const [userInfo, setUserInfo] = useState('Not logged in');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const { logIn, logout, authorizeUser, generateDevToken } = useAuthStore();

    // User credentials
    const USERS = {
        companyAdmin: {
            email: 'acampushub@gmail.com',
            password: 'P@ssw0rd$$',
            name: 'Company Administrator',
            role: 'companyAdmin'
        },
        schoolAdmin: {
            email: 'schooltestacc818@gmail.com',
            password: 'P@ssw0rd$$',
            name: 'School Administrator APU',
            role: 'schoolAdmin'
        },
        schoolAdmin2: {
            email: 'admin@bpu.edu.my',
            password: 'P@ssw0rd$$',
            name: 'School Administrator BPU',
            role: 'schoolAdmin'
        },
        student: {
            email: 'studentcampushub@gmail.com',
            password: 'P@ssw0rd$$',
            name: 'APU Student User',
            role: 'student'
        },
        student3: {
            email: 'student2@student.apu.edu.my',
            password: 'password123',
            name: 'APU Student User 2',
            role: 'student'
        },
        student2: {
            email: 'student0@student.bpu.edu.my',
            password: 'password123',
            name: 'BPU Student User',
            role: 'student'
        },
        lecturer: {
            email: 'john.smith@bpu.edu.my',
            password: 'password123',
            name: 'Jane Lee',
            role: 'lecturer'
        },
    };

    const showStatus = (message, type = 'info') => {
        setStatus({ message, type });
    };

    const updateCookieInfo = () => {
        const cookies = document.cookie;
        setCookieInfo(cookies || 'No cookies found');
    };

    const updateUserInfo = (userData) => {
        if (userData) {
            setUserInfo(JSON.stringify(userData, null, 2));
        } else {
            setUserInfo('Click Check Auth Status');
        }
    };

    const loginUser = async (role) => {
        const user = USERS[role];
        if (!user) {
            showStatus('❌ Invalid user role', 'error');
            return;
        }

        setIsLoading(true);
        try {
            showStatus(`🔄 Logging in as ${user.name}...`, 'info');

            const result = await logIn(
                { email: user.email, password: user.password }
            );

            if (result.success) {
                showStatus(`✅ Successfully logged in as ${user.name}!`, 'success');
                updateCookieInfo();
                toast({
                    title: 'Login Successful',
                    description: `Logged in as ${user.name}`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                showStatus(`❌ Login failed: ${result.message}`, 'error');
                toast({
                    title: 'Login Failed',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            showStatus(`❌ Error: ${error.message}`, 'error');
            toast({
                title: 'Connection Error',
                description: 'Make sure your backend server is running on port 5000',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const logoutUser = async () => {
        setIsLoading(true);
        try {
            showStatus('🔄 Logging out...', 'info');

            const result = await logout();

            if (result.success) {
                showStatus('✅ Successfully logged out!', 'success');
                updateCookieInfo();
                updateUserInfo(null);
                toast({
                    title: 'Logout Successful',
                    description: 'You have been logged out',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                showStatus(`❌ Logout failed: ${result.message}`, 'error');
            }
        } catch (error) {
            showStatus(`❌ Error: ${error.message}`, 'error');
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            showStatus('🔍 Checking authentication status...', 'info');

            const result = await authorizeUser();

            if (result.success) {
                showStatus(`✅ Authenticated as ${result.role || 'user'}`, 'success');
                updateUserInfo(result.data);
            } else {
                showStatus(`❌ Not authenticated: ${result.message}`, 'error');
                updateUserInfo(null);
            }
        } catch (error) {
            showStatus(`❌ Error: ${error.message}`, 'error');
            console.error('Auth check error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearCookies = () => {
        // Clear all cookies for this domain
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }

        showStatus('🗑️ Cookies cleared!', 'success');
        updateCookieInfo();
        updateUserInfo(null);
        toast({
            title: 'Cookies Cleared',
            description: 'All cookies have been removed',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
    };

    useEffect(() => {
        updateCookieInfo();
        updateUserInfo(null);
    }, []);

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box textAlign="center">
                    <Heading size="xl" mb={2}>🔐 CampusHub Authentication Test</Heading>
                    <Text fontSize="lg" color="gray.600">
                        Test different user roles and see cookies in your browser
                    </Text>
                </Box>

                <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>💡 Instructions:</AlertTitle>
                        <AlertDescription>
                            <List spacing={1} mt={2}>
                                <ListItem>Click on a user role to login</ListItem>
                                <ListItem>Check the "Cookie Info" section to see the token</ListItem>
                                <ListItem>Use browser dev tools (F12) → Application → Cookies to see stored cookies</ListItem>
                            </List>
                        </AlertDescription>
                    </Box>
                </Alert>

                <Box>
                    <Heading size="lg" mb={4}>👥 Available Users</Heading>
                    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                        {Object.entries(USERS).map(([role, user]) => (
                            <GridItem key={role}>
                                <Card
                                    cursor="pointer"
                                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                                    transition="all 0.3s ease"
                                    onClick={() => !isLoading && loginUser(role)}
                                    opacity={isLoading ? 0.6 : 1}
                                    pointerEvents={isLoading ? 'none' : 'auto'}
                                >
                                    <CardHeader>
                                        <Heading size="md">
                                            {role === 'companyAdmin' && '🏢'}
                                            {role === 'schoolAdmin' && '🏫'}
                                            {role === 'lecturer' && '👨‍🏫'}
                                            {role === 'student' && '🎓'}
                                            {' '}{user.name}
                                        </Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <VStack align="start" spacing={2}>
                                            <Text><strong>Email:</strong> {user.email}</Text>
                                            <Text><strong>Role:</strong> <Badge colorScheme="blue">{user.role}</Badge></Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        ))}
                    </Grid>
                </Box>

                <HStack spacing={4} justify="center">
                    <Button
                        colorScheme="red"
                        onClick={logoutUser}
                        isLoading={isLoading}
                        leftIcon={<InfoIcon />}
                    >
                        🚪 Logout
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={checkAuth}
                        isLoading={isLoading}
                        leftIcon={<InfoIcon />}
                    >
                        🔍 Check Auth Status
                    </Button>
                    <Button
                        colorScheme="orange"
                        onClick={clearCookies}
                        leftIcon={<InfoIcon />}
                    >
                        🗑️ Clear Cookies
                    </Button>
                </HStack>


                {status.message && (
                    <Alert status={status.type} borderRadius="md">
                        <AlertIcon />
                        <AlertTitle>{status.message}</AlertTitle>
                    </Alert>
                )}

                <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
                    <Card>
                        <CardHeader>
                            <Heading size="md">🍪 Cookie Information</Heading>
                        </CardHeader>
                        <CardBody>
                            <Box
                                bg="gray.50"
                                p={4}
                                borderRadius="md"
                                fontFamily="mono"
                                fontSize="sm"
                                whiteSpace="pre-wrap"
                                maxH="200px"
                                overflowY="auto"
                            >
                                {cookieInfo}
                            </Box>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Heading size="md">👤 Current User</Heading>
                        </CardHeader>
                        <CardBody>
                            <Box
                                bg="gray.50"
                                p={4}
                                borderRadius="md"
                                fontFamily="mono"
                                fontSize="sm"
                                whiteSpace="pre-wrap"
                                maxH="200px"
                                overflowY="auto"
                            >
                                {userInfo}
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>

                <Card>
                    <CardHeader>
                        <Heading size="md">🔧 How to Check Cookies in Browser</Heading>
                    </CardHeader>
                    <CardBody>
                        <List spacing={3}>
                            <ListItem>
                                <ListIcon as={CheckCircleIcon} color="green.500" />
                                Press <strong>F12</strong> to open Developer Tools
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckCircleIcon} color="green.500" />
                                Go to <strong>Application</strong> tab (Chrome) or <strong>Storage</strong> tab (Firefox)
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckCircleIcon} color="green.500" />
                                Click on <strong>Cookies</strong> → <strong>http://localhost:5000</strong>
                            </ListItem>
                            <ListItem>
                                <ListIcon as={CheckCircleIcon} color="green.500" />
                                You should see a <strong>token</strong> cookie with your JWT
                            </ListItem>
                        </List>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
};

export default AuthTest; 