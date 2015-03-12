var current_keyspace = "";
var keyspace_select = document.getElementById("keyspace_select");
var keyspace_selectedIndex = 0;
var keyspaces;

var url = 'http://localhost:3000/';

load_keyspacenames();

function load_keyspacenames() {
	$("body").css("cursor", "progress");
	current_keyspace = "";
	keyspace_selectedIndex = 0;
	
	reset_tableoverview();
	reset_resultsview();
	
	var system_keyspace = "schema_keyspaces";
	$.get(url+'keyspaces?keyspace='+system_keyspace, function(data, status){
		console.log(data);

		keyspaces = data.keyspaces;
		
		for (i=keyspace_select.length-1; i>=0; i--) {
			keyspace_select.remove(i);
		}

		var obj, option;
		for (i=0; i<keyspaces.length; i++) {
			name = keyspaces[i];

			option = document.createElement("option");
			option.text = name;
			option.value = name;
			keyspace_select.add(option);
		}
		option = document.createElement("option");
		option.text = "choose a keyspace...";
		option.value = "0";
		keyspace_select.add(option,0);
		
//		option = document.createElement("option");
//		option.text = "CREATE NEW ...";
//		option.value = "1";
//		keyspace_select.add(option);
		$("body").css("cursor", "default");
	});
}

function reset_tableoverview() {
	//reset table overview
	document.getElementById("tablesOverviewTitle").innerHTML = "Select a keyspace from above";
	document.getElementById("tablesOverview").innerHTML =  "";
	document.getElementById("tablesOverviewIcons").style.visibility = "hidden";
}

function reset_resultsview() {
	queryResultsContainer.innerHTML = "";
}

function keyspace_submit(input,index) {
	console.log("keyspace_submit() "+input);
	
	var drop_keyspace_img = document.getElementById("drop_keyspace");
	keyspace_selectedIndex = index;
	if (input==0) {
		reset_tableoverview();
		reset_resultsview();
		drop_keyspace_img.onclick = null;
		drop_keyspace_img.style.cursor = '';
	} else {
		use_keyspace(input);
		drop_keyspace_img.onclick = confirm_drop_keyspace;
		drop_keyspace_img.style.cursor = 'pointer';
	}
}

function use_keyspace(name) {
	console.log("USE KEYSPACE "+name);
	current_keyspace = name;
	load_tablenames(current_keyspace);
	reset_resultsview();
}

function confirm_drop_keyspace() {
	var keyspace_name = current_keyspace;
	var r = confirm("DROP KEYSPACE ["+keyspace_name+"]?");
	if (r == true) {
		drop_keyspace(keyspace_name);
	}
}

function input_new_keyspace() {
	var is_continue = true;
	var prompt_msg = "CREATE KEYSPACE";
	
	while (is_continue) {
	
		var input = prompt(prompt_msg,"keyspace name");
	
		if (input==null) {
//			keyspace_select.selectedIndex = keyspace_selectedIndex;
			is_continue = false;
		} else {

			// Check in keyspace_select if the name exists.
			var is_exist = false;
			
			console.log(keyspaces);
			
			for (var i=0; i<keyspaces.length; i++) {
				console.log(keyspaces[i]);
				if ( input.localeCompare(keyspaces[i]) ==0  ) {
					is_exist = true;
					prompt_msg = 'Keyspace "'+input+'" exists. Use another name\nCREATE KEYSPACE';
					console.log("Existing keyspace!");
					break;
				}
			}
			if (!is_exist) {
				console.log("creating keyspace "+input);
				create_keyspace(input);
				is_continue = false;
			}
		}
	}
}

function drop_keyspace(keyspace_name) {
	$("body").css("cursor", "progress");

	var body = {};
	body.keyspace = keyspace_name;
	
	
	$.ajax({
		type: "POST",
		url: url+"drop/keyspace",
		data: JSON.stringify(body),
		contentType: "application/json",
		success:	function(data, status){
						console.log("drop/keyspace", status);
						load_keyspacenames();
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

function create_keyspace(keyspace_name) {
	$("body").css("cursor", "progress");
	
	var body = {};
	body.keyspace = keyspace_name;
	
	$.ajax({
		type: "POST",
		url: url+"create/keyspace",
		data: JSON.stringify(body),
		contentType: "application/json",
		success:	function(data, status){
						console.log("create/keyspace", status);
						load_keyspacenames();
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
