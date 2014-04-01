/* global chrome */
(function () {
    var qrdom = '<div id="uqrcode" style="display:none"><div class="uqrcode-border"><div class="uqrcode-content"><div class="uqrcode-qrcode"><img/></div><div class="uqrcode-text"><div class="uqrcode-tips">请拿开鼠标再使用手机扫描</div><p></p></div></div></div></div>',

        showQrcode = function (data) {
            chrome.extension.sendMessage({ 'type': 'hideContextMenus' });
            var $qrcode = $(qrdom);
            if (data.type === 'info') {
                $qrcode.find('.uqrcode-tips').html(data.text);
                $qrcode.find('img').attr('src', data.qrcode);
                $qrcode.find('.uqrcode-content').addClass('uqrcode-info');
            } else {
                $qrcode.find('.uqrcode-content').addClass('uqrcode-success');
                data.size = data.size || 230;
                if (data.size > 400) {
                    data.size = data.size / 5 * 3;
                } else if (data.size > 300) {
                    data.size = data.size / 5 * 4;
                }
                console.log(data.size);

                if (data.size > 230) {
                    $qrcode.find('.uqrcode-border').css({width: data.size + 10, height: data.size + 10, marginLeft: -0.5 * (data.size + 10), marginTop: -0.5 * (data.size + 10)}); // padding 5；
                }
                $qrcode.find('img').attr('src', data.qrcode).css({width: data.size, height: data.size});
                $qrcode.find('.uqrcode-text p').html(data.text);
            }
            $('body').append($qrcode);
            $('#uqrcode').fadeIn(100);

            $("#uqrcode .uqrcode-close").on("click", function () {
                hideQrcode();
            });

            $("#uqrcode").on("click", function (e) {
                // console.log( "close ");
                if (e.target === this) {
                    hideQrcode();
                }
            });
        },

        hideQrcode = function () {
            chrome.extension.sendMessage({ 'type': 'showContextMenus' });
            $('#uqrcode').fadeOut(100, function () {
                $('#uqrcode').remove();
            });
        };

    chrome.extension.onMessage.addListener(function (request) {
        // console.log(request);
        if (request.type === 'qrencode') {
            showQrcode(request.data);
        }
    });
})();
