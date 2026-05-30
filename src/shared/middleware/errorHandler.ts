import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${req.method} ${req.path} — ${error.message}`)

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message
    })
  }

  return res.status(500).json({
    error: 'Internal server error'
  })
}