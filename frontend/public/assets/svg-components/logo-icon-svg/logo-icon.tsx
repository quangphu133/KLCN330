import { forwardRef, memo } from 'react'
import { type SvgComponentProps } from '../svgComponentProps'

const SvgComponent = forwardRef<SVGSVGElement, SvgComponentProps>(
  ({ width = 260, height = 65, fill = 'white', ...props }, ref) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 260 65"
      fill="none"
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="HUIT"
      {...props}
    >
      <text
        x="5"
        y="52"
        fill={fill}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="60"
        fontWeight="900"
        letterSpacing="8"
      >
        HUIT
      </text>
      <rect x="7" y="59" width="156" height="4" rx="2" fill="#ED1C24" />
    </svg>
  )
)

export default memo(SvgComponent)
