import { useState } from "react";
import {
    Box,
    Button,
    Heading,
    Input,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../api/auth/signIn"; // ✅ Your login function

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn({ email, password });
            navigate("/");
        } catch (err) {
            console.error("Login failed", err);
            toast({
                title: "Login failed.",
                description: "Please check your credentials and try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const bg = useColorModeValue("gray.100", "gray.800");
    const inputBg = useColorModeValue("white", "gray.700");
    const inputBorder = useColorModeValue("gray.300", "gray.600");

    return (
        <Box height="100vh" width={"100vw"} bg={bg} display="flex" alignItems="center" justifyContent="center">
            <Box p={6} borderRadius="lg" boxShadow="md" bg={useColorModeValue("white", "gray.900")} width="100%" maxW="360px">
                <Heading mb={6} size="lg" textAlign="center">Login</Heading>
                <Input
                    mb={4}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                />
                <Input
                    mb={6}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorder}
                />
                <Button colorScheme="blue" width="100%" isLoading={isLoading} onClick={handleLogin}>
                    Sign In
                </Button>
            </Box>
        </Box>
    );
}
