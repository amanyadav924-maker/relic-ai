"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ── Camera Permission & Lifecycle Hook ───────────────────────────────────────
// Manages browser camera access, stream lifecycle, frame capture, and cleanup.

export type CameraPermission = "idle" | "requesting" | "granted" | "denied" | "error";

interface UseCameraReturn {
  /** Current permission/connection state */
  permissionState: CameraPermission;
  /** Ref to attach to a <video> element for live preview */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Whether the camera stream is actively playing */
  isStreaming: boolean;
  /** Start camera with optional facing mode */
  startCamera: () => Promise<void>;
  /** Stop the camera stream */
  stopCamera: () => void;
  /** Capture the current video frame as a base64 JPEG string (no data URI prefix) */
  captureFrame: () => { base64: string; dataUrl: string } | null;
  /** Switch between front and back cameras */
  switchCamera: () => Promise<void>;
  /** Whether the device likely has multiple cameras */
  hasMultipleCameras: boolean;
  /** Human-readable error message */
  errorMessage: string;
}

export function useCamera(): UseCameraReturn {
  const [permissionState, setPermissionState] = useState<CameraPermission>("idle");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check for multiple cameras on mount
  useEffect(() => {
    async function checkCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // Silently ignore — permission may not be granted yet
      }
    }
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      checkCameras();
    }
  }, []);

  // Stop all tracks and clean up the stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Start camera with current facingMode preference
  const startCamera = useCallback(async () => {
    // Check for MediaDevices API support
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("error");
      setErrorMessage("Camera not supported on this device or browser.");
      return;
    }

    setPermissionState("requesting");
    setErrorMessage("");

    // Stop any existing stream before starting a new one
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for the video to actually start playing
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          video.onloadedmetadata = () => {
            video.play().then(resolve).catch(reject);
          };
          // Timeout fallback
          setTimeout(resolve, 3000);
        });
      }

      setPermissionState("granted");
      setIsStreaming(true);

      // Re-check for multiple cameras now that we have permission
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setHasMultipleCameras(videoDevices.length > 1);

    } catch (err) {
      const error = err as DOMException;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setErrorMessage("Camera permission was denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setPermissionState("error");
        setErrorMessage("No camera found on this device.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setPermissionState("error");
        setErrorMessage("Camera is already in use by another application.");
      } else {
        setPermissionState("error");
        setErrorMessage(`Camera error: ${error.message || "Unknown error"}`);
      }
    }
  }, [facingMode, stopCamera]);

  // Switch between front and back cameras
  const switchCamera = useCallback(async () => {
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  }, []);

  // Re-start camera when facingMode changes (only if already streaming)
  useEffect(() => {
    if (permissionState === "granted") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Capture current video frame to base64 JPEG using an offscreen canvas
  const captureFrame = useCallback((): { base64: string; dataUrl: string } | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    // Create or reuse canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1] ?? "";

    return { base64, dataUrl };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    permissionState,
    videoRef,
    isStreaming,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
    hasMultipleCameras,
    errorMessage,
  };
}
