function metisChart() {
    "use strict";






    var sum = 0;
    var data = [];

    for (var i = 0; i <= 7; i += 1) {
 
    	var val = parseInt(Math.random() * 300);

    	sum += val;
    	data.push([i, val]);  
    }
   		var avg = sum/data.length;

    	$.plot("#w1", [{color: "#ba4247", data: data}], {	
    			series: {
		    		// ,
		    		// threshold: {
		    		// 	below: avg,
		    		// 	//color: "red"
		    		// },
		    		bars: {
		    			show: true,
					   	barWidth: 0.9,
						lineWidth: 0,
						fill:1
		    		}
    				    		
    			},

    			tooltip: true,

    			xaxis:{
    				show: false
    			},
    			grid: {
    			    borderWidth: 0,
    			    hoverable: true, 
    			    clickable: true 
    			}

    		}

    	);

    	var previousPoint = null;



    	//$('#w1').tooltip({title: 'tooltip'});

		$("#w1").bind("plothover", function (event, pos, item) {

    	        if (item) {
    	            if (!previousPoint || previousPoint[0] != item.datapoint[0]) {
    	                previousPoint = item.datapoint;
    	                var x = item.datapoint[0].toFixed(2), y = item.datapoint[1].toFixed(2);
    	                showTooltip(item.pageX, item.pageY, item.datapoint[1]);
    	            }
    	        }
    	        else {

					$('#w1').tooltip('destroy');
					previousPoint = null;            
    	        }

    	});

    	// show the tooltip
    	function showTooltip(x, y, contents) {
    		    	$('#w1').tooltip({
    		       		title: contents
    			    })
    			    .tooltip('show')
    	}



 var 	data1 = [],
 		data2 = [];

for (var i = 0; i < 24; i++) {
	data1.push([i, Math.floor(Math.random() * 100) + 1])
}
for (var i = 0; i < 13; i++) {
	data2.push([i, Math.floor(Math.random() * 100) + 1])
}

var dataset = [{
		color: "#ba4247",
		data: data1,
		bars:{fill: 0.3}
	},{
		color: "#ba4247",
		data: data2,
		bars:{fill: 1}
}];

 
 $.plot('#w2', dataset, {
     series: {
         bars: {
  			barWidth: 0.8,
			lineWidth: 0,
			show: true
       }
     },
     xaxis:{
     	show: false
     },
     grid: {
         borderWidth: 0
     }

 });





	var dataset = [
	{
	    data: [
    		[0,32],
    		[1,23],
    		[2,45],
    		[3,12]
		],
		color: '#ba4247'

	},
	{
	    data: [
    	    [0,68],
    	    [1,77],
    	    [2,55],
    	    [3,88]
	    ],
	    color: '#eeeeee'

	}
	];

    $.plot($("#w3"), dataset, {
        series: {
        	stack: true,
            bars: {
            	fill: 1,
      		    barWidth: 0.7,
  				show: true
           	}
        },
    	xaxis:{
    		show: false
    	},
   	 	yaxis:{
    		show: false
    	},
	    grid: {
            show: false,
        },

    });




    	var dataset = [
    	{
    	    data: [
        		[0,12],
        		[1,43],
        		[2,105],
        		[3,45]
    		],
    		color: '#ba4247'
    	}
    	];

        $.plot($("#w4"), dataset, {
            series: {
                bars: {
                	fill: 1,
          		    barWidth: 0.7,
      				show: true
               	}
            },
        	xaxis:{
        		show: false
        	},
       	 	yaxis:{
        		show: false
        	},
    	    grid: {
                show: false,
            },
           

        });


}