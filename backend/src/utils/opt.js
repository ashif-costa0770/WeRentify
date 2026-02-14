import argon2 from "argon2";


export const generateOtp = () =>{
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const hashOtp = async (otp) => {
  return argon2.hash(otp);
};

export const verifyOtp = async (otp, hash) => {
  return argon2.verify(hash, otp);
};