import { Bigip } from '.'

export interface Cluster {
  [name: string]: Bigip
}