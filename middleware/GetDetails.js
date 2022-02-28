var jwt = require('jsonwebtoken');
require('dotenv').config();
const getDetails = (request,response,next)=>{
    const token = request.header('auth-token');
    if(!token){response.status(400).json({'error' : "Invalid Token"})}
    else{
        try{
            const secureToken = process.env.TOKEN_SECRET
            const user_id = jwt.verify(token,secureToken);
            request.user_id = user_id.data.key; 
            next();
        }
        catch(e){response.status(400).json({'error' : "Invalid Token"})}
    }
}
module.exports =  getDetails;