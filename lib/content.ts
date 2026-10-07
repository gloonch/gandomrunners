import type { IconName } from "@/components/ds/Icon";
import type { RouteWordMapItem } from "@/components/ds/RouteWordMap";

export const HERO_ITEMS: RouteWordMapItem[] = [
  { word: "DISCIPLINE", eyebrow: "Goal 01", title: "Discipline, from the first step", description: "Training isn’t just pushing the body. Rhythm, consistency and commitment get built here, one session at a time." },
  { word: "COMMUNITY", eyebrow: "Goal 02", title: "You don’t run alone", description: "The group makes it easier to show up, keep going and feel you belong somewhere real." },
  { word: "CONFIDENCE", eyebrow: "Goal 03", title: "Confidence is built on the route", description: "From easy first runs to serious routes — a body and a mind that move together." },
];

export type Category = "streets" | "park" | "club" | "nature" | "private";

export const CATEGORIES: Record<Category, { label: string; short: string; icon: IconName; tint: "" | "green" }> = {
  streets: { label: "City streets", short: "Streets", icon: "route", tint: "" },
  park: { label: "City park", short: "Parks", icon: "trees", tint: "green" },
  club: { label: "Club", short: "Club", icon: "building", tint: "" },
  nature: { label: "Mountain & nature", short: "Nature", icon: "mountain", tint: "green" },
  private: { label: "Private", short: "Private", icon: "user", tint: "" },
};

/** the place filters, in order; private classes show only under "All" */
export const FILTERS: ("all" | Category)[] = ["all", "streets", "park", "club", "nature"];

export type ClassRow = { id: string; cls: string; area: string; cat: Category; best: string; place: string };

/** Days and times are announced weekly, so every row shows "To be announced". No prices. */
export const CLASSES: ClassRow[] = [
  { id: "east", cls: "Group run", area: "East Tehran", cat: "streets", best: "Starting from zero, staying consistent", place: "East Tehran — urban routes; the meeting point is shared each week" },
  { id: "yas", cls: "Group run", area: "Yas Fatemi Park", cat: "park", best: "Open-air, lighter starts — beginner to intermediate", place: "Yas Fatemi Park, Tehran" },
  { id: "club", cls: "Structured training", area: "Enghelab Club", cat: "club", best: "Running form, endurance, discipline", place: "Enghelab Club, Tehran" },
  { id: "fasham", cls: "Group run", area: "Fasham", cat: "nature", best: "Outdoor energy, running with a group", place: "Fasham — open roads north of Tehran" },
  { id: "lavasan", cls: "Nature training", area: "Lavasan", cat: "nature", best: "Weekends, longer routes", place: "Lavasan — north-east of Tehran" },
  { id: "mountain", cls: "Hiking day", area: "Mountain routes", cat: "nature", best: "Trail days and hiking", place: "Atashgah, Kalleh Kooh" },
  { id: "private", cls: "Private class", area: "By arrangement", cat: "private", best: "A personal goal, a plan made for you", place: "A place agreed with the coach" },
];

/** Every "Message" CTA lands here. The design links the contact section until the Instagram DM link is confirmed. */
export const MESSAGE_HREF = "#contact";
