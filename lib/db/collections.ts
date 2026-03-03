import {getCollection} from "@/lib/db/mongodb";
import type {OAuthProviderData} from "@/lib/types";

export const usersCollection = getCollection<{
  name: string,
  coins: number,
  avatar?: string,
  oauthProviders?: OAuthProviderData[],
  gameSession?: { seed: number, createdAt: Date },
}>("users");

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
  images?: string[];
  stock?: number;
  variants?: Record<string, number>;
  variantLabel?: string;
  isNew?: boolean;
}>("products");

export const ordersCollection = getCollection<{
  orderNumber: number;
  pickupCode: string;
  userId: string;
  userName: string;
  phone: string | null;
  productId: string;
  productName: string;
  variant?: string;
  quantity: number;
  price: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}>("orders");

export const countersCollection = getCollection<{
  _id: string;
  seq: number;
}>("counters");

export const cartsCollection = getCollection<{
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    variant?: string;
  }>;
  updatedAt: Date;
}>("carts");

export const consultationsCollection = getCollection<{
  name: string;
  phone: string;
  childName: string;
  specialty: string;
  grade: string;
  flames: number;
  createdAt: Date;
}>("consultations");

export const popupSettingsCollection = getCollection<{
  key: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}>("popupSettings");