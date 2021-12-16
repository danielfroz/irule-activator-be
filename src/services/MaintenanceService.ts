import { Config } from '../config'
import { Activity, Maintenance } from '../dtos'
import { BigipClient } from '../icontrol'
import * as Dtos from '../dtos'
import * as Cqrs from '../cqrs'
import { nanoid } from 'nanoid'
import { log } from '../log'

export class MaintenanceService {
  private _map = new Map<string, Maintenance>()
  private _state = new Map<string, any>()

  constructor(readonly config: Config) {}

  create(args:{ name: string, key?: string }): Promise<{ maintenance: Maintenance }> {
    if(!args)
      throw new Error('args')
    if(!args.name)
      throw new Error('args.name')

    let { name, key } = args
    if(!key || key === '') {
      // only creates a key if none is specified...
      key = nanoid()
    }
    else {
      // check if key is not already in use...
      if(this._map.has(key))
        throw new Error('key is already in use')
    }

    const maintenance = {
      name,
      key,
      status: 'Creating'
    } as Maintenance

    this._map.set(key, maintenance)

    log.info('created maintenance: %o', maintenance)
    
    return Promise.resolve({ maintenance })
  }

  get(args:{ key: string }): Promise<{ maintenance: Maintenance|undefined }> {
    const { key } = args
    const maintenance = this._map.get(key)
    return Promise.resolve({ maintenance })
  }

  list(): Promise<{ maintenances: Maintenance[] }> {
    const maintenances = Array.from(this._map.values())
    return Promise.resolve({ maintenances })
  }

  delete(args:{ key: string }): Promise<void> {
    if(!args)
      throw new Error('args')
    if(!args.key)
      throw new Error('args.key')

    const { key } = args

    this._map.delete(key)

    return Promise.resolve()
  }

  async cluster(): Promise<Cqrs.MaintenanceClusterResult> {
    const { targets } = this.config
    if(!targets)
      throw new Error('config.targets')

    const clusters = new Array<string>()
    for(const cluster of Object.keys(targets)) {
      clusters.push(cluster)
    }

    return {
      clusters
    }
  }

  async iRule(args:{ cluster: string }): Promise<Cqrs.MaintenanceIRuleResult> {
    if(!args)
      throw new Error('args')
    if(!args.cluster)
      throw new Error('args.cluster')

    const config = this.config
    const result = {} as Cqrs.MaintenanceIRuleResult

    console.log('checking iRules... ')

    for(const t of Object.keys(config.targets)) {
      // only prepare for this particular cluster...
      if(args.cluster !== t)
        continue;

      const cluster = config.targets[t]
      if(cluster == null)
        throw new Error(`targets[${t}].cluster not specified`)

      for(const c of Object.keys(cluster)) {
        // only need to verify one node of the cluster...
        const bigip = cluster[c]
        const ic = new BigipClient(bigip)

        await ic.login()
        result.iRules = await ic.getIrules()
        await ic.logout()

        break
      }
    }

    return result
  }

  async virtualServer(args:{ cluster: string }): Promise<Cqrs.MaintenanceVirtualServerResult> {
    if(!args)
      throw new Error('args')
    if(!args.cluster)
      throw new Error('args.cluster')

    const config = this.config
    const result = {} as Cqrs.MaintenanceVirtualServerResult

    for(const t of Object.keys(config.targets)) {
      // only prepare for this particular cluster...
      if(args.cluster !== t)
        continue;

      const cluster = config.targets[t]
      if(cluster == null)
        throw new Error(`targets[${t}].cluster not specified`)

      for(const c of Object.keys(cluster)) {
        // only need to verify one node of the cluster...
        const bigip = cluster[c]
        const ic = new BigipClient(bigip)
        await ic.login()
        result.virtualServers = await ic.getVirtualServers()
        await ic.logout()

        break
      }
    }

    return result
  }
}