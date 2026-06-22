"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RefinePanelProps {
  onRefine: (instruction: string) => Promise<void>;
  onClose: () => void;
}

export function RefinePanel({ onRefine, onClose }: RefinePanelProps) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onRefine(instruction);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refine this post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Make it shorter and more casual..."
            required
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Refining..." : "Refine"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
