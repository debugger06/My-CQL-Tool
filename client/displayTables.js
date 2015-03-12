var table_names=[];

function load_tablenames() {
	$("body").css("cursor", "progress");
	
	$.get(url+'tables?keyspace='+current_keyspace, function(data, status){
		console.log(data);

		var tables = data.tables;
		table_names = tables;
	
		display_tablenames();
		
		$("body").css("cursor", "default");
	});
}

function display_tablenames() {
	var txt = "", i;
	txt = txt + "<table width='100%'>";
	
	if (table_names.length==0){	// An empty keyspace.
		txt = "<i>(EMPTY)</i>";
	} else {
		for (i = 0; i < table_names.length; i++) {
			txt = txt + "<tr>";
			txt = txt + "<td><img src='table.png'></td>";
			txt = txt + "<td width='100%' title='overview of table [" + table_names[i] + "]' style='text-align:left;cursor:pointer;text-decoration:underline;' onclick='select_all(\"" + table_names[i] + "\")'>" + table_names[i] + "</td>";  
			txt = txt + "<td style='text-align:right;'>";
			txt = txt + "<img src='trash.png' title='drop table [" + table_names[i] + "]' style='cursor:pointer' onclick='confirm_drop_table(\"" + table_names[i] + "\")'>" + "</td>";  				
			txt = txt + "</tr>";
		}
		txt = txt + "</table>";
	}
	document.getElementById("tablesOverviewTitle").innerHTML = "Tables:";
	document.getElementById("tablesOverview").innerHTML =  txt;
	document.getElementById("tablesOverviewIcons").style.visibility = "visible";
}

function confirm_drop_table(table) {
	var keyspace_name = current_keyspace;
	var r = confirm("DROP TABLE ["+table+"] in KEYSPACE ["+keyspace_name+"]?");
	if (r == true) {
		drop_table(table,keyspace_name);
	}
}

function drop_table(table,keyspace) {
	$("body").css("cursor", "progress");

	var body = {};
	body.keyspace = keyspace;
	body.table = table;
	
	$.ajax({
		type: "POST",
		url: url+"drop/table",
		data: JSON.stringify(body),
		contentType: "application/json",
		success:	function(data, status){
						console.log("drop/table", status);
						load_tablenames();
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

function input_new_table() {
	var cmd = 'CREATE TABLE table_name (\n\tclmn1_name type PRIMARY KEY,\n\tclmn2_name type\n);'
	queryCommandTextarea.value = cmd;
}

// SELECT * from table
function select_all(tablename) {
	$("body").css("cursor", "progress");
	
//	var is_keyspace_specified = false; // Whether keyspace is specified in CQL command
	console.log("select_all "+tablename);
	
	var columns;
	var query = '* FROM '+current_keyspace+'.'+tablename;

	$.get(
		url+'columns?keyspace='+current_keyspace+'&table='+tablename,
		function(data,status) {
			if (data.columns) {
				$("body").css("cursor", "progress");
				columns = data;
				$.get(
					url+'select?query='+query, 
					function(data, status){
						if (data) {
							console.log(data);
							display_results(data,columns);
						} else {
							// error
						}
						$("body").css("cursor", "default");
					}
				);
			} else {
				$("body").css("cursor", "default");
			}
		}
	);	
	
	
}
