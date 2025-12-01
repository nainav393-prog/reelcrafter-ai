import { Navbar } from "@/components/Navbar";
import { VideoCard } from "@/components/VideoCard";
import { useVideos } from "@/hooks/useVideos";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Film, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { videos, isLoading, error } = useVideos();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Reels</h1>
            <p className="text-muted-foreground mt-1">
              Manage and download your generated videos
            </p>
          </div>
          <Link to="/generate">
            <Button variant="neon" className="gap-2">
              <Plus className="h-4 w-4" />
              Generate New
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
          </div>
        ) : error ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-destructive">Failed to load videos. Please try again.</p>
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neon-purple/10 flex items-center justify-center mx-auto mb-4">
              <Film className="h-8 w-8 text-neon-purple" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No reels yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first AI-generated reel in seconds
            </p>
            <Link to="/generate">
              <Button variant="neon" className="gap-2">
                <Plus className="h-4 w-4" />
                Generate Your First Reel
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
