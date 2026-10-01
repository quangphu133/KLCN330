interface ComponentCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  desc?: string
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = '',
  desc = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Only render the header section if title or desc exists */}
      {(title || desc) && (
        <div className="px-6 py-5">
          {title && (
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{title}</h3>
          )}
          {desc && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>}
        </div>
      )}

      {/* Only render the dividing line if title or desc exists */}
      {(title || desc) && (
        <div className="flex justify-center px-6">
          <div className="border-t border-gray-100 dark:border-gray-800 w-full" />
        </div>
      )}

      {/* Card Body with proper padding */}
      <div className={`px-6 ${title || desc ? 'pt-6' : 'pt-5'} pb-5`}>
        <div className="space-y-5">{children}</div>
      </div>
    </div>
  )
}

export default ComponentCard
