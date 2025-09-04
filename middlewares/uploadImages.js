// const multer = require("multer");

// const uploadImages = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// module.exports = uploadImages;

// middlewares/uploadImages.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// export the actual middleware function
module.exports = upload.array("attachments", 5);
