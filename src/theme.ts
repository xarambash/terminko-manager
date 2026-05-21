import { createTheme } from '@mantine/core'

// ─── Design token rules ───────────────────────────────────────────────────────
// Component size  : "sm" everywhere (buttons, inputs, selects, pickers)
// Spacing tokens  : "xs"=8px  "sm"=12px  "md"=16px  "lg"=24px
//   xs  — icon + label pairs, tightly related inline elements
//   sm  — between form fields in a Stack, between buttons in a Group
//   md  — between logical sections inside a card
//   lg  — between major page sections
// Icon sizes      : 16px nav/header  |  14px action icons & inline text  |  12px icon inside button w/ label
// Numeric gaps    : avoid; use tokens above. Only raw px when sub-xs tightness is intentional.

export const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'sm',
  fontFamily: '"Anthropic Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontFamilyMonospace: 'ui-monospace, Consolas, monospace',
  headings: {
    fontFamily: '"Anthropic Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },
    NumberInput: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },
    DatePickerInput: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },
    PasswordInput: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
})
