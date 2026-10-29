import type { CSSProperties, FC } from 'react'

/** Tipos de TextLoop.jsx (React Bits), según la tabla de props oficial. */
export type TextLoopProps = {
  text?: string
  shape?: 'wave' | 'circle' | 'infinity' | 'arch' | 'line'
  path?: string
  speed?: number
  direction?: 'forward' | 'reverse'
  separator?: string
  curviness?: number
  tilt?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  uppercase?: boolean
  color?: string
  ribbon?: boolean
  ribbonColor?: string
  ribbonWidth?: number
  edgeFade?: number
  pauseOnHover?: boolean
  cross?: boolean
  crossColor?: string
  crossAngle?: number
  draggable?: boolean
  scrollBoost?: number
  outline?: boolean
  outlineWidth?: number
  className?: string
  style?: CSSProperties
}

declare const TextLoop: FC<TextLoopProps>
export default TextLoop
