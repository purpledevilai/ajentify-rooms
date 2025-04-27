import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  Flex,
  Heading,
  useColorModeValue,
  useColorMode,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

function SetRoomId() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const { colorMode, toggleColorMode } = useColorMode();

  const handleJoin = () => {
    if (!roomId.trim()) return;
    navigate(`/room/${roomId.trim()}`);
  };

  const handleJoinTranslatorRoom = () => {
    if (!roomId.trim()) return;
    navigate(`/translator-room/${roomId.trim()}`);
  };

  const bg = useColorModeValue("gray.100", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const boxShadow = useColorModeValue("md", "lg-dark");

  return (
    <Box height="100vh" width="100vw" bg={bg} position="relative" p={4}>
      {/* Color Mode Toggle Button */}
      <IconButton
        icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        aria-label="Toggle color mode"
        position="absolute"
        top="16px"
        left="16px"
        onClick={toggleColorMode}
        variant="ghost"
      />

      {/* Main Content */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="100%"
        width="100%"
      >
        <Box
          width="100%"
          maxW="360px"
          bg={useColorModeValue("white", "gray.900")}
          borderRadius="lg"
          p={6}
          boxShadow={boxShadow}
        >
          <Heading mb={4} size="lg" textAlign="center">
            Enter a Room ID
          </Heading>
          <Text fontSize="sm" mb={4} textAlign="center" color="gray.500">
            Type a name or code to join a room.
          </Text>
          <Input
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            mb={4}
            bg={inputBg}
            borderColor={inputBorder}
            _focus={{
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
          />
          <Flex
            direction="column"
            gap={2}
          >
            <Button width="100%" onClick={handleJoin} colorScheme="brand">
              Join
            </Button>
            <Button width="100%" onClick={handleJoinTranslatorRoom} colorScheme="brand">
              Translator Room✨
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default SetRoomId;
