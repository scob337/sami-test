export interface OptionScore {
  pattern: string;
  score: number;
}

export interface QuestionOption {
  optionText: string;
  sortOrder?: number;
  scores: OptionScore[];
}

export interface QuestionCreateInput {
  testId: string | number;
  questionText: string;
  sortOrder?: number;
  options: QuestionOption[];
}

export interface PromptUpdateInput {
  id?: number | null;
  testId: string | number;
  systemPrompt: string;
  reportRules: string;
}
