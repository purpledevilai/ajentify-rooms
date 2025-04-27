import { useEffect, useRef } from "react";

interface MediaStreamVideoProps {
    stream: MediaStream | null;
    muted?: boolean;
}

export const MediaStreamVideo = ({ stream, muted = false }: MediaStreamVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        console.log("Setting video stream:", stream);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            borderRadius: "8px",
        }}
    />;
};
