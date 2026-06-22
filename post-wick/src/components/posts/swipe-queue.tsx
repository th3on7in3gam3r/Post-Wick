"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "./post-card";
import { Button } from "@/components/ui/button";
import { X, Check, Sparkles } from "lucide-react";

interface QueuePost {
  id: string;
  content: string;
  platform: string;
  status: string;
  imageUrl?: string | null;
}

interface SwipeQueueProps {
  posts: QueuePost[];
  onApprove: (postId: string) => void;
  onSkip: (postId: string) => void;
  onRefine: (postId: string) => void;
}

export function SwipeQueue({
  posts,
  onApprove,
  onSkip,
  onRefine,
}: SwipeQueueProps) {
  const current = posts[0];

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-2xl italic text-brand-muted">
          Queue empty
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          Generate more posts or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          <PostCard
            content={current.content}
            platform={current.platform}
            status={current.status}
            imageUrl={current.imageUrl}
          />
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-center gap-4">
        <Button variant="outline" onClick={() => onSkip(current.id)}>
          <X className="mr-2 h-4 w-4" />
          Skip
        </Button>
        <Button variant="secondary" onClick={() => onRefine(current.id)}>
          <Sparkles className="mr-2 h-4 w-4" />
          Refine
        </Button>
        <Button onClick={() => onApprove(current.id)}>
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-brand-muted">
        {posts.length} remaining
      </p>
    </div>
  );
}
