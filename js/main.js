/**
 * Check if a literal object is empty.
 * @param  {Object} the literal object to check.
 * @return {Boolean}
 */
function isEmpty(obj) {
	for (var key in obj) {
		if (key) {
	        return false;
	    }
    }
    return true;
}

/**
 * Check if a fix tag (name) is valid. It must not be a non empty string,
 * it must rapresents an "integer" number. 
 * @param  {String} the tag name
 * @return {Boolean}
 */
function isValidTag(tag) {
	tag = "" + tag;

	try {
		tag = tag.trim();
	} catch (ex) {
		return false;
	}
	
	if (!tag) {
		return false;
	}

	var patt = /[^0-9]+/;
	var isNotNumericalTag = patt.test(tag);
	if (isNotNumericalTag) {
		return false;
	}

	return true;
}

/**
 * Add a new tag to a FixMessage literal object.
 * @param {Object} the fix message to modify
 * @param {String} the field tag
 * @param {String} the field value
 */
function addTag(fixMessage, tag, value) {
	// A fix message can have the same tag two or more times (e.g. 638=1;638=2).
	// If this happens, add a suffix to the tag name (e.g. 638=1;638_1=2).
	var tagName = tag;
	var j = 1;
	if (tag in fixMessage)
	{
		while (tagName in fixMessage)
		{
			tagName = (tag + "_" + j);
			j++;
		}
	}

	fixMessage[tagName] = value;
	return fixMessage;
}

/**
 * Transform a fix message to a literal FixMessage object.
 * @param  {String} the string to parse
 * @param  {Regex} the regex used to split the fields in the string (usually /\x01/)
 * @param  {Regex} the regex used to split the field tag and value (\usually /=/)
 * @return {Object}
 */
function parseFixMessage(text, fieldsSeparator, tagvalueSeparator) {
	// Debug only
	// console.log("Replaced Text: "  + text);

	var fields = text.split(fieldsSeparator);
	var fixMessage = {};

	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];

		// Skip empty fields
		if (!field) {
			continue;
		}

		var fieldComponents = field.split(tagvalueSeparator);
		if (fieldComponents.length != 2) {
			console.warn("Unable to parse: '" + field + "'");
			continue;
		}
		var tag = fieldComponents[0];
		var value = fieldComponents[1];
		
		if (!isValidTag(tag)) {
			// invalid tag
			console.warn("Invalid tag for field: '" + field + "'");
			continue;
		}

		tag = tag.trim();
		value = value.trim();

		fixMessage = addTag(fixMessage, tag, value);
	}

	return fixMessage;
}

/**
 * Parse the text and return a list of fix messages.
 * @param text string The text to parse
 * @param messagesSeparator regex The separator used to separate the messages (default: "\n")
 * @param fieldsSeparator regex The separator used to separate the message fields (default: "\x01")
 * @param tagvalueSeparator regex The separator used to separate tab between values (default: "=")
 */
function parseFixLog(text, messagesSeparator, fieldsSeparator, tagvalueSeparator) {
	var lines = text.split(messagesSeparator);
	var fixMessages = [];
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];

		// Gatelab log format
		// a) remove time-date:
		line = line.replace(/^\d\d\d\d\d\d\d\d-\d\d:\d\d:\d\d\.\d*/, "");
		// b) remove remaining spaces:
		line = line.replace(/^\s*:\s*/, "");

		var fixMessage = parseFixMessage(line, fieldsSeparator, tagvalueSeparator);
		if (!isEmpty(fixMessage)) {
			fixMessages.push(fixMessage);
		}
	};
	return fixMessages;
}

/**
 * This method add a new class to a DOM element using native javascript.
 * (Better performance than jQuery)
 */
function addClass(element, className) {
	element.className = element.className + " " + className;
}

/**
 * Set a new css style to a DOM element using native javascript.
 * (Better performance than jQuery)
 */
function setStyle(element, cssKey, cssValue) {
	var currentStyle = element.getAttribute(cssKey);
	if (currentStyle) {
		element.setAttribute("style", currentStyle + cssKey + ":" + cssValue + ";")
	} else {
		element.setAttribute("style", cssKey + ":" + cssValue + ";")
	}
}

/**
 * Transform a literal FixMessage object to a DOM element.
 * @param  {Object} the fix message to parse
 * @return {DOMElement}
 */
function createFixMessageElement(fixMessage) {
	// Native code for better performance
	var element = document.createElement("div");
	for (var tag in fixMessage) {
		var value = fixMessage[tag];
		try {
			var line = document.createElement("div");
			line.innerHTML = '<span class="tag">' + tag + '</span> = <span class="value">' + fixMessage[tag]+ '</span>';
			addClass(line, ("tag-" + tag));
			element.setAttribute("data-tag-" + tag, value);
			element.appendChild(line);
		} catch (ex) {
			console.error("Suppressed [TAG: " + tag + ", VALUE: " + value);
		}
    }
    return element;
}

/**
 * Show the fix messages in the UI.
 * @param  {Array} the array of literal fix messaged to show.
 */
function showFixMessages(fixMessages) {
	// This is the FixMessageElement container
	var fixBlock = document.getElementById("fix-blocks");
	fixBlock.innerHTML = "";	// Clear the container

	for (var i = 0; i < fixMessages.length; i++) {
		var fixMessage = fixMessages[i];
		var element = createFixMessageElement(fixMessage);
		// -- Animation
		if (i <= 10) {
			setStyle(element, "animation-delay", (i * 0.05) + "s");
		}
		// -- Animation
		fixBlock.appendChild(element);
	};
}

/*
// Web Worker version of the parser
function onSubmit() {
	// Get the log text
	var fixLog = $("#fix-log").val();

	// console.log("Script: " + document.getElementById('parser').innerHTML);
	var workerData = new Blob([document.getElementById('parser').innerHTML], {
	    type: "text/javascript"
	});

	var worker = new Worker("js/parser.js");

	// Parser callback
	worker.addEventListener('message', function(e) {
		// Parsered Fix Messages
		var fixMessages = e.data;
		
		// Show the messages in the UI
		showFixMessages(fixMessages);
	}, false);

	// Parse fix messages
	worker.postMessage(fixLog);

	// Prevent the form from sending
	// data and refresh the page.
	return false;
}
*/

/**
 * Transform the value of a form field to a regex. Useful when the
 * user has to input a regex.
 * @param  {DOMElement} the element to parse
 * @param  {RegExp} if the element value is empty this function returns this value
 * @return {RegExp}
 */
function getRegexValue(element, defaultValue) {
	var value = $(element).val();

	if (value) {
		// Convert to regex
		value = new RegExp(value, "i");
	} else if (defaultValue) {
		value = defaultValue;
	}
	return value;
}

function onSubmit() {
	// Get the log text
	var fixLog = $("#fix-log").val();

	// Load settings
	var messagesSeparator = getRegexValue(document.getElementById("messages-separator"), "\n");
	var fieldsSeparator = getRegexValue(document.getElementById("fields-separator"), "\x01");
	var tagvalueSeparator = getRegexValue(document.getElementById("tagvalue-separator"), "=");

	// Parse fix messages
	var fixMessages = parseFixLog(fixLog, messagesSeparator, fieldsSeparator, tagvalueSeparator);

	// Show the messages in the UI
	showFixMessages(fixMessages);

	// Prevent the form from sending
	// data and refresh the page.
	return false;
}

function onSystemMessagesCheck() {
	var body = $("body");
	var checkbox = $('#admin-messages-check')[0];
	if (checkbox && checkbox.checked) {
	    body.addClass("hide-admin-messages");
	} else {
		body.removeClass("hide-admin-messages");
	}
	return false;
}

$(function() {
    $("#fix-log-form").submit(onSubmit);
    $('#admin-messages-check').change(onSystemMessagesCheck);
});