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
  /** state of Maintenance Window */
  status: 'Creating'|'InProgress'|'RollingBack'|'Finished'
  activities: Array<i.Activity>
  /** creating object on the fly */
  state: any
}