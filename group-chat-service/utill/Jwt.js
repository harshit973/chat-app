import jwt from "jsonwebtoken"
export const generateToken = (payload) => {
    return jwt.sign(payload,process.env.JWT_SECRET_KEY,{
        expiresIn:15*24*60*60,
    })
}
export const verifyToken = async(token) =>{
    try{
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    }catch(e){
        console.error('JWT verification failed:', e?.message);
        return false;
    }
}
export const decodeToken = async(token) =>{
    try{
        return jwt.decode(token, process.env.JWT_SECRET_KEY);
    }catch(e){
        console.error('JWT verification failed:', e?.message);
        return false;
    }
}