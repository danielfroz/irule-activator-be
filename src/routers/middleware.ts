import express from 'express'
import { Services } from '../services'
import type { AppRequest } from './types'

/**
 * This middleware is responsible for JWT verification 
 * It does not block the request. Instead it verifies token and sets the header
 * If token is not valid... the router is responsible for blocking the request with the
 * proper authorization error code
 */
export const Middlware = async (
  req: AppRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  if(!req.headers.authorization) {
    // nothing to be done as Authorization is not set
    console.log('no authorization header: %o', req.path)
    return next()
  }

  const authorization = req.headers.authorization
  const token = authorization.substring('bearer '.length)
  if(!token) {
    console.log('no token: %o', req.path)
    return next()
  }

  const s = Services.getInstance()
  if(await s.getAuth().validate({ token })) {
    req.isAuthorized = true
  }
  else {
    req.isAuthorized = false
  }

  return next()
}