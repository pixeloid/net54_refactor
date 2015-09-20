$.jgrid.defaults.autowidth = true;
$.jgrid.defaults.responsive = true;
$.jgrid.defaults.styleUI = 'Bootstrap';

$.jgrid.styleUI.Bootstrap.base.headerTable = "table  table-condensed";
$.jgrid.styleUI.Bootstrap.base.rowTable = "table  table-condensed table-striped table-hover";
$.jgrid.styleUI.Bootstrap.base.footerTable = "table ";
$.jgrid.styleUI.Bootstrap.base.pagerTable = "table table-condensed";

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
    height: 200,
	viewrecords: true,
    rowNum: 10,
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
     }

});
