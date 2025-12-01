import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video, GenerateParams } from "@/types/video";
import { useEffect } from "react";

export function useVideos() {
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("videos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "videos",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["videos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { videos, isLoading, error };
}

export function useVideo(id: string) {
  const queryClient = useQueryClient();

  const { data: video, isLoading, error } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Video;
    },
    enabled: !!id,
  });

  // Set up realtime subscription for single video
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`video-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "videos",
          filter: `id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["video", id] });
          queryClient.invalidateQueries({ queryKey: ["videos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return { video, isLoading, error };
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GenerateParams) => {
      const { data, error } = await supabase
        .from("videos")
        .insert({
          topic: params.topic,
          duration: params.duration,
          style: params.style,
          status: "PENDING",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Video;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Video> & { id: string }) => {
      const { data, error } = await supabase
        .from("videos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Video;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video", data.id] });
    },
  });
}
