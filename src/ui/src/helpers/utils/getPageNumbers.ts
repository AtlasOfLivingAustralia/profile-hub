const PAGE_WINDOW = 2;

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): number[] {
  const start = Math.max(1, currentPage - PAGE_WINDOW);
  const end = Math.min(totalPages, currentPage + PAGE_WINDOW);
  const pages: number[] = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}
