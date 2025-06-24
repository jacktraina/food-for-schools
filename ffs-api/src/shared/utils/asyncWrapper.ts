import { Request, Response, NextFunction } from "express";

// Add generic type TReq extending Request
export const asyncWrapper = <TReq extends Request = Request>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (req: TReq, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Type-cast req to TReq
    fn(req as TReq, res, next).catch(next);
  };
};
