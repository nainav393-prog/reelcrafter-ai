import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useVideo, useUpdateVideo } from "@/hooks/useVideos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, ArrowLeft, RefreshCw, Loader2, Play, AlertCircle } from "lucide-react";
import { VideoGenerator } from "@/lib/videoGenerator";
import { MediaItem } from "@/types/video";

export default function Result() {
  const { id } = useParams<{ id: string }>();
  const { video, isLoading, error } = useVideo(id || "");
  const updateVideo = useUpdateVideo();
  
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideo = useCallback(async () => {
    if (!video || video.status !== "PENDING" || isGenerating) return;

    setIsGenerating(true);
    setProgress(0);
    setProgressMessage("Starting generation...");

    try {
      // Update status to PROCESSING
      await updateVideo.mutateAsync({ id: video.id, status: "PROCESSING" });

      // Step 1: Generate script
      setProgress(10);
      setProgressMessage("Generating AI script...");
      
      const { data: scriptData, error: scriptError } = await supabase.functions.invoke("generate-script", {
        body: { topic: video.topic, duration: video.duration, style: video.style },
      });

      if (scriptError || scriptData?.error) {
        throw new Error(scriptData?.error || scriptError?.message || "Failed to generate script");
      }

      const script = scriptData.script;
      await updateVideo.mutateAsync({ id: video.id, script });
      
      // Step 2: Search for media
      setProgress(30);
      setProgressMessage("Searching for stock footage...");
      
      const scriptLines = script.split('\n').filter((line: string) => line.trim());
      const mediaCount = Math.min(scriptLines.length, 5);
      
      const { data: mediaData, error: mediaError } = await supabase.functions.invoke("search-media", {
        body: { query: video.topic, count: mediaCount },
      });

      if (mediaError || mediaData?.error) {
        throw new Error(mediaData?.error || mediaError?.message || "Failed to search media");
      }

      const media: MediaItem[] = mediaData.media || [];
      
      if (media.length === 0) {
        throw new Error("No media found for this topic. Try a different topic.");
      }

      // Step 3: Render video in browser
      setProgress(50);
      setProgressMessage("Rendering video (this may take a minute)...");
      
      const generator = new VideoGenerator(
        (p) => setProgress(50 + p * 0.4),
        (msg) => setProgressMessage(msg)
      );

      const videoBlob = await generator.generateVideo({
        script: scriptLines,
        media,
        duration: video.duration,
      });

      // Create object URL for the video
      const videoUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoUrl);
      
      // Step 4: Complete
      setProgress(100);
      setProgressMessage("Video ready!");
      
      await updateVideo.mutateAsync({ 
        id: video.id, 
        status: "COMPLETED",
        video_url: videoUrl, // In a real app, you'd upload to storage
      });

      toast.success("Your reel is ready!");

    } catch (err) {
      console.error("Generation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      
      await updateVideo.mutateAsync({ 
        id: video.id, 
        status: "FAILED",
        error_message: errorMessage,
      });

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [video, isGenerating, updateVideo]);

  // Auto-start generation for pending videos
  useEffect(() => {
    if (video?.status === "PENDING" && !isGenerating) {
      generateVideo();
    }
  }, [video?.status, isGenerating, generateVideo]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Video not found</h2>
            <p className="text-muted-foreground mb-4">
              This video doesn't exist or was deleted.
            </p>
            <Link to="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[9/16] max-h-[600px] mx-auto bg-card rounded-2xl overflow-hidden border border-border">
              {(video.status === "COMPLETED" || generatedVideoUrl) ? (
                <video
                  src={generatedVideoUrl || video.video_url || undefined}
                  controls
                  className="w-full h-full object-cover"
                  playsInline
                >
                  Your browser does not support video playback.
                </video>
              ) : video.status === "PROCESSING" || isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="relative w-24 h-24 mb-6">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        className="fill-none stroke-secondary"
                        strokeWidth="8"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        className="fill-none stroke-neon-purple"
                        strokeWidth="8"
                        strokeDasharray={276.46}
                        strokeDashoffset={276.46 * (1 - progress / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground">{progressMessage}</p>
                </div>
              ) : video.status === "FAILED" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="font-medium mb-2">Generation Failed</p>
                  <p className="text-sm text-muted-foreground mb-4">{video.error_message}</p>
                  <Button onClick={generateVideo} variant="secondary" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{video.topic}</h1>
                <StatusBadge status={video.status} />
              </div>
              <p className="text-muted-foreground">
                {video.duration}s • {video.style}
              </p>
            </div>

            {video.script && (
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-purple" />
                  Generated Script
                </h3>
                <div className="space-y-2">
                  {video.script.split('\n').filter(line => line.trim()).map((line, index) => (
                    <p key={index} className="text-sm text-muted-foreground font-mono">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {(video.status === "COMPLETED" || generatedVideoUrl) && (
              <div className="flex gap-3">
                {generatedVideoUrl && (
                  <a href={generatedVideoUrl} download={`reel-${video.id}.webm`}>
                    <Button variant="neon" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Video
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
