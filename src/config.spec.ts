import * as Config from './config'
import { assert } from 'chai'

describe('config', () => {
  it('shall correctly load config', async () => {
    await Config.load()
    const config = Config.get()
    assert(config)
  })

  it('shall parse configuration', async () => {
    const config = Config.get()
    for(const t of Object.keys(config.targets)) {
      const cluster = config.targets[t]
      for(const c of Object.keys(cluster)) {
        const bigip = cluster[c]
        assert(bigip.address.startsWith('https://'), 'bigip does not start with https://')
        assert(bigip.password != null, 'bigip password must be defined')
      }
    }
  })
})