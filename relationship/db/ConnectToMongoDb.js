import mongoose from "mongoose";

export const connectToMongoDb = async() => {
    try{
        await mongoose.connect(`${process.env.DBURL}`)
    }catch(e){
        console.log(e)
    }
}