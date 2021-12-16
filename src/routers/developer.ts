import express from 'express'
import { Services } from '../services'
import { CodeError } from '../errors'

const r = express.Router()

r.post('/start', async (req, res) => {
  if(!req.body) {
    const error = { error: { code: 'bad request', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  try {
    const { key } = req.body
    const s = Services.getInstance()
    const result = await s.getDeveloper().start({ key })
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

r.post('/status', async (req, res) => {
  if(!req.body) {
    const error = { error: { code: 'bad request', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  try {
    const { key } = req.body
    const s = Services.getInstance()
    const result = await s.getDeveloper().status({ key })
    return res.status(200).json(result)
  }
  catch(e: any) {
    if(e instanceof CodeError) {
      const error = { error: { code: e.code, message: e.message }}
      return res.status(500).json(error)
    }
    else {
      const error = { error: { code: 'exception', message: e.message }}
      return res.status(500).json(error)
    }
  }
})

export { r as Developer }