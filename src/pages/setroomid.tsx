import { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { getAccessToken } from "../api/_config/auth";
import { getAgents } from "../api/agent/getAgents";
import { createContext } from "../api/context/createContext";
import { getJsonDocuments } from "../api/jsondocument/getJsonDocuments";
import { JsonDocument } from "../api/_types/jsondocument";
import { signOut } from "../api/auth/signOut";

function SetRoomId() {
  const [roomId, setRoomId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [selectedMemoryDocumentId, setSelectedMemoryDocumentId] = useState<string | undefined>(undefined);
  const [isCreatingContext, setIsCreatingContext] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [jsonDocuments, setJsonDocuments] = useState<JsonDocument[]>([]);

  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Check if user is logged in (replace with your actual login check logic)
    const checkLoginStatus = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);
        setIsLoadingAgents(true);
        setIsLoadingDocuments(true);
        
        // Load agents and JSON documents in parallel
        const [agents, documents] = await Promise.all([
          getAgents(),
          getJsonDocuments()
        ]);
        
        setAgents(agents.map(agent => ({
          id: agent.agent_id,
          name: agent.agent_name,
        })));
        if (agents.length > 0) {
          setSelectedAgentId(agents[0].agent_id);
        }
        
        setJsonDocuments(documents);
      } catch (error) {
        console.error("Error checking login status", error);
      } finally {
        setIsLoadingAgents(false);
        setIsLoadingDocuments(false);
      }
    }
    checkLoginStatus();
  }, []);


  const handleJoin = () => {
    if (!roomId.trim()) return;
    navigate(`/room/${roomId.trim()}`);
  };

  const handleJoinAgentRoom = async () => {
    if (!selectedAgentId) {
      alert("Please select an agent to create a room.");
      return;
    }
    setIsCreatingContext(true);
    try {
      const contextId = await createContextForAgent(selectedAgentId, selectedMemoryDocumentId);
      navigate(`/agent-room/${contextId}`);
    } catch (error) {
      console.error("Failed to create context", error);
      alert("Failed to create agent context.");
    } finally {
      setIsCreatingContext(false);
    }
  };

  const createContextForAgent = async (agentId: string, memoryDocumentId?: string): Promise<string> => {
    const initializeTools = memoryDocumentId ? [
      {
        tool_id: "open_memory_window",
        tool_input: {
          document_id: memoryDocumentId
        }
      }
    ] : undefined;
    
    const context = await createContext({ 
      agent_id: agentId,
      initialize_tools: initializeTools
    });
    return context.context_id;
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

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setAgents([]);
      setJsonDocuments([]);
      setSelectedAgentId(undefined);
      setSelectedMemoryDocumentId(undefined);
    } catch (error) {
      console.error("Error signing out", error);
      alert("Failed to sign out.");
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

      {/* Logout Button */}
      {isLoggedIn && (
        <Button
          position="absolute"
          top="16px"
          right="16px"
          onClick={handleLogout}
          variant="ghost"
          size="sm"
        >
          Logout
        </Button>
      )}

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
            {isLoggedIn ? (
              <>
                {isLoadingAgents ? (
                  <Text fontSize="sm" textAlign="center" color="gray.500">
                    Loading agents...
                  </Text>
                ) : (
                  <Select
                    mb={4}
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </Select>
                )}
                {isLoadingDocuments ? (
                  <Text fontSize="sm" textAlign="center" color="gray.500" mb={4}>
                    Loading memory documents...
                  </Text>
                ) : (
                  <Select
                    mb={4}
                    value={selectedMemoryDocumentId || ""}
                    onChange={(e) => setSelectedMemoryDocumentId(e.target.value || undefined)}
                    placeholder="Select memory document (optional)"
                  >
                    {jsonDocuments.map((doc) => (
                      <option key={doc.document_id} value={doc.document_id}>
                        {doc.name}
                      </option>
                    ))}
                  </Select>
                )}
                <Button
                  width="100%"
                  onClick={handleJoinAgentRoom}
                  colorScheme="brand"
                  isLoading={isCreatingContext}
                  loadingText="Creating Agent Room..."
                >
                  Agent Room ✨
                </Button>
              </>
            ) : (
              <Button width="100%" colorScheme="blue" onClick={() => navigate("/login")}>
                Login to see your agents
              </Button>
            )}
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
