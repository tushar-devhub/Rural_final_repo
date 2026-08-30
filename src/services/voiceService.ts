// Voice Service — Web Speech API for STT + TTS
// Free, browser-native, supports Hindi

export type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

let recognition: SpeechRecognition | null = null;
let synth: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

// ─── Speech Recognition (STT) ───

export function isSpeechRecognitionSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startListening(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void,
): void {
  if (!isSpeechRecognitionSupported()) {
    onError("Speech recognition is not supported in this browser.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "hi-IN"; // Hindi (India)

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimText = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }

    if (finalText) {
      onResult(finalText, true);
    } else if (interimText) {
      onResult(interimText, false);
    }
  };

  recognition.onerror = (event: Event & { error: string }) => {
    if (event.error === "no-speech") {
      onError("कोई आवाज़ नहीं सुनाई दी। दोबारा बोलें।");
    } else if (event.error === "not-allowed") {
      onError("Microphone permission दें। Settings में जाकर allow करें।");
    } else if (event.error === "network") {
      onError("Internet connection में समस्या है।");
    } else {
      onError("आवाज़ समझने में दिक्कत हुई। दोबारा कोशिश करें।");
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch {
    onError("Microphone शुरू नहीं हो पाई। दोबारा कोशिश करें।");
  }
}

export function stopListening(): void {
  if (recognition) {
    try {
      recognition.abort();
    } catch {
      // ignore
    }
    recognition = null;
  }
}

// ─── Text-to-Speech (TTS) ───

export function isSpeechSynthesisSupported(): boolean {
  return !!window.speechSynthesis;
}

export function speakHindi(
  text: string,
  onEnd: () => void,
  onError: () => void,
): void {
  if (!isSpeechSynthesisSupported()) {
    onError();
    return;
  }

  synth = window.speechSynthesis;
  synth.cancel(); // Stop any current speech

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "hi-IN";
  currentUtterance.rate = 0.95;
  currentUtterance.pitch = 1.0;

  // Try to find a Hindi voice
  const voices = synth.getVoices();
  const hindiVoice = voices.find((v) => v.lang.startsWith("hi"));
  if (hindiVoice) {
    currentUtterance.voice = hindiVoice;
  }

  currentUtterance.onend = () => {
    currentUtterance = null;
    onEnd();
  };

  currentUtterance.onerror = () => {
    currentUtterance = null;
    onError();
  };

  synth.speak(currentUtterance);
}

export function stopSpeaking(): void {
  if (synth) {
    synth.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  return synth?.speaking ?? false;
}

// ─── Audio Visualizer ───

export function createAudioAnalyzer(
  onVolume: (volume: number) => void,
): { connect: () => void; disconnect: () => void } | null {
  if (!navigator.mediaDevices?.getUserMedia) return null;

  let stream: MediaStream | null = null;
  let analyser: AnalyserNode | null = null;
  let animFrame: number | null = null;

  return {
    connect: async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const update = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          onVolume(avg / 255);
          animFrame = requestAnimationFrame(update);
        };
        update();
      } catch {
        // mic access denied
      }
    },
    disconnect: () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      stream?.getTracks().forEach((t) => t.stop());
      analyser = null;
      stream = null;
    },
  };
}
