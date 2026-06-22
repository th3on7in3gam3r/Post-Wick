export const clerkAppearance = {
  variables: {
    colorBackground: "#ffffff",
    colorInputBackground: "#eef0f8",
    colorInputText: "#1a1a1a",
    colorText: "#1a1a1a",
    colorTextSecondary: "#666666",
    colorPrimary: "#111111",
    colorDanger: "#ef4444",
    borderRadius: "0.375rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[420px]",
    cardBox: "mx-auto w-full",
    card: "mx-auto w-full bg-white border border-[#dddddd] shadow-none",
    headerTitle: "font-playfair text-near-black",
    headerSubtitle: "text-[#666666]",
    socialButtonsBlockButton:
      "border-[#cccccc] bg-white text-near-black hover:bg-[#f5f5f5]",
    formButtonPrimary:
      "bg-native-black hover:bg-black text-white font-medium",
    formFieldInput:
      "bg-[#eef0f8] border-[#cccccc] text-near-black focus:ring-native-black",
    footerActionLink: "text-[#e8a020] hover:text-[#c8890a]",
    identityPreviewEditButton: "text-[#e8a020]",
  },
};

export const clerkAppearanceAuth = {
  ...clerkAppearance,
  elements: {
    ...clerkAppearance.elements,
    rootBox: "mx-auto w-full max-w-[340px]",
    cardBox: "mx-auto w-full max-w-[340px]",
    card:
      "mx-auto w-full max-w-[340px] border border-white/70 bg-white/92 px-5 py-6 shadow-[0_12px_48px_rgba(0,0,0,0.14)] backdrop-blur-md sm:px-6",
    headerTitle: "font-playfair text-[1.35rem] text-near-black",
    headerSubtitle: "text-sm text-[#666666]",
    socialButtonsBlockButton:
      "h-10 border-[#cccccc] bg-white/90 text-sm text-near-black hover:bg-white",
    formButtonPrimary:
      "h-10 bg-native-black text-sm hover:bg-black text-white font-medium",
    formFieldInput: "h-10 text-sm",
    footer: "text-sm",
    footerActionLink: "text-[#e8a020] hover:text-[#c8890a]",
  },
};

/** @deprecated Use clerkAppearanceAuth */
export const clerkAppearanceSignIn = clerkAppearanceAuth;
