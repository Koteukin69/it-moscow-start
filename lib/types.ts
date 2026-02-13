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
  commission,
}

export interface QuizResult {
  directions: Record<string, number>;
  top: string[];
  completedAt: string;
}

export interface EventItem {
  _id?: string;
  name: string;
  date: string;
  image?: string;
  description: string;
}

export interface ProductItem {
  _id?: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  stock?: number;
  sizes?: Record<string, number>;
  isNew?: boolean;
}

export interface OrderItem {
  _id?: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  size?: string;
  price: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}
