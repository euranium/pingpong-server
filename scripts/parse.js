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
	email = email.replace(/[^A-Za-z-_0-9 |\ |:|,|&|+|\.|!|@|#|$|%|\*|\(|\)|;|\/|"|\?|=]/g, "");
	if (email.indexOf("@") === -1)
		return false;
	return email;
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
