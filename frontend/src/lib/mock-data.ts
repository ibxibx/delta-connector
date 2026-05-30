export type StakeholderType =
  | "Founder" | "Ex-Founder" | "Investor" | "Lawyer" | "Tax Advisor"
  | "Accountant" | "Mentor" | "Accelerator" | "Coworking Space"
  | "Public Institution" | "Corporate Partner" | "Recruiter"
  | "Relocation / Housing Partner" | "Other Helper";

export const currentUser = {
  name: "Marco Bianchi",
  role: "Founder",
  company: "AI SaaS",
  stage: "Pre-Seed",
  context: "Non-EU Founder",
  location: "Berlin",
  trustScore: 72,
  contributionScore: 58,
  helpfulnessScore: 4.8,
  networkReach: 1248,
  categoryCoverage: { covered: 7, total: 16 },
  savedAnswers: 4,
  initials: "MB",
};

export type Stakeholder = {
  id: string;
  name: string;
  labels: string[];
  categories: string[];
  trustScore: number;
  helpfulFor?: number;
  rating?: number;
  bestFor: string;
  notIdealFor?: string;
  type: "Founder" | "Service Provider" | "Investor" | "Organization" | "Institution";
  initials: string;
  verified?: boolean;
  acceptsFollowups?: boolean;
};

export const stakeholders: Stakeholder[] = [
  { id: "alex", name: "Alex Weber", labels: ["Tax Advisor", "Startup Advisor"], categories: ["Tax/Admin", "Funding Readiness"], trustScore: 86, helpfulFor: 24, rating: 4.8, bestFor: "VC-backed GmbHs, DATEV, payroll, investor reporting", notIdealFor: "freelancers, very early solo founders", type: "Service Provider", initials: "AW", verified: true, acceptsFollowups: true },
  { id: "anna", name: "Anna Roth", labels: ["Startup Lawyer", "Mentor"], categories: ["Legal", "Funding"], trustScore: 89, helpfulFor: 31, rating: 4.9, bestFor: "GmbH setup, VSOP, shareholder agreements, financing docs", type: "Service Provider", initials: "AR", verified: true, acceptsFollowups: true },
  { id: "sarah", name: "Sarah Kim", labels: ["Recruiter", "Operator"], categories: ["Talent/Hiring"], trustScore: 78, helpfulFor: 19, rating: 4.6, bestFor: "first hires, product and engineering recruiting", type: "Service Provider", initials: "SK", verified: true, acceptsFollowups: true },
  { id: "lukas", name: "Lukas Vogel", labels: ["Angel Investor", "Founder"], categories: ["Funding", "GTM"], trustScore: 81, helpfulFor: 15, rating: 4.7, bestFor: "B2B SaaS pre-seed intros", type: "Investor", initials: "LV", verified: true, acceptsFollowups: false },
  { id: "delta", name: "Delta Campus", labels: ["Coworking Space", "Community Hub"], categories: ["Workspace", "Community", "Events"], trustScore: 84, helpfulFor: 42, rating: 4.7, bestFor: "international founders, AI founders, startup community", type: "Organization", initials: "DC", verified: true, acceptsFollowups: true },
  { id: "nextgen", name: "NextGen Accelerator", labels: ["Accelerator", "Institution"], categories: ["Mentoring", "Funding", "Public Funding"], trustScore: 82, helpfulFor: 28, rating: 4.6, bestFor: "structured onboarding, mentor access, cohort support", type: "Institution", initials: "NG", verified: true, acceptsFollowups: true },
];

export type Answer = {
  id: string;
  question: string;
  answer: string;
  providerId: string;
  providerAnonymized: string;
  categories: string[];
  stageFit: string[];
  helpfulFor: number;
  fitConfirmations: number;
  helpfulnessPct: number;
};

export const answers: Answer[] = [
  { id: "a1", question: "Which tax advisor is good for a VC-backed GmbH in Berlin?", answer: "For a VC-backed GmbH, choose a tax advisor who understands DATEV, payroll, investor reporting, clean monthly close, and financing rounds. Avoid generalist tax advisors without startup experience.", providerId: "alex", providerAnonymized: "Verified Tax/Admin Contributor", categories: ["Tax/Admin", "Funding Readiness"], stageFit: ["Pre-Seed", "Seed"], helpfulFor: 12, fitConfirmations: 8, helpfulnessPct: 92 },
  { id: "a2", question: "What should I prepare before talking to a startup lawyer for GmbH setup?", answer: "Prepare founder IDs, company name options, business purpose, draft cap table, shareholder structure, funding plans, IP ownership status, and whether you need VSOP or investor-ready documents.", providerId: "anna", providerAnonymized: "Verified Legal Contributor", categories: ["Legal"], stageFit: ["Pre-incorporation", "Pre-Seed"], helpfulFor: 17, fitConfirmations: 11, helpfulnessPct: 95 },
  { id: "a3", question: "Which coworking space helps international founders find community in Berlin?", answer: "Look for coworking spaces with active founder programming, office hours, investor events, address support, and international onboarding. Community density matters more than desk price.", providerId: "delta", providerAnonymized: "Verified Community Contributor", categories: ["Workspace", "Community"], stageFit: ["Pre-Seed", "Seed"], helpfulFor: 9, fitConfirmations: 6, helpfulnessPct: 88 },
];

export const recentActivity = [
  { id: "1", text: "You marked an answer as fitting", time: "2h ago" },
  { id: "2", text: "Your recommendation of Alex Weber was accepted", time: "1d ago" },
  { id: "3", text: "Alex Weber replied to your follow-up request", time: "2d ago" },
  { id: "4", text: "A new public question matches your expertise: 'Best ESOP setup'", time: "3d ago" },
];

export const recommendedNextSteps = [
  { id: "1", title: "Add two recommendations in underrepresented categories", category: "Coverage" },
  { id: "2", title: "Answer one public question in AI Product", category: "Helpfulness" },
  { id: "3", title: "Request follow-up with verified Tax/Admin contributor", category: "Follow-up" },
  { id: "4", title: "Complete investor visibility settings", category: "Profile" },
];

export const publicQuestions = [
  { id: "q1", question: "Which coworking space is best for international AI founders needing community and investor access?", category: "Workspace", context: "Pre-seed · AI SaaS · International Founder · Berlin", suggestedAnswers: 3, responses: 5, askedBy: "Anonymous Pre-Seed Founder" },
  { id: "q2", question: "Best ESOP setup for a German GmbH with US investors?", category: "Legal", context: "Seed · FinTech · Berlin", suggestedAnswers: 2, responses: 4, askedBy: "Anonymous Seed Founder" },
  { id: "q3", question: "How do non-EU founders get a freelance visa quickly?", category: "Visa", context: "Idea stage · Non-EU Founder", suggestedAnswers: 1, responses: 7, askedBy: "Anonymous Founder" },
  { id: "q4", question: "Which recruiters specialize in early-stage AI engineering hires in Berlin?", category: "Talent/Hiring", context: "Pre-Seed · AI SaaS", suggestedAnswers: 4, responses: 3, askedBy: "Anonymous Founder" },
];

export const initialRecommendations = [
  { id: "r1", name: "Alex Weber", category: "Tax/Admin", impact: 5, status: "Confirmed" as const, visibility: "Network-only" },
  { id: "r2", name: "Sarah Kim", category: "Hiring", impact: 4, status: "Confirmed" as const, visibility: "Network-only" },
  { id: "r3", name: "Lukas Vogel", category: "Funding", impact: 5, status: "Pending invite" as const, visibility: "Private" },
  { id: "r4", name: "Anna Roth", category: "Legal", impact: 5, status: "Pending invite" as const, visibility: "Private" },
];

export const receivedRecommendations = [
  { id: "rr1", from: "Anonymized Founder", category: "AI Product", help: "Marco gave deep feedback on our AI agent architecture", impact: 5 },
  { id: "rr2", from: "Anonymized Founder", category: "Pitch", help: "Helped me sharpen my pre-seed pitch", impact: 4 },
];

export const radarData = [
  { dim: "Contribution", value: 58, full: 100 },
  { dim: "Helpfulness", value: 92, full: 100 },
  { dim: "Category Authority", value: 64, full: 100 },
  { dim: "Network Reach", value: 71, full: 100 },
  { dim: "Bridge Score", value: 55, full: 100 },
  { dim: "Answer Quality", value: 88, full: 100 },
];

export const graphNodes = [
  { id: "you", name: "Marco Bianchi", type: "Founder" as const, x: 50, y: 50, role: "You" },
  { id: "alex", name: "Alex Weber", type: "Service Provider" as const, x: 50, y: 12, role: "Tax Advisor" },
  { id: "anna", name: "Anna Roth", type: "Service Provider" as const, x: 88, y: 32, role: "Startup Lawyer" },
  { id: "sarah", name: "Sarah Kim", type: "Service Provider" as const, x: 12, y: 32, role: "Recruiter" },
  { id: "lukas", name: "Lukas Vogel", type: "Investor" as const, x: 82, y: 78, role: "Angel Investor" },
  { id: "delta", name: "Delta Campus", type: "Organization" as const, x: 18, y: 78, role: "Coworking" },
  { id: "nextgen", name: "NextGen", type: "Institution" as const, x: 50, y: 92, role: "Accelerator" },
];

export const graphEdges = [
  { from: "you", to: "alex", kind: "Recommended" },
  { from: "you", to: "anna", kind: "Recommended" },
  { from: "you", to: "sarah", kind: "Helped with" },
  { from: "you", to: "lukas", kind: "Introduced to" },
  { from: "you", to: "delta", kind: "Validated by" },
  { from: "you", to: "nextgen", kind: "Answered" },
];

export const nodeColor: Record<string, string> = {
  Founder: "var(--color-accent-purple)",
  "Service Provider": "var(--color-primary)",
  Investor: "var(--color-success)",
  Organization: "var(--color-warning)",
  Institution: "oklch(0.55 0.034 257)",
};
