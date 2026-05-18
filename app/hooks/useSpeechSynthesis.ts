"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ── Speech Synthesis Hook ────────────────────────────────────────────────────
// Provides text-to-speech narration using the Web Speech API with
// mute/unmute controls and voice selection.

interface UseSpeechSynthesisReturn {
  /** Speak the given text. Cancels any current narration first. */
  speak: (text: string) => void;
  /** Stop current narration */
  stop: () => void;
  /** Whether speech is currently playing */
  isSpeaking: boolean;
  /** Whether narration is muted */
  isMuted: boolean;
  /** Toggle mute/unmute */
  toggleMute: () => void;
  /** Whether the browser supports speech synthesis */
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pendingTextRef = useRef<string>("");

  // Check for browser support on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Select the best available English voice
  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!isSupported) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prefer Google or high-quality English voices
    const preferred = voices.find(
      v => v.lang.startsWith("en") && v.name.includes("Google")
    );
    const english = voices.find(v => v.lang.startsWith("en"));
    return preferred || english || voices[0] || null;
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || isMuted) return;

      // Cancel any existing narration
      stop();

      // Clean up the text for narration: remove markdown, hashtags, emojis
      const cleaned = text
        .replace(/\*+/g, "")
        .replace(/#\w+/g, "")
        .replace(/[🏛️📍🎨🎯📅📖✦🔄✨⚠️⏳🔍📁🗺️📚⚙️🏗️💡🧳]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleaned) return;

      pendingTextRef.current = cleaned;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, isMuted, stop, getVoice]
  );

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        // Muting: stop current narration
        stop();
      }
      return next;
    });
  }, [stop]);

  // Stop narration on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  // Load voices when they become available (some browsers load async)
  useEffect(() => {
    if (!isSupported) return;
    const handleVoicesChanged = () => {
      // Voices are now available — no state update needed,
      // getVoice() will pick them up on next speak() call
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isMuted,
    toggleMute,
    isSupported,
  };
}
