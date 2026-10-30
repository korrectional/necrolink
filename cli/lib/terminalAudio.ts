/**
 * Ghostly Terminal Audio Synthesizer & Local Player
 * Integrates ElevenLabs SDK voice generation with cross-platform system audio playback
 * (Windows PowerShell System.Speech/MediaPlayer, macOS afplay, Linux aplay/paplay).
 * Features graceful silent fallback when run in headless or CI environments.
 */

import { exec, execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export interface AudioPlayOptions {
  voiceId?: string;
  silent?: boolean;
}

export class TerminalAudioEngine {
  private apiKey?: string;
  private defaultVoiceId: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    // ElevenLabs "Adam" or custom ghostly narrator
    this.defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
  }

  /**
   * Synthesizes and speaks text using ElevenLabs or system fallback TTS.
   */
  public async speakText(text: string, options: AudioPlayOptions = {}): Promise<boolean> {
    if (options.silent || process.env.NECROLINK_SILENT === "1") {
      return false;
    }

    // Print spectral ASCII audio wave in console
    this.renderWaveform(text.slice(0, 40));

    // 1. Try ElevenLabs API if key is present
    if (this.apiKey) {
      try {
        const audioBuffer = await this.fetchElevenLabsStream(text, options.voiceId || this.defaultVoiceId);
        if (audioBuffer) {
          const tempPath = path.join(os.tmpdir(), `necrolink-voice-${Date.now()}.mp3`);
          fs.writeFileSync(tempPath, audioBuffer);
          await this.playLocalFile(tempPath);
          try { fs.unlinkSync(tempPath); } catch {}
          return true;
        }
      } catch {
        // Fall back gracefully to local system TTS
      }
    }

    // 2. Local system speech playback
    return this.playSystemSpeech(text);
  }

  private async fetchElevenLabsStream(text: string, voiceId: string): Promise<Buffer | null> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": this.apiKey!
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.50
        }
      })
    });

    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private playSystemSpeech(text: string): boolean {
    const cleanText = text.replace(/["'`$\\]/g, " ").replace(/\n/g, " ").slice(0, 200);
    const platform = os.platform();

    try {
      if (platform === "win32") {
        // Use PowerShell System.Speech.Synthesis asynchronously
        const psCommand = `powershell -NoProfile -Command "Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.Rate = -1; $synth.Speak('${cleanText}')"`;
        exec(psCommand, () => {});
        return true;
      } else if (platform === "darwin") {
        exec(`say "${cleanText}"`, () => {});
        return true;
      } else if (platform === "linux") {
        exec(`espeak "${cleanText}" 2>/dev/null || spd-say "${cleanText}" 2>/dev/null`, () => {});
        return true;
      }
    } catch {
      // Graceful silent fallback
    }
    return false;
  }

  private async playLocalFile(filePath: string): Promise<void> {
    const platform = os.platform();
    return new Promise((resolve) => {
      let command = "";
      if (platform === "darwin") {
        command = `afplay "${filePath}"`;
      } else if (platform === "win32") {
        command = `powershell -NoProfile -Command "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;
      } else {
        command = `aplay "${filePath}" 2>/dev/null || play "${filePath}" 2>/dev/null`;
      }

      exec(command, { timeout: 10000 }, () => resolve());
    });
  }

  private renderWaveform(label: string) {
    const wave = "  ~.~.·°¯`°·.·°¯`°·.·~";
    console.log(`\x1b[33m${wave}\x1b[0m \x1b[90m[Spectral Whisper: "${label}..."]\x1b[0m`);
  }
}

export const terminalAudio = new TerminalAudioEngine();
