export const ACCOUNT_DEACTIVATION_RETENTION_DAYS = 90;

export type AccountStatus = "active" | "deactivated";

export interface AccountLifecycle {
  accountStatus: AccountStatus;
  deactivatedAt: string | null;
  purgeAt: string | null;
}

export const ACTIVE_ACCOUNT_LIFECYCLE: AccountLifecycle = {
  accountStatus: "active",
  deactivatedAt: null,
  purgeAt: null,
};

export function computePurgeAt(
  deactivatedAt: string,
  retentionDays: number = ACCOUNT_DEACTIVATION_RETENTION_DAYS,
): string {
  const start = new Date(deactivatedAt);
  if (Number.isNaN(start.getTime())) {
    throw new Error("Data de desativação inválida");
  }

  const purge = new Date(start);
  purge.setUTCDate(purge.getUTCDate() + retentionDays);
  return purge.toISOString();
}

export function createDeactivatedLifecycle(
  deactivatedAt: Date = new Date(),
  retentionDays: number = ACCOUNT_DEACTIVATION_RETENTION_DAYS,
): AccountLifecycle {
  const deactivatedAtIso = deactivatedAt.toISOString();
  return {
    accountStatus: "deactivated",
    deactivatedAt: deactivatedAtIso,
    purgeAt: computePurgeAt(deactivatedAtIso, retentionDays),
  };
}

export function isAccountDeactivated(lifecycle: AccountLifecycle): boolean {
  return lifecycle.accountStatus === "deactivated";
}

export function isAccountPurgeDue(lifecycle: AccountLifecycle, now: Date = new Date()): boolean {
  if (!isAccountDeactivated(lifecycle) || !lifecycle.purgeAt) {
    return false;
  }

  const purgeAt = new Date(lifecycle.purgeAt);
  if (Number.isNaN(purgeAt.getTime())) {
    return false;
  }

  return purgeAt.getTime() <= now.getTime();
}

export function normalizeAccountLifecycle(input: {
  accountStatus?: AccountStatus | null;
  deactivatedAt?: string | null;
  purgeAt?: string | null;
}): AccountLifecycle {
  if (input.accountStatus !== "deactivated") {
    return ACTIVE_ACCOUNT_LIFECYCLE;
  }

  const deactivatedAt = input.deactivatedAt?.trim() || null;
  const purgeAt = input.purgeAt?.trim() || (deactivatedAt ? computePurgeAt(deactivatedAt) : null);

  return {
    accountStatus: "deactivated",
    deactivatedAt,
    purgeAt,
  };
}
