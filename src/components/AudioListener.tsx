import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Loader2 } from "lucide-react";
import BirdResult from "./BirdResult";

interface BirdIdentification {
  birdName: string;
  confidence: number;
  reasoning?: string;
  alternatives?: string[];
  facts?: string;
}

const AudioListener = () => {
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BirdIdentification | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await analyzeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Listening to bird sounds...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record bird sounds",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = (reader.result as string).split(',')[1];

      const { data, error } = await supabase.functions.invoke('identify-bird-audio', {
        body: { audioBase64: base64Audio }
      });

      if (error) throw error;

      setResult(data);

      await supabase.from('bird_identifications').insert({
        bird_name: data.birdName,
        confidence: data.confidence,
        identification_type: 'audio',
        additional_info: {
          reasoning: data.reasoning,
          alternatives: data.alternatives,
          facts: data.facts
        }
      });

      toast({
        title: "Bird identified!",
        description: data.birdName,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Identification failed",
        description: "Please try recording again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-center">
              Record Bird Sounds
            </h2>
            
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={handleToggleRecording}
              disabled={isAnalyzing}
              className="rounded-full w-40 h-40 text-lg shadow-2xl hover:scale-110 transition-all duration-300 relative group"
            >
              {isListening ? (
                <div className="flex flex-col items-center">
                  <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
                  <MicOff className="w-12 h-12 mb-2 animate-pulse relative z-10" />
                  <span className="text-base font-bold relative z-10">{recordingTime}s</span>
                </div>
              ) : (
                <div className="flex flex-col items-center relative z-10">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Mic className="w-12 h-12 mb-2" />
                  <span className="text-base font-bold">Record</span>
                </div>
              )}
            </Button>

            {isAnalyzing && (
              <div className="flex items-center gap-3 text-foreground animate-fade-in">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-lg font-semibold">Analyzing bird sounds...</span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-5 rounded-xl border border-primary/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm font-semibold text-foreground mb-3">
              <strong>Recording tips:</strong>
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
              <li>Get as close to the bird as safely possible</li>
              <li>Record in a quiet environment to reduce background noise</li>
              <li>Record for at least 5-10 seconds for best results</li>
              <li>Hold your device steady during recording</li>
            </ul>
          </div>
        </div>
      </Card>

      {result && <BirdResult result={result} type="audio" />}
    </div>
  );
};

export default AudioListener;