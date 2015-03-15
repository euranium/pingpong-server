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

