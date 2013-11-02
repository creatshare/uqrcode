var config = {
	tinyUrl: {
		enabled: true, // 是否转换为短网址
		type: 'baidu' // 短网址接口
	},
	qrCode: {
		type: 'liantu' // 二维码接口
	}
}
var saveOption = function() {
	config.tinyUrl.enabled = $('#tinyUrlEnabled').get(0).checked;
	config.tinyUrl.type = $('#tinyUrlType').val();
	config.qrCode.type = $('#qrCodeType').val();
	
	localStorage["tinyQrcode"] = JSON.stringify( config );
	console.log( JSON.stringify( config ) );
	$('.info p').html("保存成功").fadeIn(400);
	setTimeout( function(){
		$('.info p').fadeOut(400);
	}, 1000);
};
(function(){ // loadOption
	var saveConfig = localStorage["tinyQrcode"] ? JSON.parse( localStorage["tinyQrcode"] ) : config;
	if( !saveConfig.tinyUrl.enabled ) {
		$('#tinyUrlEnabled').removeAttr("checked");
		$('#tinyUrlType').attr("disabled", "disabled");
	};
	$('#tinyUrlType').val( saveConfig.tinyUrl.type );
	$('#qrCodeType').val( saveConfig.qrCode.type );
}());
$('button').on( 'click', function() {
	saveOption();
});
$('.info p').on('click', function(){
	$(this).fadeOut(400);
});
$("#tinyUrlEnabled").on("change", function() {
	if( this.checked ) {
		$('#tinyUrlType').removeAttr("disabled");
	} else {
		$('#tinyUrlType').attr("disabled", "disabled");
	}
})
