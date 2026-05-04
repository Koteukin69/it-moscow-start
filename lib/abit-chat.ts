export const ABIT_MAX_MESSAGE_LENGTH = 1024;
export const ABIT_RATE_LIMIT_PER_MINUTE = 3;
export const ABIT_RATE_LIMIT_PER_HOUR = 30;
export const ABIT_FALLBACK_MESSAGE = "Сейчас высокая нагрузка. Попробуйте повторить вопрос чуть позже.";
export const ABIT_TOO_MANY_REQUESTS_MESSAGE = "Слишком много запросов, повторите вопрос позже.";
export const ABIT_EMPTY_MESSAGE_ERROR = "Введите сообщение.";

export const ABIT_SYSTEM_PROMPT = "Ты ассистент для абитуриентов проекта IT.Москва. Отвечай кратко, по делу и дружелюбно на русском языке.";

export type AbitChatRole = "user" | "assistant";

export interface AbitChatMessage {
  role: AbitChatRole;
  text: string;
  createdAt: string;
}

export interface AbitChatRequestBody {
  token: string;
  text: string;
  pendingText?: string;
}
