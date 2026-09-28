import { forwardRef, memo } from 'react'
import { type SvgComponentProps } from '../svgComponentProps'

const SvgComponent = forwardRef<SVGSVGElement, SvgComponentProps>(
  ({ isSelected, height = 18, width = 18, ...props }, ref) => (

<svg
  viewBox="0 0 20 20"
     fill="none"
     height={height}
     ref={ref}
     width={width}
     xmlns="http://www.w3.org/2000/svg"
     {...props}
>
  <path d="M3.54488 9.72539L6.80112 8.056C6.94007 7.98476 7.071 7.89524 7.16639 7.77162C7.57731 7.23912 7.66722 6.51628 7.38366 5.89244L5.76239 2.32564C5.23243 1.15974 3.7011 0.882058 2.79552 1.78764L1.72733 2.85577C1.36125 3.22182 1.18191 3.73847 1.27376 4.24794C1.9012 7.72846 3.56003 11.0595 6.25026 13.7497C8.94049 16.44 12.2716 18.0988 15.7521 18.7262C16.2615 18.8181 16.7782 18.6388 17.1442 18.2727L18.2124 17.2045C19.118 16.2989 18.8403 14.7676 17.6744 14.2377L14.1076 12.6164C13.4838 12.3328 12.7609 12.4227 12.2284 12.8336C12.1048 12.929 12.0153 13.06 11.944 13.1989L10.2747 16.4552" stroke={isSelected ? '#0068AD' : '#344054'} strokeWidth="1.5"/>
</svg>
  )
)

export default memo(SvgComponent)
