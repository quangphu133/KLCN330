type LoaderProps = {
  message?: string
  bgColor?: string
  textColor?: string
}

export const LoaderMain = ({
  message = 'Đang tải...',
  bgColor = 'bg-black/30',
  textColor = 'text-white',
}: LoaderProps) => {
  return (
    <div
      className={`fixed w-screen h-screen top-0 left-0 backdrop-blur-sm flex items-center justify-center z-[9999] ${bgColor}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-transparent border-t-purple-600 border-b-purple-600 rounded-full animate-spin" />
        <p className={`${textColor} text-lg font-semibold drop-shadow`}>{message}</p>
      </div>
    </div>
  )
}
