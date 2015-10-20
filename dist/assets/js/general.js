/**
* NET54-Refactor-Template v1.0.0
* Author : Gergely Olah 
* Copyright 2015
* Licensed under MIT
*/
function formGeneral() {
    "use strict";


    $('input').iCheck({
      checkboxClass: 'icheckbox_minimal',
      radioClass: 'iradio_minimal',
      // increaseArea: '20%' // optional
    });

    return;

}
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
(function($) {
	$.fn.net54Grid = function(options, pagerOptions) {
		var settings = $.extend({
			// These are the defaults.
			datatype : "json",
			styleUI: "Bootstrap",
			rowNum : 10,
			rowList : [ 5, 10, 25, 50, 100 ],
			pager : getPagerName($(this)[0].id),
			viewrecords : true,
			autowidth : true,
			altRows : true,
			altclass : 'altRow',
			height : 'auto',
			multiselect : false,
			multiSort : true,
			hidegrid : false,
			beforeProcessing : function(data) {
				var gridData = options.pagingDataVariableName;
				if (gridData && gridData.length !== 0) {
					data.total = data[gridData].total;
					data.records = data[gridData].records;
				}
			},
			loadError : function(xhr, st, err) {
				$("#" + this.id).setGridParam({
					emptyrecords : $.jgrid.errors.load + ': ' + xhr.status + " " + xhr.statusText
				});
				$("#" + this.id).jqGrid("clearGridData", true);
			},
			exportxls : false,
			exportcsv : false
		}, options);

		if (options.pagingDataVariableName && options.pagingDataVariableName.length !== 0) {
			var prefix = options.pagingDataVariableName + ".";
			var paramNames = {
				page : prefix + "page",
				rows : prefix + "rows",
				sort : prefix + "sidx",
				order : prefix + "sord",
				search : prefix + "search",
				nd : prefix + "nd",
				id : prefix + "id",
				oper : prefix + "oper",
				editoper : prefix + "edit",
				addoper : prefix + "add",
				deloper : prefix + "del",
				subgridid : prefix + "id",
				totalrows : prefix + "totalrows"
			};
			settings = $.extend(settings, {
				prmNames : paramNames
			});
		}

		if (!settings.exporturl) {
			settings.exporturl = settings.url;
		}

		var pagerSettings = $.extend({
			edit : false,
			add : false,
			del : false,
			search : false
		}, pagerOptions);

		var myGrid = this.jqGrid(settings);

		$(window).resize(function() {
			var width = $('#gbox_' + myGrid[0].id).parent().width();
			$('#' + myGrid[0].id).setGridWidth(width);
		}).trigger('resize');

		if (settings.pager) {
			myGrid.jqGrid('navGrid', settings.pager, pagerSettings);
			if (true === settings.exportxls) {
				myGrid.jqGrid('navButtonAdd', myGrid.jqGrid('getGridParam', 'pager'), {
					id : myGrid.jqGrid('getGridParam', 'id') + '_xlsbutton',
					caption : "Excel",
					buttonicon : "ui-icon-bookmark",
					onClickButton : function() {
						doExport(myGrid.jqGrid('getGridParam', 'id'), "XLS");
					}
				});
			}

			if (true === settings.exportcsv) {
				myGrid.jqGrid('navButtonAdd', myGrid.jqGrid('getGridParam', 'pager'), {
					id : myGrid.jqGrid('getGridParam', 'id') + '_csvbutton',
					caption : "CSV",
					buttonicon : "ui-icon-bookmark",
					onClickButton : function() {
						doExport(myGrid.jqGrid('getGridParam', 'id'), "CSV");
					}
				});
			}
			return myGrid;
		}
		return myGrid;
	};
}(jQuery));

function getPagerName(tableId) {
	var pager = $("#" + tableId + '_pager');
	if (pager) {
		return "#" + tableId + '_pager';
	}
	return;
}

var doExport = function (gridId, exportType) {
	jQuery("#" + gridId).jqGrid('excelExport', {
		url : getExportURL(gridId, exportType)
	});
};

var getExportURL = function (gridId, exportType) {
	var url = jQuery("#" + gridId).jqGrid('getGridParam', 'exporturl');
	var params = 'exportType=' + exportType;
	var res = null;
	if (url) {
		if (url.indexOf("?") !== -1) {
			res = url + "&" + params;
		} else {
			res = url + "?" + params;
		}
	}
	return res;
};

// regul�ris kifejez�s, amely az RFC8601 d�tumra illeszkedik
var datePattern = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})$/;

var RFCDateFormatter = function (cellValue, options, rowObject) {
	if (datePattern.test(cellValue)) {
		var year = cellValue.slice(0,4);
		var month = cellValue.slice(5,7);
		var day = cellValue.slice(8,10);
		var hour = cellValue.slice(11,13);
		var minute = cellValue.slice(14,16);
		var second = cellValue.slice(17,19);

		return year + '-' + month + '-' + day + " " + hour + ":" + minute + ":" + second;
	} else {
		return '';
	}
};

var RFCDateFormatterWithoutTime = function (cellValue, option, rowObject) {
	if (datePattern.test(cellValue)) {
		var year = cellValue.slice(0,4);
		var month = cellValue.slice(5,7);
		var day = cellValue.slice(8,10);

		var sep = $.jgrid.defaults.date_sep;
		if (sep === '.') {
			return year + sep + month + sep + day + sep ;
		} else {
			return year + sep + month + sep + day;
		}
	} else {
		return '';
	}
};

var RFCTimeFormatter = function (cellValue, options, rowObject) {
	if (datePattern.test(cellValue)) {
		var hour = cellValue.slice(11,13);
		var minute = cellValue.slice(14,16);
		var second = cellValue.slice(17,19);

		var sep = $.jgrid.defaults.date_sep;
		if (sep === '.') {
			return hour + ":" + minute + ":" + second;
		}
	} else {
		return '';
	}
};

var BooleanFormatter = function (cellValue, options, rowObject) {
	if (cellValue) {
		return '<span class="glyphicon glyphicon-ok"></span>';
	} else {
		return '';
	}
};
Node.prototype.appendChildren = function (nodeArray) {
	for (var i = 0; i < nodeArray.length; i++) {
		this.appendChild(nodeArray[i]);
	}
	return this;
}

Node.prototype.empty = function () {
	while (this.firstChild) {
		this.removeChild(this.firstChild);
	}
}

Node.prototype.hasChildElementNodes = function () {
	if (this.hasChildNodes()) {
		for (var i = 0; i < this.childNodes.length; i++) {
			if (this.childNodes[i].nodeType == Node.ELEMENT_NODE) {
				return true;
			}
		}
	}
	return false;
}

Node.prototype.countChildElementNodes = function () {
	if (this.hasChildNodes()) {
		var count = 0;
		for (var i = 0; i < this.childNodes.length; i++) {
			if (this.childNodes[i].nodeType == Node.ELEMENT_NODE) {
				count++;
			}
		}
		return count;
	}
	return 0;
}

function createElementWithAttributes (elementName, attributes) {
	var element = document.createElement(elementName);
	for (var attribute in attributes) {
		element.setAttribute(attribute, attributes[attribute]);
	}
	return element;
}

function createElementWithTextContent (elementName, text) {
	var element = document.createElement(elementName);
	element.textContent = text;
	return element;
}

function createElementWithAttributesAndTextContent (elementName, attributes, text) {
	var element = createElementWithAttributes(elementName, attributes);
	element.textContent = text;
	return element;
}
/**
 * net54/bootstrap-utils.js
 * 
 * Saját segédmetódusok a Bootstrap-hez
 * @author meb
 * @since 2014.10.15.
 */

/**
 * Megjelöli a bootstap mezőt a megadott státusszal.
 * A következő státuszok adhatóak meg:
 * <ul>
 *  <li>error</li>
 *  <li>warning</li>
 *  <li>success</li>
 * </ul>
 */
var markField = function (fieldName, status) {
	if (status !== 'error' && status !== 'warning' && status !== 'success') {
		console.log('markField() called with invalid status parameter!');
	} else if (typeof fieldName !== "string" || fieldName === "") {
		console.log('markField() called with invalid fieldName parameter!');
	} else {
		$('#' + fieldName).closest('.form-group').addClass('has-' + status);
	}
};

/**
 * Eltávolítja a megadott bootstrap mezőről a megadott státuszhoz
 * tartozó jelölést.
 * A következő státuszok adhatóak meg:
 * <ul>
 *  <li>error</li>
 *  <li>warning</li>
 *  <li>success</li>
 * </ul>
 */
var unmarkField = function (fieldName, status) {
	if (status !== 'error' && status !== 'warning' && status !== 'success') {
		console.log('markField() called with invalid status parameter!');
	} else if (typeof fieldName !== "string" || fieldName === "") {
		console.log('markField() called with invalid fieldName parameter!');
	} else {
		$('#' + fieldName).closest('.form-group').removeClass('has-' + status);
	}
};

/**
 * Inaktívvá teszi, és üríti a megadott mezőt.
 */
var disableAndClearField = function (fieldName) {
	document.getElementById(fieldName).disabled = true;
	document.getElementById(fieldName).value = '';
};

/**
 * Aktívvá teszi a megadott mezőt.
 */
var enableField = function (fieldName) {
	document.getElementById(fieldName).disabled = false;
};