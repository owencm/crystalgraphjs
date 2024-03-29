var LIB = (function() {

	var clone = function(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) return obj;
		// Handle Date
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
		// Handle Array
		if (obj instanceof Array) {
			var copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}
		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
			}
			return copy;
		}
		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	function assert(outcome, description) {  
		if (!outcome) {
			throw description;
		}
	};

	var newFilledArray = function(length, value) {
		var result = [];
		while (--length >= 0) {
			result.push(value);
		}
		return result;
	}

	function randomBetween(from, to)
	{
	    return Math.floor(Math.random()*(to-from+1)+from);
	}

	return { 
		clone: clone,
		assert: assert,
		newFilledArray: newFilledArray,
		randomBetween: randomBetween
	};

}());