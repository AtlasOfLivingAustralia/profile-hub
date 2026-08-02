import Pagination from "react-bootstrap/Pagination";
import { useIntl } from "react-intl";

import { getPageNumbers } from "#/helpers/utils/getPageNumbers";
import styles from "./PaginationBar.module.css";

type PaginationBarProps = {
  page: number;
  totalPages: number;
  loading?: boolean;
  disableLast?: boolean;
  onPageChange: (page: number) => void;
};

export function PaginationBar({
  page,
  totalPages,
  loading = false,
  disableLast = false,
  onPageChange,
}: PaginationBarProps) {
  const intl = useIntl();

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav
      className={styles.pagination}
      aria-label={intl.formatMessage({
        id: "view.browse.level.pagination.ariaLabel",
      })}
    >
      <Pagination className="mb-0">
        <Pagination.First
          disabled={loading || page <= 1}
          onClick={() => onPageChange(1)}
          aria-label={intl.formatMessage({
            id: "view.browse.level.pagination.first",
          })}
        />
        <Pagination.Prev
          disabled={loading || page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label={intl.formatMessage({
            id: "view.browse.level.pagination.previous",
          })}
        />
        {pageNumbers[0] > 1 && <Pagination.Ellipsis disabled />}
        {pageNumbers.map((pageNumber) => (
          <Pagination.Item
            key={pageNumber}
            active={pageNumber === page}
            disabled={loading}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Pagination.Item>
        ))}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <Pagination.Ellipsis disabled />
        )}
        <Pagination.Next
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label={intl.formatMessage({
            id: "view.browse.level.pagination.next",
          })}
        />
        <Pagination.Last
          disabled={loading || disableLast || page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label={intl.formatMessage({
            id: "view.browse.level.pagination.last",
          })}
        />
      </Pagination>
    </nav>
  );
}
