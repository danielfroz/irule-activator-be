import express from 'express'
import { Services } from '../services'
import type { AppRequest } from '.'
import { log } from '../log'

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
    const { id, maintenance } = req.body
    log.info('maintenance/create: command: %o', { id, maintenance })
    const s = Services.getInstance()
    const result = await s.getMaintenance().create({ maintenance })
    return res.status(200).json(result)
  }
  catch(e: any) {
    log.error('maintenance/create: error caught: %o', e)
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

r.post('/get', async (req: AppRequest, res) => {
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
    const result = await s.getMaintenance().get({ key })
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

r.post('/verify', async (req: AppRequest, res) => {
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
    log.info(`maintenance/verify: key: ${key}`)
    const s = Services.getInstance()
    const result = await s.getMaintenance().verify({ key })
    return res.status(200).json(result)
  }
  catch(e: any) {
    log.error('maintenance/verify: caught error: %o', e)
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