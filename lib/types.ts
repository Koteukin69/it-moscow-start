export interface JWTPayload {
  name: string;
  userId: string;
  hasPhone: boolean;
}

export interface OAuthProviderData {
  provider: "vk" | "yandex";
  providerUserId: string;
  phone?: string;
  linkedAt: Date;
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
  images?: string[];
  stock?: number;
  variants?: Record<string, number>;
  variantLabel?: string;
  isNew?: boolean;
}

export interface OrderItem {
  _id?: string;
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
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: string;
}

export interface ConsultationItem {
  _id: string;
  name: string;
  phone: string;
  childName: string;
  specialty: string;
  grade: string;
  flames: number;
  createdAt: string;
}

export interface CartWithProducts {
  items: Array<CartItem & {
    index: number;
    name: string;
    price: number;
    images: string[];
    variants: Record<string, number> | null;
    variantLabel: string | null;
    stock: number | null;
  }>;
}
