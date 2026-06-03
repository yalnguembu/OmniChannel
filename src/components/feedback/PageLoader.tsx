export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[200px]">
      <div className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#2E8FAD] rounded-full animate-spin" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-[#E5E7EB]">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-[#F0F2F4] rounded animate-pulse"
              style={{ flex: j === 0 ? '0 0 120px' : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
