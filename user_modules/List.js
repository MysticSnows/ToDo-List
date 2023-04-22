const mongoose = require('mongoose');
const Item = require(__dirname + "/Item.js");

const listSchema = new mongoose.Schema({
    name: String,
    items: [Item.itemsSchema]
});

module.exports = mongoose.model("List", listSchema);
