"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const body_parser_1 = __importDefault(require("body-parser"));
const image_size_1 = __importDefault(require("image-size"));
const sharp_1 = __importDefault(require("sharp"));
var width;
var height;
var processedImagePath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./dist/public/uploadedImages");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path_1.default.extname(file.originalname));
    },
});
const imageFilter = function (req, file, cb) {
    var error = new Error();
    if (!file.originalname.match(/\.(png|jpeg|jpg|gif|tiff)$/)) {
        cb(null, false);
        return cb(new Error("Images Only Allowed"), false);
    }
    else {
        cb(null, true);
    }
};
var upload = (0, multer_1.default)({
    storage: storage, fileFilter: imageFilter
});
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.post('/resizeImage', upload.single('images'), (req, res) => {
    width = parseInt(req.body.width);
    height = parseInt(req.body.height);
    if (req.file) {
        console.log(req.file.path);
        if (isNaN(width) || isNaN(height)) {
            const size = (0, image_size_1.default)(req.file.path);
            console.log(size);
            width = parseInt(size.width.toString());
            height = parseInt(size.height.toString());
            resizeImage(width, height, req, res);
        }
        else {
            resizeImage(width, height, req, res);
        }
    }
});
app.listen(3000, function () {
    console.log("Server has started on Port 3000");
});
function resizeImage(width, height, req, res) {
    processedImagePath = Date.now() + "processedImage.jpeg";
    if (req.file) {
        (0, sharp_1.default)(req.file.path)
            .resize(width, height)
            .toFile(processedImagePath, (err, _info) => {
            if (err)
                throw err;
            res.download(processedImagePath, (err) => {
                if (err)
                    throw err;
                fs_1.default.unlinkSync(req.file.path);
                fs_1.default.unlinkSync(processedImagePath);
            });
        });
    }
}
//# sourceMappingURL=index.js.map