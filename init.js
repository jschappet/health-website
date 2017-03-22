
var dataCurrentWeight = [];
var db ;
var tableData = [];


var size = 250;

var smallSize = (size * .50);

function updateVitals(year) {
	var data=[];
        db.query('vitals/vitals-per-month', {
         startkey: year+"-" ,
         endkey: year+"-\uffff" 
        }).then(function (res) {
                 $.each( res.rows, function(key, row  ) {
                   data.push({
                            "key": row.key,
                            "bp": row.value.systolic,
                            "diatolic": row.value.diatolic
                        });
		});
		console.log(data);
		vitalsGraph(data);

	});
}

var vitalsGrph ;

function vitalsGraph(vitalsData) {

        vitalsGrp =  c3.generate({
         size: {
                height: size
            },
          bindto: '#myVitalsGraph',
          data: {
              json: vitalsData,
              keys: {
                 x: 'diatolic',
                 value: ['bp'],
                },
               type: 'scatter',
           },
    	axis: {
	  x: {
            label: 'diatolic (mmHg)',
            max: 110,
            min: 65,
            // Range includes padding, set 0 if no padding needed
            // padding: {top:0, bottom:0}
        },
        y: {
            label: 'systolic (mmHg)',
            max: 160,
            min: 110,
            // Range includes padding, set 0 if no padding needed
            // padding: {top:0, bottom:0}
        }
	}	
       });
}

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
  	updateTable();
	updateLatestWeight(); 
	weightGraph();
	updateVitals(new Date().getFullYear());
	$('#loginForm').html("<a href='/' id='signOut' class='btn btn-success' onClick='signOut()'>Sign out</a>");
	
}


// With JQuery
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

var tablist = ["#home","#weight", "#messages","#vitals"];

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
  if (target==='#vitals') {
	//updateVitals("2017");
  } 
  
});

	
