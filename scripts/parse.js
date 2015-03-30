var crypto = require('crypto');

exports.remove = function (string) {
	// remove any non standard characters
	return string.replace(/[^A-Za-z-_0-9 |\ |:|,|&|+|\.|!|@|#|$|%|\*|\(|\)|;|\/|"|\?|=]/g, "");
};

exports.isEmail = function (email) {
	// make sure its is a viable string
	if (email.length < 1 || typeof email !== 'string')
		return false;
	// remove non standard characters
	email = email.replace(/[^A-Za-z-_0-9 |\ |:|,|&|+|\.|!|@|#|$|%|\*|\(|\)|;|\/|"|\?|=]/g, "");
	if (email.indexOf("@") === -1)
		return false;
	return email;
};
exports.isUser = function (user) {
	// check type and length
	if (typeof user !== 'string' || user.length < 1)
		return false;
	// return all safe characters
	return user.replace(/[^A-Za-z-_0-9 |+|!|@|#|%|;|\/|"|\?|=]/g, "");
};
exports.check = function (entry, entry1, entry2) {
	// check in any input is not valid
	if (entry.length < 1 || entry === false || typeof entry !== 'string')
		return 'password not valid';
	if (entry1.length < 1 || entry1 === false || typeof entry1 !== 'string')
		return 'please enter a user name';
	if (entry2 === false || entry2.length < 1 || typeof entry2 !== 'string')
		return 'please enter a valid user name';
	return true;
};
exports.isValid = function (entry, entry0, entry1, entry2) {
	if (entry === entry0)
		return 'cannot send request to youself';
	else if(entry1 === entry2)
		return 'winner and looser the same person';
	else if (entry0 !== entry1 && entry0 !== entry2)
		return 'you must be apart of the game';
	else if (typeof entry !== 'string' || typeof entry0 !== 'string' || typeof entry1 !== 'string' || typeof entry2 !== 'string')
		return 'please enter a valid string';
	return true;
};

exports.toTime = function() {
	// returns a string fomrated as datetime yyyy_mm_dd hh:mm:ss
	now = new Date();
	year = "" + now.getFullYear();
	month = "" + (now.getMonth() + 1);
	// if any lenth is 1, add a 0, then convert to a string
	if (month.length == 1)
		month = "0" + month;
	day = "" + now.getDate();
	if (day.length == 1)
		day = "0" + day;
	hour = "" + now.getHours();
	if (hour.length == 1)
		hour = "0" + hour;
	minute = "" + now.getMinutes();
	if (minute.length == 1)
		minute = "0" + minute;
	second = "" + now.getSeconds();
	if (second.length == 1)
		second = "0" + second;
	return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
};

function uuidFromBytes (rnd) {
	// generate a random hex string
	rnd[6] = (rnd[6] & 0x0f) | 0x40;
	rnd[8] = (rnd[8] & 0x3f) | 0x80;
	rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
	rnd.shift();
	return rnd.join('-');
}

exports.genUuid = function (callback) {
	// generate a random hex
	if (typeof(callback) !== 'function')
		return uuidFromBytes(crypto.randomBytes(16));
	crypto.randomBytes(16, function(err, rnd) {
		if (err)
			return callback(err);
		callback(null, uuidFromBytes(rnd));
	});
};
