import express from 'express'
import cors from 'cors'
import * as Config from './config'
import * as Routers from './routers'
import { Services } from './services'
import { log } from './log'

const bootstrap = async () => {
  await Config.load()
  const config = Config.get()
  
  log.info('running config: %o', config)

  let port = process.env.PORT || 3000
  if(config.service.port) {
    port = config.service.port
  }

  const s = Services.getInstance()
  s.init()

  const app = express()
  app.use(cors({
    origin: '*'
  }))
  app.use(express.json())
  app.use(Routers.Middlware)
  app.use('/auth', Routers.Auth)
  app.use('/developer', Routers.Developer)
  app.use('/maintenance', Routers.Maintenance)
  app.use((req, res, next) => {
    console.log('resource not found: %o', req.path)
    return res.status(404).json({ error: { code: 'notfound', message: 'resource not found' }})
  })
  app.listen(port, ()=> {
    console.log(`Backend running on port ${port}`)
  })
}

bootstrap()