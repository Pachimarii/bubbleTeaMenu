var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var fs = require('fs');
var _ = require("underscore");

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

function restoreOriginalData() {
  fs.writeFileSync('drinks.json', fs.readFileSync('drinks_original.json'));
}

function saveData(data) {
	var obj = {
		drinks: data
	};
	fs.writeFileSync('drinks.json', JSON.stringify(obj));
}

function loadData() {
  return JSON.parse(fs.readFileSync('drinks.json'));
}

restoreOriginalData();

var _DATA = loadData().drinks;
/* Add whatever endpoints you need! Remember that your API endpoints must
 * have '/api' prepended to them. Please remember that you need at least 5
 * endpoints for the API, and 5 others.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// home page and api/getFullMenu provides menu of milktea
app.get('/',function(req,res){
  res.render('home',{data: _DATA});
});


// =============== api ===================

// get full menu
app.get('/api/getFullMenu',function(req,res){
 res.send(_DATA);
});

// filter the bubble tea that can add Tapioca Pearls as topping.
app.get("/api/pearls_only",function(req,res){
  let arr = _DATA.filter( e=> e["toppings"].includes("tapioca pearls"));
  res.send({data: arr})
});

// add toppings to bubble tea
app.post("/api/toppings/:drink_id/add/:topping_name", function(req, res) {

  var _topping = req.params.topping_name;
  var _id = parseInt(req.params.drink_id);

  var result = _.findWhere(_DATA, { id: _id })
  if(!result){return res.send({})};
  
  if(!result["toppings"].includes(_topping)){
      let val = parseInt(result["id"]-1);
      _DATA[val]["toppings"].push(_topping);
  }
  saveData(_DATA);
  var name = _DATA[parseInt(result["id"])-1]["name"];
  var toppingsarr = _DATA[parseInt(result["id"]-1)]["toppings"];
  var j = {"name":name,"weaknesses":toppingsarr};
  res.send(j);
});

// add Bubble tea
app.post("/api/addBubbleTea", function(req, res) {
//  /api/addBubbleTea?name=myBubbleTea&ingredients=milk+boba
  let _ingredients = req.body.ingredients;
  let _name = req.body.name;
  let _toppings = req.body.toppings;
  let _notes = req.body.notes;
  let _id = Object.keys(_DATA).length+1
  
  if(!(_ingredients && _name && _toppings && _notes)){
    let err = new Error("some required field is no filled :0 please try again.");
    res.send({"Error":err.message});
    throw err;
    
  }
  var result = _.findWhere(_DATA, { name: _name })
  if(result){
    let err = new Error("Duplicate name :( try another one");
    res.send({"Error":err.message});
    throw "Duplicate name :( try another one";
  }else{
    obj = {
      "id":_id,
      "name": _name,
      "ingredients": _ingredients,
      "toppings": _toppings,
      "notes": _notes,
      "rating": 0
    };
    _DATA.push(obj);
    saveData(_DATA);
    res.send(obj);
  }
  

});

//sort by alphabetical order
app.get("/api/alphabetical",function(req,res){
  let sorted_data = _DATA.sort(function(a,b){
    let x = a["name"].toLowerCase();
    let y = b["name"].toLowerCase();
    if(x<=y){return -1}else{
      return 1;
    }
  });
  res.send({data: sorted_data});
});



// ============= nav links ===============

// sort drinks name in alphabetical order.
app.get('/alphabetical', function(req,res){
  let sorted_data = _DATA.sort(function(a,b){
    let x = a["name"].toLowerCase();
    let y = b["name"].toLowerCase();
    if(x<=y){return -1}else{
      return 1;
    }
  });
  res.render('alphabetical',{data: sorted_data});
});

// sort by number of toppings.
app.get('/rating',function(req,res){
  let sorted_data = _DATA.sort(function(a,b){
    let x = a["rating"];
    let y = b["rating"];
    if(x<=y){return 1}else{
      return -1;
    }
  });
  let full = "fas fa-star", half = "fas fa-star-half-alt",empty = "far fa-star";
  for (i of sorted_data){
   
    let arr = [];
    let num = i["rating"];
    for( let j=1; j<=5; j++){
      if(num>=1){
        arr.push(full);
      }else if (num > 0){
        arr.push(half);
      }else{
        arr.push(empty);
      }
      num--;
    }
    i.stars=arr;
  }
  res.render('rating',{data: sorted_data});
});

// filter the bubble tea that can add Tapioca Pearls as topping.
app.get('/pearls_only',function(req,res){
  let arr = _DATA.filter( e=> e["toppings"].includes("tapioca pearls"));
  res.render('pearlsonly', {data: arr})
});

// filter all non tea drinks. including matcha and genmaicha
app.get('/nontea',function(req,res){
  let arr = _DATA.filter( e=> {
    for (i of e["ingredients"]) {
      let str = i.toLowerCase();
      if((str.indexOf("genmaicha") !== -1) || (str.indexOf("matcha") !== -1) || (str.indexOf("tea") !== -1)){
        return false;
      }
    }
    return true;
  });
  res.render('nontea', {data: arr});
});

// generate 3 random drink from the menu.
app.get('/random3',function(req,res){
  let len = Object.keys(_DATA).length;
  let arr = [];
  for (let i = 1; i<=3; i++){
    let n = (Math.ceil(Math.random() * (len-1)));
    while(arr.includes(n)){
      n = (Math.ceil(Math.random() * len-1));
    }
    arr.push(n);
  }
  let result = _DATA.filter( e => {
    for (num of arr){
      if( num === e["id"] ){
        return true;
      }
    }
    return false;
  });
  res.render('random3', {data: result})
});

//the form that customize a new bubble tea
app.get('/newdrink', function(req, res){
  res.render('newdrink');
});

//add the new bubble tea to menu
app.post('/newdrink',function(req,res){
  let _id = Object.keys(_DATA).length+1;
  let _name = req.body.name;
  let _ingredients = req.body.ing_str.split(",").filter(e => e.length !== 0 );
  let _toppings = req.body.topping_str.split(",").filter(e => e.length !== 0 );
  let _notes = req.body.notes;
  var result = _.findWhere(_DATA, { name: _name })
  if(result){
    res.render('success',{})
  }else{
    obj = {
      "id":_id,
      "name": _name,
      "ingredients": _ingredients,
      "toppings": _toppings,
      "notes": _notes,
      "rating":0
    };
    _DATA.push(obj);
    saveData(_DATA);
    res.render('success',{ outcome: true});
  }
  

});

// get specific bubble tea
app.get('/drink/:drink_id',function(req,res){
  var _id = parseInt(req.params.drink_id);
  var result = _.findWhere(_DATA, { id: _id })
 
  if(!result){
    return res.render('singledrink',{})
  }else{
    let full = "fas fa-star", half = "fas fa-star-half-alt",empty = "far fa-star";
    let arr = [];
    let num = result["rating"];
    for( let j=1; j<=5; j++){
      if(num>=1){
        arr.push(full);
      }else if (num > 0){
        arr.push(half);
      }else{
        arr.push(empty);
      }
      num--;
    }
    result.stars=arr;
    return res.render('singledrink',{
      drink: result
    })
  };
});

app.listen(3000, function() {
    console.log('Listening on port 3000!');
});
