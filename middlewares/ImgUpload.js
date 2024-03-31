const multer = require("multer");
const fs = require("fs");


const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const ImgUpload = multer({ storage: storageConfig });





const mkdirSync = (dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
};

const storageConfigNew = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.userId;
    const userUploadsDir = `uploads/${userId}`;
    mkdirSync(userUploadsDir);
    cb(null, userUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const userUploadsDir = `uploads/${req.userId}`;
    const files = fs.readdirSync(userUploadsDir);
    const fileCount = files.filter((name) => name.endsWith(`.${ext}`)).length + 1;
    cb(null, `${fileCount}.${ext}`);
  },
});



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

    req.body.imageUrls = req.files.map(file => `/uploads/${req.userId}/${file.filename}`);

    next();
  });
};





//module.exports = ;
module.exports = { ImgUpload , handleImageUpload };
