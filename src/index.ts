import express, { Request, Response } from "express";
import multer from 'multer'
import bodyParser from 'body-parser'
import imageSize from 'image-size'
import sharp from 'sharp'

var width
var height
var processedImagePath:string

import fs from 'fs';
import path from 'path';

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"));

var storage = multer.diskStorage({
    destination: function (req:Request,file,cb) {
            cb(null, "./dist/public/uploadedImages");   
    },
    filename: function(req:Request,file,cb){
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
        
    },
});

const imageFilter = function (req: Request,file: { originalname: string ; },cb: (arg0: Error | null, arg1: boolean | undefined) => void) {
    
        var error = new Error(); 
    if (!file.originalname.match(/\.(png|jpeg|jpg|gif|tiff)$/)) {
        cb(null,false)
        return cb(new Error("Images Only Allowed"),false)
    } else {
    cb(null,true)
      } 
    }

var upload = multer({
    storage: storage, fileFilter: imageFilter
    
    })
    
const PORT = process.env.PORT || 3000
app.get('/', (req:Request,res:Response) => {
    res.sendFile(__dirname + "/index.html")
})
app.post('/resizeImage', upload.single('images'), (req ,res) =>{
    width=parseInt(req.body.width)
    height=parseInt(req.body.height)
    if(req.file){
        console.log(req.file.path)

        if(isNaN(width) || isNaN(height)){
            const size = imageSize(req.file.path)
            console.log(size)
            width=parseInt(size.width.toString())
            height=parseInt(size.height.toString()) 
            resizeImage(width,height,req,res)
        }

    else{
        resizeImage(width,height,req,res)   
                    
}

    }
})
 
app.listen(3000, function(){
    console.log("Server has started on Port 3000")
})

function resizeImage(width: number | null | undefined, height: number | null | undefined, req: Request, res: Response){
    processedImagePath = Date.now() + "processedImage.jpeg" ;  
    if(req.file){
        sharp(req.file.path)
        .resize(width,height) 
        .toFile(processedImagePath, (err,_info) =>{
            if(err)throw err;
            res.download(processedImagePath,(err: any) =>{
                if(err)throw err; 
                fs.unlinkSync(req.file.path); 
                fs.unlinkSync(processedImagePath);                  
            });
    });
     
}
}
 

