import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PexelsVideo {
  id: number;
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
}

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, count = 5 } = await req.json();
    
    console.log(`Searching Pexels for: ${query}, count: ${count}`);
    
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS_API_KEY) {
      throw new Error("PEXELS_API_KEY is not configured");
    }

    // First try to get videos
    const videoResponse = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    const videoData = await videoResponse.json();
    console.log(`Found ${videoData.videos?.length || 0} videos`);

    const videos = (videoData.videos || []).map((video: PexelsVideo) => {
      // Prefer HD vertical videos
      const videoFile = video.video_files
        .filter(f => f.height > f.width && f.file_type === 'video/mp4')
        .sort((a, b) => b.height - a.height)[0] 
        || video.video_files[0];
      
      return {
        type: 'video',
        url: videoFile?.link,
        id: video.id,
      };
    }).filter((v: { url?: string }) => v.url);

    // If not enough videos, get images as fallback
    let images: Array<{ type: string; url: string; id: number }> = [];
    if (videos.length < count) {
      const imageResponse = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count - videos.length}&orientation=portrait`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      const imageData = await imageResponse.json();
      console.log(`Found ${imageData.photos?.length || 0} images`);

      images = (imageData.photos || []).map((photo: PexelsPhoto) => ({
        type: 'image',
        url: photo.src.large2x || photo.src.large,
        id: photo.id,
      }));
    }

    const media = [...videos, ...images].slice(0, count);
    
    console.log(`Returning ${media.length} media items`);

    return new Response(JSON.stringify({ media }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in search-media:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search media";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
