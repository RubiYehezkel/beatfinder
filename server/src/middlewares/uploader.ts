import { NextFunction } from "express";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: any) {
    const uploadDir = path.join(__dirname, "../../uploads/artists");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: any) {
    const fileID = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, fileID + ext);
  },
});

// File type filter
const types = ["image/jpeg", "image/gif", "image/png", "image/jpg"];
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (types.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB file size limit
  },
});

// Middleware function to handle file upload
export const imageUploader = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("profileImage")(req, res, function (err: any) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.log(err);

      return res.status(400).send(err);
    } else if (err) {
      // An unknown error occurred
      console.log(err);
      return res
        .status(500)
        .send({ message: "An error occurred while uploading" });
    }
    next();
  });
};

// Function to delete photo
export const deletePhotoByName = (name: string) => {
  const filePath = path.join(__dirname, "../../uploads/artists", name);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  } else {
    return false;
  }
};

export const deletePhotoByPath = (name: string) => {
  const fileName = name.split("/").pop() as string;
  const filePath = path.join(__dirname, "../../uploads/artists", fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  } else {
    return false;
  }
};
