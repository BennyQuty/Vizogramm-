import React from 'react';

export function Table({
  className = '',
  children,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#2B344D]">
      <table
        className={`w-full text-left text-xs border-collapse ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-[#0E111B] text-[#94A3B8] border-b border-[#2B344D] font-medium uppercase tracking-wider text-[11px] select-none ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={`divide-y divide-[#1E2538] bg-[#121520] ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  className = '',
  children,
  isInteractive = false,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { isInteractive?: boolean }) {
  return (
    <tr
      className={`transition-colors duration-100 ${
        isInteractive
          ? 'hover:bg-[#191E2E] cursor-pointer'
          : 'hover:bg-[#161B29]'
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className = '',
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-semibold text-[#94A3B8] ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className = '',
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-4 py-3 text-[#F8FAFC] align-middle ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
