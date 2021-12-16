import { Maintenance } from '../dtos'
import { Config } from '../config'
import { CodeError } from '../errors'
import * as i from '.'

export class DeveloperService {
  constructor(readonly config: Config, readonly mw: i.MaintenanceService ) {}

  async start(args:{ key: string }): Promise<{ maintenance: Maintenance|undefined }> {
    if(!args)
      throw new Error('args')
    if(!args.key)
      throw new Error('args.key')
    const { key } = args

    const { maintenance } = await this.mw.get({ key })
    if(!maintenance) {
      throw new Error('invalid key; no maintanence found')
    }

    return { maintenance }
  }

  async status(args:{ key: string }): Promise<{ maintenance: Maintenance|undefined }> {
    if(!args)
      throw new Error('args')
    if(!args.key)
      throw new Error('args.key')

    const { key } = args
    const { maintenance } = await this.mw.get({ key })
    if(!maintenance)
      throw new CodeError('key', 'invalid key; no maintenance found')

    return { maintenance }
  }
}