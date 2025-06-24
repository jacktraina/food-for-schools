import Validator from "validator";
import { isPasswordValid } from "../../../../src/domain/validators/isPasswordValid";

jest.mock("validator", () => ({
  isEmpty: jest.fn(),
  isStrongPassword: jest.fn(),
}));

describe("isPasswordValid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if the password is empty", () => {
    (Validator.isEmpty as jest.Mock).mockReturnValue(true);

    expect(() => isPasswordValid("")).toThrowError("Password is empty");
    expect(Validator.isEmpty).toHaveBeenCalledWith("");
    expect(Validator.isStrongPassword).not.toHaveBeenCalled();
  });

  it("should throw an error if the password is not strong", () => {
    (Validator.isEmpty as jest.Mock).mockReturnValue(false);
    (Validator.isStrongPassword as jest.Mock).mockReturnValue(false);

    expect(() => isPasswordValid("weakpass")).toThrowError("Password is not strong enough");
    expect(Validator.isEmpty).toHaveBeenCalledWith("weakpass");
    expect(Validator.isStrongPassword).toHaveBeenCalledWith("weakpass");
  });

  it("should not throw an error for a strong password", () => {
    (Validator.isEmpty as jest.Mock).mockReturnValue(false);
    (Validator.isStrongPassword as jest.Mock).mockReturnValue(true);

    expect(() => isPasswordValid("StrongPass123!")).not.toThrow();
    expect(Validator.isEmpty).toHaveBeenCalledWith("StrongPass123!");
    expect(Validator.isStrongPassword).toHaveBeenCalledWith("StrongPass123!");
  });

  it("should throw an error for whitespace-only password", () => {
    (Validator.isEmpty as jest.Mock).mockReturnValue(true);

    expect(() => isPasswordValid("   ")).toThrowError("Password is empty");
    expect(Validator.isEmpty).toHaveBeenCalledWith("   ");
    expect(Validator.isStrongPassword).not.toHaveBeenCalled();
  });
});
