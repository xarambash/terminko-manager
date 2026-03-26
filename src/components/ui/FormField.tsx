import { forwardRef } from 'react'

import { cn } from '@/lib/utils'
import type { FormFieldProps } from '../../types'
import { Input } from './input'

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, error, id, className, ...props }, ref) {
    const inputId = id ?? props.name
    return (
      <div>
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <Input
          ref={ref}
          id={inputId}
          className={cn(className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
