export default function Pagination({ pagination, onPage }) {
  const { page, totalPages, total } = pagination;
  if (total === 0) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button className="btn small" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span>Page {page} of {totalPages} · {total} task{total === 1 ? '' : 's'}</span>
      <button className="btn small" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
    </nav>
  );
}
