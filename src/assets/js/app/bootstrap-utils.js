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