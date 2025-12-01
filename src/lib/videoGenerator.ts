import { MediaItem } from "@/types/video";

interface GenerateVideoParams {
  script: string[];
  media: MediaItem[];
  duration: number;
}

export class VideoGenerator {
  private progressCallback: (progress: number) => void;
  private messageCallback: (message: string) => void;

  constructor(
    progressCallback: (progress: number) => void,
    messageCallback: (message: string) => void
  ) {
    this.progressCallback = progressCallback;
    this.messageCallback = messageCallback;
  }

  async generateVideo(params: GenerateVideoParams): Promise<Blob> {
    const { script, media, duration } = params;
    
    this.messageCallback("Loading media assets...");
    this.progressCallback(0.1);

    // Create canvas for rendering
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    // Calculate timing
    const segmentDuration = duration / script.length;
    const fps = 30;
    const totalFrames = duration * fps;

    // Load media
    const loadedMedia = await this.loadMedia(media);
    this.progressCallback(0.3);

    // Set up MediaRecorder
    const stream = canvas.captureStream(fps);
    const chunks: Blob[] = [];
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 5000000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onerror = (e) => reject(e);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(blob);
      };

      mediaRecorder.start();

      let currentFrame = 0;

      const renderFrame = () => {
        if (currentFrame >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        const currentTime = currentFrame / fps;
        const segmentIndex = Math.min(
          Math.floor(currentTime / segmentDuration),
          script.length - 1
        );
        const segmentProgress = (currentTime % segmentDuration) / segmentDuration;

        // Clear canvas
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background media
        const mediaIndex = segmentIndex % loadedMedia.length;
        const currentMedia = loadedMedia[mediaIndex];
        
        if (currentMedia) {
          this.drawMediaWithEffect(ctx, currentMedia, segmentProgress);
        }

        // Draw gradient overlay
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        const text = script[segmentIndex];
        if (text) {
          this.drawText(ctx, text, segmentProgress);
        }

        // Update progress
        const progress = 0.3 + (currentFrame / totalFrames) * 0.7;
        this.progressCallback(progress);
        
        if (currentFrame % 30 === 0) {
          this.messageCallback(`Rendering frame ${currentFrame}/${totalFrames}...`);
        }

        currentFrame++;
        
        // Use requestAnimationFrame for smoother rendering
        if (currentFrame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          mediaRecorder.stop();
        }
      };

      renderFrame();
    });
  }

  private async loadMedia(media: MediaItem[]): Promise<(HTMLImageElement | HTMLVideoElement)[]> {
    const loaded: (HTMLImageElement | HTMLVideoElement)[] = [];

    for (const item of media) {
      try {
        if (item.type === "video") {
          const video = await this.loadVideo(item.url);
          loaded.push(video);
        } else {
          const image = await this.loadImage(item.url);
          loaded.push(image);
        }
      } catch (err) {
        console.warn("Failed to load media:", item.url, err);
      }
    }

    // Fallback: create a gradient background if no media loaded
    if (loaded.length === 0) {
      const fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = 1080;
      fallbackCanvas.height = 1920;
      const fallbackCtx = fallbackCanvas.getContext("2d")!;
      
      const gradient = fallbackCtx.createLinearGradient(0, 0, 1080, 1920);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(0.5, "#16213e");
      gradient.addColorStop(1, "#0f3460");
      fallbackCtx.fillStyle = gradient;
      fallbackCtx.fillRect(0, 0, 1080, 1920);

      const img = new Image();
      img.src = fallbackCanvas.toDataURL();
      loaded.push(img);
    }

    return loaded;
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private loadVideo(url: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      
      video.onloadeddata = () => {
        video.play().then(() => resolve(video)).catch(reject);
      };
      video.onerror = reject;
      video.src = url;
      video.load();
    });
  }

  private drawMediaWithEffect(
    ctx: CanvasRenderingContext2D,
    media: HTMLImageElement | HTMLVideoElement,
    progress: number
  ) {
    const canvas = ctx.canvas;
    const scale = 1 + progress * 0.05; // Subtle zoom effect
    
    const width = canvas.width * scale;
    const height = canvas.height * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    ctx.save();
    ctx.drawImage(media, x, y, width, height);
    ctx.restore();
  }

  private drawText(ctx: CanvasRenderingContext2D, text: string, progress: number) {
    const canvas = ctx.canvas;
    
    // Text animation
    const opacity = Math.min(progress * 4, 1 - Math.max(0, (progress - 0.8) * 5));
    const yOffset = (1 - Math.min(progress * 3, 1)) * 50;

    ctx.save();
    ctx.globalAlpha = Math.max(0, opacity);
    
    // Text styling
    ctx.font = "bold 64px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Text shadow for better readability
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Wrap text
    const maxWidth = canvas.width - 120;
    const lines = this.wrapText(ctx, text, maxWidth);
    const lineHeight = 80;
    const startY = canvas.height * 0.75 - (lines.length - 1) * lineHeight / 2 + yOffset;

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      
      // White text with subtle gradient
      ctx.fillStyle = "#ffffff";
      ctx.fillText(line, canvas.width / 2, y);
    });

    ctx.restore();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
