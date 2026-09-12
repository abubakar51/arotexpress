"use client";
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 15,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 25, 50, 100],
  className = ''
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems === 0) return null;

  const startItem = (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, totalItems);

  // Generate visible page numbers (smart window with ellipsis)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, validCurrentPage - 1);
      let end = Math.min(totalPages - 1, validCurrentPage + 1);

      if (validCurrentPage <= 3) {
        start = 2;
        end = 4;
      } else if (validCurrentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) pages.push('ellipsis-1');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('ellipsis-2');

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`app-pagination-container ${className}`}>
      {/* Items Summary & Page Size selector */}
      <div className="app-pagination-info">
        <span>
          মোট <strong>{toBengaliNumber(totalItems)}</strong> টির মধ্যে{' '}
          <strong>
            {toBengaliNumber(startItem)} - {toBengaliNumber(endItem)}
          </strong>{' '}
          নম্বর প্রদর্শিত
        </span>

        {onPageSizeChange && (
          <div className="app-pagination-size-wrap">
            <label htmlFor="page-size-select">প্রতি পেজে:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="app-pagination-select"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {toBengaliNumber(opt)} টি
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="app-pagination-controls">
        {/* First Page */}
        <button
          type="button"
          className="pagination-btn icon-btn"
          disabled={validCurrentPage === 1}
          onClick={() => onPageChange(1)}
          title="প্রথম পেজ"
          aria-label="প্রথম পেজ"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          className="pagination-btn icon-btn prev-btn"
          disabled={validCurrentPage === 1}
          onClick={() => onPageChange(validCurrentPage - 1)}
          title="পূর্ববর্তী পেজ"
          aria-label="পূর্ববর্তী পেজ"
        >
          <ChevronLeft size={16} />
          <span className="btn-text">পূর্ববর্তী</span>
        </button>

        {/* Page Numbers */}
        <div className="pagination-numbers">
          {getPageNumbers().map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  •••
                </span>
              );
            }

            const isActive = page === validCurrentPage;
            return (
              <button
                key={page}
                type="button"
                className={`pagination-btn num-btn ${isActive ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`পেজ ${toBengaliNumber(page)}`}
              >
                {toBengaliNumber(page)}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          className="pagination-btn icon-btn next-btn"
          disabled={validCurrentPage === totalPages}
          onClick={() => onPageChange(validCurrentPage + 1)}
          title="পরবর্তী পেজ"
          aria-label="পরবর্তী পেজ"
        >
          <span className="btn-text">পরবর্তী</span>
          <ChevronRight size={16} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          className="pagination-btn icon-btn"
          disabled={validCurrentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          title="সর্বশেষ পেজ"
          aria-label="সর্বশেষ পেজ"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
