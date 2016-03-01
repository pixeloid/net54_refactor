/**
 * Paraméteres karakterláncok kezelése.
 * @param string a bemeneti karakterlánc
 * @param params egy tömb a paraméterekkel
 */
function setStringParameters(string, params) {
	for (var i = 0; i < params.length; i++) {
		string = string.replace('{' + i + '}', params[i]);
	}
	return string;
}