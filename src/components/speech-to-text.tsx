'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Copy, Trash2 } from 'lucide-react';
import { sttService, STTOptions, STTResult } from '@/lib/stt-utils';
import { useToast } from '@/hooks/use-toast';

interface SpeechToTextProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onTranscriptionUpdate?: (transcript: string) => void;
  className?: string;
  placeholder?: string;
}

export function SpeechToText({ 
  onTranscriptionComplete, 
  onTranscriptionUpdate, 
  className,
  placeholder = "Your speech will appear here..."
}: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fullTranscriptRef = useRef('');

  useEffect(() => {
    const supported = sttService.checkSupport();
    setIsSupported(supported);
    
    if (!supported) {
      setError('Speech recognition is not supported in your browser');
    }
  }, []);

  const handleStartListening = () => {
    if (!isSupported) return;

    setError(null);
    setIsListening(true);
    setInterimTranscript('');
    
    // Configure STT options
    sttService.configure({
      language,
      continuous: true,
      interimResults: true,
      maxAlternatives: 1
    });

    // Start listening
    sttService.startListening(
      (result: STTResult) => {
        if (result.isFinal) {
          // Final result - add to full transcript
          const newTranscript = fullTranscriptRef.current + ' ' + result.transcript;
          fullTranscriptRef.current = newTranscript.trim();
          setTranscript(fullTranscriptRef.current);
          setInterimTranscript('');
        } else {
          // Interim result - show as temporary
          setInterimTranscript(result.transcript);
          const currentFull = fullTranscriptRef.current + ' ' + result.transcript;
          onTranscriptionUpdate?.(currentFull.trim());
        }
      },
      (error: string) => {
        setError(error);
        setIsListening(false);
        toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: error
        });
      },
      undefined
    );
  };

  const handleStopListening = () => {
    sttService.stopListening();
    setIsListening(false);
    // Automatically trigger task generation when listening stops
    if (transcript) {
      onTranscriptionComplete?.(transcript);
    }
  };

  const handleClearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    fullTranscriptRef.current = '';
    onTranscriptionUpdate?.('');
  };

  const handleCopyTranscript = async () => {
    const textToCopy = transcript || interimTranscript;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied to clipboard',
        description: 'Transcript copied to clipboard'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Failed to copy transcript to clipboard'
      });
    }
  };

  const availableLanguages = sttService.getAvailableLanguages();

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5" />
            Speech-to-Text
          </CardTitle>
          <CardDescription>
            Speech recognition is not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Speech-to-Text
        </CardTitle>
        <CardDescription>
          Press the button and speak your task. The app will handle everything automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <Button
          onClick={isListening ? handleStopListening : handleStartListening}
          variant={isListening ? "destructive" : "default"}
          className="w-full"
          disabled={!isSupported}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Voice Note
            </>
          )}
        </Button>
        {isListening && (
          <div className="text-sm text-blue-500 animate-pulse text-center">
            Listening... Speak now
          </div>
        )}
      </CardContent>
    </Card>
  );
} 