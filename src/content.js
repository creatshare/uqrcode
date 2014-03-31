/* global chrome */
(function () {
    var dom = '<div id="uqrcode" style="display:none"><div class="uqrcode-border"><span class="uqrcode-close">&times;</span><div class="uqrcode-content"><div class="uqrcode-img"><img></div></div></div></div>',

        showQrcode = function (data) {
            chrome.extension.sendMessage({ 'type': 'hideContextMenus' });
            $('body').append(dom);
            $('#uqrcode').fadeIn(100);
            setValue(data);

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

        setValue = function (data) {
            $('#uqrcode .uqrcode-content').attr('title', data.title);
            $('#uqrcode .uqrcode-text').html(data.text);
            $('#uqrcode .uqrcode-img img').attr('src', data.qrcode);
        },

        hideQrcode = function () {
            // console.log('hide');
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
