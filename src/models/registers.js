const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name :{
        type: String,
        required: true
    },

    email :{
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },

    password : {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
         validate(value){
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },

    confirmpassword: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
         validate(value){
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})

// generating token 
userSchema.methods.generateAuthToken = async function(req,res){
    try {
        
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        
        return token;

    } catch (error) {
        res.render('error');
    }
}


// converting password into hash 
userSchema.pre('save', async function(next){

    if(this.isModified('password')){

        this.password = await bcrypt.hash(this.password, 10);

        this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);
    }

    next();
})


// now we need to crate Collection

const Register = new mongoose.model('Register', userSchema);

module.exports = Register;