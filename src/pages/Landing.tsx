import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Zap, Film, Wand2, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--neon-purple)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--neon-pink)/0.1),transparent_50%)]" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-neon-pink/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-purple/30 mb-8 animate-float">
            <Sparkles className="h-4 w-4 text-neon-purple" />
            <span className="text-sm text-foreground/80">AI-Powered Video Generation</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Create Viral
            <span className="block gradient-text mt-2">Reels in Seconds</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10">
            Transform your ideas into stunning vertical videos with AI-generated scripts, 
            premium stock footage, and beautiful text overlays. No editing skills required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/generate">
              <Button variant="neon" size="xl" className="group">
                Start Creating
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="glass" size="xl">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          {[
            {
              icon: Wand2,
              title: "AI Script Generation",
              description: "Our AI crafts compelling scripts tailored to your topic and style preference.",
              color: "neon-pink",
            },
            {
              icon: Film,
              title: "Stock Video Library",
              description: "Access thousands of premium vertical videos from Pexels, automatically matched.",
              color: "neon-purple",
            },
            {
              icon: Zap,
              title: "Browser Rendering",
              description: "Videos render directly in your browser using ffmpeg.wasm. No server needed.",
              color: "neon-cyan",
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="group relative glass rounded-2xl p-6 hover:border-neon-purple/30 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-pink/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-${feature.color}/10 mb-4`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Preview Mockup */}
        <div className="mt-24 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan rounded-3xl opacity-20 blur-xl" />
            <div className="relative w-[280px] h-[500px] bg-card rounded-3xl border border-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <p className="text-2xl font-bold mb-2">"Chase your dreams"</p>
                <p className="text-muted-foreground text-sm">Your AI-generated reel preview</p>
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
