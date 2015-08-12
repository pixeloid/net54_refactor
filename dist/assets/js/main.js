/**
* NET54-Refactor-Template v1.0.0
* Author : Gergely Olah 
* Copyright 2015
* Licensed under MIT
*/
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
    
});

















function formGeneral() {
    "use strict";


    $('input').iCheck({
      checkboxClass: 'icheckbox_minimal',
      radioClass: 'iradio_minimal',
      // increaseArea: '20%' // optional
    });

    return;

    $('.with-tooltip').tooltip({
        selector: ".input-tooltip"
    });

    /*----------- BEGIN autosize CODE -------------------------*/
    $('#autosize').autosize();
    /*----------- END autosize CODE -------------------------*/

    /*----------- BEGIN inputlimiter CODE -------------------------*/
    $('#limiter').inputlimiter({
        limit: 140,
        remText: 'You only have %n character%s remaining...',
        limitText: 'You\'re allowed to input %n character%s into this field.'
    });
    /*----------- END inputlimiter CODE -------------------------*/

    /*----------- BEGIN tagsInput CODE -------------------------*/
    $('#tags').tagsInput();
    /*----------- END tagsInput CODE -------------------------*/

    /*----------- BEGIN chosen CODE -------------------------*/

    $(".chzn-select").chosen();
    $(".chzn-select-deselect").chosen({
        allow_single_deselect: true
    });
    /*----------- END chosen CODE -------------------------*/

    /*----------- BEGIN spinner CODE -------------------------*/
//     DEPRECATED
//     $('#spin1').spinner();
//     $("#spin2").spinner({
//         step: 0.01,
//         numberFormat: "n"
//     });
//     $("#spin3").spinner({
//         culture: 'en-US',
//         min: 5,
//         max: 2500,
//         step: 25,
//         start: 1000,
//         numberFormat: "C"
//     });
    /*----------- END spinner CODE -------------------------*/

    /*----------- BEGIN validVal CODE -------------------------*/
    $('#validVal').validVal();
    /*----------- END validVal CODE -------------------------*/

    /*----------- BEGIN colorpicker CODE -------------------------*/
    $('#cp1').colorpicker({
        format: 'hex'
    });
    $('#cp2').colorpicker();
    $('#cp3').colorpicker();
    $('#cp4').colorpicker().on('changeColor', function(ev) {
        $('#colorPickerBlock').css('background-color', ev.color.toHex());
    });
    /*----------- END colorpicker CODE -------------------------*/

    /*----------- BEGIN datepicker CODE -------------------------*/
    $('#dp1').datepicker({
        format: 'mm-dd-yyyy'
    });
    $('#dp2').datepicker();
    $('#dp3').datepicker();
    $('#dp3').datepicker();
    $('#dpYears').datepicker();
    $('#dpMonths').datepicker();


    var startDate = new Date(2014, 1, 20);
    var endDate = new Date(2014, 1, 25);
    $('#dp4').datepicker()
            .on('changeDate', function(ev) {
        if (ev.date.valueOf() > endDate.valueOf()) {
            $('#alert').show().find('strong').text('The start date can not be greater then the end date');
        } else {
            $('#alert').hide();
            startDate = new Date(ev.date);
            $('#startDate').text($('#dp4').data('date'));
        }
        $('#dp4').datepicker('hide');
    });
    $('#dp5').datepicker()
            .on('changeDate', function(ev) {
        if (ev.date.valueOf() < startDate.valueOf()) {
            $('#alert').show().find('strong').text('The end date can not be less then the start date');
        } else {
            $('#alert').hide();
            endDate = new Date(ev.date);
            $('#endDate').text($('#dp5').data('date'));
        }
        $('#dp5').datepicker('hide');
    });
    /*----------- END datepicker CODE -------------------------*/

    /*----------- BEGIN daterangepicker CODE -------------------------*/
    $('#reservation').daterangepicker();

    $('#reportrange').daterangepicker(
            {
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                    'Last 7 Days': [moment().subtract('days', 6), moment()],
                    'Last 30 Days': [moment().subtract('days', 29), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                }
            },
    function(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }
    );
    /*----------- END daterangepicker CODE -------------------------*/

    /*----------- BEGIN timepicker CODE -------------------------*/
    $('.timepicker-default').timepicker();

    $('.timepicker-24').timepicker({
        minuteStep: 1,
        showSeconds: true,
        showMeridian: false
    });
    /*----------- END timepicker CODE -------------------------*/

    /*----------- BEGIN toggleButtons CODE -------------------------*/
    // Resets to the regular style
$('#dimension-switch').bootstrapSwitch('setSizeClass', '');
// Sets a mini switch
$('#dimension-switch').bootstrapSwitch('setSizeClass', 'switch-mini');
// Sets a small switch
$('#dimension-switch').bootstrapSwitch('setSizeClass', 'switch-small');
// Sets a large switch
$('#dimension-switch').bootstrapSwitch('setSizeClass', 'switch-large');
    /*----------- END toggleButtons CODE -------------------------*/

    /*----------- BEGIN dualListBox CODE -------------------------*/
    $.configureBoxes();
    /*----------- END dualListBox CODE -------------------------*/
}
function metisChart() {
    "use strict";






    var sum = 0;
    var data = [];

    for (var i = 0; i <= 7; i += 1) {

        var val = parseInt(Math.random() * 300);

        sum += val;
        data.push([i, val]);
    }
    var avg = sum / data.length;

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

            tooltip: true,

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

    var previousPoint = null;



    //$('#w1').tooltip({title: 'tooltip'});

    $("#w1").bind("plothover", function(event, pos, item) {

        if (item) {
            if (!previousPoint || previousPoint[0] != item.datapoint[0]) {
                previousPoint = item.datapoint;
                var x = item.datapoint[0].toFixed(2),
                    y = item.datapoint[1].toFixed(2);
                showTooltip(item.pageX, item.pageY, item.datapoint[1]);
            }
        } else {

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
$.jgrid.styleUI.Bootstrap.base.headerTable = "table table-bordered table-condensed";
$.jgrid.styleUI.Bootstrap.base.rowTable = "table table-bordered table-condensed";
$.jgrid.styleUI.Bootstrap.base.footerTable = "table table-bordered table-condensed";
$.jgrid.styleUI.Bootstrap.base.pagerTable = "table table-condensed";

$("#jqGrid").jqGrid({
    url: 'http://trirand.com/blog/phpjqgrid/examples/jsonp/getjsonp.php?callback=?&qwery=longorders',
    mtype: "GET",
    datatype: "jsonp",
    styleUI : 'Bootstrap',
    colModel: [
        { label: 'OrderID', name: 'OrderID', key: true, sorttype:'number'},
        { label: 'Customer ID', name: 'CustomerID' },
        { label: 'Order Date', name: 'OrderDate' },
        { label: 'Freight', name: 'Freight' },
        { label:'Ship Name', name: 'ShipName' }
    ],
    multiselect: true,
    height: 200,
    autowidth: true,
	viewrecords: true,
    rowNum: 10,
    pager: "#jqGridPager"
});
