import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpeechToText } from '@/components/speech-to-text';
import { generateTasksFromAudio } from '@/ai/flows/generate-tasks-from-audio';

interface AIVoiceToTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksGenerated: (tasks: any[]) => void;
}

const AIVoiceToTask: React.FC<AIVoiceToTaskProps> = ({ open, onOpenChange, onTasksGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionComplete = async (transcript: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tasks = await generateTasksFromAudio({ transcript });
      onTasksGenerated(tasks);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate tasks from voice note.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Speak your task</DialogTitle>
        </DialogHeader>
        <SpeechToText onTranscriptionComplete={handleTranscriptionComplete} />
        {isLoading && <div className="text-center text-blue-500">Generating tasks...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIVoiceToTask; 