import { observer } from "mobx-react-lite";
import { MediaStreamVideo } from "./MediaStreamVideo";
import { RoomConnection } from "../../lib/RoomConnection";
import { Flex } from "@chakra-ui/react";

export const PeerVideoElements = observer(({ roomConnection }: {roomConnection: RoomConnection}) => {
    return (
        <Flex
            direction="column"
            gap={4}
        >
            {Object.entries(roomConnection.peerConnections || {}).map(([id, peerConnection]) => (
                <MediaStreamVideo key={id} stream={peerConnection.inboundMediaStream} />
            ))}
        </Flex>
    );
});
