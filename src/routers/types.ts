import express from 'express'

export type AppRequest = express.Request & { isAuthorized?: boolean }