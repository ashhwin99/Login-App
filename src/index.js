const express = require('express');
const pasth = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();
// convert data into json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));

// use EJS as the view engine
app.set('view engine', 'ejs');
// static file
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// funcationality for signup page
// Register user
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    // Check if user already exists in the database 
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser) {
        res.send("User already exists. Please choose a different username.");
    }else{    
        // hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; //Replace the hash password with original password

        // sending data into database
        const userdata = await collection.insertMany(data);
        console.log("userdata",userdata);
    }

});

//Login user 
app.post("/login", async (req, res) => {
    console.log("inside login function");
   try {
        const check = await collection.findOne({name: req.body.username});
        console.log("check",check);
        if(!check) {
            res.send("user name cannot be found");
        }

        // compare the hash password from the database with the plain text
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        console.log("isPasswordMatch",isPasswordMatch);
        if(isPasswordMatch) {
            res.render("home");
        }else {
            req.send("wrong password");
        }
    }catch{
        res.send("wrong details");
   } 
});


const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
