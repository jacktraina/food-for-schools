import { Request, Response, NextFunction } from 'express';

export function preprocessMultipartJson(req: Request, res: Response, next: NextFunction): void {
  try {
    if (typeof req.body?.data === 'string') {
      const parsed = JSON.parse(req.body.data);

      // Preserve the rest of the body (in case you pass other fields outside `data`)
      req.body = {
        ...parsed,
        ...req.body, // This ensures `req.body.data` (as string) is overwritten
      };
    }

    next();
  } catch (err) {
    console.log( err)
    res.status(400).json({ error: 'Invalid JSON in "data" field.' });
  }
}
