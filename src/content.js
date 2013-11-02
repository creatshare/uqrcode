var loadImg = chrome.extension.getURL('images/loading.gif');
var html = '<div id="extqrcode"><div class="qrcodecontent"><span class="qrcodeclose">×</span><p class="qrcodetext">正在努力加载中<span class="qrcodedots">...</span></p><div class="qrcodeimg"><img src="###" width="200" height="200"/></div><div class="qrcodeloading"><img src="###" width="30" height="30"/></div></div></div>';
$('body').append( html );
$('#extqrcode .qrcodeloading img').attr('src', loadImg);

var loading = {
	i: 0,
	text : ['&nbsp;&nbsp;&nbsp;', '.&nbsp;&nbsp;', '..&nbsp;', '...'],
	timer : setInterval( function() {
		if ( loading.i == loading.text.length ) {
			loading.i = 0;
		} else {
			loading.i++;
		}
		$('#extqrcode p.qrcodetext .qrcodedots').html( loading.text[loading.i] );
	}, 200)
}

var setValue = function( data ) {
	var qrcode = new Image();
	qrcode.src = data.imgUrl;
	qrcode.onload = function() {
		clearInterval( loading.timer );
		$('#extqrcode .qrcodeimg').show();
		$('#extqrcode .qrcodeloading').hide();
	}
	if( !data.text.match( /^<span/ ) ) {
		data.text = data.text.substr(0, 20);
	}
	$('#extqrcode .qrcodetext').attr('title', data.title ).html( data.text );
	$('#extqrcode .qrcodeimg img').attr( 'src', data.imgUrl );
}

var hideQrcode = function() {
	chrome.extension.sendMessage( { 'type': 'showContextMenus' } );
	$('#extqrcode').fadeOut(100, function(){
		$('#extqrcode .qrcodeimg').hide();
		$('#extqrcode .qrcodeloading').show();
	});
}

chrome.extension.onMessage.addListener( function(request, sender, sendResponse ) {
	console.log(request);
	if( request.type == 'showpage' ) {
		chrome.extension.sendMessage( { 'type': 'hideContextMenus' } );
		$('#extqrcode .qrcodeimg').hide();
		$('#extqrcode .qrcodeloading').show();
		$('#extqrcode').fadeIn(60);
	} else if( request.type == 'setdata' ) {
		setValue( request.data );
	}
});

$("#extqrcode .qrcodeclose").on("click", function() {
	hideQrcode();
});
$("#extqrcode").on("click", function( e ){
	if( e.target == this ) {
		hideQrcode();
	}
});