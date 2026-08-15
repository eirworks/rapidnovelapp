/**
 * Severity of a status bar message. Each value maps to a dot color:
 * success (green), danger (red), warning (amber), info (blue).
 */
export type StatusSeverity = 'success' | 'danger' | 'warning' | 'info'

/** A single queued status bar entry. */
export interface StatusMessage {
  severity: StatusSeverity
  message: string
}
