

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _= require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//const uri = 'mongodb://127.0.0.1:27017';
const uri = 'mongodb+srv://admin-Dheerap:JEC2025@cluster0.0y6f2hz.mongodb.net';

const databaseName = "todolistDB";

async function connect() {
  try {
    // Connect to the MongoDB server
    await mongoose.connect(uri + '/' + databaseName, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB server is started");

    // Create an item schema
    const itemsSchema = {
      name: String
    };

    // Create an item model
    const Item = mongoose.model('Item', itemsSchema);

    // Create default items
    const item1 = new Item({
      name: "Welcome to your Tododlist!"
    });

    const item2 = new Item({
      name: "Hit the + button to add a new item."
    });

    const item3 = new Item({
      name: "<-- Hit this button to delete an item."
    });
    console.log("Successfully saved items into the DB");


    const defaultItems = [item1, item2, item3];

    // Create a list schema
    const listsSchema = {
      name: String,
      items: [itemsSchema]
    };

    // Create a list model
    const List = mongoose.model('List', listsSchema);


    app.get("/", async function (req, res) {
      try {
        // Insert default items into the database if they don't already exist
        for (const defaultItem of defaultItems) {
          const existingItem = await Item.findOne({ name: defaultItem.name }).exec();
          if (!existingItem) {
            const newItem = new Item(defaultItem);
            await newItem.save();
            console.log(`Item document with name '${defaultItem.name}' saved successfully.`);
          }
        }

        //arr name who contained item name
        const items = await Item.find().exec();
        res.render("list", { listTitle: "Today", newListItems: items });
      } catch (err) {
        console.error('Error fetching items from the database:', err);
        res.render("list", { listTitle: "Today", newListItems: [] });
      }
    });

app.post("/", async function (req, res) {
  try {
    const itemName = req.body.newItem; // Assuming the new item name is provided in the request body
    const listName = req.body.list; // Assuming the name of the list is provided in the request body

    const newItem = new Item({
      name: itemName
    });

    if (listName === "Today") {
      await newItem.save();
      res.redirect("/");
    } else {
      // Find the list based on the provided listName
      const foundList = await List.findOne({ name: listName }).exec();

        foundList.items.push(newItem);
        await foundList.save();
        res.redirect("/" + listName);
    
    }
  } catch (err) {
    console.error('Error adding item:', err);
    res.redirect("/");
  }
});


  
// ... previous code ...

app.post("/delete", async function (req, res) {
  try {
    const itemId = req.body.checkbox;
    const listName = req.body.listName;

   if (listName === "Today") {
      const deletedItem = await Item.findOneAndDelete({ _id: itemId }).exec();

      if (deletedItem) {
        console.log(`Item with ID ${itemId} deleted successfully.`);
      } else {
        console.log(`Item with ID ${itemId} not found.`);
      }

      res.redirect("/");
    }
   else {
      const foundList = await List.findOne({ name: listName }).exec();

      if (foundList) {
        const updateResult = await List.findOneAndUpdate(
          { name: listName },
          { $pull: { items: { _id: itemId } } },
          { new: true }
        ).exec();

        if (updateResult) {
          console.log(`Item with ID ${itemId} deleted successfully from list '${listName}'.`);
        } else {
          console.log(`Item with ID ${itemId} not found in list '${listName}'.`);
        }
        res.redirect("/" + listName);
      } else {
        console.log(`List '${listName}' not found.`);
        res.redirect("/");
      }
   }
  } catch (err) {
    console.error('Error deleting item:', err);
    res.redirect("/");
  }
});

// ... remaining code ...


    app.get("/:customListName", async function (req, res) {
      try {
        const customListName = _.capitalize(req.params.customListName); // to find dynamic list name
        // Check if a list with the same name already exists
        const existingList = await List.findOne({ name: customListName }).exec();

        if(!existingList) {
          // Create a new list if it doesn't exist
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          await list.save();
          res.redirect("/" + customListName);
        } else {
          // If list with the same name exists, render the list
          res.render("list", { listTitle: existingList.name, newListItems: existingList.items });
        }
      } catch (err) {
        console.error("Error processing custom list name:", err);
        res.redirect("/");
      }
    });
    const port = 3000;  
    app.listen(port, function () {
      console.log(`Server started on port ${port}`);
    });

  } catch (err) {
    console.error('Error connecting to the MongoDB server:', err);
  }
}
// Call the connect function
connect();



 //mongodb atlas password //dheearp2701
 //atlas connection password JEC2025
//run this for check dbs and collections mongosh "mongodb+srv://cluster0.0y6f2hz.mongodb.net/" --apiVersion 1 --username admin-Dheerap




































