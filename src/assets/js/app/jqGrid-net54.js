(function($) {
	$.fn.net54Grid = function(options, pagerOptions) {
		var self = this;
		// Save initial settings
		self.options = options;

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
			beforeRequest: function () {
				if (self.options.rest) {
					var data = self.getGridParam('postData');
					self.setGridParam({
						url: self.options.url + '/' + data.rows + '/' + data.page
								+ (data.sidx ? '/' + data.sidx + '/' + data.sord : '')
					});
				}
			},
			serializeGridData: function (postData) {
				// On REST request, drop post params
				postData: self.options.rest ? '' : postData;
			},
			beforeProcessing : function(data) {
				if (options.countUrl) {
					var ajax = new XMLHttpRequest();
					ajax.open('GET', options.countUrl, false);
					ajax.send(null);
					if (ajax.status === 200) {
						data.records = ajax.responseText;
						data.total = Math.ceil(data.records / self.getGridParam('rowNum'));
					}
				}

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
			loadComplete: formGeneral,
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

		var myGrid = self.jqGrid(settings);

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

// reguláris kifejezés, amely az RFC8601 dátumra illeszkedik
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