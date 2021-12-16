import { stringify } from "uuid"

export type LogLevel = 'DEBUG'|'INFO'|'ERROR'|'WARNING'

export class log {
  static debug(m: string, ...args: any[]) {
    log.log('DEBUG', m, args)
  }

  static info(m: string, ...args: any[]) {
    log.log('INFO', m, args)
  }

  static warn(m: string, ...args: any[]) {
    log.log('WARNING', m, args)
  }

  static error(m: string, ...args: any[]) {
    log.log('ERROR', m, args)
  }

  static log(level: LogLevel, m: string, ...args: any[]) {
    const date = new Date().toISOString()
    const fmt = `${date} [${level}] ${m}`
    let func: (...data: any[]) => void
    if(level === 'ERROR') {
      func = console.error
    }
    else {
      func = console.log
    }
    func(fmt, ...(args.shift()))
  }
}