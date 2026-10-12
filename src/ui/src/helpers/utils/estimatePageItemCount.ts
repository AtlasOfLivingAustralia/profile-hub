const DEFAULT_PAGE_SIZE = 25;

/** Estimate how many items the current page should show, capped at pageSize. */
export function estimatePageItemCount(
  totalCount: number,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): number {
  if (totalCount <= 0) return pageSize;
  const remaining = totalCount - (page - 1) * pageSize;
  return Math.max(0, Math.min(pageSize, remaining));
}
