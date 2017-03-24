
var dataCurrentWeight = [];
var db ;
//var tableData = [];


var size = 250;

var smallSize = (size * .50);


function updateTable() {
	var tableData = [] ;
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
	Cookies.remove('remoteDb');
	var logout = db.logout(function (err, response) {
	if (err) {
		console.log(err);
	}	else {	
		console.log(response.ok);
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



function initDisplay() {
	var currentDate = new Date();
	var hrKey = [ currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()];
  	updateTable();
	updateLatestWeight(); 
	weightGraph();
	updateVitals(currentDate.getFullYear());
	updateHr(hrKey);
	$('#loginForm').html("<a href='/' id='signOut' class='btn btn-success' onClick='signOut()'>Sign out</a>");
	updateWeightTable("2017", "2017-12-12\ufffff", 15);
	
}


$("#vitalsYearSlider").slider();
$("#vitalsYearSlider").on("slide", function(slideEvt) {
	$("#vitalsYearVal").text(slideEvt.value);
        updateVitals(slideEvt.value);
});




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
                initDisplay();
	});

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
			 initDisplay();
		}
		});
	}
}


initDb();


var tablist = ["#homeTab","#weightTab", "#messagesTab","#hrTab","#vitalsTab"];

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  $.each(tablist, function (item) {
    // console.log(tablist[item]);
     $(tablist[item]).addClass("fade");
     $(tablist[item]).removeClass("active");
     $(tablist[item]).removeClass("active in");
  });
  var target = $(e.target).attr("href") // activated tab
  $(target).addClass("active");
  $(target).addClass("in");
  
});

	

 $('#addWeightButton').click( function () {
	 $('#weightModal').show();
 });



 $('#saveWeightBtn').click( function () {
	
	if(saveWeight($('#weightVal').val(), new Date())) {
		$('#weightModal').modal('hide');
	} else {
		
		$('#weightVal').val(0);
	}
	
 });


 $('#hrDateSelect').change( function () {
	var selectDate = new Date($('#hrDateSelect').val());
	console.log(selectDate);
        var hrKey = [ selectDate.getFullYear(),selectDate.getMonth(),selectDate.getDate()];
        updateHr(hrKey);
 });


/*
var changes = db.changes({
  since: 'now',
  live: true,
  include_docs: true
}).on('change', function(change) {
  
initDisplay();
  // handle change
}).on('complete', function(info) {
  // changes() was canceled
}).on('error', function (err) {
  console.log(err);
});
*/
