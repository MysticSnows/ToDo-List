const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const currDay = require(__dirname + "/date.js");
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


run().catch((err) => console.log(`Error: ${err}`));
async function run(){
    await mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB")
    .then(() => console.log("Connected to Database"));
}

// Schema
const itemsSchema = new mongoose.Schema({
    name: {type: String}
});
// Model
const Item = new mongoose.model("item",itemsSchema);
// Default Documents
const item1 = new Item({
    name: "Welcome to your ToDo List!"
});
const item2 = new Item({
    name: "Click on '+' Button to add a new item"
});
const item3 = new Item({
    name: "<-- Click this to delete an item"
});
const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});
const List = new mongoose.model("List", listSchema);


async function insertDefaults(){
    // Model.exists() checks if Model is empty(no document in db) or not. Returns boolean
    if(!await Item.exists()){
        Item.insertMany(defaultItems).
        then(() => console.log("Inserted Default items successfully."));
    }
}
insertDefaults();

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

app.listen(port, function () {
    console.log(`Server Running at Port ${port}`);
})