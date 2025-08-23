import bcrypt from "bcryptjs";

const hashPassword = async (password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return {
      success: true,
      data: hashedPassword,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

const comparePassword = async (password: string, hashedPassword: string) => {
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    if (!result) {
      return {
        success: false,
        message: "Password does not match",
      };
    }
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export { hashPassword, comparePassword };
