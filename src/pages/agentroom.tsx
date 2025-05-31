import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
    Box,
    Flex,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { agentRoomStore } from "../stores/agentroomstore";
import { MediaStreamAudio } from "./components/MediaStreamAudio";
import { MediaStreamVideo } from "./components/MediaStreamVideo";

const BASE_ORB_SIZE = 50;
const ORB_CONTAINER_HEIGHT = 160;

const AgentRoomView = observer(() => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [localVolume, setLocalVolume] = useState(0);
    const [remoteVolume, setRemoteVolume] = useState(0);
    const [orbColor, setOrbColor] = useState("gray.400");
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    const topOffset = `calc(50% - ${ORB_CONTAINER_HEIGHT / 2}px)`;
    const bottomOffset = `calc(50% + ${ORB_CONTAINER_HEIGHT / 2}px)`;

    const bg = useColorModeValue("gray.100", "gray.900");
    const text = useColorModeValue("gray.800", "white");

    const [visibleSpeech, setVisibleSpeech] = useState<string | null>(null);
    const [speechVisible, setSpeechVisible] = useState(false);

    // Init room
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        if (!roomId) {
            navigate("/set-room-id");
            return;
        }

        const initialize = async () => {
            agentRoomStore.setOnInboundVolumeChange((_, volume) => setRemoteVolume(volume));
            agentRoomStore.setOnLocalVolumeChange(setLocalVolume);
            await agentRoomStore.initialize(roomId);
        };

        initialize();

        return () => agentRoomStore.reset();
    }, [roomId, navigate]);

    // Orb color logic
    useEffect(() => {
        setOrbColor(
            agentRoomStore.isUserSpeaking
                ? "blue.400"
                : agentRoomStore.currentlySpeakingSentenceId
                    ? "green.400"
                    : "gray.400"
        );
    }, [agentRoomStore.isUserSpeaking, agentRoomStore.currentlySpeakingSentenceId]);

    // Scroll active sentence into view
    useEffect(() => {
        const id = agentRoomStore.currentlySpeakingSentenceId;
        if (scrollRef.current && id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [agentRoomStore.currentlySpeakingSentenceId]);

    // Whenever a new detected speech comes in
    useEffect(() => {
        if (agentRoomStore.currentDetectedSpeech) {
            setVisibleSpeech(agentRoomStore.currentDetectedSpeech);
            setSpeechVisible(true);
        } else {
            setSpeechVisible(false);
        }
    }, [agentRoomStore.currentDetectedSpeech]);

    return (
        <Box position="relative" h="100vh" w="100vw" bg={bg} color={text}>
            {/* Calibration Overlay */}
            {agentRoomStore.isCalibrating && (
                <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    align="center"
                    justify="center"
                    bg="rgba(0,0,0,0.6)"
                    zIndex={10}
                >
                    <Text fontSize="2xl" color="white">
                        Calibrating... Please do not speak
                    </Text>
                </Flex>
            )}

            {/* Local Video */}
            <Box
                position="absolute"
                top="16px"
                right="16px"
                w="120px"
                h="120px"
                borderRadius="20px"
                overflow="hidden"
                boxShadow="lg"
                bg="black"
                zIndex={2}
            >
                <MediaStreamVideo
                    stream={agentRoomStore.mediaStream}
                    muted={true}
                />
            </Box>

            {/* Center Orb */}
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="100%"
                maxW="600px"
                h={`${ORB_CONTAINER_HEIGHT}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={1}
            >
                <Box
                    w={`${BASE_ORB_SIZE + Math.max(localVolume, remoteVolume)}px`}
                    h={`${BASE_ORB_SIZE + Math.max(localVolume, remoteVolume)}px`}
                    borderRadius="50%"
                    bg={orbColor}
                    transition="all 0.1s ease"
                    boxShadow="0 0 40px rgba(0,0,0,0.2)"
                >
                    <MediaStreamAudio
                        stream={
                            Object.values(agentRoomStore.roomConnection?.peerConnections || {})[0]
                                ?.inboundMediaStream
                        }
                    />
                </Box>
            </Box>

            {/* Top Speech */}
            <Box
                position="absolute"
                top={0}
                left="50%"
                transform="translateX(-50%)"
                h={topOffset}
                w="100%"
                maxW="600px"
                display="flex"
                alignItems="flex-end"
                justifyContent="center"
                textAlign="center"
                px={4}
                zIndex={1}
            >
                <Text
                    fontSize="md"
                    opacity={speechVisible ? 1 : 0}
                    transition="opacity 0.5s ease"
                >
                    {visibleSpeech || " "}
                </Text>
            </Box>

            {/* Bottom Messages */}
            <Box
                position="absolute"
                top={bottomOffset}
                left="50%"
                transform="translateX(-50%)"
                w="100%"
                maxW="600px"
                maxH="200px"
                px={8}
                py={4}
                overflowY="auto"
                ref={scrollRef}
                zIndex={1}
                opacity={agentRoomStore.showAIMessages ? 1 : 0}
                transition="opacity 0.5s ease"
            >
                <VStack spacing={2}>
                    {agentRoomStore.aiMessages.map(({ sentence, sentence_id }) => (
                        <Text
                            key={sentence_id}
                            id={sentence_id}
                            fontWeight={
                                agentRoomStore.currentlySpeakingSentenceId === sentence_id
                                    ? "bold"
                                    : "normal"
                            }
                            fontSize="md"
                            opacity={
                                agentRoomStore.currentlySpeakingSentenceId === sentence_id
                                    ? 1
                                    : 0.5
                            }
                            transition="opacity 0.2s ease"
                        >
                            {sentence}
                        </Text>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
});

export default AgentRoomView;
