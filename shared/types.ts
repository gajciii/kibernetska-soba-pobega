export interface StageSummary { id: number; title: string; topic: string }
export interface SessionView {
  teamName: string;
  startedAt: string;
  completedAt: string | null;
  solved: number[];
  attempts: Record<string, number>;
  hints: Record<string, number[]>;
  currentStage: number;
  hintCount: number;
  profilePasswordVerified?: boolean;
  leaderboardId?: string;
}
export interface LeaderboardEntry {
  id: string;
  rank: number;
  teamName: string;
  solvedCount: number;
  hintCount: number;
  elapsedSeconds: number;
  completed: boolean;
  isCurrent: boolean;
}
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentEntry: LeaderboardEntry | null;
  total: number;
  updatedAt: string;
}
export interface Bootstrap { csrfToken: string; session: SessionView | null; stages: StageSummary[]; nextStartAt: string | null }
export interface Choice { id: string; label: string }
export interface Mail {
  id: string;
  sender: string;
  recipient: string;
  time: string;
  preview: string;
  subject: string;
  body: string;
  replyTo?: string;
  attachment?: string;
  linkLabel?: string;
  linkUrl?: string;
}
export interface LogRow { time: string; ip: string; account: string; event: string; file: string; result: string }
export interface TrafficPacket {
  number: number;
  time: string;
  source: string;
  destination: string;
  protocol: 'ARP' | 'DNS' | 'TCP' | 'TLS' | 'HTTP';
  length: number;
  info: string;
  detail: string;
  logTime?: string;
}
export interface InvestigationNote { id: string; title: string; text: string }
export interface EvidenceArtifact {
  id: string;
  name: string;
  kind: 'photo' | 'document' | 'image';
  size: string;
  description: string;
  preview: string;
  alt: string;
  metadata: string;
}
export interface PublicProfile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  avatarAlt: string;
  posts: { id: string; image: string; alt: string; caption: string; location: string }[];
}
export interface StageContent extends StageSummary {
  intro: string;
  question: string;
  kind: 'caesar' | 'encoding' | 'phishing' | 'password' | 'metadata' | 'logs' | 'domains' | 'binary';
  evidence?: string;
  note?: string;
  choices?: Choice[];
  reasons?: Choice[];
  mails?: Mail[];
  logs?: LogRow[];
  packets?: TrafficPacket[];
  investigations?: InvestigationNote[];
  artifacts?: EvidenceArtifact[];
  profile?: PublicProfile;
  recommendations?: Choice[];
  metadata?: string;
}
export interface StageResponse {
  stage: StageContent;
  solved: boolean;
  hints: { index: number; text: string }[];
  explanation?: string;
  passwordVerified?: boolean;
}
export interface AnswerResponse { correct: boolean; message: string; explanation?: string; passwordVerified?: boolean; session: SessionView }
export interface Finale {
  title: string;
  topics: string[];
}
