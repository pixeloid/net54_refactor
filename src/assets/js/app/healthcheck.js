var net54 = $.extend(true, net54, {
	healthCheck: {
		data: {
			/*
			"group": {
				display: {
					hidden: isHidden,
				},
				services: {
					serviceName: isOk,
					...
				}
			}
			*/
		},

		toggle: function (recordGroup) {
			// sorok ki- és bekapcsolása
			var hidden = this.data[recordGroup].display.hidden;
			hidden = !hidden; 
			var group = document.getElementById(recordGroup);
			var rows = group.querySelectorAll('tr[data-service="true"]');
			for (var i = 0; i < rows.length; i++) {
				rows[i].classList.toggle('hidden');
			}
			var errorRow = group.querySelector('tr[data-name="empty"]');
			if (errorRow) {
				errorRow.classList.toggle('hidden');
			}

			// ikon megváltoztatása
			var glyph = document.getElementById(recordGroup).querySelector('.net54-healthcheck-dropdown');
			// glyph.dataset.state = glyph.dataset.state ? '' : 'down';
			glyph.classList.toggle('glyphicon-menu-down');
			glyph.classList.toggle('glyphicon-menu-up');
		},

		run: function (result) {
			var panel = document.getElementById('healthCheckPanel');
			var spinner = panel.querySelector('.panel-body');
			if (spinner) {
				panel.removeChild(spinner);
			}
			var healthCheckTable = document.getElementById('healthCheckTable');

			// adatmodell
			for (var recordGroup in result) {
				this.addRecordGroup(recordGroup);
				for (var i = 0; i < result[recordGroup].length; i++) {
					this.addRecord(recordGroup, result[recordGroup][i]);
				}
			}

			// renderelés
			for (var recordGroup in this.data) {
				// fejléc
				if (!document.getElementById(recordGroup)) {
					// még nem rendereltük le
					var newGroup = this.renderRecordGroup(recordGroup, result);
					healthCheckTable.appendChild(newGroup);
				}
				var emptyGroup = Object.keys(this.data[recordGroup].services).length == 0;
				if (emptyGroup) {
					// lehalt a komponens
					var recordGroupRows = document.getElementById(recordGroup);
					var rows = recordGroupRows.querySelectorAll('tr[data-service="true"]');
					for (var i = 0; i < rows.length; i++) {
						var row = rows[i];
						recordGroupRows.removeChild(row);
					}
					// nézzük meg hogy már van-e hibasor
					if (!recordGroupRows.querySelector('tr[data-name="empty"]')) {
						var errorRow = this.renderErrorRow(recordGroup);
						recordGroupRows.appendChild(errorRow);
					}
				}
				this.refreshRecordGroupState(recordGroup);

				// szolgáltatások
				var newItems = false;
				for (var record in this.data[recordGroup].services) {
					if (!document.getElementById(recordGroup + '-' + record)) {
						newItems = true;
						var l10nRecord = this.text['service.name.' + recordGroup + '.' + record];
						var newRow = this.renderRecord(recordGroup, record, l10nRecord);
						var recordGroupRows = document.getElementById(recordGroup);
						recordGroupRows.appendChild(newRow);
					}
					this.refreshRecordState(recordGroup, record);
				}
				if (newItems) {
					var errorRow = document.querySelector('#' + recordGroup + ' tr[data-name="empty"]');
					if (errorRow) {
						errorRow.parentNode.removeChild(errorRow);
					}
				}
			}
		},

		addRecordGroup: function (recordGroup) {
			this.data[recordGroup] = {
				display: {
					hidden: true
				},
				services: {
					
				}
			};
		},

		/**
		 * Az adott rekordcsoport fejlécének létrehozása
		 * @return tbody DOM objektum
		 */
		renderRecordGroup: function(recordGroup, result, l10n) {
			var tbody = createElementWithAttributes('tbody', {
				'id': recordGroup
			});
			var row = createElementWithAttributes('tr', {
				'id': recordGroup + 'Row',
				'onclick': 'net54.healthCheck.toggle(\'' + recordGroup + '\')',
				'class': 'healthCheckToggle'
			});
			var dropdown = createElementWithAttributes('td', {
				'style': 'width: 24px'
			});
			dropdown.appendChild(createElementWithAttributes('span', {
				'class': 'net54-healthcheck-dropdown glyphicon glyphicon-menu-down'
			}));
			var groupName = net54.healthCheck.text['group.' + recordGroup];
			var component = document.createElement('td');
			component.appendChild(createElementWithTextContent('span', groupName ? groupName : recordGroup));
			var okay = createElementWithAttributes('td', {
				'class': 'text-right'
			});
			var sign = createElementWithAttributes('span', {
				'class': 'status-indicator',
				'title': ''
			});
			okay.appendChild(sign);
			row.appendChildren([dropdown, component, okay]);
			tbody.appendChild(row);
			return tbody;
		},

		refreshRecordGroupState: function (recordGroup) {
			var records = this.data[recordGroup].services;
			console.log(this.data[recordGroup]);
			// ha üres, akkor mindenképp false
			var ok = Object.keys(records).length > 0;
			for (var record in records) {
				if (!records[record]) {
					ok = false;
					break;
				}
			}

			// indikátor frissítése
			var led = document.querySelector('#' + recordGroup + ' .status-indicator');
			this.refreshLed(led, ok);
		},

		addRecord: function (recordGroup, record) {
			var records = this.data[recordGroup].services;
			records[record.serviceName] = record.ok;
		},

		/**
		 * Az adott rekord létrehozása
		 * @return sor DOM objektum
		 */
		renderRecord: function (recordGroup, serviceName, l10n) {
			var hidden = this.data[recordGroup].display.hidden;

			var row = createElementWithAttributes('tr', {
				'id': recordGroup + '-' + serviceName,
				'data-service': true,
				'class': hidden ? 'hidden' : ''
			});
			var service = createElementWithTextContent('td', l10n ? l10n : serviceName);
			var okay = createElementWithAttributes('td', {
				'class': 'text-right'
			});
			var sign = createElementWithAttributes('span', {
				'class': 'status-indicator',
				'title': ''
			});
			okay.appendChild(sign);
			row.appendChildren([document.createElement('td'), service, okay]);
			return row;
		},

		refreshRecordState: function (recordGroup, serviceName) {
			var ok = this.data[recordGroup].services[serviceName];
			var led = document.querySelector('#' + recordGroup + '-' + serviceName + ' .status-indicator');
			this.refreshLed(led, ok);
		},

		/**
		 * Hibasor létrehozása, ha nincs megjeleníthető adat
		 * @return sor DOM objektum
		 */
		renderErrorRow: function (recordGroup) {
			var hidden = this.data[recordGroup].display.hidden;

			var row = createElementWithAttributes('tr', {
				'data-group': recordGroup,
				'data-name': 'empty',
				'class': hidden ? 'hidden' : ''
			});
			var errorMessage = createElementWithAttributesAndTextContent('td', {
				'colspan': '2'
			}, 'A komponens nem küld adatokat!');
			row.appendChildren([document.createElement('td'), errorMessage]);
			return row;
		},

		refreshLed: function (led, ok) {
			if (ok) {
				led.classList.remove('status-indicator-off');
				led.classList.add('status-indicator-on');
				led.title = this.text['state.ok'];
			} else {
				led.classList.add('status-indicator-off');
				led.classList.remove('status-indicator-on');
				led.title = this.text['state.error'];
			}
		}
	}
});

