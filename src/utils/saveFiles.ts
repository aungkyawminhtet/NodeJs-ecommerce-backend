import type { Request, Response, NextFunction } from "express";
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

import type { UploadedFile } from "express-fileupload";

export interface CustomRequest extends Request {
  imageName?: string;
  image?: string;
  message?: string;
  files?: any;
  body: any;
}

const saveFile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // console.log(req);

    if (!req.files || !req.files.photo) {
      return res
        .status(400)
        .json({ message: "No file uploaded in this files" });
    }

    const photo = req.files?.photo as UploadedFile;

    // console.log("photooto", photo);

    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = Date.now() + "-" + photo.name;
    const uploadPath = path.join(uploadDir, uniqueName);

    await photo.mv(uploadPath);

    req.body["image"] = uniqueName;
    // console.log("from iamge ", req.body);
    next();
    // console.log("success image");

    // return res.status(200).json({
    //   message: "File uploaded successfully",
    //   fileName: uniqueName,
    //   filePath: `/uploads/${uniqueName}`,
    // });
  } catch (error) {
    throw new Error("File upload failed");
  }
};

const saveMultiFiles = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let photo: any = req.files.photo as UploadedFile;

    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let filesName: string[] = [];
    photo.forEach(async (file: UploadedFile) => {
      const uniqueName = Date.now() + "-" + file.name;
      const uploadPath = path.join(uploadDir, uniqueName);

      filesName.push(uniqueName);
      await file.mv(uploadPath);
    });

    req.image = filesName.join(",");
    next();

    // return res.status(200).json({
    //   message: "File uploaded successfully",
    //   fileName: uniqueName,
    //   filePath: `/uploads/${uniqueName}`,
    // });
  } catch (error) {
    throw new Error("File upload failed");
  }
};

const deleteImage = async (fileName: string) => {
  if (fileName) {
    const filePath = path.join(__dirname, `../uploads/${fileName}`);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log("File deleted successfully");
      return true;
    } else {
      console.log("File does not exist");
      return false;
    }
  }
};

// const deleteImage = async (fileName: string) => {
//     console.log("delete file name", fileName);
//   await fs.unlinkSync(path.join(__dirname, `../uploads/${fileName}`));

//   // req.message = "File deleted successfully";
//   // next();
// };

module.exports = {
  saveFile,
  saveMultiFiles,
  deleteImage,
};
