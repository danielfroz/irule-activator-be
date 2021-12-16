import express from 'express'
import { Services } from '../services'

const r = express.Router()

r.post('/login', async (req, res) => {
  if(!req.body) {
    const error = { error: { code: 'bad request', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  try {
    const { username, password } = req.body
    const s = Services.getInstance()
    const result = await s.getAuth().login({ username, password })
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

r.post('/logout', async (req, res) => {
  if(!req.body) {
    const error = { error: { code: 'bad request', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  try {
    const { token } = req.body
    const s = Services.getInstance()
    const result = await s.getAuth().logout({ token })
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

export { r as Auth }