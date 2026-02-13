import {getCollection} from "@/lib/db/mongodb";

export const usersCollection = getCollection<{name: string, phone?: string, coins: number}>("users");

export const quizResultsCollection = getCollection<{
  userId: string;
  directions: Record<string, number>;
  top: string[];
  completedAt: Date;
}>("quizResults");

export const eventsCollection = getCollection<{
  name: string;
  date: string;
  image?: string;
  description: string;
}>("events");

export const productsCollection = getCollection<{
  name: string;
  price: number;
  description: string;
  image?: string;
  stock?: number;
  sizes?: Record<string, number>;
}>("products");