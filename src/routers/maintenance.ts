import express from 'express'
import { Services } from '../services'
import type { AppRequest } from '.'

const r = express.Router()

r.post('/create', async (req: AppRequest, res) => {
  if(!req.body) {
    const error = { error: { code: 'badrequest', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  if(!req.isAuthorized) {
    const error = { error: { code: 'notauthorized', message: 'you are not authorized' }}
    return res.status(403).json(error)
  }
  try {
    const { name, key } = req.body
    const s = Services.getInstance()
    const result = await s.getMaintenance().create({ name, key })
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

r.post('/delete', async (req: AppRequest, res) => {
  if(!req.body) {
    const error = { error: { code: 'badrequest', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  if(!req.isAuthorized) {
    const error = { error: { code: 'notauthorized', message: 'you are not authorized' }}
    return res.status(403).json(error)
  }
  try {
    const { key } = req.body
    const s = Services.getInstance()
    const result = await s.getMaintenance().delete({ key })
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

r.post('/list', async (req: AppRequest, res) => {
  if(!req.isAuthorized) {
    const error = { error: { code: 'notauthorized', message: 'you are not authorized' }}
    return res.status(403).json(error)
  }
  try {
    const s = Services.getInstance()
    const result = await s.getMaintenance().list()
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

r.get('/cluster', async (req: AppRequest, res) => {
  if(!req.isAuthorized) {
    const error = { error: { code: 'notauthorized', message: 'you are not authorized' }}
    return res.status(403).json(error)
  }
  try {
    const s = Services.getInstance()
    const result = await s.getMaintenance().cluster()
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

r.post('/irule', async (req: AppRequest, res) => {
  if(!req.body) {
    const error = { error: { code: 'badrequest', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  if(!req.isAuthorized) {
    const error = { error: { code: 'notauthorized', message: 'you are not authorized' }}
    return res.status(403).json(error)
  }
  try {
    const { cluster } = req.body
    const s = Services.getInstance()
    const result = await s.getMaintenance().iRule({ cluster })
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

r.post('/virtualserver', async (req: AppRequest, res) => {
  if(!req.body) {
    const error = { error: { code: 'badrequest', message:'invalid request; body missing' }}
    return res.status(400).json(error)
  }
  if(!req.isAuthorized) {
    const error = { error: { code: 'notauthorized', message: 'you are not authorized' }}
    return res.status(403).json(error)
  }
  try {
    const { cluster } = req.body
    const s = Services.getInstance()
    const result = await s.getMaintenance().virtualServer({ cluster })
    return res.status(200).json(result)
  }
  catch(e: any) {
    const error = { error: { code: 'exception', message: e.message }}
    return res.status(500).json(error)
  }
})

export { r as Maintenance }