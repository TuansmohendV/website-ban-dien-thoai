import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${
          currentPage === 1
            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
            : 'border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600 bg-white'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2 px-4 py-1 bg-gray-100/50 rounded-2xl border border-gray-100">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
              currentPage === page
                ? 'bg-red-600 text-white shadow-md scale-110'
                : 'text-gray-500 hover:text-red-600'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${
          currentPage === totalPages
            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
            : 'border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600 bg-white'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
