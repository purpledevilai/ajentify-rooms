import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
    Box,
    Flex,
    Text,
    IconButton,
    useColorMode,
    useColorModeValue,
    HStack,
    Select,
    Tooltip,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { roomStore } from "../stores/roomstore";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

const Room = observer(() => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerRefs = useRef<Record<string, HTMLVideoElement>>({});
    const { colorMode, toggleColorMode } = useColorMode();

    const bg = useColorModeValue("gray.100", "gray.900");
    const text = useColorModeValue("gray.800", "white");
    const controlBarBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(0,0,0,0.7)");

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

    const handleLeave = () => {
        roomStore.leaveRoom();
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        navigate("/set-room-id");
    };

    return (
        <Box position="relative" height="100vh" width="100vw" overflow="hidden" bg={bg} color={text}>
            {/* Color Mode Toggle (Top-Right Overlay) */}
            <IconButton
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                position="absolute"
                top="16px"
                left="16px" // Adjusted to not overlap local video
                zIndex={3}
                variant="ghost"
            />

            {/* Local Video (Top-Right Overlay) */}
            <Box
                position="absolute"
                top="16px"
                right="16px"
                width="200px"
                height="120px"
                zIndex={2}
                borderRadius="md"
                overflow="hidden"
                boxShadow="lg"
                bg="black"
            >
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                    }}
                />
            </Box>

            {/* Peer Videos Scroll Area (Centered Main View) */}
            <Flex
                direction="column"
                align="center"
                justify="start"
                height="100%"
                px={4}
                pt="160px"
                pb="160px"
                overflowY="auto"
                position="relative"
                zIndex={1}
            >
                <Text fontSize="lg" mb={4}>Room ID: {roomId}</Text>

                {Object.entries(roomStore.peerConnections).map(([id]) => (
                    <Box key={id} mb={6} width="100%" maxW="600px">
                        <Box borderRadius="md" overflow="hidden" boxShadow="md" bg="black">
                            <video
                                ref={(el) => {
                                    if (el) peerRefs.current[id] = el;
                                }}
                                autoPlay
                                playsInline
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                }}
                            />
                        </Box>
                    </Box>
                ))}
            </Flex>

            {/* Control Bar (Bottom Overlay) */}
            <Box
                position="absolute"
                bottom="0"
                width="100%"
                bg={controlBarBg}
                backdropFilter="blur(6px)"
                py={3}
                px={4}
                zIndex={2}
            >
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    {/* Audio Controls */}
                    <HStack spacing={2}>
                        <Tooltip label="Mute / Unmute Microphone">
                            <IconButton
                                aria-label="Toggle Mute Audio"
                                icon={roomStore.audioMuted ? <FaMicrophoneSlash /> : <FaMicrophone /> }
                                onClick={() => roomStore.toggleAudioDeviceMute()}
                            />
                        </Tooltip>
                        <Select
                            placeholder="Select Microphone"
                            value={roomStore.selectedAudioDevice?.deviceId ?? ""}
                            onChange={(e) => roomStore.setAudioDevice(e.target.value)}
                            maxW="200px"
                        >
                            {roomStore.audioDevices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Mic ${device.deviceId.slice(-4)}`}
                                </option>
                            ))}
                        </Select>
                    </HStack>

                    {/* Video Controls */}
                    <HStack spacing={2}>
                        <Tooltip label="Toggle Camera">
                            <IconButton
                                aria-label="Toggle Mute Video"
                                icon={roomStore.videoMuted ? <FaVideoSlash /> : <FaVideo />}
                                onClick={() => roomStore.toggleVideoDeviceMute()}
                            />
                        </Tooltip>
                        <Select
                            placeholder="Select Camera"
                            value={roomStore.selectedVideoDevice?.deviceId ?? ""}
                            onChange={(e) => roomStore.setVideoDevice(e.target.value)}
                            maxW="200px"
                        >
                            {roomStore.videoDevices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Cam ${device.deviceId.slice(-4)}`}
                                </option>
                            ))}
                        </Select>
                    </HStack>

                    <Text
                        as="button"
                        onClick={handleLeave}
                        color="red.400"
                        _hover={{ color: "red.600" }}
                        fontWeight="bold"
                    >
                        Leave Call
                    </Text>
                </Flex>
            </Box>
        </Box>
    );
});

export default Room;
