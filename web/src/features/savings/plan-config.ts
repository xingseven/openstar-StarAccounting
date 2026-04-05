import type { SavingsAssetSyncConfig, SavingsGoal, SavingsPlanConfig } from "@/types";

function normalizeAssetId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getSavingsAssetSyncConfig(planConfig: SavingsPlanConfig | null | undefined): SavingsAssetSyncConfig {
  const raw = planConfig?.assetSync;
  const sourceAssetId = normalizeAssetId(raw?.sourceAssetId);
  const holdingAssetId = normalizeAssetId(raw?.holdingAssetId);
  const syncToAssets = Boolean(raw?.syncToAssets && (sourceAssetId || holdingAssetId));

  return {
    syncToAssets,
    sourceAssetId,
    holdingAssetId: holdingAssetId ?? sourceAssetId,
  };
}

export function isSavingsGoalSyncedToAssets(goal: Pick<SavingsGoal, "planConfig">) {
  return getSavingsAssetSyncConfig(goal.planConfig).syncToAssets;
}
