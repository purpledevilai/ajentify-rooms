import { JSONRPCPeer } from "./JSONRPCPeer";
import { PeerConnection } from "./PeerConnection";

export class RoomConnection {
    id: string;
    peerConnections: Record<string, PeerConnection>;
    roomServer: JSONRPCPeer;
    websocket: WebSocket;
    onPeerAdded: (peerId: string, selfDescription: string) => PeerConnection | null;
    onConnectionRequest: (peerId: string, selfDescription: string) => PeerConnection | null;
    defaultMediaStream: MediaStream | null;

    constructor({
        id,
        onPeerAdded = this.defaultCreatePeer,
        onConnectionRequest = this.defaultCreatePeer,
        selfDescription = "Peer",
        defaultMediaStream = null,
    }: {
        id: string;
        onPeerAdded?: (peerId: string, selfDescription: string) => PeerConnection | null;
        onConnectionRequest?: (peerId: string, selfDescription: string) => PeerConnection | null;
        selfDescription?: string;
        defaultMediaStream?: MediaStream | null;
    }) {
        this.id = id;
        this.peerConnections = {};
        this.onPeerAdded = onPeerAdded;
        this.onConnectionRequest = onConnectionRequest;
        this.defaultMediaStream = defaultMediaStream;

        // Check that if there is no onPeerAdded that there must be a default media stream
        if ((!this.onPeerAdded || !this.onConnectionRequest) && !this.defaultMediaStream) {
            throw new Error("You must provide a default media stream if no onPeerAdded or onConnectionRequest is provided");
        }

        // Create WebSocket 
        const WS_URL = "wss://room-signaling-server.prod.rooms.ajentify.com/ws";
        this.websocket = new WebSocket(WS_URL);

        // Create sender for JSON-RPC messages
        const sender = (message: string) => {
            this.websocket.send(message);
        }

        // Set up JSON-RPC peer
        this.roomServer = new JSONRPCPeer(sender);
        this.roomServer.on("peer_added", this.peer_added as (params: Record<string, any>) => any);
        this.roomServer.on("connection_request", this.connection_request as (params: Record<string, any>) => any);
        this.roomServer.on("add_ice_candidate", this.add_ice_candidate as (params: Record<string, any>) => any);

        // On Message
        this.websocket.onmessage = (event) => {
            this.roomServer.handleMessage(event.data);
        }

        // On Error
        this.websocket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        // On Close
        this.websocket.onclose = () => {
            console.log("WebSocket closed");
            // Clean up peer connections
            for (const key in this.peerConnections) {
                this.peerConnections[key].pc.close();
                delete this.peerConnections[key];
            }
        };

        // On Connect, Join the room
        this.websocket.onopen = async () => {
            console.log("WebSocket connected");
            this.roomServer.call("join", { room_id: this.id, self_description: selfDescription });
        };
    }

    // DEFAULT ON PEER ADDED
    private defaultCreatePeer = (peerId: string, selfDescription: string) => {
        console.log("Default onPeerAdded called");
        const peerConnection = new PeerConnection(peerId, selfDescription, this.defaultMediaStream!);
        return peerConnection;
    }

    // PEER ADDED
    private peer_added = async (params: { peer_id: string; self_description: string }) => {
        console.log("Peer added:", params);
        const { peer_id, self_description } = params;

        // Ask domain logic if we want to connect to this peer
        const peerConnection = this.onPeerAdded(peer_id, self_description);
        if (!peerConnection) {
            return; // Rejecting to connect to peer
        }

        // Set on ICE candidate
        peerConnection.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.roomServer.call("relay_ice_candidate", {
                    peer_id,
                    candidate: event.candidate,
                });
            }
        }

        // Create offer
        const offer = await peerConnection.pc.createOffer();
        await peerConnection.pc.setLocalDescription(offer);

        // Send offer to peer
        const answerResponse = await this.roomServer.call("request_connection", {
            peer_id,
            self_description: peerConnection.selfDescription,
            offer,
        }, true, 10000);

        // Check if we got an answer
        if (!answerResponse || !answerResponse.answer) {
            console.log("Connection rejected by peer");
            return; // Connection rejected
        }

        // Set answer
        await peerConnection.pc.setRemoteDescription(answerResponse.answer as RTCSessionDescriptionInit);
    }

    // CONNECTION REQUEST
    private connection_request = async (params: { peer_id: string; self_description: string; offer: RTCSessionDescriptionInit }) => {
        console.log("Connection request:", params);
        const { peer_id, self_description, offer } = params;

        // Ask domain logic if we want to connect to this peer
        const peerConnection = this.onConnectionRequest(peer_id, self_description);
        if (!peerConnection) {
            console.log("Connection request rejected");
            return null; // Rejecting to connect to peer
        }

        // Set on ICE candidate
        peerConnection.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.roomServer.call("relay_ice_candidate", {
                    peer_id,
                    candidate: event.candidate,
                });
            }
        }

        // Set remote and create answer
        await peerConnection.pc.setRemoteDescription(offer);
        const answer = await peerConnection.pc.createAnswer();
        await peerConnection.pc.setLocalDescription(answer);

        // return answer
        return answer
    }

    // ADD ICE CANDIDATE
    private add_ice_candidate = async (params: { peer_id: string; candidate: RTCIceCandidate }) => {
        console.log("Adding ICE candidate:", params);
        const { peer_id, candidate } = params;

        // Add ICE candidate to peer connection
        const peer = this.peerConnections[peer_id];
        if (peer) {
            await peer.pc.addIceCandidate(candidate);
        }
    }
}