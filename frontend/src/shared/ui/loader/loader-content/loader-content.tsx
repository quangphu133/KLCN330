import { CSSProperties } from 'react'

export type LoaderProps = {
  height?: CSSProperties['height']
  isLoading?: boolean
  width?: CSSProperties['width']
}

export const LoaderContent = ({ height = '100px', width = '100px', isLoading }: LoaderProps) => {
  if (!isLoading) return null

  return (
    <div className="inset-0 flex h-[75vh] justify-center items-center z-20 bg-transparent backdrop-blur-sm">
      <div className="relative" style={{ width, height }}>
        {/* White circle background with an even shadow */}
        <div
          className="absolute inset-0 rounded-full bg-white"
          style={{
            boxShadow: '0 0 25px rgba(0, 0, 0, 0.01), 0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        ></div>
        {/* Spinner */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#704ecc' }}
        ></div>
      </div>
    </div>
  )
}
