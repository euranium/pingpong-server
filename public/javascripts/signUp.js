$('#password1').on('keyup', function () {
	if ($(this).val() == $('#password0').val()) {
		$('#message').html('matching').css('color', 'green');
	} else $('#message').html('not matching').css('color', 'red');
});
