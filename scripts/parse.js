var crypto = require('crypto');

exports.test = function () {
	return 'here';
};

exports.remove = function (string) {
	return string.replace(/[^A-Za-z-_0-9 |\ |:|,|&|+|\.|!|@|#|$|%|\*|\(|\)|;|\/|"|\?|=]/g, "");
};

exports.isEmail = function (email) {
	if (email.length === 0)
		return false;
	if (typeof email !== 'string')
		return false;
	email = email.replace(/[^A-Za-z-_0-9 |\ |:|,|&|+|\.|!|#|$|%|\*|\(|\)|;|\/|"|\?|=]/g, "");
	if (email.indexOf("@") === -1)
		return false;
	return email;
};
exports.isUser = function (user) {
	if (typeof user !== 'string' || user.length === 0)
		return false;
	return user.replace(/[^A-Za-z-_0-9 |:|,|&|+|!|#|%|\(|\)|;|\/|"|\?|=]/g, "");
};
exports.check = function (pass0, pass1, user, email) {
	if ((pass0 === '') || (pass1 === '') || (pass0 !== pass1))
		return 'passwords do not match';
	if (user.length === 0 || user === false)
		return 'please enter a user name';
	if (email === false || email.length === 0)
		return 'please enter a valid user name';
	return user;
};

function uuidFromBytes (rnd) {
  rnd[6] = (rnd[6] & 0x0f) | 0x40;
  rnd[8] = (rnd[8] & 0x3f) | 0x80;
  rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rnd.shift();
  return rnd.join('-');
}

exports.genUuid = function (callback) {
	if (typeof(callback) !== 'function') {
		return uuidFromBytes(crypto.randomBytes(16));
	}

	crypto.randomBytes(16, function(err, rnd) {
		if (err) return callback(err);
		callback(null, uuidFromBytes(rnd));
	});
};

exports.toTime = function() {
	// returns a string fomrated to yyyy_mm_dd_hh_mm_ss
	now = new Date();
	year = "" + now.getFullYear();
	month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
	day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
	hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
	minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
	second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
	return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
};
