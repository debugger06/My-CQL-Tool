var express = require('express');
var bodyParser = require('body-parser');
var cassandra = require('cassandra-driver');

var client = new cassandra.Client( { contactPoints : [ '127.0.0.1' ] } );
client.connect(function(err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log('Cassandra: Connected To the Database.');
	}
});

var app = express();
app.use(bodyParser.json());
app.set('json spaces', 2);

// Enables CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/metadata', function(req, res) {
    res.send(client.hosts.slice(0).map(function (node) {
        return { address : node.address, rack : node.rack, datacenter : node.datacenter }
    }));
});

// Get the list of keyspaces
app.get('/keyspaces', function(req, res) {
	var keyspace = req.query.keyspace;
	client.execute("SELECT * from system."+keyspace+";", function(err, result) {
        if (err) {
        	console.log(err);
            res.status(400).send(err);
        } else {
        	var names = [];
        	for (var i=0; i<result.rows.length; i++) {
	        	var c = result.rows[i];
        		names.push(c.keyspace_name);
        	}
        	var obj = {};
        	obj.keyspaces = names;
        	res.status('201').send(obj);
        }
    });
});

// Get the list of tables in a keyspace
app.get('/tables', function(req, res) {
	var keyspace = req.query.keyspace;
	console.log(keyspace);
	client.execute("select columnfamily_name from system.schema_columnfamilies where keyspace_name = '"+keyspace+"';", function(err, result) {
        if (err) {
        	console.log(err);
            res.status(400).send(err);
        } else {
        	console.log(result);
        	var names = [];
        	for (var i=0; i<result.rows.length; i++) {
	        	var c = result.rows[i];
	        	names.push(c.columnfamily_name);
        	}
        	var obj = {};
        	obj.tables = names;
			obj.keyspace = keyspace;
			res.status('201').send(obj);
		}
    });
});

// Get the list of columns of a table 
// GET /columns?keyspace=keyspace_name&table=table_name
app.get('/columns', function(req, res) {
	var keyspace = req.query.keyspace;
	var table = req.query.table;
	
	var cql = "select column_name,type from system.schema_columns";
	cql = cql + " WHERE keyspace_name='" + keyspace + "' AND columnfamily_name='" + table + "';";
	
	client.execute(cql, function(err, result) {
        if (err) {
        	console.log(err);
            res.status(404).send(err);
        } else {
        	console.log(result);
        	var names = [];
        	for (var i=0; i<result.rows.length; i++) {
	        	var c = result.rows[i];
	        	var name = {};
	        	name.column_name = c.column_name;
	        	name.type = c.type;
	        	names.push(name);
        	}
        	var obj = {};
        	obj.columns = names;
        	obj.keyspace = keyspace;
        	obj.table = table;
			res.send(obj);
		}
    });
});

app.post('/query', function(req, res) {
    var keyspace = req.body.keyspace;
    var cql_query = req.body.query;
    
    console.log(cql_query);
    
    var cql_use_keyspace = 'USE "'+keyspace+'";';
    
    client.execute(
    	cql_use_keyspace,
    	function(err, result) {
		    if (err) {
		    	console.log(err);
		        res.status(400).send(err);
		    } else {
		    	console.log(result);
		    	
				client.execute(
					cql_query,
					function(err, result) {
						if (err) {
							console.log(err);
							res.status(400).send(err);
						} else {
							console.log(result);
							res.status('201').send(result);
						}
					}
				);    	
		    	
		    }
    	}
    );    	
});

app.get('/select',function(req,res){
    var query_string = 'SELECT '+req.query.query;
    console.log(query_string);
    client.execute(query_string,function(err, result) {
        if (err) {
        	console.log(err);
            res.status(400).send(err);
        } else {
        	console.log(result);
            res.status(201).json(result);
        }
    });
});


// Create a new keyspace
app.post('/create/keyspace', function(req, res) {
    var keyspace_name = req.body.keyspace;
    var cql = "CREATE KEYSPACE IF NOT EXISTS \""+keyspace_name+"\" WITH replication = {'class' : 'SimpleStrategy', 'replication_factor' : 1};";
    console.log(cql);
    client.execute(
    	cql, 
    	function(err, result) {
		    if (err) {
		    	console.log(err);
		        res.status(400).send(err);
		    } else {
		    	console.log(result);
		        res.status('201').send();
		    }
    	}
    );
});

// Drop a  keyspace
app.post('/drop/keyspace', 
	function(req, res) {
		var keyspace_name = req.body.keyspace;
		var cql = "DROP KEYSPACE \""+keyspace_name+"\";";
		console.log(cql);
		client.execute(
			cql, 
			function(err, result) {
				if (err) {
					console.log(err);
				    res.status(400).send(err);
				} else {
					console.log(result);
				    res.status('204').send();
				}
			}
		);
	}
);


// Create a table
app.post('/create/table', function(req, res) {
    var keyspace = req.body.keyspace;
    var table_name = req.body.table;
    var table_columns = req.body.columns;
    
    console.log(table_columns);
    
    var cql_use_keyspace = 'USE "'+keyspace+'";';
    var cql_create_table = 'CREATE TABLE "'+table_name+'('+table_columns+');';
    
    client.execute(
    	cql_use_keyspace,
    	function(err, result) {
		    if (err) {
		    	console.log(err);
		        res.status(400).send(err);
		    } else {
		    	console.log(result);
		    	
				client.execute(
					cql_create_table,
					function(err, result) {
						if (err) {
							console.log(err);
							res.status(404).send(err);
						} else {
							console.log(result);
							res.status('201').send();
						}
					}
				);    	
		    	
		    }
    	}
    );    	
});

// Drop a  keyspace
app.post('/drop/table', 
	function(req, res) {
		var keyspace_name = req.body.keyspace;
		var table_name = req.body.table;
		var cql = 'DROP TABLE "'+keyspace_name+'"."'+table_name+'";';
		console.log(cql);
		client.execute(
			cql, 
			function(err, result) {
				if (err) {
					console.log(err);
				    res.status(400).send(err);
				} else {
					console.log(result);
				    res.status('204').send();
				}
			}
		);
	}
);

var server = app.listen(3000, function() {
    console.log('Express Server Listening on port %d', server.address().port);
});
