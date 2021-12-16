import { BigipClient } from '.'
import { Bigip } from '../dtos'

describe('BigipClient', async function () {
  it('Shall obtain all virtual servers configuration', async () => {
    const bigip = {
      address: 'https://10.3.0.11',
      username: 'admin',
      password: '123qwe'
    } as Bigip
    const tm = new BigipClient(bigip)
    
    await tm.login()

    // const syncStatus = await tm.getSyncStatus()
    // console.log('status: %o', syncStatus)

    const devices = await tm.getDevices()
    console.log('devices: %o', devices)

    const servers = await tm.getVirtualServers()
    console.log('servers: %o', servers)

    const irules = await tm.getIrules()
    console.log('irules: %o', irules)

    await tm.logout()
  })
})