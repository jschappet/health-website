
function updateWeightTable(startkey, endkey, limit) {
	
	var tableData = [] ;

        db.query('weightView/weightViewIndex', {
         startkey: endkey ,
         endkey: startkey ,
         descending: true ,
         limit: limit
        }).then(function (res) {
                 $.each( res.rows, function(key, row  ) {
                   tableData.push({
                          "id": row.id,
                            "weight": row.value.weight.toFixed(2),
                            "source": row.value.source,
                            "date": row.key
                        });

                });
        $('#weightTable').bootstrapTable({
            columns: [{
                field: 'date',
                title: 'Date'
            }, {
                field: 'weight',
                title: 'Weight'
            }, {
                field: 'source',
                title: 'Source'
            }
            ],
            data: tableData
        });
     }).catch(function (err) {
           console.log(err);
     });

}


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
/*
{
  "_id": "weight_5F476E29-6E7F-49A7-B1EE-559114DB6C2D",
  "_rev": "1-ac3e3e9d5a469edbcb4ccafc848979ba",
  "data": {
    "devicename": "Withings",
    "value": "216.604172596642",
    "endDate": "2013-05-31T19:09:07.000Z",
    "startDate": "2013-05-31T19:09:07.000Z"
  }
}
*/


function saveWeight(inputValue, date) {
	if (inputValue > 400) {
		console.log("Error: weight too high");
		return false;
	}
        if (inputValue < 50) {
                console.log("Error: weight too low");
		return false;
        }
	var weight = {};
	weight.data = {};
	var uuid = UUID.generate();
	weight._id = "weight_" + uuid;
	weight.data.value = inputValue;
	weight.data.startDate = new Date();
	weight.data.endDate =  new Date();
	weight.data.devicename = "HealthWebsite";
	console.log(weight);
	db.put(weight);

	return true;

}
