import type { CSSProperties, FC, MouseEvent } from 'react'

/** Tipos de FlowingMenu.jsx (React Bits), según la tabla de props oficial. */
export type FlowingMenuItem = {
  text: string
  link?: string
  image?: string
  marquee?: string
  meta?: string
}

export type FlowingMenuProps = {
  items?: FlowingMenuItem[]
  speed?: number
  direction?: 'left' | 'right' | 'alternate'
  followCursor?: number
  duration?: number
  stretch?: number
  magnet?: number
  bandInset?: number
  carryContent?: boolean
  bandRadius?: number
  textColor?: string
  bgColor?: string
  marqueeBgColor?: string
  marqueeTextColor?: string
  borderColor?: string
  dividers?: boolean
  dimInactive?: boolean
  align?: 'center' | 'left'
  showIndex?: boolean
  showArrow?: boolean
  imageShape?: 'pill' | 'rounded' | 'circle'
  intro?: boolean
  activeIndex?: number
  onItemClick?: (item: FlowingMenuItem, index: number, event: MouseEvent<HTMLElement>) => void
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

declare const FlowingMenu: FC<FlowingMenuProps>
export default FlowingMenu
