


function updateHr(day) {
        var data=[];
	
	var startkey = day;
	startkey = startkey.concat([0,0]);
	var endkey = day;
	endkey = endkey.concat([24,60]);
        db.query('heartrate/heartrate-histogram', {
         startkey: startkey,
         endkey: endkey,
	 group: true,
         reduce: true
        }).then(function (res) {
                 $.each( res.rows, function(key, row  ) {
		   var rowDate = new Date(...row.key);
                   data.push({
                            "key": row.key,
                            "AverageHeartRate": row.value.sum/row.value.count,
                            "time": rowDate
                        });
                });
                hrGraph(data);

        });
}

var hrGrp ;




function hrGraph(hrData) {

        hrGrp =  c3.generate({
         size: {
                height: size
            },
          bindto: '#myHrGraph',
          data: {
              xFormat: '%Y-%m-%dT%H:%M%S.%LZ',
              json: hrData,
              keys: {
                 x: 'time',
                 value: ['AverageHeartRate'],
                },
           },
        axis: {
          x: {
            label: 'Time',
            type: 'timeseries',
	    tick: {
		    format: '%H:%M'
            }
        },
        y: {
            label: 'Beats Per Minute',
            max: 150,
            min: 40,
        }
        }
       });
}

