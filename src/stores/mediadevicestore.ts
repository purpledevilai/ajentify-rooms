import { makeAutoObservable } from "mobx";

class MediaDeviceStore {

    videoDevices: MediaDeviceInfo[] = [];
    audioDevices: MediaDeviceInfo[] = [];
    selectedVideoDevice: MediaDeviceInfo | undefined = undefined;
    selectedAudioDevice: MediaDeviceInfo | undefined = undefined;
    mediaStream: MediaStream | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    initializeMediaDevices = async () => {
        // Prompt for both video and audio
        await navigator.mediaDevices.getUserMedia();

        // Get all the devices
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Separate video and audio devices
        this.videoDevices = devices.filter((d) => d.kind === "videoinput");
        this.audioDevices = devices.filter((d) => d.kind === "audioinput");

    }

    toggleMute = (option: "audio" | "video") => {
        if (!this.mediaStream) return;
        let track: MediaStreamTrack | undefined = undefined;
        if (option === "audio") {
            track = this.mediaStream.getAudioTracks()[0];
        } else if (option === "video") {
            track = this.mediaStream.getVideoTracks()[0];
        }
        if (!track) return;
        track.enabled = !track.enabled;
    }
}

export const mediaDeviceStore = new MediaDeviceStore();