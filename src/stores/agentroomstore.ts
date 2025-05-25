import { makeAutoObservable } from "mobx";
import { mediaDeviceStore } from "./mediadevicestore";
import { RoomConnection } from "../lib/RoomConnection";
import { PeerConnection } from "../lib/PeerConnection";

export class AgentRoomStore {
    roomConnection: RoomConnection | undefined = undefined;
    selectedVideoDevice: MediaDeviceInfo | undefined = undefined;
    selectedAudioDevice: MediaDeviceInfo | undefined = undefined;
    mediaStream: MediaStream | undefined = undefined;
    audioMuted = false;
    videoMuted = false;
    isConnected = false;

    constructor() {
        makeAutoObservable(this);
    }

    /**
     * Reset the store
     */
    reset = () => {
        if (this.roomConnection) {
            this.roomConnection.leaveRoom();
        }
        this.roomConnection = undefined;
        this.selectedVideoDevice = undefined;
        this.selectedAudioDevice = undefined;
        this.mediaStream = undefined;
        this.audioMuted = false;
        this.videoMuted = false;
        this.isConnected = false;
    }

    /**
     * Initializes media devices (asking permission if not granted), sets default media stream, and sets up the room connection.
     * @param roomId The ID of the room to connect to
     */
    async initialize(roomId: string) {

        // Initialize media devices - asks for permission if not granted
        await mediaDeviceStore.initializeMediaDevices();
        console.log("initialized media devices");

        // Set default selected devices
        this.selectedVideoDevice = mediaDeviceStore.videoDevices[0];
        this.selectedAudioDevice = mediaDeviceStore.audioDevices[0];

        // Set up media constraints
        const videoConstraints = this.selectedVideoDevice
            ? { deviceId: this.selectedVideoDevice.deviceId }
            : false;
        const audioConstraints = this.selectedAudioDevice
            ? { deviceId: this.selectedAudioDevice.deviceId }
            : false;

        // Set the media stream
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audioConstraints,
        });

        // Create the room connection
        this.roomConnection = new RoomConnection({
            id: roomId,
            selfDescription: `Peer`,
            onPeerAdded: this.onPeerAdded,
            onConnectionRequest: this.onConnectionRequest,
            onPeerConnectionStateChanged: (peerId: string, connected: boolean) => {
                console.log(`Peer ${peerId} connection status changed: ${connected}`);
                this.isConnected = connected;
            }
        });

        // Join the room
        const existingPeers = await this.roomConnection.joinRoom();

        // Check if the room has a agent
        const hasAgent = existingPeers["existing_peers"].some((peer: { self_description: string; }) => peer.self_description === "Agent");

        if (!hasAgent) {
            // Call agnet server to wake agent POST with roomId
            const response = await fetch(
                `${import.meta.env.VITE_AGENT_SERVER_URL}/invite-agent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        context_id: roomId,
                    }),
                }
            )
            console.log("waking agent server", response);
        }
    }

    onPeerAdded = async (peerId: string, selfDescription: string) => {
        if (selfDescription === "Agent") {
            // If the peer is an agent, we create a data channel
            return await this.onPeerAddedOrConnectionRequest(peerId, selfDescription, true);
        }
        return await this.onPeerAddedOrConnectionRequest(peerId, selfDescription, false);
    }

    onConnectionRequest = async (peerId: string, selfDescription: string) => {
        return await this.onPeerAddedOrConnectionRequest(peerId, selfDescription, false);
    }

    /**
     * Peer added or connection request
     */
    onPeerAddedOrConnectionRequest = async (peerId: string, selfDescription: string, createDataChanel: boolean) => {

        // Get media constraints
        let videoConstraints = this.selectedVideoDevice
            ? { deviceId: this.selectedVideoDevice.deviceId }
            : false;
        let audioConstraints = this.selectedAudioDevice
            ? { deviceId: this.selectedAudioDevice.deviceId }
            : false; 

        // Check if the peer is a translator
        if (selfDescription === "Agent") {
            // Get media audio stream only
            audioConstraints = this.selectedAudioDevice
                ? { deviceId: this.selectedAudioDevice.deviceId }
                : false;
            videoConstraints = false;
        }

        // Create a new PeerConnection
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audioConstraints,
        });
        const peer = new PeerConnection(peerId, selfDescription, mediaStream, createDataChanel, this.onMessageReceived);
        return peer
    }

    onMessageReceived = (message: string) => {
        console.log("message received", JSON.stringify(message));
    }

    /**
     * Toggle media device mute
     */
    toggleMediaDeviceMute(kind: "audio" | "video") {
        console.log("Toggling media device mute", kind);
        if (!this.mediaStream) return;
    
        // Toggle local stream track
        const tracks = kind === "audio"
            ? this.mediaStream.getAudioTracks()
            : this.mediaStream.getVideoTracks();
    
        if (tracks.length > 0) {
            const track = tracks[0];
            const newEnabledState = !track.enabled;
            track.enabled = newEnabledState;
            console.log(`${kind} track enabled:`, newEnabledState);
    
            if (kind === "audio") {
                this.audioMuted = !newEnabledState;
            } else {
                this.videoMuted = !newEnabledState;
            }
    
            // Also update all outbound tracks of same kind in each peer connection
            if (this.roomConnection) {
                Object.values(this.roomConnection.peerConnections).forEach((peerConn) => {
                    const outboundStream = peerConn.outboundMediaStream;
                    if (!outboundStream) return;
    
                    const peerTracks = kind === "audio"
                        ? outboundStream.getAudioTracks()
                        : outboundStream.getVideoTracks();
    
                    peerTracks.forEach((peerTrack) => {
                        peerTrack.enabled = newEnabledState;
                        console.log(
                            `Updated ${kind} track for peer ${peerConn.id} to enabled:`,
                            newEnabledState
                        );
                    });
                });
            }
        }
    }

    /**
     * Set Media Device
     */
    async setMediaDevice(deviceId: string, kind: "audio" | "video") {
        const deviceList = kind === "audio"
            ? mediaDeviceStore.audioDevices
            : mediaDeviceStore.videoDevices;
    
        const device = deviceList.find((d) => d.deviceId === deviceId);
        if (!device || !this.mediaStream) return;
    
        const constraints = kind === "audio"
            ? { audio: { deviceId }, video: false }
            : { audio: false, video: { deviceId } };
    
        const tempStream = await navigator.mediaDevices.getUserMedia(constraints);
    
        const newTrack = kind === "audio"
            ? tempStream.getAudioTracks()[0]
            : tempStream.getVideoTracks()[0];
    
        const oldTrack = kind === "audio"
            ? this.mediaStream.getAudioTracks()[0]
            : this.mediaStream.getVideoTracks()[0];
    
        // Replace in local display stream
        if (oldTrack) {
            this.mediaStream.removeTrack(oldTrack);
            oldTrack.stop();
        }
        this.mediaStream.addTrack(newTrack);
    
        // Replace in each peer connection
        for (const peerConnection of Object.values(this.roomConnection?.peerConnections || {})) {
            const sender = peerConnection.pc.getSenders().find(
                (s) => s.track?.kind === newTrack.kind
            );
            if (sender) {
                await sender.replaceTrack(newTrack);
            }
    
            // Also update outboundMediaStream if available
            if (peerConnection.outboundMediaStream) {
                const outboundTracks = kind === "audio"
                    ? peerConnection.outboundMediaStream.getAudioTracks()
                    : peerConnection.outboundMediaStream.getVideoTracks();
    
                // Remove old track of the same kind
                outboundTracks.forEach((t) => peerConnection.outboundMediaStream?.removeTrack(t));
    
                // Add the new track
                peerConnection.outboundMediaStream.addTrack(newTrack);
            }
        }
    
        // Clean up any other tracks from temp stream
        tempStream.getTracks().forEach((track) => {
            if (track !== newTrack) track.stop();
        });
    
        // Update selection
        if (kind === "audio") {
            this.selectedAudioDevice = device;
        } else {
            this.selectedVideoDevice = device;
        }
    }


    /**
     * Send a request to leave the room
     */
    leaveRoom() {
        this.mediaStream?.getVideoTracks().forEach((track) => track.stop());
        this.mediaStream?.getAudioTracks().forEach((track) => track.stop());
        this.mediaStream?.getTracks().forEach((track) => track.stop());
        this.reset();
    }
}

// Export a singleton store
export const agentRoomStore = new AgentRoomStore();
