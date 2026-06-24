"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  id: string;
  label: string;
  hint?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function TagInput({
  id,
  label,
  hint,
  tags,
  onChange,
  placeholder = "Add a tag and press Enter",
  disabled = false,
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addTags(raw: string) {
    const next = raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag) => !tags.includes(tag));

    if (next.length) {
      onChange([...tags, ...next]);
    }
    setInput("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (input.trim()) addTags(input);
    } else if (event.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-near-black">
        {label}
      </label>
      {hint ? <p className="mt-1 text-xs text-gray-label">{hint}</p> : null}
      <div
        className={cn(
          "mt-2 flex min-h-[48px] flex-wrap gap-2 rounded-xl border border-black/[0.1] bg-cream/50 px-3 py-2",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-near-black shadow-sm"
          >
            {tag}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(tags.filter((item) => item !== tag))}
              className="rounded-full p-0.5 text-gray-label transition hover:bg-cream hover:text-near-black"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={input}
          disabled={disabled}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) addTags(input);
          }}
          placeholder={tags.length ? "Add another…" : placeholder}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-near-black outline-none placeholder:text-gray-label"
        />
      </div>
    </div>
  );
}
