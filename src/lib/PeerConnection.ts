import { makeAutoObservable } from "mobx";

export class PeerConnection {
    id: string;
    selfDescription: string;
    outboundMediaStream: MediaStream | null = null;
    pc: RTCPeerConnection;
    inboundMediaStream: MediaStream | null = null;
    dataChannel: RTCDataChannel | null = null;

    constructor(
        id: string,
        selfDescription: string,
        outboundMediaStream: MediaStream,
        createDataChannel: boolean = false,
        onMessageCallback: (message: string) => void = () => {}
    ) {
        makeAutoObservable(this);

        this.id = id;
        this.selfDescription = selfDescription;
        this.outboundMediaStream = outboundMediaStream;

        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        // ✅ If this peer is the initiator, create data channel
        if (createDataChannel) {
            this.dataChannel = this.pc.createDataChannel("chat");

            this.dataChannel.onopen = () => {
                console.log(`[${this.id}] DataChannel is open and ready`);
            };

            this.dataChannel.onmessage = (event) => {
                console.log(`[${this.id}] Received message:`, event.data);
                if (onMessageCallback) onMessageCallback(event.data);
            };
        }

        // ✅ If this peer is the answerer, listen for incoming data channels
        this.pc.ondatachannel = (event) => {
            console.log(`[${this.id}] Incoming data channel`);
            this.dataChannel = event.channel;

            this.dataChannel.onopen = () => {
                console.log(`[${this.id}] Incoming DataChannel is open`);
            };

            this.dataChannel.onmessage = (event) => {
                console.log(`[${this.id}] Received message from remote:`, event.data);
                if (onMessageCallback) onMessageCallback(event.data);
            };
        };

        this.pc.ontrack = (event) => {
            console.log("Received Track Event:", event);
            const [newStream] = event.streams;
            this.inboundMediaStream = newStream;
        };

        // Add local media tracks
        this.outboundMediaStream.getTracks().forEach((track) => {
            console.log("Adding local track:", track);
            this.pc.addTrack(track, this.outboundMediaStream!);
        });
    }

    sendMessage(message: string) {
        if (this.dataChannel?.readyState === "open") {
            this.dataChannel.send(message);
            console.log(`[${this.id}] Sent message:`, message);
        } else {
            console.warn(`[${this.id}] Data channel not ready`);
        }
    }
}
