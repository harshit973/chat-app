import jwt from "jsonwebtoken"
export const generateToken = (payload) => {
    return jwt.sign(payload,process.env.JWT_SECRET_KEY,{
        expiresIn:15*24*60*60,
    })
}
export const verifyToken = async(token) =>{
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded;    
    }catch(e){
        console.error('JWT verification failed:', err.message);
        return false;
    }
}
export const generateJWTTokenAndSetCookie = (payload, res) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "15d"
    })
    res.cookie("x-access-token", token, {
        maxAge: 15*24*60*60*1000,
        httpOnly: true,
        sameSite:"strict",
        secure: false
    })
 }
 export const decodeJWTToken = (token) => {
    const decoded = jwt.decode(token, process.env.JWT_SECRET_KEY)
    return decoded
 }