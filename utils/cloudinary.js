
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({

cloudinary_Config_Cloud_Name : "dztrxetoh",
cloudinary_Config_api_key : "437127126219587",
cloudinary_Config_api_secret : "wrcR4muS_eBo9iB-L8r_DzvEHtM"  ,

});
console.log(cloudinary.config()); 
module.exports = cloudinary;