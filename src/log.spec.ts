import { log } from './log'

describe.skip('log', function() {
  it('log shall be working as console', () => {
    log.info('testing code: %o', { ok: 'works' })
    console.log('testing code: %o', { ok: 'works' })

    log.info('testing with 2 objects: obj[%o] obj[%o]', { name: 'object 1' }, { name: 'object 32' })
    console.log('testing with 2 objects: obj[%o] obj[%o]', { name: 'object 1' }, { name: 'object 32' })
  })
})