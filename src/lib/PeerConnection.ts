import { makeAutoObservable } from "mobx";

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
        // Make this class observable
        makeAutoObservable(this);

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

        // On Track
        this.pc.ontrack = (event) => {
            console.log("Received Track Event:", event);
            const [newStream] = event.streams;
            this.inboundMediaStream = newStream;
        };

        // Add local stream to peer connection
        this.outboundMediaStream.getTracks().forEach((track) => {
            console.log("Adding local track to peer connection:", track);
            this.pc.addTrack(track, this.outboundMediaStream!);
        });
    }
}