export interface Criteria {
  name: string;
  minScore: number;
  maxScore: number;
  score: number | null;
  help: string | null;
  comment: string | null;
  scale?: 'Full' | 'Binary';
}

export interface Block {
  name: string;
  minScore: number;
  maxScore: number;
  score: number | null;
  criterias: Criteria[];
}

interface Data {
  name: string | null;
  minScore: number;
  maxScore: number;
  score: number | null;
  blocks: Block[];
}

export interface Checklist {
  id: number;
  name: string | null;
  isActive: boolean;
  data: Data | null;
  projectIds?: number[];
}

export interface ChecklistFull {
  id: number;
  name: string | null;
  isActive: boolean;
  data: Data | null;
  checklistProjects:
    | {
        projectName: string | null;
        projectId: number | null;
      }[]
    | null;
}
export const ChecklistScaleTypeValues = ['Full', 'Binary'] as const;
export type ChecklistScale = (typeof ChecklistScaleTypeValues)[number];

export interface ChecklistReqBody {
  isActive?: boolean;
  name?: string | null;
  projectIds?: number[];
  data?: {
    name: string;
    blocks?: {
      name: string;
      criterias?: {
        name: string;
        minScore?: number;
        maxScore?: number;
        help?: string | null;
        scale?: ChecklistScale;
      }[];
    }[];
  };
}
