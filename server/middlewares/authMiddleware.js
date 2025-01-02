const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
      try{
          const authHeader = req.header('authorization');
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return res.send({
              success: false,
              message: "Authorization header missing or malformed",
              });
          }
          const token = authHeader.split(" ")[1];

         const decryptedToken = jwt.verify(token,process.env.JWT_SECRET);
         req.body.userId = decryptedToken.userId;
         next();
      }catch(error){
        res.send({
            success:false,
            message:error.message,
        })
      }
}