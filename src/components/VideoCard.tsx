import { Video } from "@/types/video";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/button";
import { Download, Play, Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="group relative glass rounded-xl p-4 hover:border-neon-purple/30 transition-all duration-300">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-pink/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate pr-2">{video.topic}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {video.duration}s
              </span>
              <span className="capitalize">{video.style}</span>
            </div>
          </div>
          <StatusBadge status={video.status} />
        </div>

        {video.script && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-mono">
            {video.script.split('\n')[0]}...
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
          </span>

          <div className="flex gap-2">
            <Link to={`/result/${video.id}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Play className="h-4 w-4" />
                View
              </Button>
            </Link>
            {video.status === "COMPLETED" && video.video_url && (
              <a href={video.video_url} download>
                <Button variant="secondary" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
