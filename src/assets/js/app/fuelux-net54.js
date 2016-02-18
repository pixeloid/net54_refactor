/**
 * Feltölti a megadott pillboxot az elemekkel, ha van bejegyzés hozzá,
 * akkor azt is megjeleníti az azonosító mellett.
 * @param pillboxId a doboz azonosítója
 * @param entries a bejegyzések tömbje
 * @param mappings a szótár: bejegyzés -> név (opcionális)
 * @param showId jelenítse meg az id-t is a név mellé (default: true)
 */
function setupPillbox(pillboxId, entries, mappings, showId) {
	showId = typeof showId !== 'undefined' ? showId : true;
	var pills = [];
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		if (mappings && mappings[entry]) {
			if (showId) {
				pills.push({text: mappings[entry] + ' (' + entry + ')', value: entry});
			} else {
				pills.push({text: mappings[entry], value: entry});
			}
		} else {
			pills.push({text: entry, value: entry});
		}
	}
	/*
	 * Elfogadott elvásztó karakterek:
	 *  - 13: ENTER
	 *  - 32: SPACE
	 *  - 188: ;
	 *  - 186: ,
	 */
	$('#' + pillboxId).pillbox({
		acceptKeyCodes: [13,32,188,186]
	});
	$('#' + pillboxId).pillbox('addItems', 1, pills);
}

/**
 * Elemek hozzáadása a pillbox-hoz
 * @param pillboxId a box azonosítója
 * @param sourceId a forrás (bemeneti mező) azonosítója
 */
function addPillboxItem(pillboxId, sourceId) {
	// data values
	var text = $('#' + sourceId + " option:selected").text();
	var value = $('#' + sourceId).val();
	if (!value) {
		return;
	}
	// items in the pillbox
	var existing = $('#' + pillboxId).pillbox('items');
	// see if item is already added
	for (var i = 0; i < existing.length; i++) {
		if (existing[i].value == value) {
			console.log("Duplicate item not added.");
			return;
		}
	}
	$('#' + pillboxId).pillbox('addItems', -1, {
		text: text,
		value: value
	});
};

/**
 * Kinyeri a megadott pillbox-ból az elemeket.
 * 
 * @param pillboxId a pillbox azonosítója
 * @return az értékek tömbje
 */
function getPillboxItems(pillboxId) {
	var returnValues = [];
	if ($('#' + pillboxId).length) {
		var originalObjects = $('#' + pillboxId).pillbox('items');
	
		for (var i = 0; i < originalObjects.length; i++) {
			returnValues.push(originalObjects[i].value);
		}
	}
	return returnValues;
};
