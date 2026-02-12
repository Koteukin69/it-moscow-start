export interface JWTPayload {
  name: string;
  userId: string;
  phone?: string;
  verified: boolean;
  role: Role
}

export enum Role {
  applicant,
  parent,
}

export interface QuizResult {
  directions: Record<string, number>;
  top: string[];
  completedAt: string;
}
