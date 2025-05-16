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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

// 🔧 Config: List of agents and their IDs
const AGENTS = [
  { id: "201cdebe-5c29-45b9-ba4c-56d10d9ae84c", name: "Convo-Bot" },
  { id: "f00db1f4-7545-4c68-be43-450033db5d2d", name: "Shana's Sourdough" },
];

function SetRoomId() {
  const [roomId, setRoomId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(AGENTS[0].id);
  const [isCreatingContext, setIsCreatingContext] = useState(false);

  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleJoin = () => {
    if (!roomId.trim()) return;
    navigate(`/room/${roomId.trim()}`);
  };

  const handleJoinTranslatorRoom = () => {
    if (!roomId.trim()) return;
    navigate(`/translator-room/${roomId.trim()}`);
  };

  const handleJoinAgentRoom = async () => {
    setIsCreatingContext(true);
    try {
      const contextId = await createContextForAgent(selectedAgentId);
      navigate(`/agent-room/${contextId}`);
    } catch (error) {
      console.error("Failed to create context", error);
      alert("Failed to create agent context.");
    } finally {
      setIsCreatingContext(false);
    }
  };

  const createContextForAgent = async (agentId: string): Promise<string> => {
    // ⛏️ Replace this with your real API call
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/context`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId }),
    });

    if (!response.ok) throw new Error("Context creation failed");
    const data = await response.json();
    return data.context_id;
  };

  const handleResetRoom = async () => {
    if (!roomId.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SIGNALING_SERVER_URL_HTTP}/reset/${roomId.trim()}`);
      if (!response.ok) throw new Error("Failed to reset room");
    } catch (error) {
      console.error(error);
      alert("Failed to reset the room.");
    } finally {
      onClose();
    }
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
      <Flex direction="column" align="center" justify="center" height="100%" width="100%">
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
          <Flex direction="column" gap={2}>
            <Button width="100%" onClick={handleJoin} colorScheme="brand">
              Join
            </Button>
            <Text fontSize="sm" textAlign="center" color="gray.500">
              Or...
            </Text>

            {/* Agent Selector */}
            <Select
              mb={4}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              {AGENTS.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </Select>
            <Button
              width="100%"
              onClick={handleJoinAgentRoom}
              colorScheme="brand"
              isLoading={isCreatingContext}
              loadingText="Creating Agent Room..."
            >
              Agent Room ✨
            </Button>
          </Flex>
        </Box>
      </Flex>

      {/* Reset Room Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Reset</ModalHeader>
          <ModalBody>
            Are you sure you want to reset the room "{roomId}"? This will disconnect all users.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleResetRoom}>
              Reset Room
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default SetRoomId;
