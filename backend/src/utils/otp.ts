import bcrypt from "bcrypt";

export const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export const hashOtp = async (otp: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(otp, saltRounds);
};


export const compareOtp = async ( otp: string, hashedOtp: string ): Promise<boolean> => {
    return bcrypt.compare(otp, hashedOtp);
};

