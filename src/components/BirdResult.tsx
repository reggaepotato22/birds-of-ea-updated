import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bird, Sparkles, MapPin, Shield, Info } from "lucide-react";

interface BirdResultProps {
  result: any;
  type: 'audio' | 'image';
}

const BirdResult = ({ result, type }: BirdResultProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md border-primary/30 shadow-2xl animate-scale-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between animate-fade-in">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bird className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {result.birdName}
              </h3>
            </div>
            <Badge className={`${getConfidenceColor(result.confidence)} text-white shadow-lg hover:scale-105 transition-transform duration-200`}>
              {getConfidenceLabel(result.confidence)} ({Math.round(result.confidence * 100)}%)
            </Badge>
          </div>
        </div>

        {/* Audio-specific info */}
        {type === 'audio' && result.reasoning && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-5 rounded-xl border border-primary/20 hover:shadow-lg transition-all duration-300 animate-fade-in">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Why this identification?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.reasoning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Image-specific info */}
        {type === 'image' && result.keyFeatures && result.keyFeatures.length > 0 && (
          <div className="bg-sage/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-forest-medium mt-0.5" />
              <div>
                <h4 className="font-semibold text-forest-dark mb-2">
                  Key Identifying Features
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.keyFeatures.map((feature: string, idx: number) => (
                    <li key={idx} className="text-sm text-forest-medium">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Habitat info */}
        {result.habitat && (
          <div className="bg-sage/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-forest-medium mt-0.5" />
              <div>
                <h4 className="font-semibold text-forest-dark mb-1">Habitat</h4>
                <p className="text-sm text-forest-medium">{result.habitat}</p>
              </div>
            </div>
          </div>
        )}

        {/* Conservation status */}
        {result.conservation && (
          <div className="bg-sage/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-forest-medium mt-0.5" />
              <div>
                <h4 className="font-semibold text-forest-dark mb-1">
                  Conservation Status
                </h4>
                <p className="text-sm text-forest-medium">{result.conservation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Interesting facts */}
        {result.facts && (
          <div className="bg-forest-light/50 p-4 rounded-lg border border-forest-medium/20">
            <h4 className="font-semibold text-forest-dark mb-2">
              Interesting Facts
            </h4>
            <p className="text-sm text-forest-medium">{result.facts}</p>
          </div>
        )}

        {/* Alternative possibilities */}
        {result.alternatives && result.alternatives.length > 0 && (
          <div className="border-t border-forest-medium/20 pt-4">
            <h4 className="font-semibold text-forest-medium mb-2 text-sm">
              Other Possibilities:
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.alternatives.map((alt: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="border-forest-medium/30"
                >
                  {alt}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BirdResult;