
import { Request, Response, NextFunction } from 'express';
import { preprocessMultipartJson } from '../../../../src/interfaces/middleware/preprocessMultipartJson';

describe('preprocessMultipartJson middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonResponse: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        jsonResponse = result;
        return mockResponse;
      }),
    };
    mockNext = jest.fn();
    jsonResponse = null;
  });

  it('should call next() when req.body has no data field', () => {
    mockRequest.body = { otherField: 'value' };
    
    preprocessMultipartJson(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({ otherField: 'value' });
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should parse valid JSON in data field and merge with body', () => {
    const jsonData = { nested: { field: 'value' }, array: [1, 2, 3] };
    mockRequest.body = {
      data: JSON.stringify(jsonData),
      otherField: 'preserved'
    };
    
    preprocessMultipartJson(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({
      ...jsonData,
      data: JSON.stringify(jsonData), // Original data string is preserved due to spread order
      otherField: 'preserved'
    });
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should respond with 400 for invalid JSON in data field', () => {
    mockRequest.body = {
      data: '{invalid: json}',
      otherField: 'value'
    };
    
    preprocessMultipartJson(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(jsonResponse).toEqual({ error: 'Invalid JSON in "data" field.' });
  });

  it('should preserve non-data fields when parsing JSON data', () => {
    const jsonData = { key: 'value' };
    mockRequest.body = {
      data: JSON.stringify(jsonData),
      file: 'file123',
      meta: 'information'
    };
    
    preprocessMultipartJson(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({
      ...jsonData,
      data: JSON.stringify(jsonData),
      file: 'file123',
      meta: 'information'
    });
  });

  it('should handle empty JSON object in data field', () => {
    mockRequest.body = {
      data: '{}',
      otherField: 'value'
    };
    
    preprocessMultipartJson(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({
      data: '{}',
      otherField: 'value'
    });
  });

  it('should handle when data field is not a string', () => {
    mockRequest.body = {
      data: { already: 'parsed' },
      otherField: 'value'
    };
    
    preprocessMultipartJson(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({
      data: { already: 'parsed' },
      otherField: 'value'
    });
  });
});