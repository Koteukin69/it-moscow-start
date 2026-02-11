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
