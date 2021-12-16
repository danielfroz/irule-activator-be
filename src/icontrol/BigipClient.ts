import https from 'https'
import axios, { Axios } from 'axios'
import { Bigip } from '../dtos'

export class BigipClient {
  private client: Axios
  private token?: string

  constructor(readonly bigip: Bigip) {
    this.client = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })

    axios.interceptors.request.use(request => {
      console.log('Starting Request', JSON.stringify(request, null, 2))
      return request
    })
    
    axios.interceptors.response.use(response => {
      console.log('Response:', JSON.stringify(response, null, 2))
      return response
    })
  }

  async login() {
    const url = `${this.bigip.address}/mgmt/shared/authn/login`
    const { username, password } = this.bigip
    // console.log('url: %o', url)
    const res = await this.client.post(url, {
      username,
      password,
      'loginProviderName': 'tmos'
    })
    this.token = res.data.token.name
  }

  async logout() {
    if(!this.token)
      throw new Error('logout required')
    const url = `${this.bigip.address}/mgmt/shared/authz/tokens/${this.token}`
    const res = await this.client.delete(url, {
      headers: {
        'X-F5-Auth-Token': this.token
      }
    })
    // console.log('logout() res.data: %o', res.data)
  }

  async getDevices() {
    if(!this.token)
      throw new Error('Login required')
    const url = `${this.bigip.address}/mgmt/tm/cm/device`
    const res = await this.client.get(url, {
      headers: {
        'X-F5-Auth-Token': this.token
      }
    })
    const devices = new Array<any>()
    for(const device of res.data.items) {
      // console.log('device: %o', device)
      devices.push({
        name: device.name,
        version: device.version,
        failoverState: device.failoverState,
      })
    }
    return devices
  }

  async getSyncStatus() {
    if(!this.token)
      throw new Error('login required')
    const url = `${this.bigip.address}/mgmt/tm/cm/sync-status`
    const res = await this.client.get(url, {
      headers: {
        'X-F5-Auth-Token': this.token
      }
    })
    const statuses = new Array<any>()
    for(const k of Object.keys(res.data.entries)) {
      const status = res.data.entries[k]
      console.log('status: %o', status)
      statuses.push({
        group: k,
        status: status.nestedStats.status.description,
        summary: status.nestedStats.summary.description
      })
    }
    // console.log(res.data)
    return statuses
  }

  async getVirtualServers() {
    if(!this.token)
      throw new Error('Login required')
    const url = `${this.bigip.address}/mgmt/tm/ltm/virtual`
    const res = await this.client.get(url, {
      headers: {
        'X-F5-Auth-Token': this.token
      }
    })

    const virtualServers = new Array<any>()
    for(const vs of res.data.items) {
      const rules = new Array<any>()

      // console.log('getVirtualServers(): vs: %o', vs)
      if(vs.rulesReference) {
        // console.log('getVirtualServers(): rules: %o', vs.rulesReference)
        for(const r of vs.rulesReference) {
          const reference = r.link
          const regex = /mgmt\/tm\/ltm\/rule\/~(\w+)~(\w+)\?/
          const match = regex.exec(reference)
          if(match?.length == 3) {
            // console.log('match: ', match[1], match[2])
            rules.push({
              partition: match[1],
              name: match[2]
            })
          }
        }
      }

      virtualServers.push({
        name: vs.name,
        irules: rules
      })
    }
    return virtualServers
  }

  async getIrules() {
    if(!this.token)
      throw new Error('Login required')

    const url = `${this.bigip.address}/mgmt/tm/ltm/rule`
    const res = await this.client.get(url, {
      headers: {
        'X-F5-Auth-Token': this.token
      }
    })
    const irules = new Array<any>()
    for(const rule of res.data.items) {
      if(rule.name.startsWith('_sys'))
        continue
      irules.push({
        name: rule.name,
        partition: rule.partition,
      })
    }
    return irules
  }
}