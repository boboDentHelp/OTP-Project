// componenta reutilizabila pentru butoane
// are suport pentru loading state si variante diferite

import { memo, forwardRef } from 'react'

// folosim forwardRef ca sa putem pasa ref-uri la buton daca e nevoie
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  // combinam clasele
  const classes = `btn btn-${variant} ${className}`.trim()

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner" />}
      {children}
    </button>
  )
})

export default memo(Button)
