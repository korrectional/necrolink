"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Sparkles, Terminal } from "lucide-react";

interface TerminalWhisperProps {
  whisperText: string;
  repoName: string;
  autoPlay?: boolean;
}

export default function TerminalWhisper({
  whisperText,
  repoName,
  autoPlay = false
}: TerminalWhisperProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  // Typewriter effect for spectral whisper
  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      if (index < whisperText.length) {
        setDisplayedText(whisperText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [whisperText]);

  // Web Speech synthesis voice generator
  const handlePlayVoice = () => {
    if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(whisperText);
    utterance.rate = 0.85;
    utterance.pitch = 0.75; // Low, resonant spectral pitch

    // Try selecting a deep English voice
    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Male") || v.name.includes("Natural")));
    if (deepVoice) utterance.voice = deepVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleMute = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative border border-amber-600/40 rounded-xl bg-stone-900/80 backdrop-blur-md p-5 shadow-2xl overflow-hidden">
      {/* Background Spectral Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold">
            Ghost Shell Whisper: {repoName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayVoice}
            disabled={isPlaying || isMuted}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all duration-200 ${
              isPlaying
                ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/30"
                : "bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isPlaying ? "Whispering..." : "Hear Spirit"}
          </button>

          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition"
            title={isMuted ? "Unmute" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-stone-300" />}
          </button>
        </div>
      </div>

      {/* Spectral Waveform Animation */}
      <div className="flex items-center gap-1 h-6 mb-3 px-1">
        {[40, 70, 30, 90, 60, 20, 85, 45, 95, 35, 75, 50, 80, 25, 65, 30].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              isPlaying ? "bg-amber-400 shadow-sm shadow-amber-400" : "bg-stone-800"
            }`}
            style={{
              height: isPlaying ? `${Math.max(6, Math.floor(h * Math.random()))}px` : "4px"
            }}
          />
        ))}
      </div>

      {/* Terminal Whisper Content */}
      <div className="font-mono text-sm leading-relaxed text-stone-300 bg-stone-950/60 p-4 rounded-lg border border-stone-800/80">
        <span className="text-amber-500 font-bold mr-2">❯</span>
        <span className="italic">{displayedText}</span>
        <span className="inline-block w-2 h-4 bg-amber-500 ml-1 animate-pulse align-middle" />
      </div>
    </div>
  );
}
