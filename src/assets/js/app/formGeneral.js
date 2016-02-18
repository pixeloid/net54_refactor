function formGeneral(root) {
	var $root = root ? $(root + ' input') : $('input');
	$root.iCheck({
		checkboxClass: 'icheckbox_minimal',
		radioClass: 'iradio_minimal',
		// increaseArea: '20%' // optional
	});
}