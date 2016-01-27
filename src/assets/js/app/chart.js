function metisChart() {
    "use strict";

    var tooltipBox = $('#tooltipBox');
    var chartColor = $('.net54-footer a').css('color');



    var sum = 0;
    var data = [];

    for (var i = 0; i <= 7; i += 1) {

        var val = parseInt(Math.random() * 300);

        sum += val;
        data.push([i, val]);
    }
    var avg = sum / data.length;


    if($('#w1').length){


        $.plot("#w1", [{
                color: chartColor,
                data: data
            }], {
                series: {
                    // ,
                    // threshold: {
                    //  below: avg,
                    //  //color: "red"
                    // },
                    bars: {
                        show: true,
                        barWidth: 0.9,
                        lineWidth: 0,
                        fill: 1
                    }

                },

                tooltip: {
                  show: true,
                  content: "x: %x; y: %y",
                  shifts: {
                    x: 10,
                    y: -20
                  },
                  defaultTheme: false


                },

                xaxis: {
                    show: false
                },
                grid: {
                    borderWidth: 0,
                    hoverable: true,
                    clickable: true
                }

            }

        );
    }



    if($('#w2').length){



        var data1 = [],
            data2 = [];

        for (var i = 0; i < 24; i++) {
            data1.push([i, Math.floor(Math.random() * 100) + 1])
        }
        for (var i = 0; i < 13; i++) {
            data2.push([i, Math.floor(Math.random() * 100) + 1])
        }

        var dataset = [{
            color: chartColor,
            data: data1,
            bars: {
                fill: 0.3
            }
        }, {
            color: chartColor,
            data: data2,
            bars: {
                fill: 1
            }
        }];


        $.plot('#w2', dataset, {
            series: {
                bars: {
                    barWidth: 0.8,
                    lineWidth: 0,
                    show: true
                }
            },
            xaxis: {
                show: false
            },
            grid: {
                borderWidth: 0
            }

        });

    }



    if($('#w3').length){

        var dataset = [{
            data: [
                [0, 32],
                [1, 23],
                [2, 45],
                [3, 12]
            ],
            color: '#ba4247'

        }, {
            data: [
                [0, 68],
                [1, 77],
                [2, 55],
                [3, 88]
            ],
            color: '#eeeeee'

        }];

        $.plot($("#w3"), dataset, {
            series: {
                stack: true,
                bars: {
                    fill: 1,
                    barWidth: 0.7,
                    show: true
                }
            },
            xaxis: {
                show: false
            },
            yaxis: {
                show: false
            },
            grid: {
                show: false,
            },

        });

    }


    if($('#w4').length){

        var dataset = [
                {"data": [[1,100]], "color":chartColor, bars: {fill: 0.1}},
                {"data":[[1,50]], "color":chartColor}
            ];

        $.plot($("#w4"), dataset, {
            series: {
                stackpercent : true,    // enable stackpercent
                bars: {
                    fill: 1,
                    barWidth: 1,
                    show: true,
                    lineWidth: 0
                }
            },
            xaxis: {
                show: false
            },
            yaxis: {
                show: false
            },
            grid: {
                show: false,
            },


        });

    }

}