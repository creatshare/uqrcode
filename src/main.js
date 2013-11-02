var config = {};

var menuId = {
	'image': 0,
	'text': 0,
	'link': 0
}
// 初始化右键菜单
var initContentMenus = function() {
	var createTextInfo = {
		type: 'normal',
		title: "转化\"%s\"为二维码",
		contexts: ['selection'],
		onclick: function( info, tab ) {
			console.log("showpage ");
			chrome.tabs.sendMessage( tab.id, { 'type': 'showpage' } );
			config = JSON.parse( localStorage['tinyQrcode'] );
			creatData( { "type": 'text', "url": tab.url, "text": info.selectionText }, function( data ) {
				chrome.tabs.sendMessage( tab.id, { 'type': 'setdata', 'data': data } );
			});
		}
	};	
	var createImageInfo = {
		type: 'normal',
		title: "转化图片地址为二维码",
		contexts: ['image'],
		onclick: function( info, tab ) {
			chrome.tabs.sendMessage( tab.id, { 'type': 'showpage' } );
			config = JSON.parse( localStorage['tinyQrcode'] );
			creatData( { "type": 'image', "url": info.srcUrl, "title": info.srcUrl }, function( data ) {
				chrome.tabs.sendMessage( tab.id, { 'type': 'setdata', 'data': data } );
			});
		}
	};
	
	var createLinkInfo = {
		type: 'normal',
		title: "转化链接为二维码",
		contexts: ['link'],
		onclick: function( info, tab ) {
			chrome.tabs.sendMessage( tab.id, { 'type': 'showpage' } );
			config = JSON.parse( localStorage['tinyQrcode'] );
			creatData( { "type": 'link', "url": info.linkUrl, "title": info.linkUrl }, function( data ) {
				chrome.tabs.sendMessage( tab.id, { 'type': 'setdata', 'data': data } );
			});
		}
	};
	if( !menuId.text ) {
		menuId.text = chrome.contextMenus.create( createTextInfo );
	}
	if( !menuId.image ) {
		menuId.image = chrome.contextMenus.create( createImageInfo );
	}
	if( !menuId.link ) {
		menuId.link = chrome.contextMenus.create( createLinkInfo );
	}
	console.log( menuId );
}

// 初始化插件
var initExt = function() {
	
	// 初始化默认选项
	var defaultConfig = {
		tinyUrl: {
			enabled: true, // 是否转换为短网址
			type: 'baidu' // 短网址接口
		},
		qrCode: {
			type: 'liantu' // 二维码接口
		}
	}
	if( !localStorage['tinyQrcode'] ) {
		localStorage['tinyQrcode'] = JSON.stringify( defaultConfig );
	}
	config = localStorage['tinyQrcode'];
	if( config.showType == 'page' ) {
		chrome.browserAction.setPopup({'popup':''});
	} else if( config.showType == 'popup' ) {
		chrome.browserAction.setPopup({'popup':'./popup.html'});
	}
	
	initContentMenus();
	chrome.browserAction.onClicked.addListener( function( tab ) {
		chrome.tabs.sendMessage( tab.id, { 'type': 'showpage' } );
		config = JSON.parse( localStorage['tinyQrcode'] );
		creatData( { "type": 'url', "url": tab.url, "title": tab.title }, function( data ) {
			chrome.tabs.sendMessage( tab.id, { 'type': 'setdata', 'data': data } );
		});
	});
	
	chrome.extension.onMessage.addListener( function(request, sender, sendResponse ) {
		if( request.type == 'hideContextMenus' ) {
			chrome.contextMenus.removeAll(function(){
				menuId = { 'image': 0, 'text': 0 };
			});
		} else if( request.type == 'showContextMenus' ) {
			initContentMenus();
		}
	});
}

// Ajax POST 请求
var AJAXpost = function( type, url, params, callback ) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if ( request.readyState == 4 ) {
			if ( request.status == 200 ) {
				callback( request.responseText );
			}
		}
	}
	request.open("POST", url, true);
	if( type == 1 ) {
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		params = json2data( params );
	} else {
		request.setRequestHeader("Content-Type", "application/json");
		params = JSON.stringify( params );
	}
	request.send( params );
}

// JSON 对象转换为 formData 字符串
var json2data = function( json ) {
	var str = JSON.stringify( json );
	str = str.replace(/[\{\"\}]/ig,'');
	str = str.replace(':','=');
	str = str.replace(',','&');
	return str;
}

// 获取短网址链接
var getTinyUrl = function( url, type, callback ) {
	type = type ? type : 'baidu';
	switch( type ) {
		case 'baidu' : {
			AJAXpost('1', 'http://dwz.cn/create.php',{ 'url': url }, function( val ){
				val = JSON.parse( val );
				if( !val.status ) {
					callback( val.tinyurl );
				} else {
					callback( url );
				}
			});
			break;
		}
		case 'google' : {
			AJAXpost('2', 'https://www.googleapis.com/urlshortener/v1/url',{ 'longUrl': url }, function( val ){
				val = JSON.parse( val );
				if( val.id ) {
					callback( val.id );
				} else {
					callback( url );
				}
			});
			break;
		}
	}
}

// 获取二维码图片链接
var getQrCode = function( text, type ) {
	var returnText = '';
	type = type ? type : 'liantu';
	switch( type ) {
		case 'liantu' : {
			returnText = 'http://qr.liantu.com/api.php?w=200&el=l&m=25&text=' + text;
			break;
		}
		case 'google' : {
			returnText = 'https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=UTF-8&chld=L|4&chl=' + text;
			break;
		}
		case 'kuaipai' : {
			returnText = 'http://api.kuaipai.cn/qr?chs=200x200&chl=' + text;
			break;
		}
	}
	return returnText;
}

// 检查网址是否合法
var cleckUrl = function( url ) {
	var regExp = /^http/;
	if( url.match( regExp ) ) {
		return true;
	} else {
		return false;
	}
}

// 转换为数据
var creatData = function( val, callback ) {
	console.log( "Data =====", val );
	var data = {};
	if( cleckUrl(val.url) ) {
		if( val.type == "text" ) {
			data.type = "text";
			data.text = '扫一下，文字瞬间到手机！';
			data.title = val.text;
			data.imgUrl = getQrCode( data.title, config.qrCode.type );
			callback( data );
		} else if( val.type == "url" ) {
			data.type = "url";
			// data.text = val.title;
			data.text = '扫一下，网址瞬间到手机！';
			data.title = val.url;
			if( config.tinyUrl.enabled ) {
				getTinyUrl( val.url, config.tinyUrl.type, function( tinyurl ) {
					data.imgUrl = getQrCode( tinyurl, config.qrCode.type );
					callback( data );
				});
			} else {
				data.imgUrl = getQrCode( val.url, config.qrCode.type );
				callback( data );
			}
		} else if( val.type == "image" ) {
			data.type = "image";
			/* var textArr = val.title.split('/');
			data.text = decodeURI( textArr[textArr.length - 1] );
			data.text = decodeURI( textArr[textArr.length - 1] );
			*/
			data.text = '扫一下，图片瞬间到手机！';
			data.title = val.url;
			if( config.tinyUrl.enabled ) {
				getTinyUrl( val.url, config.tinyUrl.type, function( tinyurl ) {
					data.imgUrl = getQrCode( tinyurl, config.qrCode.type );
					callback( data );
				});
			} else {
				data.imgUrl = getQrCode( val.url, config.qrCode.type );
				callback( data );
			}
		} else if( val.type == "link" ) {
			data.type = "link";
			/* var textArr = val.title.split('/');
			data.text = decodeURI( textArr[textArr.length - 1] );
			data.text = decodeURI( textArr[textArr.length - 1] );
			*/
			data.text = '扫一下，链接瞬间到手机！';
			data.title = val.url;
			if( config.tinyUrl.enabled ) {
				getTinyUrl( val.url, config.tinyUrl.type, function( tinyurl ) {
					data.imgUrl = getQrCode( tinyurl, config.qrCode.type );
					callback( data );
				});
			} else {
				data.imgUrl = getQrCode( val.url, config.qrCode.type );
				callback( data );
			}
		}
	} else {
		data = {
			'type': 'error',
			'text': '<span class="error">错误：不是有效的网址</span>',
			'imgUrl': chrome.extension.getURL('images/error.png'),
			'title': ''
		}
		console.log("Page Error", data );
		callback( data );
	}
}

initExt();