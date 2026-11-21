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
}
export interface Bootstrap { csrfToken: string; session: SessionView | null; stages: StageSummary[] }
export interface Choice { id: string; label: string }
export interface Mail { id: string; sender: string; subject: string; body: string; linkLabel?: string; linkUrl?: string }
export interface LogRow { time: string; ip: string; account: string; event: string; file: string; result: string }
export interface StageContent extends StageSummary {
  intro: string;
  question: string;
  kind: 'caesar' | 'base64' | 'phishing' | 'password' | 'metadata' | 'logs' | 'domains' | 'binary';
  evidence?: string;
  note?: string;
  choices?: Choice[];
  reasons?: Choice[];
  mails?: Mail[];
  logs?: LogRow[];
  profile?: { name: string; username: string; posts: string[] };
  metadata?: string;
}
export interface StageResponse {
  stage: StageContent;
  solved: boolean;
  hints: { index: number; text: string }[];
  explanation?: string;
}
export interface AnswerResponse { correct: boolean; message: string; explanation?: string; session: SessionView }
export interface Finale {
  title: string;
  findings: string[];
  limitation: string;
  topics: string[];
  discussion: string[];
}
