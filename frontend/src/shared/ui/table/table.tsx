import { ReactNode } from 'react';

// Props for Table
interface TableProps {
  children: ReactNode;
  className?: string;
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  role?: string;
  tabIndex?: number;
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  borders?: {
    right?: boolean;
    bottom?: boolean;
  };
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div>
      <table className={`${className}`}>{children}</table>
    </div>
  );
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  onClick,
  onKeyDown,
  role,
  tabIndex,
}) => {
  return (
    <tr
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  colSpan,
  rowSpan,
  borders = { right: false, bottom: false },
}) => {
  const CellTag = isHeader ? 'th' : 'td';

  const borderClasses = `${borders.right ? 'border-r' : ''} ${borders.bottom ? 'border-b' : ''}`;

  return (
    <CellTag
      className={`${borderClasses} border-gray-100 ${className || ''}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
