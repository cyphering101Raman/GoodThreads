import multer from "multer";
import { CloudinaryStorage } from "@fluidjs/multer-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "FashionStore",
    },
});

export const upload = multer({ storage });
