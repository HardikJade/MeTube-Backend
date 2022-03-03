require('dotenv').config();
const jwt = require('jsonwebtoken');
const uploaderVerify = (request,response,next)=>{
    const token = request.header('auth-token');
    if(!token){response.status(400).json({'error' : "Invalid Token"})}
    else{
        try{
            const secureToken = process.env.TOKEN_SECRET
            const user_id = jwt.verify(token,secureToken);
            request.uploader_id = user_id.data.key; 
            //Check Here For the Uploader's ID
            
            next();
        }
        catch(e){response.status(400).json({'error' : "Invalid Token"})}
    }
}
module.exports = uploaderVerify;
