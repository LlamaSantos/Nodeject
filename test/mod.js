(function (module, undefined){
	'use strict';

	var obj = {
		first : 'firstname',
		last : 'lastname',
		fn : function (){
			return obj.first + ' ' + obj.last;
		}
	};

	module.exports = obj;
})(module);