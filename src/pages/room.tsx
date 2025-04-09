import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Box, Flex } from "@chakra-ui/react"; // assuming Chakra UI
import { roomStore } from "../stores/roomstore"; // adjust the import path as needed

const Room = observer(() => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerRefs = useRef<Record<string, HTMLVideoElement>>({});


    // Navigate away if no roomId
    useEffect(() => {
        if (!roomId) {
            navigate("/set-room-id");
            return;
        }
        roomStore.initializeAndConnect(roomId);
    }, [roomId]);

    // Attach the media stream to the video element
    useEffect(() => {
        if (localVideoRef.current && roomStore.mediaStream) {
            localVideoRef.current.srcObject = roomStore.mediaStream;
        }
    }, [roomStore.mediaStream]);

    useEffect(() => {
        // Attach mediaStreams for each peer when updated
        Object.entries(roomStore.peerConnections).forEach(([id, pcData]) => {
            const el = peerRefs.current[id];
            if (el && pcData.mediaStream && el.srcObject !== pcData.mediaStream) {
                el.srcObject = pcData.mediaStream;
            }
        });
    }, [roomStore.peerConnections]);

    return (
        <Flex direction="column" align="center" justify="center" height="100vh" p={4}>
            This is the room {roomId}
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                controls={false}
                muted
                style={{ width: "100%", height: "auto", borderRadius: "8px", transform: "scaleX(-1)", }}
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
    );
});

export default Room;