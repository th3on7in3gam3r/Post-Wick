export const industries = [
  "local businesses",
  "fitness studios",
  "coffee shops",
  "restaurants",
  "boutiques",
  "salons & spas",
  "churches",
  "nonprofits",
  "yoga studios",
  "bakeries",
] as const;

export type Industry = (typeof industries)[number];

export const industryImages: Record<Industry, { src: string; alt: string }> = {
  "local businesses": {
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80",
    alt: "Independent local shop on a neighborhood street",
  },
  "fitness studios": {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
    alt: "Modern fitness studio with weights and equipment",
  },
  "coffee shops": {
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&q=80",
    alt: "Freshly brewed coffee in a cozy café",
  },
  restaurants: {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
    alt: "Restaurant dining room ready for guests",
  },
  boutiques: {
    src: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
    alt: "Clothing boutique with curated displays",
  },
  "salons & spas": {
    src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80",
    alt: "Relaxing salon and spa treatment room",
  },
  churches: {
    src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=500&q=80",
    alt: "Historic church with steeple at golden hour",
  },
  nonprofits: {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=80",
    alt: "Community volunteers working together",
  },
  "yoga studios": {
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80",
    alt: "People practicing yoga in a bright studio",
  },
  bakeries: {
    src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80",
    alt: "Fresh bread and pastries in a bakery",
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
