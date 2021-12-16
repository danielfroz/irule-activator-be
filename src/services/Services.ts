import * as i from '.'
import * as Config from '../config'

/**
 * Singleton pattern for Services.
 */
export class Services {
  private static _instance = new Services()
  private auth?: i.AuthService
  private developer?: i.DeveloperService
  private maintenace?: i.MaintenanceService

  private constructor() {}

  static getInstance() {
    return Services._instance;
  }

  init() {
    const config = Config.get()
    this.auth = new i.AuthService(config)
    this.maintenace = new i.MaintenanceService(config)
    this.developer = new i.DeveloperService(config, this.maintenace)
  }

  getAuth(): i.AuthService {
    if(!this.auth)
      throw new Error('Services not initialized')
    return this.auth
  }

  getDeveloper(): i.DeveloperService {
    if(!this.developer)
      throw new Error('Services not initialized')
    return this.developer
  }

  getMaintenance(): i.MaintenanceService {
    if(!this.maintenace)
      throw new Error('Services not initialized')
    return this.maintenace
  }
}