// Ghi chú nhóm: Việt hóa hoặc tinh chỉnh hiển thị của thành phần giao diện dùng chung.
'use client';

import Button from '@/shared/ui/button/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];

    pageNumbers.push(1);

    if (currentPage > 3) {
      pageNumbers.push('ellipsis');
    }

    // Pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (i <= totalPages - 1 && i >= 2) {
        pageNumbers.push(i);
      }
    }

    // Show ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      pageNumbers.push('ellipsis');
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {/* Previous Button */}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full cursor-pointer px-4 py-2 border-px border-gray-200"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="text-sm font-medium">Trước</span>
        </Button>

        {/* Page Numbers */}
        <ul className="hidden items-center gap-2 sm:flex">
          {getPageNumbers().map((page, idx) => (
            <li key={idx}>
              {page === 'ellipsis' ? (
                <span className="px-2 text-gray-500">...</span>
              ) : (
                <Button
                  onClick={() => goToPage(Number(page))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium cursor-pointer ${
                    currentPage === page
                      ? 'bg-purple-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </Button>
              )}
            </li>
          ))}
        </ul>

        {/* Next Button */}
        <Button
          onClick={() => goToPage(currentPage + 1)}
          size="sm"
          variant="outline"
          className="rounded-full cursor-pointer px-4 py-2 border-px border-gray-200"
          disabled={currentPage === totalPages}
        >
          <span className="text-sm font-medium">Tiếp</span>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
