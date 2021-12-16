import * as Config from '../config'
import { MaintenanceService } from '.'
import { assert } from 'chai'

describe('MaintenanceService', function() {
  it('shall create Maintenance', async function() {
    const config = await Config.load()
    const service = new MaintenanceService(config)
    const { maintenance } = await service.create({ name: 'ok' })
    await service.start({ key: maintenance.key })
  })
})