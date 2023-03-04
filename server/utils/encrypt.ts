import bcrypt from "bcrypt";

export const encrypt = async (value: string) => {
    const hash = await bcrypt.hash(value, 10);
    return hash;
};

export const checkPassword = async (
    hashedPassword: string,
    password: string
) => {
    const passwordCorrect = await bcrypt.compare(password, hashedPassword);
    return passwordCorrect;
};
