const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.connect('mongodb://localhost:27017/Registations')
.then(()=>{
    console.log(`connection succesfull`)
}).catch((e)=>{
    console.log(e);
})