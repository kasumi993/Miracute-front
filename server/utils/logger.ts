// Structured logging utility for production monitoring
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
  requestId?: string
  userId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`
    }

    // Production JSON format for log aggregation
    return JSON.stringify({
      ...entry,
      error: entry.error ? {
        message: entry.error.message,
        stack: entry.error.stack,
        name: entry.error.name
      } : undefined
    })
  }

  info(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context
    }
    console.log(this.formatLog(entry))
  }

  warn(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context
    }
    console.warn(this.formatLog(entry))
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error,
      context
    }
    console.error(this.formatLog(entry))
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        context
      }
      console.debug(this.formatLog(entry))
    }
  }

  // API request logging
  logRequest(event: any, duration?: number) {
    const getClientIP = (event: any): string => {
      return getHeader(event, 'x-forwarded-for') ||
             getHeader(event, 'x-real-ip') ||
             event.node.req.connection?.remoteAddress ||
             event.node.req.socket?.remoteAddress ||
             'unknown'
    }

    this.info('API Request', {
      method: event.node.req.method,
      url: event.node.req.url,
      userAgent: getHeader(event, 'user-agent'),
      ip: getClientIP(event),
      duration: duration ? `${duration}ms` : undefined
    })
  }

  // Error logging with context
  logError(error: Error, event?: any) {
    const getClientIP = (event: any): string => {
      return getHeader(event, 'x-forwarded-for') ||
             getHeader(event, 'x-real-ip') ||
             event.node.req.connection?.remoteAddress ||
             event.node.req.socket?.remoteAddress ||
             'unknown'
    }

    this.error('Unhandled Error', error, {
      method: event?.node.req.method,
      url: event?.node.req.url,
      ip: event ? getClientIP(event) : undefined
    })
  }
}

export const logger = new Logger()
