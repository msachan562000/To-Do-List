const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
let workitems = [];
app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({
  extended: true,
  useUnifiedTopology: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-yash:Tanishq562000@cluster0.7ouhp.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsschema = {
  name: String
};

const Item = mongoose.model("Item", itemsschema);
const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultitems = [item1, item2, item3];
const listschema = {
  name: String,
  items: [itemsschema]
};


const List = mongoose.model("list", listschema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultitems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved");
        }
      });
      res.redirect("/");
    } else {

      res.render("list", {
        listtitle: "Today",
        newlistitems: foundItems
      });
    }
  })
});
app.get("/about", function(req, res) {
  res.render("about");
});
app.post("/", function(req, res) {
  const itemname = req.body.newitem;
  const listname = req.body.list;

  const item = new Item({
    name: itemname
  });

  if (listname === "Today") {

    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listname
    }, function(err, founndlist) {
      founndlist.items.push(item);
      founndlist.save();
      res.redirect("/" + listname);
    });
  }



});
app.post("/delete", function(req, res) {
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkeditemid, function(err) {
      if (!err) {
        console.log("deleted checked item");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkeditemid
        }
      }
    }, function(err, founndlist) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});


app.get("/:customListName", function(req, res) {
  const customlistname = _.capitalize(req.params.customListName);
  List.findOne({
    name: customlistname
  }, function(err, found) {
    if (!err) {
      if (!found) {
        //create a new list
        const list = new List({
          name: customlistname,
          items: defaultitems
        });
        list.save();
        res.redirect("/" + customlistname);
      } else {
        //show existing list
        res.render("list", {
          listtitle: found.name,
          newlistitems: found.items
        });
      }
    }
  });

});

app.post("/work", function(req, res) {
  let item = req.body.newitem;
  workitems.push(item);
  res.redirect("/work");
});
let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("server is on port 3000");
});
