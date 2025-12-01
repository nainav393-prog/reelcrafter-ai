import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, duration, style } = await req.json();
    
    console.log(`Generating script for topic: ${topic}, duration: ${duration}s, style: ${style}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const lineCount = duration === 15 ? 4 : duration === 30 ? 6 : 8;
    
    const stylePrompts: Record<string, string> = {
      motivational: "inspiring, energetic, and uplifting with powerful action words",
      business: "professional, strategic, and focused on success and growth",
      emotional: "heartfelt, touching, and deeply personal",
      facts: "informative, surprising, and educational with interesting statistics",
    };

    const prompt = `Generate a short ${style} reel script about "${topic}". 
Create exactly ${lineCount} punchy, direct sentences that would work great as text overlays in a vertical video reel.
Each line should be impactful and ${stylePrompts[style] || "engaging"}.
Format: Return ONLY the lines, one per line, no numbering or bullets.
Keep each line under 60 characters for readability as subtitles.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a viral content writer specializing in short-form video scripts. Your scripts are punchy, memorable, and perfect for reels." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content?.trim() || "";
    
    console.log("Generated script:", script);

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-script:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate script";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
