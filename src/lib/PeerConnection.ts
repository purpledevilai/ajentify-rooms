export class PeerConnection {
    id: string;
    selfDescription: string;
    outboundMediaStream: MediaStream | null = null;
    pc: RTCPeerConnection;
    inboundMediaStream: MediaStream | null = null;

    /**
     * CONSTRUCTOR
     * 
     * @param id ID of the remote peer
     * @param selfDescription Description of what you are to the remote peer
     * @param outboundMediaStream The mediastream you would like to publish to the remote peer
     * @description Constructor for the PeerConnection class. This class is used to represent a connection to a remote peer. 
     */
    constructor(
        id: string,
        selfDescription: string,
        outboundMediaStream: MediaStream,
    ) {

        // Variables
        this.id = id;
        this.selfDescription = selfDescription;
        this.outboundMediaStream = outboundMediaStream;

        // Create RTCPeerConnection
        this.pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        // On ICE Connection State Change
        this.pc.oniceconnectionstatechange = () => {
            console.log("ICE connection state changed:", this.pc.iceConnectionState);
        }

        // On Connection State Change
        this.pc.onconnectionstatechange = () => {
            console.log("Connection state changed:", this.pc.connectionState);
            // Check if connection is closed
            if (this.pc.connectionState === "disconnected" || this.pc.connectionState === "closed") {
                console.log("Peer connection closed");
                // TODO: Notify disconnection
            }
        }

        // On Track
        this.pc.ontrack = (event) => {
            console.log("Received Track Event:", event);
            const [newStream] = event.streams;
            this.inboundMediaStream = newStream;
            // TODO: Notify new stream
        };

        // Create local media stream
        const localStream = new MediaStream();
        this.outboundMediaStream.getTracks().forEach((track) => {
            localStream.addTrack(track);
        });

        // Add local stream to peer connection
        localStream.getTracks().forEach((track) => {
            console.log("Adding local track to peer connection:", track);
            this.pc.addTrack(track, localStream);
        });
    }
}