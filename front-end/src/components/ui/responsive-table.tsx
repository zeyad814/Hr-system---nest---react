import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveTableRowProps {
  children: React.ReactNode
  className?: string
  headers?: string[]
}

interface ResponsiveTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  header?: string
  hideOnMobile?: boolean
}

const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  ResponsiveTableProps
>(({ className, children, ...props }, ref) => {
  const tableChildren = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && (child.type === ResponsiveTableHeader || child.type === ResponsiveTableBody)
  )

  const mobileContent = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === ResponsiveTableBody
  )

  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="relative w-full overflow-auto rounded-lg border shadow-sm">
          <table className="w-full text-sm border-collapse">
            {tableChildren}
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {React.isValidElement(mobileContent) &&
          React.Children.map(mobileContent.props.children, (child) => {
            if (React.isValidElement(child) && child.type === ResponsiveTableRow) {
              const rowProps = child.props as ResponsiveTableRowProps & React.HTMLAttributes<HTMLTableRowElement>
              const { children: rowChildren, headers = [] } = rowProps

              return (
                <div
                  key={child.key}
                  className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
                >
                  {React.Children.map(rowChildren, (cell, index) => {
                    if (React.isValidElement(cell) && cell.type === ResponsiveTableCell) {
                      const cellProps = cell.props as ResponsiveTableCellProps
                      const { header, hideOnMobile, children: cellChildren } = cellProps
                      if (hideOnMobile) return null

                      // لو مفيش header أو headers[index] -> ما يظهرش أي label
                      const label = header || headers[index]

                      return (
                        <div
                          key={index}
                          className="grid grid-cols-2 gap-2 items-center"
                        >
                          {label && (
                            <span className="text-xs font-medium text-gray-500">
                              {label}
                            </span>
                          )}
                          <span className="text-sm text-gray-800 text-right break-words">
                            {cellChildren}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )
            }
            return null
          })}
      </div>
    </div>
  )
})
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b bg-gray-50", className)}
    {...props}
  >
    {children}
  </thead>
))
ResponsiveTableHeader.displayName = "ResponsiveTableHeader"

const ResponsiveTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  >
    {children}
  </tbody>
))
ResponsiveTableBody.displayName = "ResponsiveTableBody"

const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  ResponsiveTableRowProps & React.HTMLAttributes<HTMLTableRowElement>
>(({ className, children, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-gray-50",
      className
    )}
    {...props}
  >
    {children}
  </tr>
))
ResponsiveTableRow.displayName = "ResponsiveTableRow"

const ResponsiveTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-3 text-right align-middle font-semibold text-gray-600 text-sm whitespace-nowrap",
      className
    )}
    {...props}
  >
    {children}
  </th>
))
ResponsiveTableHead.displayName = "ResponsiveTableHead"

const ResponsiveTableCell = React.forwardRef<
  HTMLTableCellElement,
  ResponsiveTableCellProps
>(({ className, hideOnMobile, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-2 align-middle text-sm text-gray-800",
      hideOnMobile && "hidden md:table-cell",
      className
    )}
    {...props}
  >
    {children}
  </td>
))
ResponsiveTableCell.displayName = "ResponsiveTableCell"

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
}