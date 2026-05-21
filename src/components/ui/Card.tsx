import { Paper } from '@mantine/core'
import { Link } from 'react-router-dom'
import type { CardProps } from '../../types'

export function Card({ children, className, style, to }: CardProps) {
  if (to) {
    return (
      <Paper
        component={Link}
        to={to}
        withBorder
        shadow="xs"
        className={className}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit', ...style }}
      >
        {children}
      </Paper>
    )
  }

  return (
    <Paper withBorder shadow="xs" className={className} style={style}>
      {children}
    </Paper>
  )
}
