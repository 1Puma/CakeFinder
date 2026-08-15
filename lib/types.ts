export type CapabilityFlag = string;

export type DecoratorSourceRef = {
  sourceId: string;
  externalId: string;
  url: string | null;
};

export type PortfolioImage = {
  id: string;
  url: string;
  attribution: string | null;
  width: number | null;
  height: number | null;
};

export type CapabilityEvidence = {
  flag: CapabilityFlag;
  confidence: number;
  evidenceImageIds: string[];
  reasoning: string;
};

export type Decorator = {
  id: string;
  name: string;
  sources: DecoratorSourceRef[];
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number | null;
  portfolioImages: PortfolioImage[];
  capabilities: CapabilityEvidence[];
  hasLicensedPrintProgram: boolean | null;
  isChain: boolean;
  claimedByUser: boolean;
  lastIndexedAt: Date;
  city: string;
  email: string | null;
  website: string | null;
  publishedPrice: string | null;
  phone: string | null;
};

export type RawDecorator = {
  sourceId: string;
  externalId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  isChain: boolean;
  photoRefs: string[];
  url: string | null;
  publishedPrice: string | null;
};

export type TraceStepType =
  "plan" | "search" | "evaluate" | "reject" | "replan" | "substitute" | "rank" | "complete";

export type TraceStep = {
  type: TraceStepType;
  at: string;
  message: string;
};

export type Match = {
  decorator: Decorator;
  matchedFlags: CapabilityFlag[];
  missingFlags: CapabilityFlag[];
  categoryScores: Record<"structure" | "frosting" | "piping" | "decor" | "finish", number>;
  reasoning: string;
  distanceMiles: number;
};

export type Substitution = {
  blockedFlag: CapabilityFlag;
  proposal: string;
  specPatchSummary: string;
};

export type MatchResult = {
  matches: Match[];
  substitutions: Substitution[];
  unmetRequirements: CapabilityFlag[];
  trace: TraceStep[];
};

export type ChangeDescription = {
  path: string;
  from: unknown;
  to: unknown;
  summary: string;
};
