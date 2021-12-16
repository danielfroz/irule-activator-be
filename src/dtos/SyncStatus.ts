export interface SyncStatus {
  group: string
  status: 'In Sync'|'Disconnected'|'Changes Pending'
  summary?: string
}