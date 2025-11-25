import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
  columnCount?: number
  rowCount?: number
}

export function TableSkeleton({ columnCount = 5, rowCount = 10 }: TableSkeletonProps) {
  return (
    <div className="rounded-xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_var(--border)] overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary border-b-2 border-border">
          <TableRow className="hover:bg-secondary">
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-[100px] bg-muted-foreground/20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <TableRow key={i} className="border-b border-border hover:bg-muted/50 even:bg-muted/30">
              {Array.from({ length: columnCount }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full bg-muted-foreground/20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
