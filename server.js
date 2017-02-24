/*
Shabab Islam
100816199
Used base code provided for assignment as well as in the lectures
*/


var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var app = express();



/*json object with empty array*/
var testjson = {names:[]};
var s_obj = {};

app.set('views','./views');
app.set('view engine','pug');



app.get("/", function(req,res){
	res.render("index");
});

/*connect to db, store entries in testjson file and send it to client*/
app.get("/recipes", function(req,res){
	//var sendObj = {names:[]};
	MongoClient.connect("mongodb://localhost:27017/test",function(err,db){
		if(err){
			console.log("Error connecting to the DB");
			res.sendStatus(500);
			db.close();
		}else{
			//handle the insert operation!
			var collection = db.collection("recipeDB");
			var cursor = collection.find();
			
			cursor.each(function(err,document){
				if(document == null){
					res.json(testjson);
				} else {
					if(document.name){
						testjson.names.push(document.name);
					}

				}
			});
		}

	});

});



app.use(function(req,res,next){
	console.log(req.method+" request for "+req.url);
	next();
});


app.use('/recipe',bodyParser.urlencoded({extended:false}));

/*check db for req file and send it back*/
app.get("/recipe/:rname", function(req,res){
	MongoClient.connect("mongodb://localhost:27017/test", function(err,db){
		if(err){
			res.sendStatus(500);
			db.close();
		}else{
			var cursor = db.collection("recipeDB").find({name: req.params.rname});
			cursor.toArray(function(err,docs){
				res.send(docs[0]);
				db.close();
			});

		}
	});
});

/*check if duplicates exist, then insert recipe : duplicate part doesn't work, sadface */
app.post("/recipe", function(req, res){
	console.log(req.body);
	MongoClient.connect("mongodb://localhost:27017/test",function(err,db){
		if(err){
			console.log("Error connecting to the DB");
			res.sendStatus(500);
			db.close();
		}else{
			var cursor = db.collection("recipeDB").find({name: req.body.name});
			cursor.toArray(function(err,docs){
				if(docs[0]!==req.body){
					console.log("NO DUPLICATE");
					var collection = db.collection("recipeDB");
					collection.insertOne(req.body, function(err,result){
						if(err){
							console.log("insert failed: ",err);
							res.sendStatus(500);
						}else{
							res.send(result);
						}
					});

				} else {
					console.log("DUPLICATE");	
					res.sendStatus(500);
				}
				db.close();
			});
			
		}	
	});
});

app.use(express.static("./public"));

app.listen(2406,function(){console.log("Server is listening for PUG requests on 2406");});