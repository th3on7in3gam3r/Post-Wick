import { pathWithUtm } from "@/lib/utm";

/** Directory → signup CTA with Pulse UTMs (preserves ref=directory). */
export function directorySignUpHref() {
  return pathWithUtm("/get-started?ref=directory", {
    source: "kerygma",
    campaign: "directory",
    medium: "referral",
    content: "directory-cta",
  });
}
