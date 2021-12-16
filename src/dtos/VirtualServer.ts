import { iRule } from '.'

export interface VirtualServer {
  name: string,
  irules: Array<iRule>
}