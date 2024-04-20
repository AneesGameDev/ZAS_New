const multer = require("multer");
const fs = require("fs");




const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const userUploadsDir = `UploadsProfile`;
    fs.mkdirSync(userUploadsDir, { recursive: true });
    cb(null, userUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const uniqueFilename = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + ext;
    cb(null, uniqueFilename);
  },
});


const ImgUpload = multer({ storage: storageConfig });


const handleProfileImageUpload = (req, res, next) => {
  ImgUpload.single("profileImage")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Error uploading file' });
    } else if (err) {
      return res.status(500).json({ message: 'Error uploading file' });
    }
    // Pass uploaded file to the next middleware

    req.fileUrl = `/UploadsProfile/${req.file.filename}`;
    next();
  });
};

const mkdirSync = (dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
};
/*
const storageConfigNew = multer.diskStorage({
  destination: (req, file, cb) => {
    const userUploadsDir = `Uploads/Campaigns`;
    //mkdirSync(userUploadsDir);
    cb(null, userUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const userUploadsDir = `Uploads/Campaigns`;
    const files = fs.readdirSync(userUploadsDir);
    const fileCount = files.filter((name) => name.endsWith(`.${ext}`)).length + 1;
    cb(null, `${fileCount}.${ext}`);
  },
});
*/

const storageConfigNew = multer.diskStorage({
  destination: (req, file, cb) => {
    const userUploadsDir = `Uploads`;
    fs.mkdirSync(userUploadsDir, { recursive: true }); // Create directory if it doesn't exist
    cb(null, userUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const uniqueFilename = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + ext;
    cb(null, uniqueFilename);
  },
});

/*
const ImgUploadNew = multer({
  storage: storageConfigNew,
  limits: { files: 3 },
}).array("images", 3);


// Middleware to handle image upload and update imgURLs
const handleImageUpload = (req, res, next) => {
  ImgUploadNew(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Error uploading files' });
    } else if (err) {
      return res.status(500).json({ message: 'Error uploading files' });
    }

    req.imageUrls = req.files.map(file => `/uploads/Campaigns/${file.filename}`);

    next();
  });
};
*/


const ImgUploadNew = multer({
  storage: storageConfigNew,
  limits: { files: 3 },
}).array("images", 3);

// Middleware to handle image upload and update imgURLs
const handleImageUpload = (req, res, next) => {
  ImgUploadNew(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Error uploading files' });
    } else if (err) {
      return res.status(500).json({ message: 'Error uploading files' });
    }

    req.imageUrls = req.files.map(file => `/Uploads/${file.filename}`);

    next();
  });
};







//module.exports = ;
module.exports = { handleImageUpload , handleProfileImageUpload };
