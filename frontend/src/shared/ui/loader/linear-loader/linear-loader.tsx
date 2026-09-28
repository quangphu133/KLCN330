import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

import './linear-loader.css' // import new CSS file

export type LoaderProps = ComponentPropsWithoutRef<'progress'>

const LinearLoaderComponent = forwardRef<ElementRef<'progress'>, LoaderProps>(
  ({ className, ...restProps }, ref) => {
    return <progress className={twMerge('root', className)} {...restProps} ref={ref} />
  }
)

LinearLoaderComponent.displayName = 'LinearLoader'

export const LinearLoader = LinearLoaderComponent
