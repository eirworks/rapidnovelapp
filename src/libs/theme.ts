/**
 * Applies the resolved color scheme to the document so Tailwind's `dark:`
 * variant activates. The main process controls `nativeTheme.themeSource`
 * (auto/dark/light), which drives what `prefers-color-scheme` reports here,
 * so a single `prefers-color-scheme` listener covers all three modes.
 */
export function initTheme(): void {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const apply = () => document.documentElement.classList.toggle('dark', media.matches)

  apply()
  media.addEventListener('change', apply)
}
