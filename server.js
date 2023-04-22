require('dotenv').config();
const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// User Modules
const currDay = require(__dirname + "/user_modules/date.js");
const List = require(__dirname + "/user_modules/List.js");
const Item = require(__dirname + "/user_modules/Item.js");

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const PORT = process.env.PORT || 3000;
const app = express();

// mongoose.set('strictQuery', false);
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(err){
        console.log(err);
        process.exit(1);
    }
}
// Connect to DB
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on Port ${PORT}`);
    })
});

// Set Defaults
Item.setDefaultItems();

app.get("/", async function (req, res) {
    let day = currDay.currDay();
    const items = await Item.find({});
    
    res.render("list", { 
        listTitle: day, 
        newListItems: items.map((item) => {return item})
    });
});

// Express Route Parameters:    /:param.   
// Access using req.params.param
app.get("/:listName", async function(req, res){
    const listName = _.capitalize(req.params.listName);
    if(listName === "About"){
        res.render('about');
    }
    if((await List.find({name: listName})).length === 0){
        // Create a list which does not exist
        const list = new List({
            name: listName,
            items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
    } else {    // Display the existing list
        const items = await List.findOne({name: listName}).select('items -_id');
        res.render("list", {
            listTitle: listName,
            newListItems: (items.items)
        });
    }
});

app.get("/about/page", function(req, res){
    res.render("about");
})

app.post("/", async function(req, res){
    let itemName = req.body.newItem;
    let listName = req.body.submit;
    const item = new Item({
        name: itemName
    });
    if(days.some((day) => listName.includes(day))){
        // Save to document "items"
        item.save();
        res.redirect("/");
    } else {
        await List.updateOne({name: listName}, {$push: {items: item}})
        .then(()=>console.log(`Updated Model->List:${listName} Successfully`));
        res.redirect("/" + listName);
    }
});

app.post("/delete", async function(req, res){
    checkedItemId = req.body.checkbox;
    listName = req.body.listTitle;

    if(checkedItemId != undefined){
        if(days.some((day) => listName.includes(day))){
            // Delete from default Document
            await Item.findByIdAndRemove(checkedItemId)
            .then(()=>console.log(`Deleted ${checkedItemId} Successfully from default Document`))
            .catch((err) => console.log("Deletion Error: " + err));
            res.redirect("/");
        } else {
            // Delete from custom 'List' Document
            await List.updateOne({name: listName}, {$pull: {items: {_id: checkedItemId}}}, {safe: true})
            .then(() => console.log(`Deleted ${checkedItemId} Successfully from List:${listName}`));
            res.redirect("/" + listName);
        }
    }
});
