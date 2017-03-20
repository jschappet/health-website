
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

$('#signOut').click( function () {
	db  = null;
 	$('#table').html();
	return false;
});


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


  $.ajax({
    url : 'https://data.schappet.com/_session',
    contentType : "application/x-www-form-urlencoded", 
    type : 'POST',
    data : 'name='+ user.name + '&password=' + user.password ,
    success : function(resp) { 
		console.log(resp);
	},
    error: function(err) {
	console.log(err);
  }

  });

	var removeDbUrl = 'https://data.schappet.com/userdb-' + hexVal;
	console.log(removeDbUrl);
	db = new PouchDB(removeDbUrl, {
	  ajax: {
	    cache: false,
	    timeout: 10000,
	    headers: {
		'Authorization': 'Basic ' + window.btoa(user.name + ':' + user.password)
	    },
	  },
	  auth: {
	    username: user.name,
	    password: user.password
	  }
	});
  	updateTable();

	$('#loginForm').html("<button id='signOut' class='btn btn-success'>Sign out</button>");
	return false;
});
