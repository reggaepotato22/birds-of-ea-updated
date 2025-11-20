import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Camera, Loader2, X } from "lucide-react";
import BirdResult from "./BirdResult";

interface BirdIdentification {
  birdName: string;
  confidence: number;
  keyFeatures?: string[];
  alternatives?: string[];
  habitat?: string;
  conservation?: string;
  facts?: string;
}

const ImageScanner = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BirdIdentification | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload or capture a bird image",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('identify-bird-image', {
        body: { imageBase64: selectedImage }
      });

      if (error) throw error;

      setResult(data);

      // Store in database
      await supabase.from('bird_identifications').insert({
        bird_name: data.birdName,
        confidence: data.confidence,
        identification_type: 'image',
        additional_info: {
          keyFeatures: data.keyFeatures,
          alternatives: data.alternatives,
          habitat: data.habitat,
          conservation: data.conservation,
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
        description: "Please try again with a clearer image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Upload or Capture Bird Photo
          </h2>

          {!selectedImage ? (
            <div className="space-y-6">
              <div className="relative border-2 border-dashed border-primary/30 rounded-2xl p-16 text-center hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-16 h-16 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    Upload a photo or take a picture of the bird
                  </p>
                </div>
                <div className="relative flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="flex-1">
                    <Button className="w-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg" size="lg" asChild>
                      <span>
                        <Upload className="w-6 h-6 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="camera-capture"
                  />
                  <label htmlFor="camera-capture" className="flex-1">
                    <Button className="w-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg" size="lg" variant="secondary" asChild>
                      <span>
                        <Camera className="w-6 h-6 mr-2" />
                        Take Photo
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-5 rounded-xl border border-primary/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p className="text-sm font-semibold text-foreground mb-3">
                  <strong>Tips for better results:</strong>
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
                  <li>Ensure the bird is clearly visible</li>
                  <li>Good lighting improves accuracy</li>
                  <li>Capture distinctive features (beak, plumage, markings)</li>
                  <li>Avoid blurry or distant shots</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <img
                  src={selectedImage}
                  alt="Selected bird"
                  className="w-full max-h-[500px] object-contain bg-gradient-to-br from-muted/50 to-muted/30"
                />
                <Button
                  onClick={clearImage}
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 shadow-xl hover:scale-110 transition-transform duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="w-full text-lg font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Identifying Bird...
                  </>
                ) : (
                  "Identify Bird"
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {result && <BirdResult result={result} type="image" />}
    </div>
  );
};

export default ImageScanner;