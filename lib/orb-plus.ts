import { prisma } from "@/lib/db/prisma";

export const ORB_PRO_DAILY_LIMIT_FREE = 10;
export const ORB_PRO_DAILY_LIMIT_PLUS = 100;
export const ORB_PLUS_PRICE_RUB = 100;
export const USAGE_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface OrbProUsage {
  count: number;
  windowStartedAt: string | null;
}

export interface OrbPlusState {
  active: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  paymentMethodId: string | null;
  nextChargeAt: string | null;
}

export interface OrbStatus {
  plusActive: boolean;
  plusExpiresAt: string | null;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string | null;
}

function isPlusActive(state: OrbPlusState | null): boolean {
  if (!state?.active || !state.expiresAt) return false;
  return new Date(state.expiresAt).getTime() > Date.now();
}

function rollUsageWindow(usage: OrbProUsage | null): OrbProUsage {
  const now = Date.now();
  if (!usage?.windowStartedAt) {
    return { count: 0, windowStartedAt: null };
  }
  const startedAt = new Date(usage.windowStartedAt).getTime();
  if (now - startedAt >= USAGE_WINDOW_MS) {
    return { count: 0, windowStartedAt: null };
  }
  return { count: usage.count ?? 0, windowStartedAt: usage.windowStartedAt };
}

export async function getOrbStatus(userId: string): Promise<OrbStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { orbProUsage: true, orbPlus: true },
  });

  const plusState = (user?.orbPlus as OrbPlusState | null) ?? null;
  const usage = rollUsageWindow((user?.orbProUsage as OrbProUsage | null) ?? null);
  const plusActive = isPlusActive(plusState);
  const limit = plusActive ? ORB_PRO_DAILY_LIMIT_PLUS : ORB_PRO_DAILY_LIMIT_FREE;
  const remaining = Math.max(0, limit - usage.count);

  const resetAt = usage.windowStartedAt
    ? new Date(new Date(usage.windowStartedAt).getTime() + USAGE_WINDOW_MS).toISOString()
    : null;

  return {
    plusActive,
    plusExpiresAt: plusActive ? plusState?.expiresAt ?? null : null,
    limit,
    used: usage.count,
    remaining,
    resetAt,
  };
}

export async function consumeOrbProQuota(userId: string): Promise<{ ok: true; status: OrbStatus } | { ok: false; status: OrbStatus }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { orbProUsage: true, orbPlus: true },
  });

  const plusState = (user?.orbPlus as OrbPlusState | null) ?? null;
  const plusActive = isPlusActive(plusState);
  const limit = plusActive ? ORB_PRO_DAILY_LIMIT_PLUS : ORB_PRO_DAILY_LIMIT_FREE;

  const rolled = rollUsageWindow((user?.orbProUsage as OrbProUsage | null) ?? null);

  if (rolled.count >= limit) {
    const resetAt = rolled.windowStartedAt
      ? new Date(new Date(rolled.windowStartedAt).getTime() + USAGE_WINDOW_MS).toISOString()
      : null;
    return {
      ok: false,
      status: { plusActive, plusExpiresAt: plusActive ? plusState?.expiresAt ?? null : null, limit, used: rolled.count, remaining: 0, resetAt },
    };
  }

  const updated: OrbProUsage = {
    count: rolled.count + 1,
    windowStartedAt: rolled.windowStartedAt ?? new Date().toISOString(),
  };

  await prisma.user.update({
    where: { id: userId },
    data: { orbProUsage: { ...updated } },
  });

  const resetAt = new Date(new Date(updated.windowStartedAt!).getTime() + USAGE_WINDOW_MS).toISOString();
  return {
    ok: true,
    status: {
      plusActive,
      plusExpiresAt: plusActive ? plusState?.expiresAt ?? null : null,
      limit,
      used: updated.count,
      remaining: Math.max(0, limit - updated.count),
      resetAt,
    },
  };
}
