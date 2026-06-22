"use client";

import { useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-[320px] rounded-xl bg-white p-5 shadow-cookie">
      <p className="text-[0.85rem] leading-relaxed text-gray-body">
        We use cookies to personalize content, run ads, and analyze traffic.
      </p>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-full bg-native-black px-[18px] py-2 text-[0.85rem] font-medium text-white transition hover:bg-black"
        >
          Okay
        </button>
      </div>
    </div>
  );
}
