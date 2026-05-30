import { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler'

export function validateUUID(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName] as string
    console.log(`validating UUID: ${id}`)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(id)) {
      return next(new AppError(`Invalid ID format: ${id}`, 400))
    }

    next()
  }
}