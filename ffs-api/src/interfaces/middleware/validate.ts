import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodSchema } from "zod";
import { BadRequestError } from "../../domain/core/errors/BadRequestError";

export const validate =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.format();
      return res.status(400).json({ errors });
    }

    // Attach parsed data if you want
    req.body = result.data;
    next();
  };

  
 // Extend the Request interface to include your custom property
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validatedData?: Record<string, any>; // Or a more specific type if you know it
    }
  }
}

export const validateAll =
  (schema: AnyZodObject) => // Using AnyZodObject for broader schema compatibility
  (req: Request, res: Response, next: NextFunction) => {
    const validationResult = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      throw new BadRequestError(`Validation failed. Errors: ${JSON.stringify(errors.fieldErrors)}`); // Stringify for better error message
    }

    // Now TypeScript knows about this property
    req.validatedData = validationResult.data;

    next();
  };