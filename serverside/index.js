const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors")
const User=require('./models/user.model');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const authMiddleware = require('./authmiddleware');
const app=express();
app.use(cors());
app.use(express.json());

//connecting mongodb server
mongoose.connect('mongodb://localhost:27017/password-manager').then(()=>{console.log("success")}).catch((err)=>{console.log(err)});

//register route
app.post("/api/register",async function(req,res){
    // console.log(req.body);
    try{
            const encryptedpw=await bcrypt.hash(req.body.password,10);
            // const encryptedpw=await encrypt.encrypt(req.body.password);
            const user=await User.create({     //creating a new user
            name:req.body.name,
            email:req.body.email,
            password:encryptedpw,
         })
        res.json({status:'ok'});
    }
    catch(err)
    {
        console.log(err);
        res.json({status:'error',error: 'Duplicate Email'})
    }

})


//login route
app.post("/api/login",async function(req,res){
    // console.log(req.body);
    try{
           const user=await User.findOne({
            email:req.body.email, 
        })
            const isValid=await bcrypt.compare(req.body.password,user.password);
            // console.log(user);
            if(isValid){
                const token=jwt.sign({name:req.body.name,email:req.body.email},"secretkey")
                res.json({status: 'ok', user : token});

            }
            else
            {
                // console.log("running");
                return res.json({status : 'error', user: false});
            }
    }
    catch(err)
    {
        console.log(err);
        res.json({status:'error',error: 'Duplicate Email'})
    }
})


app.get("/api/home",authMiddleware,async function(req,res){
try{
    const token=req.headers["x-access-token"];
   const decoded=jwt.verify(token,'secretkey');
   const email=decoded.email;
    console.log(email);
    const user= await User.findOne({email:email});
    console.log(user.name);
     res.json({status : "ok",name : user.name});
 }
 catch(err)
 {
    console.log(err);
    res.json({status:"error",error:"invalid-token"})
 }
   
});




app.listen(2000,function(){
    console.log("server is running at port 3000");
});