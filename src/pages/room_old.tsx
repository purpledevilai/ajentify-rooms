import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
    Box,
    Button,
    Flex,
    Text,
    IconButton,
    Select,
    Spacer,
    VStack,
} from "@chakra-ui/react";
import { roomStore } from "../stores/roomstore";

/**
 * A simple Room page. 
 * 1. Prompts for camera/mic (if not already allowed)
 * 2. Connects to the specified room 
 * 3. Lets user toggle audio/video, choose devices, and leave the room
 * 4. Shows remote streams
 */

const Room: React.FC = observer(() => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
    const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");

    useEffect(() => {
        if (!roomId) {
            // If no roomId was provided in the URL, redirect to set_room_id
            navigate("/set-room-id");
            return;
        }

        // Request user media permission
        initMediaDevices().catch((err) => {
            console.error("Error initializing media devices:", err);
        });

        // On mount, connect to the room
        //roomStore.connect_to_room(roomId);

        // Cleanup on unmount
        return () => {
            // Optionally leave the room if you want immediate leave on page exit
            // roomStore.leave_room();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    // Whenever the user selects a different device,
    // or toggles audio/video, update the media stream.
    useEffect(() => {
        refreshMediaStream();
    }, [audioEnabled, videoEnabled, selectedAudioDeviceId, selectedVideoDeviceId]);

    /**
     * Prompt for device permissions and enumerate them.
     */
    const initMediaDevices = async () => {
        try {
            // Prompt for both video and audio
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // Now enumerate devices
            const devices = await navigator.mediaDevices.enumerateDevices();

            const audioDevices = devices.filter((d) => d.kind === "audioinput");
            const videoDevices = devices.filter((d) => d.kind === "videoinput");

            roomStore.audioDevices = audioDevices;
            roomStore.videoDevices = videoDevices;

            // Pick the default devices for our local selection state
            if (audioDevices[0]) {
                setSelectedAudioDeviceId(audioDevices[0].deviceId);
            }
            if (videoDevices[0]) {
                setSelectedVideoDeviceId(videoDevices[0].deviceId);
            }
        } catch (err) {
            console.error("Could not get user media or enumerate devices:", err);
        }
    };

    /**
     * Create a new local MediaStream with the selected devices, 
     * respecting current audio/video enabled toggles.
     * Update the roomStore's media stream so peers see the changes.
     */
    const refreshMediaStream = async () => {
        try {
            // If user has turned off video, we won't request it
            const videoConstraints = videoEnabled
                ? { deviceId: selectedVideoDeviceId || undefined }
                : false;

            // If user has turned off audio, we won't request it
            const audioConstraints = audioEnabled
                ? { deviceId: selectedAudioDeviceId || undefined }
                : false;

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: audioConstraints,
            });

            // Update the store
            roomStore.update_media_stream(newStream);
        } catch (err) {
            console.error("Error getting new media stream:", err);
        }
    };

    /**
     * Toggle audio on/off
     */
    const toggleAudio = () => {
        setAudioEnabled(!audioEnabled);
    };

    /**
     * Toggle video on/off
     */
    const toggleVideo = () => {
        setVideoEnabled(!videoEnabled);
    };

    /**
     * Leave the room and navigate back
     */
    const leaveRoom = () => {
        roomStore.leave_room();
        navigate("/set-room-id");
    };

    return (
        <Flex direction="column" height="100vh">
            {/* Control Bar */}
            <Flex
                direction="row"
                align="center"
                p={4}
                borderBottom="1px solid #ccc"
                wrap="wrap"
            >
                <Text fontSize="lg" fontWeight="bold">
                    Room: {roomId}
                </Text>
                <Spacer />

                {/* Audio Mute/Unmute */}
                <Button mr={2} onClick={toggleAudio}>
                    {audioEnabled ? "Mute Audio" : "Unmute Audio"}
                </Button>

                <select
                    //width="120px"
                    //mr={4}
                    value={selectedAudioDeviceId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAudioDeviceId(e.target.value)}
                >
                    {roomStore.audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Audio Device ${device.deviceId}`}
                        </option>
                    ))}
                </select>

                {/* Video On/Off */}
                <Button mr={2} onClick={toggleVideo}>
                    {videoEnabled ? "Stop Video" : "Start Video"}
                </Button>

                <select
                    //width="120px"
                    //mr={4}
                    value={selectedVideoDeviceId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedVideoDeviceId(e.target.value)}
                >
                    {roomStore.videoDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Video Device ${device.deviceId}`}
                        </option>
                    ))}
                </select>

                {/* Leave Room */}
                <Button colorScheme="red" onClick={leaveRoom}>
                    Leave
                </Button>
            </Flex>

            {/* Main content area: remote videos */}
            <Box flex="1" overflowY="auto">
                <VStack gap={4} p={4}>
                    {/* 
            For each PeerConnection, show a video. We'll create a <video> ref 
            and attach the remote stream from the peer's tracks.
          */}
                    {Array.from(roomStore.peerConnections.entries()).map(
                        ([referenceId, pcData]) => {
                            return (
                                <RemoteVideo
                                    key={referenceId}
                                    referenceId={referenceId}
                                    pcData={pcData}
                                />
                            );
                        }
                    )}
                </VStack>
            </Box>
        </Flex>
    );
});

/**
 * A helper component that creates a <video> element to display
 * the remote track(s) from a single RTCPeerConnection.
 */
interface RemoteVideoProps {
    referenceId: string;
    pcData: {
        connection: RTCPeerConnection;
        tracks: MediaStreamTrack[];
    };
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({ referenceId, pcData }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        // Combine the tracks into a stream
        const remoteStream = new MediaStream(pcData.tracks);
        videoRef.current.srcObject = remoteStream;
        videoRef.current.play().catch((err) => {
            console.error("Error playing remote video:", err);
        });
    }, [pcData.tracks]);

    return (
        <Box width="100%" border="1px solid #aaa" borderRadius="md" p={2}>
            <Text mb={2} fontWeight="bold">
                Peer: {referenceId}
            </Text>
            <video
                ref={videoRef}
                style={{ width: "100%", height: "auto" }}
                autoPlay
                playsInline
                muted
            />
        </Box>
    );
};

export default Room;
