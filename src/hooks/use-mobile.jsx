import * as React from "react"

const MOBILE_BREAKPOINT = 768
const WIDE_BREAKPOINT = 1024

export function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener("change", onChange)
    setMatches(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}

/** iPad and similar: split workspace + right panel (messages, KB) */
export function useIsTablet() {
  return useMediaQuery(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${WIDE_BREAKPOINT - 1}px)`)
}

export function useIsWide() {
  return useMediaQuery(`(min-width: ${WIDE_BREAKPOINT}px)`)
}
