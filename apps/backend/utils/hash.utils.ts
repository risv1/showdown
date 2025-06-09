import bcrypt from "bcryptjs";

const generateSalt = async (rounds: number = 10): Promise<string> => {
  return await bcrypt.genSalt(rounds);
};

export const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
  const salt = await generateSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
