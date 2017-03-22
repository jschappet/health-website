
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
