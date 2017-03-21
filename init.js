
var dataCurrentWeight = [];
var db ;
var tableData = [];


var size = 250;

var smallSize = (size * .50);


function updateTable() {

	db.query('combinedView/combined-view-index', {
	 reduce: true,
	 descending: true ,
	 group: true ,
	 limit: 15
	}).then(function (res) {
		 $.each( res.rows, function(key, row  ) {
		   dataCurrentWeight.push({"date":row.key,"value":row.value.weight.toFixed(2)});
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
	dataCurrentWeight = dataCurrentWeight.reverse();
	weightGraph();	
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
		Cookies.remove('remoteDb');
 		$('#table').html('');
		location.reload();
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
		Cookies.set('remoteDb',remoteDbUrl);
	});

  	updateTable();
	updateLatestWeight(); 

	$('#loginForm').html("<a href='/' id='signOut' class='btn btn-success' onClick='signOut()'>Sign out</a>");
	return false;
});


function initDb() {
	var remoteDbUrl = Cookies.get('remoteDb');
     	console.log(remoteDbUrl);	
	if (remoteDbUrl) {

		db = new PouchDB(remoteDbUrl, {skipSetup: true});
	
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
			$('#loginForm').html("<a href='/'  id='signOut' class='btn btn-success'  onClick='signOut()'>Sign out</a>"); 
			updateTable();
			updateLatestWeight();
			weightGraph();
		}
		});
	}
}


initDb()


function weightGraph() {
if (dataCurrentWeight.lenght == 0 ) { return }

c3.generate({
	 size: {
	        height: smallSize
	    },
   bindto: '#last5',
   data: {
       x: 'monthYear',
       json: dataCurrentWeight,
       axes: {
   		weight: 'y',
        
       },
       keys: {
         x: 'date', // it's possible to specify 'x' when category axis
         value: [ 'value', ],
     }
 },
	axis: {
	    x: {
	        label: 'Date',
	        type: 'category',
	        tick: {
	            format: '%Y-%m-%d %H:%M'
	       }
	    },
	    y: {
	        label: 'Current Weight',
	    }
	}
});
}

function updateLatestWeight() {
	console.log("updateLatestWeight");
        db.query('weight/weight-view-index', {
         reduce: false,
         descending: true ,
         limit: 1
        }).then(function (res) {
		console.log("current weight");
                 $.each( res.rows, function(key, row  ) {
		    $("#current_weight").html(row.value.toFixed(2) +"lbs");
		       });
        }).catch(function (err) {
	console.log("Error");
	console.log(err);
});


}
	
