


function updateVitals(year) {
        var data=[];
        db.query('vitals/vitals-per-month', {
         startkey: year+"-" ,
         endkey: year+"-\uffff" 
        }).then(function (res) {
                 $.each( res.rows, function(key, row  ) {
                   data.push({
                            "key": row.key,
                            "BloodPressure": row.value.systolic,
                            "diatolic": row.value.diatolic
                        });
                });
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
                 value: ['BloodPressure'],
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

