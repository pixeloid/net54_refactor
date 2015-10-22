/**
* NET54-Refactor-Template v1.0.0
* Author : Gergely Olah 
* Copyright 2015
* Licensed under MIT
*/
function metisChart() {
    "use strict";

    var tooltipBox = $('#tooltipBox');




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
                color: "#ba4247",
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
                  content: "%s",
                  shifts: {
                    x: 10,
                    y: 20
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
            color: "#ba4247",
            data: data1,
            bars: {
                fill: 0.3
            }
        }, {
            color: "#ba4247",
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

        var dataset = [{
            data: [
                [0, 12],
                [1, 43],
                [2, 105],
                [3, 45]
            ],
            color: '#ba4247'
        }];

        $.plot($("#w4"), dataset, {
            series: {
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

}

$(function () {

    $("#jqGrid").jqGrid({
        url: 'http://trirand.com/blog/phpjqgrid/examples/jsonp/getjsonp.php?callback=?&qwery=longorders',
        mtype: "GET",
        datatype: "jsonp",
        colModel: [
            { label: 'OrderID', name: 'OrderID', key: true, sorttype:'number'},
            { label: 'Customer ID', name: 'CustomerID' },
            { label: 'Order Date', name: 'OrderDate' },
            { label: 'Freight', name: 'Freight' },
            { label:'Ship Name', name: 'ShipName' }
        ],
        multiselect: true,
        height: 500,
    	viewrecords: true,
        rowNum: 20,
        pager: "#jqGridPager",
        gridComplete:function(){
            var table_header = $('#container').find('.ui-jqgrid-hbox').css("position","relative");

            $('.ui-jqgrid-bdiv').bind('jsp-scroll-x', function(event, scrollPositionX, isAtLeft, isAtRight) {
                table_header.css('right', scrollPositionX);
            }).jScrollPane({
                showArrows: false, 
                autoReinitialise: true,
                horizontalDragMaxWidth: 20,
                verticalDragMaxHeight: 20           
            });

            formGeneral();
         }

    });
});

$(function () {
    "use strict";

    $('a[href=#]').on('click', function (e) {
        e.preventDefault();
    });


  var $button = $("<div id='source-button' class='btn btn-primary btn-xs'>&lt; &gt;</div>").click(function(){
    var html = $(this).parent().html();
    html = cleanSource(html);
    $("#source-modal pre").text(html);
    $("#source-modal").modal();
  });

  $('.bs-component [data-toggle="popover"]').popover();
  $('.bs-component [data-toggle="tooltip"]').tooltip();

  $(".bs-component").hover(function(){
    $(this).append($button);
    $button.show();
  }, function(){
    $button.hide();
  });

  function cleanSource(html) {
    var lines = html.split(/\n/);

    lines.shift();
    lines.splice(-1, 1);

    var indentSize = lines[0].length - lines[0].trim().length,
        re = new RegExp(" {" + indentSize + "}");

    lines = lines.map(function(line){
      if (line.match(re)) {
        line = line.substring(indentSize);
      }

      return line;
    });

    lines = lines.join("\n");

    return lines;
  }





    $('.minimize-box').on('click', function (e) {
        e.preventDefault();
        var $icon = $(this).children('i');
        if ($icon.hasClass('icon-chevron-down')) {
            $icon.removeClass('icon-chevron-down').addClass('icon-chevron-up');
        } else if ($icon.hasClass('icon-chevron-up')) {
            $icon.removeClass('icon-chevron-up').addClass('icon-chevron-down');
        }
    });
    $('.close-box').click(function () {
        $(this).closest('.box').hide('slow');
    });

    $('#changeSidebarPos').on('click', function (e) {
        $('body').toggleClass('hide-sidebar');
    });

    $('li.accordion-group > a').on('click', function (e) {
        $(this).children('span').children('i').toggleClass('icon-angle-down');
    });
    
    $('#menu-toggle').on('click', function(e){
        $('#left').toggleClass('opened');
        e.preventDefault();
    });
    


    $(".scroll-pane").jScrollPane();
    metisChart(); 
   

});
















