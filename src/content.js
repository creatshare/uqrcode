(function(){
    var loadImg = chrome.extension.getURL('images/loading.gif'),
    dom = '<div id="uqrcode" style="display:none"><div class="uqrcode-border"><span class="uqrcode-close">&times;</span><div class="uqrcode-content"><p class="uqrcode-text">正在玩命加载中<span class="uqrcode-dots">...</span></p><div class="uqrcode-img"><img src="###" width="200" height="200"/></div><div class="uqrcode-loading"><img src="' + loadImg + '" width="30" height="30"/></div></div></div></div>',
    
    // 加载动画...
    loading = function() {
        var api = {
            i: 0,
            text : ['&nbsp;&nbsp;&nbsp;', '.&nbsp;&nbsp;', '..&nbsp;', '...'],
            timer : setInterval( function() {
                if ( api.i == api.text.length ) {
                    api.i = 0;
                } else {
                    api.i++;
                }
                $('#uqrcode p.uqrcode-text .uqrcode-dots').html( api.text[api.i] );
            }, 400)
        };
        
        return api;
    },

    showQrcode = function() {
        chrome.extension.sendMessage( { 'type': 'hideContextMenus' } );
        loading();
        $('body').append( dom );
        $('#uqrcode').fadeIn(100);
        
        $("#uqrcode .uqrcode-close").on("click", function() {
            hideQrcode();
        });
        $("#uqrcode").on("click", function( e ) {
            // console.log( "close ");
            if( e.target == this ) {
                hideQrcode();
            }
        });
    },
    
    setValue = function( data ) {
        var qrcode = new Image();
        qrcode.src = data.imgUrl;
        qrcode.onload = function() {
            clearInterval( loading.timer );
            $('#uqrcode .uqrcode-img').show();
            $('#uqrcode .uqrcode-loading').hide();
        }
        $('#uqrcode .uqrcode-content').attr('title', data.title );
        $('#uqrcode .uqrcode-text').html( data.text );
        $('#uqrcode .uqrcode-img img').attr( 'src', data.imgUrl );
    },

    hideQrcode = function() {
        // console.log('hide');
        chrome.extension.sendMessage( { 'type': 'showContextMenus' } );
        $('#uqrcode').fadeOut(100, function() {
            $('#uqrcode').remove();
        });
    };

    chrome.extension.onMessage.addListener( function(request, sender, sendResponse ) {
        // console.log(request);
        if( request.type == 'showpage' ) {
            showQrcode();
        } else if( request.type == 'setdata' ) {
            setValue( request.data );
        }
    });
})();