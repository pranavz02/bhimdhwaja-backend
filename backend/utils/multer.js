import multer from 'multer';

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit (adjust as needed)
// });


export default upload;