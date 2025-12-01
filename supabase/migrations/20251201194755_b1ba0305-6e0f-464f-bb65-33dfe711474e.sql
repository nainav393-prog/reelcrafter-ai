-- Create videos table for storing generated reels
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 15,
  style TEXT NOT NULL DEFAULT 'motivational',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  script TEXT,
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow public access for MVP (no auth)
CREATE POLICY "Anyone can view videos" 
ON public.videos 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update videos" 
ON public.videos 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for videos table
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;