import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
    Box,
    Flex,
    Text,
    Button,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import { roomStore } from "../stores/roomstore";

const Room = observer(() => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerRefs = useRef<Record<string, HTMLVideoElement>>({});

    const handleLeave = () => {
        roomStore.leaveRoom();
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null; // Clear the camera stream from the video element
        }
        navigate("/set-room-id");
    };

    useEffect(() => {
        if (!roomId) {
            navigate("/set-room-id");
            return;
        }
        roomStore.initializeAndConnect(roomId);
    }, [roomId]);

    useEffect(() => {
        if (localVideoRef.current && roomStore.mediaStream) {
            localVideoRef.current.srcObject = roomStore.mediaStream;
        }
    }, [roomStore.mediaStream]);

    useEffect(() => {
        Object.entries(roomStore.peerConnections).forEach(([id, pcData]) => {
            const el = peerRefs.current[id];
            if (el && pcData.mediaStream && el.srcObject !== pcData.mediaStream) {
                el.srcObject = pcData.mediaStream;
            }
        });
    }, [roomStore.peerConnections]);

    return (
        <Box position="relative" height="100vh">
            {/* Leave Dialog */}
            <Box position="absolute" top="1rem" right="1rem">
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <Button colorScheme="red">Leave</Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <Dialog.Header>
                                    <Dialog.Title>Leave Room</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <Text>Are you sure you want to leave the room?</Text>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button colorScheme="red" ml={3} onClick={handleLeave}>
                                        Leave
                                    </Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton position="absolute" top="1rem" right="1rem" />
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </Box>

            <Flex direction="column" align="center" justify="center" height="100%" p={4}>
                <Text mb={4}>This is the room {roomId}</Text>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    controls={false}
                    muted
                    style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        transform: "scaleX(-1)",
                    }}
                />
                {Object.entries(roomStore.peerConnections).map(([id, pcData]) => (
                    <Box key={id} mb={4}>
                        <Box mb={1}>Peer: {id}</Box>
                        <video
                            ref={(el) => {
                                if (el) peerRefs.current[id] = el;
                            }}
                            autoPlay
                            playsInline
                            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                        />
                    </Box>
                ))}
            </Flex>
        </Box>
    );
});

export default Room;
