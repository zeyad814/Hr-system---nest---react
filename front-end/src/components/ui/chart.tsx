
import React from "react"
import { cn } from "@/lib/utils"

interface ChartTooltipProps {
  payload?: any[]
  label?: string
  active?: boolean
  className?: string
}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ payload, label, active, className, ...props }, ref) => {
    if (!active || !payload || !payload.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-2 shadow-md",
          className
        )}
        {...props}
      >
        {label && <div className="mb-2 font-medium">{label}</div>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
)
ChartTooltip.displayName = "ChartTooltip"

interface ChartLegendProps {
  payload?: any[]
  verticalAlign?: "top" | "bottom"
  className?: string
}

const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(
  ({ payload, verticalAlign = "bottom", className, ...props }, ref) => {
    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" && "mb-4",
          verticalAlign === "bottom" && "mt-4",
          className
        )}
        {...props}
      >
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
)
ChartLegend.displayName = "ChartLegend"

export { ChartTooltip, ChartLegend }
