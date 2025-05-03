/**  Global dark-mode palette (charcoal instead of navy) */
export const darkGreyTheme = {
    colors: {
      /* Primary surfaces */
      bg: {
        base:      "#18181B",   // page background
        subtle:    "#18181B",   // light panels / hero strips
        component: "#18181B",   // cards, nav, footer, etc.
        component_elevated: "#18181B",
      },
  
      /* Optional – tweak interactive states */
      interactive: {
        base:      "#242424",
        hover:     "#2E2E2E",
        pressed:   "#383838",
      },
  
      field:     "#222222",
      skeleton:  "#222222",
    },
  } as const
  