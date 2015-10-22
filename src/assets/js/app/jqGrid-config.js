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