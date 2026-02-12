import {getCollection} from "@/lib/db/mongodb";

export const usersCollection = getCollection<{name: string, phone?: string}>("users");

export const quizResultsCollection = getCollection<{
  userId: string;
  directions: Record<string, number>;
  top: string[];
  completedAt: Date;
}>("quizResults");