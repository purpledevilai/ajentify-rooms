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
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { agentRoomStore } from "../stores/agentroomstore";
import { mediaDeviceStore } from "../stores/mediadevicestore";
import { PeerVideoElements } from "./components/PeerVideoElements";

const AgentRoom = observer(() => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef<HTMLVideoElement>(null);


    const { colorMode, toggleColorMode } = useColorMode();
    const bg = useColorModeValue("gray.100", "gray.900");
    const text = useColorModeValue("gray.800", "white");
    const controlBarBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(0,0,0,0.7)");

    /**
     * Initialize the room and media devices, or navigate to set-room-id if no roomId is provided
     */
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        if (!roomId) {
            navigate("/set-room-id");
            return;
        }

        const initialize = async () => {
            agentRoomStore.setOnInboundVolumeChange((peerId, volume) => {
                // Handle volume change for animations or UI updates
                //console.log(`Inbound volume for peer ${peerId}:`, volume);
            });
            agentRoomStore.setOnLocalVolumeChange((volume) => {
                // Handle volume change for animations or UI updates
                //console.log(`Outbound volume for room ${roomId}:`, volume);
            });
            await agentRoomStore.initialize(roomId)
        }

        initialize()
        

    }, [roomId, navigate]);


    /**
     * on navigate away from this page, reset the store
     */
    useEffect(() => {
        return () => {
            console.log("Cleaning up regular chat room on unmount");
            agentRoomStore.reset();
        };
    }, []);


    /**
     * Set the local video/adio src when the mediaStream changes
     */
    useEffect(() => {
        if (localVideoRef.current && agentRoomStore.mediaStream) {
            localVideoRef.current.srcObject = agentRoomStore.mediaStream;
        }
    }, [agentRoomStore.mediaStream]);



    /**
     * Handle Leaving the room
     */
    const handleLeave = () => {
        agentRoomStore.leaveRoom();
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        navigate("/set-room-id");
    };

    /**
     * View
     */
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
                gap={4}
                px={4}
                pt="160px"
                pb="200px"
                overflowY="auto"
                position="relative"
                zIndex={1}
            >
                <Text fontSize="lg" mb={4}>Agent Room ID: {roomId}</Text>

                {/* Connection Status */}
                <Text fontSize="sm" color={agentRoomStore.isConnected ? "green.500" : "red.500"}>
                    {agentRoomStore.isConnected ? "Connected" : "Connecting..."}
                </Text>

                {/* Peer Video Elements */}
                {agentRoomStore.roomConnection && <PeerVideoElements roomConnection={agentRoomStore.roomConnection} />}

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
                                icon={agentRoomStore.audioMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                                onClick={() => agentRoomStore.toggleMediaDeviceMute("audio")}
                            />
                        </Tooltip>
                        <Select
                            placeholder="Select Microphone"
                            value={agentRoomStore.selectedAudioDevice?.deviceId ?? ""}
                            onChange={(e) => agentRoomStore.setMediaDevice(e.target.value, "audio")}
                            maxW="200px"
                        >
                            {mediaDeviceStore.audioDevices.map((device) => (
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
                                icon={agentRoomStore.videoMuted ? <FaVideoSlash /> : <FaVideo />}
                                onClick={() => agentRoomStore.toggleMediaDeviceMute("video")}
                            />
                        </Tooltip>
                        <Select
                            placeholder="Select Camera"
                            value={agentRoomStore.selectedVideoDevice?.deviceId ?? ""}
                            onChange={(e) => agentRoomStore.setMediaDevice(e.target.value, "video")}
                            maxW="200px"
                        >
                            {mediaDeviceStore.videoDevices.map((device) => (
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

export default AgentRoom;
