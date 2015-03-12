var queryResultsContainer = document.getElementById("queryResult");
var queryCommandTextarea = document.getElementById("queryCommand");

var queries = [];
var column_names = [];

// Display query results 
//	- results: JSON object responded by the server
function display_results(results,columnsdata) {
	queryResultsContainer.innerHTML = "";
	var txt = "";
	
	column_names = [];

	if (results.rows) {	//If the query is SELECT, data is returned
		var len = results.rows.length;
		var i, j, k, txt;

		if (columnsdata) {
			var table_name = columnsdata.table;
			txt = txt + "<b>Overview of table <i>" + table_name +"</i></b> ";
			txt = txt + "<br>Number of Records: " + len ;
			txt = txt + " (<img src='plus.png' title='insert into table ["+table_name+"]' style='cursor:pointer' onclick='insert_into_table(\""+table_name+"\")'>)";
			txt = txt + "<table class='tftable' style='width:100%;'><tr>";

			// Show the column names as header and save the names
			var column_name;
			for (i=0; i<columnsdata.columns.length; i++) {
				column_name = columnsdata.columns[i].column_name;
				column_names.push(column_name);
				txt = txt + "<th>" + column_name ;
				if (columnsdata.columns[i].type=="partition_key") {
					txt = txt + " (PK)";
				} else if (columnsdata.columns[i].type=="clustering_key") {
					txt = txt + " (CK)";
				}
				txt = txt + "</th>";
			}
			txt = txt + "</tr>";
		}
		
		if (len>0) {
			if (!columnsdata) {
				txt = txt + "<div style='margin-bottom:10px;'>Number of Records: " + len + "</div>";
				txt = txt + "<table class='tftable' style='width:100%;'><tr>";
				// Show the column names as header and save the names
				var column_name;
				for (i=0; i<results.meta.columns.length; i++) {
					column_name = results.meta.columns[i].name;
					column_names.push(column_name);
					txt = txt + "<th>" + column_name + "</th>";  
				}
				txt = txt + "</tr>";
			}
			for (j=0; j<len; j++) {
				m = results.rows[j];
				txt = txt + "<tr>";	   
				for (k = 0; k < column_names.length; k++) {
					txt = txt + "<td>" + m[column_names[k]] + "</td>";  
				}
				txt = txt + "</tr>";
			}
			txt = txt + "</table></div>";
		}
	} else {
		txt = txt + "<div style='margin-bottom:10px;'>Query sent to server successfully.</div>";
	}
	queryResultsContainer.innerHTML =  txt;
}

function display_results_err(error_msg) {
	queryResultsContainer.innerHTML = error_msg;
	document.getElementById("queryRunBtn").disabled = false;
}

function insert_into_table(table) {
	var cmd = 'INSERT INTO '+table+'(';
	
	for (var i=0; i<column_names.length; i++) {
		if (i==0) {
			cmd += column_names[i] ;
		} else {
			cmd = cmd + ',' + column_names[i] ;
		}
	}
	
	cmd += ')\nVALUES ( ... );';
	
	queryCommandTextarea.value = cmd;
}

function query_submit() {
	
	document.getElementById("queryRunBtn").disabled = true;
	
	var query = queryCommandTextarea.value;
	var query_arr = query.split(';');
	var q;
	
//	console.log(query_arr);

	for (var i=0; i<query_arr.length; i++) {
		q = query_arr[i].trim();
		
		if (q.length>0) {
			queries.unshift(q);
		}
	}

	console.log(queries);

	query_execute();
}

function query_execute() {

	if (queries.length<1) {
		document.getElementById("queryRunBtn").disabled = false;
		return;
	}
	
	$("body").css("cursor", "progress");
	
	var query = queries.pop();
	console.log(query);
	var body = {};
	body.keyspace = current_keyspace;
	body.query = query;
	
	$.ajax({
		type: "POST",
		url: url+"query",
		data: JSON.stringify(body),
		contentType: "application/json",
		dataType: "json",
		success:	function(data, status){
						console.log("query execute", status);
						console.log(data);
						
						display_results(data);
						
						query_execute();
					},
		error:		function(jqXHR,status){
						var error_msg = 'ERROR: ';
						error_msg+= jqXHR.responseJSON.message;
						error_msg+= '<br> in: <i>';
						error_msg+= jqXHR.responseJSON.query;
						error_msg+= ' ;</i>';
						display_results_err(error_msg);
					},
		complete:	function(){
						$("body").css("cursor", "default");
					}
	});
}
