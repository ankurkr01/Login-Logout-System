require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');


require('./db/conn');
const Register = require('./models/registers');
const { validateHeaderValue } = require('http');

app.use(express.json());
app.use(cookieParser());

const static_path = path.join(__dirname, '../public');
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.set('view engine', 'hbs');
app.set('views',template_path);
hbs.registerPartials(partials_path);
app.use(express.static(static_path));

const port = process.env.PORT || 3000;

app.get('/', (req, res)=>{
    res.render('login');
})

app.get('/index', auth ,(req, res)=>{
    
    res.render('index');
})

app.get('/login', (req, res)=>{
    res.render('login');
})

app.get('/logout', auth , async (req, res)=>{
    try {

        // for single logout
        // req.user.tokens = req.user.tokens.filter((currentElement)=>{
        //     return currentElement.token !== req.token
        // })


        // logout from all divices
        req.user.tokens = [];


        res.clearCookie('jwt');

        await req.user.save();
        res.render('login');

    } catch (error) {
        res.status(500).send(error);
    }
})

app.get('/register', (req, res)=>{
    res.render('register');
})

// create a new user in our database

app.post('/register',async (req, res)=>{
    try {

        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){

            const userRegister = new Register({

                name : req.body.name,
                email : req.body.email,
                password : password,
                confirmpassword : cpassword

            })

            // middleware

            const token = await userRegister.generateAuthToken();

            // here password hash 

            // the res.cookie() function is use to set the cookiename to validateHeaderValue.
            // the value parameter may be a string or object converted to JSON 

            res.cookie('jwt', token, {
                expires:new Date(Date.now() + 30000),
                httpOnly:true
            })
            

            const registerd = await userRegister.save();
            res.status(201).render('login');

        }else{
            res.send('password are not matching');
        }

    } catch (error) {
        res.status(400).send(error);
        console.log(error)
    }
})

// login validation

app.post('/login', async(req, res)=>{
    try {

        const email =req.body.email;
        const password =req.body.password;

       const useremail = await Register.findOne({email:email})

       const isMatch = await bcrypt.compare(password, useremail.password);

       const token = await useremail.generateAuthToken();
      
    res.cookie('jwt', token, {
     expires:new Date(Date.now() + 600000),
     httpOnly:true
    })
    
       
       if (isMatch) {
        res.status(201).render('index');
       }else{
        res.send('incorrect password');
       }

    } catch (error) {
        res.status(400).send(error);
    }
})


// const bcrypt = require('bcryptjs');
// const securepassword = async(password)=>{
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     const passwordMatch = await bcrypt.compare(password, passwordHash);
//     console.log(passwordMatch);

// }

// securepassword('ankur@123');




// const jwt = require('jsonwebtoken');

// const createToken = async()=>{
//     const token =  await jwt.sign({_id : 'a12eijhifhbdr848hr'}, 'mynameisankurandiamacryptotrader', {expiresIn:'2 seconds'});
//     console.log(token);

//     const userVer = await jwt.verify(token, 'mynameisankurandiamacryptotrader');
//     console.log(userVer);

// }

// createToken();




app.listen(port, ()=>{
    console.log(`Server is running at port no ${port}`)
})