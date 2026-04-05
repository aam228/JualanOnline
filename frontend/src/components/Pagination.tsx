import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="admin-dashboard-pagination">
      <button 
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="admin-dashboard-pagination-btn"
      >
        Previous
      </button>
      <span className="text-gray-600 font-medium">
        Page {page} of {totalPages}
      </span>
      <button 
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="admin-dashboard-pagination-btn"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
