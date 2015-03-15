exports.test = function () {
	return 'here';
};

exports.remove = function (string) {
	return string.replace(/[^A-Za-z-_0-9 |\ |:|,|&|+|\.|!|@|#|$|%|\*|\(|\)|;|\/|"|\?|=]/g, "");
};
