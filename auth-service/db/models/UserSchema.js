import mongoose, {Schema} from 'mongoose'


const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: Number,
        required: false,
        default: 0
    },
    password: {
        type: String,
        required: true
    }    
})

export const userModal = mongoose.model("User",userSchema)