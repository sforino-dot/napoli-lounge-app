// Costanti consentite dal brief (nessun dato di palinsesto/notizie qui).
export const STATION_NAME = "Napoli Lounge";
export const STATION_TAGLINE = "La colonna sonora della tua estate, in ogni stagione";
export const STATION_SITE = "https://www.napolilounge.it";

export const STREAM_URL = "https://stream.zeno.fm/cyau14bgqd0uv";
export const PRIVACY_URL = "https://www.napolilounge.it/privacy-policy-napoli-lounge-app/";

const MEDIA = "https://media.base44.com/images/public/6aad35cb7e9e89bd6ab72479/";
export const LOGO_URL = MEDIA + "89d363e25_logo-Photoroom.png";
export const SEASONAL_IMAGE_URL = MEDIA + "62c0636f3_summer.jpg";
export const mediaUrl = (file: string) => MEDIA + file;

export const DEFAULT_TITLE = "Napoli Lounge Music";

export type Social = {
  key: string;
  name: string;
  subtitle: string;
  url: string;
  feather?: "mail" | "globe";
  slug?: string;
  color?: string;
  gradient?: string[];
};

export const SOCIALS: Social[] = [
  { key: "email", name: "Email", subtitle: "info@napolilounge.it", url: "mailto:info@napolilounge.it", feather: "mail", color: "#2a6df4" },
  { key: "facebook", name: "Facebook", subtitle: "@napolilounge", url: "https://www.facebook.com/napolilounge/", slug: "facebook", color: "#1877F2" },
  { key: "instagram", name: "Instagram", subtitle: "@napoli.lounge", url: "https://www.instagram.com/napoli.lounge/", slug: "instagram", gradient: ["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"] },
  { key: "tiktok", name: "TikTok", subtitle: "@napolilounge", url: "https://www.tiktok.com/@napolilounge", slug: "tiktok", color: "#010101" },
  { key: "youtube", name: "YouTube", subtitle: "@napolilounge", url: "https://www.youtube.com/@napolilounge", slug: "youtube", color: "#FF0000" },
  { key: "website", name: "Sito web", subtitle: "napolilounge.it", url: "https://napolilounge.it", feather: "globe", color: "#0f766e" },
];

export const simpleIconUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}/ffffff`;

/** Il conduttore è assente se vuoto o "Napoli Lounge". */
export function displayHost(host?: string | null): string | null {
  const h = (host ?? "").trim();
  if (!h || h.toLowerCase() === "napoli lounge") return null;
  return h;
}
