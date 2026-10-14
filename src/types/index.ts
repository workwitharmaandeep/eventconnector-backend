export type Role = "STUDENT" | "ORGANIZER" | "ADMIN";

export type EventSource = "ORGANIZER" | "UNSTOP" | "DEVPOST" | "OTHER";

export type EventType = "HACKATHON" | "WORKSHOP" | "FESTIVAL" | "CONFERENCE" | "COMPETITION" | "OTHER";

export type EventMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface CampusMarker {
  id: string;
  label: string;
  category: "AUDITORIUM" | "LAB" | "GROUND" | "GATE" | "HOSTEL" | "CAFETERIA" | "MAIN_BUILDING" | "PARKING";
  latitude: number;
  longitude: number;
  description?: string;
  floor?: string;
}

export interface EligibilityCriteria {
  minYear?: number;
  maxYear?: number;
  branches?: string[];
  collegeOnly?: boolean;
  notes?: string;
}

export interface EventFilterParams {
  q?: string;
  type?: string;
  mode?: string;
  source?: string;
  domains?: string;
  skills?: string;
  city?: string;
  state?: string;
  country?: string;
  startAfter?: string;
  startBefore?: string;
  deadlineStatus?: "all" | "open" | "closing_soon" | "ended";
  lat?: number;
  lng?: number;
  radius?: number; // km
  sort?: "newest" | "upcoming" | "deadline" | "popular" | "distance";
  page?: number;
  limit?: number;
}

export interface ScrapedEventRaw {
  title: string;
  description?: string;
  source: EventSource;
  externalUrl: string;
  externalPlatform: string;
  eventType: EventType;
  mode: EventMode;
  startDate: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  venueName?: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  domains: string[];
  requiredSkills: string[];
  registrationUrl?: string;
  websiteUrl?: string;
  bannerImageUrl?: string;
  teamSizeMin?: number;
  teamSizeMax?: number;
  prizePool?: string;
}
