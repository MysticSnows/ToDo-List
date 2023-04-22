// import { Schema, model } from 'mongoose';
const mongoose = require('mongoose');
// Schema
const itemsSchema = new mongoose.Schema({
    name: {type: String}
});
// Model
const Item = new mongoose.model("item", itemsSchema);

const setDefaultItems = function(){
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

    async function insertDefaults(){
        // Model.exists() checks if Model is empty(no document in db) or not. Returns boolean
        if(!await Item.exists()){
            Item.insertMany(defaultItems).
            then(() => console.log("Inserted Default items successfully."));
        }
    }
    insertDefaults();
}

module.exports = mongoose.model("Item", itemsSchema);
module.exports.setDefaultItems = setDefaultItems;
module.exports.itemsSchema = itemsSchema;