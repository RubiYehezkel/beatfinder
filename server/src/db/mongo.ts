import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || '';

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_CONNECTION_STRING);
        console.log('MongoDB Connected...');
    } catch (err: unknown) {
        console.log('Failed to connect to MongoDB');
        console.error((err as Error).message);
        process.exit(1);
    }
};