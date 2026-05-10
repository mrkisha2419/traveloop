import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET
    });
}
export async function uploadBuffer(buffer, folder) {
    if (!env.CLOUDINARY_CLOUD_NAME) {
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error || !result)
                reject(error);
            else
                resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
