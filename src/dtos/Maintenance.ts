import * as i from '.'

/**
 * Represents Maintenance Window
 * Simply works with Key, so we know that the user is authorized
 * to stop service and redirect
 */
export interface Maintenance {
  /** key usually with nanoid */
  key: string
  /** name for easier identification */
  name: string
  /** status of Maintenance Window */
  status: 'Created'|'VerificationInProgress'|'VerificationFailed'|'Verified'|'Started'|'RolledBack'|'Finished'
  /** points to the active device */
  device: i.Device
  /** activities which will happen during verification or during the maintenance window */
  activities: Array<i.Activity>
  /** virtualServer targetted for this Maintenance Window */
  virtualServer: string
  /** iRule which will be applied */
  iRule: string
}