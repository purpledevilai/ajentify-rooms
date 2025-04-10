import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, Flex, Heading } from "@chakra-ui/react";

function SetRoomId() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!roomId.trim()) {
      return;
    }
    navigate(`/room/${roomId.trim()}`);
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      width="100vw"
      p={4}
    >
      <Heading mb={6}>Enter a Room ID</Heading>
      <Box width="100%" maxW="300px">
        <Input
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          mb={4}
        />
        <Button width="100%" onClick={handleJoin}>
          Join
        </Button>
      </Box>
    </Flex>
  );
}

export default SetRoomId;
