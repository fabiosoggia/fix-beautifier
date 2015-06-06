// ...
// Include parser functions
// ...

self.addEventListener('message', function(e) {
	console.log("Starting the worker");

	var text = e.data; // Text to parse

	// Parse fix messages
	var fixMessages = parseFixLog(fixLog, "\n", "\x01", "=");

	self.postMessage(fixMessage);

}, false);