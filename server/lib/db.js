import mongoose from "mongoose"

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("MongoDB connected")
        });

        await mongoose.connect(`${process.env.MONGO_URI}/chat-app`)
        // console.log("MONGO_URI:", process.env.MONGO_URI);
    }
    catch (error) {
        console.log(error);
    }
}

export default connectDB;