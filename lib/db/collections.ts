import {getCollection} from "@/lib/db/mongodb";

export const usersCollection = getCollection<{name: string, phone?: string}>("users");