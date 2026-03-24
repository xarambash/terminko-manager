import { Card } from './Card'
import type { ModalProps } from '../../types'

export function Modal({
  open,
  onClose,
  title,
  titleId = 'modal-title',
  children,
}: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6 shadow-lg">
          <h2
            id={titleId}
            className="mb-4 text-lg font-medium text-[var(--text-h)]"
          >
            {title}
          </h2>
          {children}
        </Card>
      </div>
    </div>
  )
}
