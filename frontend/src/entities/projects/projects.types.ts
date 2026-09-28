export interface Project {
  id: number;
  name: string | null;
  isActive: boolean;
  vocabularyProjects?: {
    vocabularyName: string | null;
    vocabularyId: number;
    projectName: string | null;
    projectId: number;
  }[];
  checklistProjects?: {
    checklistName: string | null;
    checklistId: number;
    projectName: string | null;
    projectId: number;
  }[];
}
