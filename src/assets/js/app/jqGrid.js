
$(function () {
    (function ($) {
        $.extend($.jgrid.defaults, {
            autowidth :true,
            responsive: true,
            styleUI: 'Bootstrap'
        });


        $.jgrid.styleUI.Bootstrap.base.headerTable = "table  table-condensed";
        $.jgrid.styleUI.Bootstrap.base.rowTable = "table  table-condensed table-striped table-hover";
        $.jgrid.styleUI.Bootstrap.base.footerTable = "table ";
        $.jgrid.styleUI.Bootstrap.base.pagerTable = "table table-condensed";
        $.jgrid.styleUI.Bootstrap.common.highlight = "highlight";
    })(jQuery);
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
        loadComplete: formGeneral/*function () {
            var table_header = $(this).closest('.ui-jqgrid ').find('.ui-jqgrid-hbox').css("position", "relative");
            $(this).closest('.ui-jqgrid-bdiv').bind('jsp-scroll-x', function (event, scrollPositionX, isAtLeft, isAtRight) {
                table_header.css('right', scrollPositionX);
            }).jScrollPane({ showArrows: false,
                autoReinitialise: true,
            });

            formGeneral();
		}*/

    });
});
