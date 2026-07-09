import { plans } from "@/lib/pricing";
import { PLAN_LIMITS } from "@/lib/plans";
import { OG_DEFAULT_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/brand";

export function pricingProductsJsonLd() {
  const base = siteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: `${SITE_NAME} Free`,
        description: `Free AI social media plan — up to ${PLAN_LIMITS.free.generateMax} posts per batch, ${PLAN_LIMITS.free.postsPerWeek} posts per week on autopilot, no credit card required.`,
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        offers: {
          "@type": "Offer",
          url: `${base}/guides/free-plan`,
          priceCurrency: "USD",
          price: "0",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "Product",
        name: `${SITE_NAME} Pro`,
        description: `AI social media automation Pro plan — up to ${PLAN_LIMITS.pro.generateMax} posts per generation batch with approval workflow and multi-channel publishing.`,
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        offers: {
          "@type": "Offer",
          url: `${base}/pricing`,
          priceCurrency: "USD",
          price: plans.pro.monthly.toFixed(2),
          availability: "https://schema.org/InStock",
          description: `$${plans.pro.monthly}/month billed monthly, or $${plans.pro.yearlyPerMonth}/month billed annually.`,
        },
      },
      {
        "@type": "Product",
        name: `${SITE_NAME} Max`,
        description: `AI social media automation Max plan — up to ${PLAN_LIMITS.max.generateMax} posts per generation batch for high-volume local brands and agencies.`,
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        offers: {
          "@type": "Offer",
          url: `${base}/pricing`,
          priceCurrency: "USD",
          price: plans.max.monthly.toFixed(2),
          availability: "https://schema.org/InStock",
          description: `$${plans.max.monthly}/month billed monthly, or $${plans.max.yearlyPerMonth}/month billed annually.`,
        },
      },
    ],
  };
}

export function homepageSoftwareJsonLd() {
  const base = siteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: base,
    description: OG_DEFAULT_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        url: `${base}/guides/free-plan`,
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: plans.pro.monthly.toFixed(2),
        priceCurrency: "USD",
        url: `${base}/pricing`,
      },
      {
        "@type": "Offer",
        name: "Max",
        price: plans.max.monthly.toFixed(2),
        priceCurrency: "USD",
        url: `${base}/pricing`,
      },
    ],
  };
}
