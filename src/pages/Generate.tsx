import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateVideo } from "@/hooks/useVideos";
import { toast } from "sonner";
import { Sparkles, Loader2, Clock, Palette } from "lucide-react";
import { GenerateParams } from "@/types/video";

const styles = [
  { value: "motivational", label: "Motivational", emoji: "🔥" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "emotional", label: "Emotional", emoji: "💖" },
  { value: "facts", label: "Facts & Education", emoji: "🧠" },
];

const durations = [
  { value: 15, label: "15 seconds", description: "Quick & punchy" },
  { value: 30, label: "30 seconds", description: "Standard reel" },
  { value: 60, label: "60 seconds", description: "Extended story" },
];

export default function Generate() {
  const navigate = useNavigate();
  const createVideo = useCreateVideo();
  
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const [style, setStyle] = useState<GenerateParams["style"]>("motivational");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsSubmitting(true);

    try {
      const video = await createVideo.mutateAsync({
        topic: topic.trim(),
        duration,
        style,
      });

      toast.success("Video generation started!");
      navigate(`/result/${video.id}`);
    } catch (error) {
      console.error("Failed to create video:", error);
      toast.error("Failed to start video generation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-neon-purple/10 mb-4">
              <Sparkles className="h-8 w-8 text-neon-purple" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Generate New Reel</h1>
            <p className="text-muted-foreground">
              Enter your topic and preferences to create an AI-powered video reel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base font-medium">
                Topic
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Never give up on your dreams, 5 productivity tips..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-12 bg-secondary/50 border-border/50 focus:border-neon-purple"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Be specific for better results. The AI will generate a script based on your topic.
              </p>
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value as 15 | 30 | 60)}
                    disabled={isSubmitting}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      duration === d.value
                        ? "border-neon-purple bg-neon-purple/10 shadow-[0_0_20px_hsl(var(--neon-purple)/0.2)]"
                        : "border-border bg-secondary/30 hover:border-border/80"
                    }`}
                  >
                    <div className="font-semibold">{d.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{d.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style
              </Label>
              <Select value={style} onValueChange={(v) => setStyle(v as GenerateParams["style"])} disabled={isSubmitting}>
                <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="neon"
              size="xl"
              className="w-full"
              disabled={isSubmitting || !topic.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Reel
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
