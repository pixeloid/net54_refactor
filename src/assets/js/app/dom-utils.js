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