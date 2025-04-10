import { makeAutoObservable, runInAction, reaction } from "mobx";

/**
 * Type for tracking peer connection objects in the store.
 * Each entry holds a WebRTC peer connection and its currently-received tracks.
 */
interface PeerConnectionData {
    connection: RTCPeerConnection;
    tracks: MediaStreamTrack[];
    mediaStream?: MediaStream;
}

export class RoomStore {
    roomId: string | undefined = undefined;
    isConnecting = false;

    requestResponses: Record<string, any> = {};

    websocket: WebSocket | null = null;
    peerConnections: Record<string, PeerConnectionData> = {};

    connectionState: RTCIceConnectionState | undefined = undefined;
    mediaStream: MediaStream | undefined = undefined;

    videoDevices: MediaDeviceInfo[] = [];
    audioDevices: MediaDeviceInfo[] = [];
    selectedVideoDevice: MediaDeviceInfo | undefined = undefined;
    selectedAudioDevice: MediaDeviceInfo | undefined = undefined;


    constructor() {
        makeAutoObservable(this);
    }

    /**
     * Wrapper to call both initializeMediaDevices and connect to server
     */
    async initializeAndConnect(roomId: string) {
        this.roomId = roomId;
        await this.initializeMediaDevices();
        this.connectToServer();
    }

    /**
     * Initialize the media devices and set the default devices.
     */
    async initializeMediaDevices() {
        // Prompt for both video and audio
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Get all the devices
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Separate video and audio devices
        this.videoDevices = devices.filter((d) => d.kind === "videoinput");
        this.audioDevices = devices.filter((d) => d.kind === "audioinput");

        // Set default selected devices
        this.selectedVideoDevice = this.videoDevices[0];
        this.selectedAudioDevice = this.audioDevices[0];

        await this.refreshMediaStream();
    }

    /**
     * Refresh the media stream with the currently selected devices.
     * This is called when the user changes their audio/video settings.
     */
    async refreshMediaStream() {
        // If user has turned off video, we won't request it
        const videoConstraints = this.selectedVideoDevice
            ? { deviceId: this.selectedVideoDevice.deviceId }
            : false;

        // If user has turned off audio, we won't request it
        const audioConstraints = this.selectedAudioDevice
            ? { deviceId: this.selectedAudioDevice.deviceId }
            : false;

        const newStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audioConstraints,
        });

        this.mediaStream = newStream;
    }

    /**
     * Connect to the WebSocket server, set up message listeners.
     */
    connectToServer() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            return;
        }

        runInAction(() => {
            this.isConnecting = true;
        });

        const WS_URL = "wss://room-signaling-server.prod.rooms.ajentify.com/ws";

        this.websocket = new WebSocket(WS_URL);

        this.websocket.onopen = async () => {
            console.log("WebSocket connected");
            runInAction(() => {
                this.isConnecting = false;
            });
            await this.sendRequest("join_room", { room_id: this.roomId }, false);
        };

        this.websocket.onmessage = (event) => {
            this.websocketOnMessage(event);
        }

        this.websocket.onerror = (err) => {
            console.error("WebSocket error:", err);
            runInAction(() => {
                this.isConnecting = false;
            });
        };

        this.websocket.onclose = () => {
            console.log("WebSocket closed");
            // Clean up peer connections
            for (const key in this.peerConnections) {
                const pcData = this.peerConnections[key];
                pcData.connection.close();
            }
            runInAction(() => {
                this.isConnecting = false;
            });
        };
    }

    /**
     * Parses and routes messages from server
     */
    websocketOnMessage = async (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        console.log("Received message:", message);
        if (message.type === "request") {

            const { method, params, id } = message;

            switch (method) {
                case "create_rtc_peer_connection_and_offer":
                    this.createRtcPeerConnectionAndOffer(
                        params.ref_id,
                        id
                    );
                    break;

                case "create_rtc_peer_connection_and_answer":
                    this.createRtcPeerConnectionAndAnswer(
                        params.ref_id,
                        params.offer,
                        id
                    );
                    break;

                case "set_remote_peer_answer":
                    this.setRemotePeerAnswer(params.ref_id, params.answer);
                    break;

                case "add_ice_candidate":
                    this.addIceCandidate(params.ref_id, params.candidate);
                    break;

                default:
                    console.log("Unknown request method from server:", method);
            }
        } else if (message.request_id) { // Is response message
            const { request_id, data } = message;
            this.requestResponses[request_id] = data;
        } else {
            console.log("Unknown message format", message);
        }
    }

    /**
     * Create a new RTCPeerConnection and store it in the peerConnections map.
     */
    createRTCPeerConnection(referenceId: string) {
        // Create RTCPeerConnection
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        this.peerConnections[referenceId] = { connection: pc, tracks: [] };
        console.log("SET PEER CONNECTION!!!", JSON.stringify(this.peerConnections));

        // On ICE Candidate
        pc.oniceconnectionstatechange = () => {
            console.log("ICE connection state changed:", pc.iceConnectionState);
        }
        pc.onicecandidate = (event) => {
            console.log("ICE candidate:", event.candidate);
            if (event.candidate) {
                this.sendRequest("ice_candidate", {
                    reference_id: referenceId,
                    candidate: event.candidate,
                }, false);
            }
        }

        // On Track
        pc.ontrack = (event) => {
            console.log("Track event:", event);

            const pcData = this.peerConnections[referenceId];

            // If it's the first track, create a new MediaStream
            if (!pcData.mediaStream) {
                pcData.mediaStream = new MediaStream();
            }

            // Add the incoming track to the peer's MediaStream
            event.streams[0].getTracks().forEach((track) => {
                pcData.mediaStream?.addTrack(track);
            });

            // Trigger MobX update (we’re mutating deep object, so force a rerender)
            runInAction(() => {
                this.peerConnections = { ...this.peerConnections };
            });
        };

        // On Connection State Change
        pc.onconnectionstatechange = () => {
            console.log("Connection state changed:", pc.connectionState);
            // Check if connection is closed
            if (pc.connectionState === "disconnected" || pc.connectionState === "closed") {
                console.log("Peer connection closed");
                console.log("Deleting peer connection from store");
                delete this.peerConnections[referenceId];
            }
        }

        // Add local tracks from our media stream
        if (this.mediaStream) {
            console.log("Adding local tracks to peer connection");
            this.mediaStream.getTracks().forEach((track) => {
                pc.addTrack(track, this.mediaStream!);
            });
        } else {
            console.log("No media stream available to add tracks");
        }

        return pc;
    }

    /**
     * Create a new RTCPeerConnection and send local offer to server.
     */
    async createRtcPeerConnectionAndOffer(reference_id: string, request_id: string) {
        console.log("Creating RTCPeerConnection and offer");
        const pc = this.createRTCPeerConnection(reference_id);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.sendResponse(request_id, { offer });
    }

    /**
     * Create a new RTCPeerConnection and send an answer to the remote offer
     */
    async createRtcPeerConnectionAndAnswer(
        reference_id: string,
        offer: RTCSessionDescriptionInit,
        request_id: string
    ) {
        console.log("Creating RTCPeerConnection and answer");
        const pc = this.createRTCPeerConnection(reference_id);
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer);
        this.sendResponse(request_id, { answer });
    }

    /**
     * Set remote peer answer
     */
    setRemotePeerAnswer(referenceId: string, answer: RTCSessionDescriptionInit) {
        console.log("Setting remote peer answer");
        const pcData = this.peerConnections[referenceId];
        if (!pcData) {
            console.warn("No peer connection found for reference ID", referenceId);
            return;
        }
        pcData.connection.setRemoteDescription(answer);
    }

    /**
     * Add an ICE candidate to a specific peer connection
     */
    addIceCandidate(referenceId: string, candidate: RTCIceCandidate) {
        const pcData = this.peerConnections[referenceId];
        if (!pcData) {
            console.warn("No peer connection found for reference ID", referenceId);
            return;
        }
        pcData.connection.addIceCandidate(candidate);
    }

    /**
     * Update the store's active MediaStream and ensure that
     * any existing RTCPeerConnections also update to use these tracks.
     */
    update_media_stream(mediaStream: MediaStream) {
        runInAction(() => {
            this.mediaStream = mediaStream;
        });

        Object.keys(this.peerConnections).forEach((key) => {
            const pcData = this.peerConnections[key];
            const senders = pcData.connection.getSenders();
            senders.forEach((sender) => {
                pcData.connection.removeTrack(sender);
            });
            mediaStream.getTracks().forEach((track) => {
                pcData.connection.addTrack(track, mediaStream);
            });
        });
    }

    /**
     * Send a request to leave the room
     */
    leaveRoom() {
        // Clean up local data
        Object.keys(this.peerConnections).forEach((key) => {
            const pcData = this.peerConnections[key];
            pcData.connection.close();
            delete this.peerConnections[key];
        });
        this.websocket?.close();
        this.mediaStream?.getVideoTracks().forEach((track) => track.stop());
        this.mediaStream?.getAudioTracks().forEach((track) => track.stop());
        this.mediaStream?.getTracks().forEach((track) => track.stop());
        runInAction(() => {
            this.connectionState = undefined;
            this.mediaStream = undefined;
            this.roomId = undefined;
        });
    }

    /**
     * Helper to send a request to the WebSocket signaling server
     * If `awaitResponse` is true, we return a Promise that resolves with the
     * response. Otherwise we resolve immediately.
     */
    sendRequest(
        method: string,
        params: Record<string, any> = {},
        await_response = false
    ): Promise<any> {
        return new Promise((resolve) => {
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                console.warn("WebSocket is not open. Cannot send request.");
                resolve(null);
                return;
            }

            // Construct request object
            const requestId: string | undefined = await_response ? this.generateUniqueId() : undefined;
            const request: { id: string | undefined; type: string; method: string; params: Record<string, any> } = {
                id: requestId,
                type: "request",
                method,
                params,
            };


            // If awaiting a response, we'll track it in requestResponses
            if (await_response) {
                runInAction(() => {
                    this.requestResponses[requestId!] = undefined;
                });
            }

            console.log("Sending request", request);
            // Send request
            this.websocket.send(JSON.stringify(request));

            // If we don't need a response, resolve now.
            if (!await_response) {
                resolve(null);
                return;
            }

            // Otherwise, poll until we get a response in requestResponses
            const interval = setInterval(() => {
                const responseData = this.requestResponses[requestId!];
                if (responseData !== undefined) {
                    clearInterval(interval);
                    runInAction(() => {
                        delete this.requestResponses[requestId!];
                    });
                    console.log("Received response", responseData);
                    resolve(responseData);
                }
            }, 50);
        });
    }

    /**
     * Helper to send a response back to the signaling server
     */
    sendResponse(request_id: string, data: Record<string, any>) {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket is not open. Cannot send response.");
            return;
        }

        const response = {
            request_id,
            type: "response",
            data,
        };
        console.log("Sending response", response);
        this.websocket.send(JSON.stringify(response));
    }

    /**
     * Utility to generate unique IDs for requests
     */
    private generateUniqueId() {
        return Math.random().toString(36).substring(2, 15);
    }
}

// Export a singleton store
export const roomStore = new RoomStore();
