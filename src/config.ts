import yaml from 'js-yaml'
import fs from 'fs'
import { Bigip, Cluster } from './dtos'

export interface Service {
  port: number,
  auth: {
    username: string,
    password: string
  },
  jwt: {
    salt: string
  }
}

export interface Config {
  service: Service,
  targets: {
    [cluster:string]: Cluster
  }
}

let config = {} as Config

export const get = () => {
  return config;
}

export const load = async () => {
  config = yaml.load(fs.readFileSync('config.yaml', 'utf8')) as Config
  if(!config.service)
    throw new Error('server not specified')
  if(!config.service.auth)
    throw new Error('server.auth not specified')
  if(!config.service.auth.username)
    throw new Error('server.auth.username not specified')
  if(!config.service.auth.password)
    throw new Error('server.auth.password not specified')

  // validating targets...
  if(config.targets == null)
    throw new Error('targets not specified')
    
  if(Object.keys(config.targets).length == 0)
    throw new Error('targets.cluster not specified')

  for(const t of Object.keys(config.targets)) {
    const cluster = config.targets[t]
    if(cluster == null)
      throw new Error(`targets[${t}].cluster not specified`)
    for(const c of Object.keys(cluster)) {
      const bigip = cluster[c]
    }
  }

  return config
}