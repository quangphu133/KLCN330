import { ReactNode } from 'react'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return <>{children}</>
}
