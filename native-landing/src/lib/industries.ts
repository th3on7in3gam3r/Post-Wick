export const industries = [
  "churches",
  "faith-aligned businesses",
  "fitness studios",
  "wellness spas",
  "yoga studios",
  "coffee roasters",
  "design agencies",
  "carpenters",
  "boutique hotels",
] as const;

export type Industry = (typeof industries)[number];

export const industryImages: Record<Industry, { src: string; alt: string }> = {
  churches: {
    src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=500&q=80",
    alt: "Historic church with steeple at golden hour",
  },
  "faith-aligned businesses": {
    src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=500&q=80",
    alt: "Community gathered together in fellowship",
  },
  "fitness studios": {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
    alt: "Modern fitness studio with weights and equipment",
  },
  "wellness spas": {
    src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80",
    alt: "Relaxing wellness spa with massage table and candles",
  },
  "yoga studios": {
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80",
    alt: "People practicing yoga in a bright studio",
  },
  "coffee roasters": {
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&q=80",
    alt: "Freshly roasted coffee beans",
  },
  "design agencies": {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80",
    alt: "Creative design agency workspace",
  },
  carpenters: {
    src: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80",
    alt: "Carpenter sanding wood in a workshop",
  },
  "boutique hotels": {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
    alt: "Boutique hotel pool and lounge",
  },
};

export type ImagePlacement = {
  top: string;
  left: string;
  rotate: number;
};

export function randomImagePlacement(): ImagePlacement {
  const useLeft = Math.random() > 0.5;
  const top = `${14 + Math.random() * 48}%`;
  const left = useLeft
    ? `${4 + Math.random() * 16}%`
    : `${74 + Math.random() * 14}%`;
  const rotate = Math.round(-10 + Math.random() * 20);

  return { top, left, rotate };
}
