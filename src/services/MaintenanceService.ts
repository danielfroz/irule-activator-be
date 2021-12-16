import { Config } from '../config'
import { Activity, iRule, Maintenance, VirtualServer } from '../dtos'
import { BigipClient } from '../icontrol'
import * as Cqrs from '../cqrs'
import { nanoid } from 'nanoid'
import { log } from '../log'

export class MaintenanceService {
  private _map = new Map<string, Maintenance>()
  private _state = new Map<string, any>()

  constructor(readonly config: Config) {}

  /**
   * This is an asynchronous service... we fire it up... and let it run...
   * If any check fails, we then set the Maintenance.status = 'VerificationFailed'
   * Developers won't be able to start the maintenance until the problem is fixed
   */
   async create(args: { maintenance: Maintenance }): Promise<{ maintenance: Maintenance }> {
    if(!args)
      throw new Error('args')
    if(!args.maintenance)
      throw new Error('args.maintenance')
    
    const { maintenance } = args
    // case that key is white space...
    if(maintenance.key && maintenance.key.trim() === '')
      throw new Error('args.maintenance.key')
    if(!maintenance.iRule)
      throw new Error('args.maintenance.iRule')
    if(!maintenance.virtualServer)
      throw new Error('args.maintenance.virtualServer')

    // check if key is not already in use...
    if(maintenance.key && this._map.has(maintenance.key))
      throw new Error('key is already in use; or maintenance already created; check the Maintenance list')
    // only creates a key if none is specified... In other words, allow admin to create a Maintenance window
    // using an previous key which is not currently in use...
    if(!maintenance.key) {
      maintenance.key = nanoid()
    }

    // status is created
    maintenance.status = 'Created'
    // all good... create Activities
    maintenance.activities = new Array<Activity>()
    maintenance.activities.push({
      date: new Date(),
      owner: 'Admin',
      message: `created`
    })

    this._map.set(maintenance.key, maintenance)

    log.info('maintenance created: %o', maintenance)

    return {
      maintenance
    }
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

  async verify(args:{ key: string }): Promise<void> {
    if(!args)
      throw new Error('args')
    if(!args.key)
      throw new Error('args.key')

    const { key } = args

    const maintenance = this._map.get(key)
    if(!maintenance)
      throw new Error('invalid key')
    
    if(maintenance.status == 'VerificationInProgress') {
      // do nothing as this code is running still...
      return
    }
    if(maintenance.status != 'Created' && maintenance.status != 'VerificationFailed')
      throw new Error('verification must happen once the Maintenance Created or Verification Failed')

    const config = this.config
    try {
      maintenance.status = 'VerificationInProgress'
      
      for(const clusterName of Object.keys(config.targets)) {
        const cluster = config.targets[clusterName]
  
        maintenance.activities.push({
          date: new Date(),
          owner: 'Cluster',
          message: `Checking cluster ${clusterName}`
        })
  
        for(const c of Object.keys(cluster)) {
          const bigip = cluster[c]
          const icontrol = new BigipClient(bigip)
  
          maintenance.activities.push({
            date: new Date(),
            owner: 'Cluster',
            message: `Connecting to bigip ${bigip.address}`
          })

          await icontrol.login()
          try {
            const devices = await icontrol.getDevices()
            // console.log('checking devices: %o', devices)
  
            // check if versions are the same in all bigip instances
            const versions = new Map<string, number>()
            // check if both devices are active / standby or active / active
            for(const d of devices) {
              if(d.failoverState != 'active' && d.failoverState != 'standby') {
                throw new Error(`bigip ${bigip.address}; indicated a device with invalid failover state: ${d.failoverState}`)
              }
              if(d.failoverState === 'active') {
                maintenance.device = d
              }
              let count = versions.get(d.version) || 0
              versions.set(d.version, ++count)
            }
            maintenance.activities.push({
              date: new Date(),
              owner: 'Bigip',
              message: `bigip ${bigip.address} devices failover state... Check`
            })
  
            // to do that simply check if there is more than 1 version reported in devices... 
            if(Array.from(versions.keys()).length > 1) {
              throw new Error(`bigip ${bigip.address}: reporting cluster running with different versions: ${JSON.stringify(versions.values())}`)
            }
            maintenance.activities.push({
              date: new Date(),
              owner: 'Bigip',
              message: `bigip ${bigip.address} version... Check`
            })
  
            // let's get bigip status
            const status = await icontrol.getSyncStatus()
            if(status.status != 'In Sync') {
              throw new Error(`bigip ${bigip.address}; not in sync status; you must have them in sync prior to this maintenance window!`)
            }
            maintenance.activities.push({
              date: new Date(),
              owner: 'Bigip',
              message: `bigip ${bigip.address} status In Sync... Check`
            })
  
            // let's check the virtual server... if exists in this box
            const virtualServers = await icontrol.getVirtualServers()
            const vsMap = new Map<string, VirtualServer>()
            for(const vs of virtualServers) {
              vsMap.set(vs.name, vs)
            }
            if(!vsMap.has(maintenance.virtualServer)) {
              throw new Error(`bigip ${bigip.address}; VS ${maintenance.virtualServer} missing; make sure the target Virtual Server is deployed on all clusters`)
            }
            maintenance.activities.push({
              date: new Date(),
              owner: 'Bigip',
              message: `bigip ${bigip.address} virtual server... Check`
            })
  
            const irules = await icontrol.getIrules()
            const irulesMap = new Map<string, iRule>()
            for(const irule of irules) {
              irulesMap.set(irule.name, irule)
            }
            if(!irulesMap.has(maintenance.iRule)) {
              throw new Error(`bigip ${bigip.address}; iRule ${maintenance.iRule} missing; make sure the target iRule is deployed on all clusters`)
            }
            maintenance.activities.push({
              date: new Date(),
              owner: 'Bigip',
              message: `bigip ${bigip.address} iRule... Check`
            })
          }
          finally {
            await icontrol.logout()
          }
        }
      }

      maintenance.status = 'Verified'
    }
    catch(error: any) {
      maintenance.activities.push({
        date: new Date(),
        owner: 'Bigip',
        error: `error caught: ${error.message}`
      })
      maintenance.status = 'VerificationFailed'
    }
    finally {
      // sets maintenance ... must be removed by delete if desired...
      this._map.set(maintenance.key, maintenance)
    }
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