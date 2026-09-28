interface UploadAlertProps {
  onClose: () => void
  title: string
}

export const UploadAlert = ({ onClose, title }: UploadAlertProps) => {
  return (
    <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 flex justify-between items-center">
      <div className="flex items-center">
        <svg
          className="mr-2 h-5 w-5 text-blue-600"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        <span>{title}</span>
      </div>
      <button type="button" className="text-blue-800 hover:text-blue-900 ml-2" onClick={onClose}>
        <svg
          className="h-4 w-4"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  )
}
