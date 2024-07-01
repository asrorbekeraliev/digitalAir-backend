const multer = require('multer')
const path = require('path')

// Set storage
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))        
    }
})

// Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 320000000 }, // 40 megabytes in bits
    fileFilter: function(req, file, cb){
        checkFileType(file, cb)
    }
})

// Check file types
function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if(mimetype && extname){
        return cb(null, true)
    }else{
        cb('Error: You can upload only image files')
    }
}

module.exports = upload