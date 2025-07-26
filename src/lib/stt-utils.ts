/**
 * Speech-to-Text utilities using the Web Speech API
 */

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: any;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface STTOptions {
  language?: string; // e.g., 'en-US', 'en-GB', 'es-ES'
  continuous?: boolean; // Whether to continue listening after speech ends
  interimResults?: boolean; // Whether to return interim results
  maxAlternatives?: number; // Number of alternative transcriptions
}

export interface STTResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

class STTService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check for browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.isSupported = !!SpeechRecognition;
      
      if (this.isSupported) {
        this.recognition = new (SpeechRecognition as any)();
        this.setupDefaultOptions();
      }
    }
  }

  /**
   * Check if speech-to-text is supported in the current browser
   */
  checkSupport(): boolean {
    return this.isSupported;
  }

  /**
   * Setup default recognition options
   */
  private setupDefaultOptions() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  /**
   * Configure recognition options
   */
  configure(options: STTOptions) {
    if (!this.recognition) return;

    if (options.language) {
      this.recognition.lang = options.language;
    }
    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }
    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults;
    }
    if (options.maxAlternatives !== undefined) {
      this.recognition.maxAlternatives = options.maxAlternatives;
    }
  }

  /**
   * Start listening for speech
   */
  startListening(
    onResult: (result: STTResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): void {
    if (!this.recognition || !this.isSupported) {
      onError?.('Speech recognition is not supported in this browser');
      return;
    }

    // Setup event handlers
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      onResult({
        transcript,
        confidence,
        isFinal
      });
    };

    this.recognition.onerror = (event: any) => {
      const error = this.getErrorMessage(event.error);
      onError?.(error);
    };

    this.recognition.onend = () => {
      onEnd?.();
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      onError?.('Failed to start speech recognition');
    }
  }

  /**
   * Stop listening for speech
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Abort current recognition session
   */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.recognition?.state === 'recording';
  }

  /**
   * Get available languages (if supported)
   */
  getAvailableLanguages(): string[] {
    // This is a basic list - in a real implementation you might want to
    // use a more comprehensive list or detect available languages
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA',
      'es-ES', 'es-MX', 'fr-FR', 'de-DE',
      'it-IT', 'pt-BR', 'pt-PT', 'ru-RU',
      'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'
    ];
  }

  /**
   * Convert error codes to user-friendly messages
   */
  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try again.';
      case 'audio-capture':
        return 'No microphone was found. Please check your microphone settings.';
      case 'not-allowed':
        return 'Microphone access was denied. Please allow microphone access.';
      case 'network':
        return 'Network error occurred. Please check your internet connection.';
      case 'service-not-allowed':
        return 'Speech recognition service is not allowed.';
      case 'bad-grammar':
        return 'Speech recognition grammar error.';
      case 'language-not-supported':
        return 'The selected language is not supported.';
      default:
        return `Speech recognition error: ${error}`;
    }
  }
}

// Create singleton instance
export const sttService = new STTService();

/**
 * Utility function to transcribe audio file (if supported)
 */
export async function transcribeAudioFile(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!sttService.checkSupport()) {
      reject(new Error('Speech recognition is not supported'));
      return;
    }

    // Convert blob to audio element
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // For now, we'll return a placeholder since direct file transcription
    // requires more complex setup with the Web Speech API
    // In a production app, you might want to use a service like Google Speech-to-Text API
    
    resolve('Audio transcription placeholder - use real-time speech recognition instead');
    
    // Cleanup
    URL.revokeObjectURL(audioUrl);
  });
} 