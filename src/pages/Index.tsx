import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudioListener from "@/components/AudioListener";
import ImageScanner from "@/components/ImageScanner";
import { Volume2, Camera } from "lucide-react";
import birdLogo from "@/assets/bird-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--accent-rgb),0.1),transparent_50%)]" />
      
      {/* Header */}
      <header className="relative py-8 px-4 text-center animate-fade-in">
        <div className="flex flex-col items-center justify-center gap-4 mb-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img 
              src={birdLogo} 
              alt="Birds of East Africa Logo" 
              className="relative w-32 h-32 md:w-40 md:h-40 object-contain transform group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-scale-in">
            Birds of East Africa
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the beautiful birds of East Africa through sound or sight
        </p>
      </header>

      {/* Main Content */}
      <main className="relative container max-w-4xl mx-auto px-4 pb-12">
        <Tabs defaultValue="audio" className="w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/50 backdrop-blur-sm shadow-lg border border-border/50">
            <TabsTrigger 
              value="audio" 
              className="text-lg data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all duration-300 hover:scale-105"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Listen to Bird Sounds
            </TabsTrigger>
            <TabsTrigger 
              value="image" 
              className="text-lg data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all duration-300 hover:scale-105"
            >
              <Camera className="w-5 h-5 mr-2" />
              Scan Bird Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="mt-0">
            <AudioListener />
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            <ImageScanner />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">
          Powered by AI • Helping conserve East African biodiversity
        </p>
      </footer>
    </div>
  );
};

export default Index;