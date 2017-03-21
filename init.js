
var db ;
var tableData = [];

function updateTable() {

	db.query('combinedView/combined-view-index', {
	 reduce: true,
	 descending: true ,
	 group: true ,
	 limit: 15
	}).then(function (res) {
		 $.each( res.rows, function(key, row  ) {
		   tableData.push({
			  "id": row.key,
			    "weight": row.value.weight.toFixed(2),
			    "hr": row.value.hr.toFixed(2),
			    "bp": row.value.sys> 0 ? row.value.sys.toFixed(0) + "/" + row.value.dia.toFixed(0) : "",
			    "steps": row.value.steps
			});

		});
	$('#table').bootstrapTable({
	    columns: [{
		field: 'id',
		title: 'Year Week'
	    }, {
		field: 'weight',
		title: 'Weight'
	    }, {
		field: 'bp',
		title: 'Blood Pressure'
	    }, {
		field: 'hr',
		title: 'Heart Rate'
	    }, {
		field: 'steps',
		title: 'Steps'
	    }],
	    data: tableData
	});
	}).catch(function (err) {	
  		console.log(err);
  	});

}

function signOut() {
	var logout = db.logout(function (err, response) {
	if (err) {
		console.log(err);
	}	else {	
		console.log(response.ok);
		Cookie.remove('remoteDb');
 		$('#table').html('');
	}
	});
	return false;
}

function string2Hex(tmp) {
    var str = '';
    for(var i = 0; i < tmp.length; i++) {
        str += tmp[i].charCodeAt(0).toString(16);
    }
    return str;
}

$('#loginSubmit').click( function () {

	var hexVal =  string2Hex(loginForm.user.value);
	var user = {
	  name: loginForm.user.value,
	  password: loginForm.password.value 
	};

	var remoteDbUrl = 'https://data.schappet.com/userdb-' + hexVal;
	console.log(remoteDbUrl);
	db = new PouchDB(remoteDbUrl, {skipSetup: true}); //, {
	db.login(user.name, user.password).then(function (userInfo) {
  		console.log(userInfo);
		Cookie.set('remoteDb',remoteDbUrl);
	});

  	updateTable();

	$('#loginForm').html("<a href='#' id='signOut' class='btn btn-success' onClick='signOut()'>Sign out</a>");
	return false;
});


function isLoggedIn() {
	var remoteDbUrl = Cookie.get('remoteDb');
     	console.log(remoteDbUrl);	
 	db = new PouchDB(remoteDbUrl, {skipSetup: true});
	var loggedIn = false;
	
	db.getSession(function (err, response) {
  	if (err) {
  		console.log("error");		
  		console.log(err);		
	} else if (!response.userCtx.name) {
		console.log("Not logged in");
  	} else {
    	// response.userCtx.name is the current user
	console.log("current user: " +  response.userCtx.name );
	 loggedIn = true;
        $('#loginForm').html("<a href='#'  id='signOut' class='btn btn-success'  onClick='signOut()'>Sign out</a>"); 
	updateTable();
  	}
	});
	console.log("Logged in: " + loggedIn);
}


isLoggedIn()

