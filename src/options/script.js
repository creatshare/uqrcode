(function ($) {
    // 在 Canvas 绘制图片
    var inBox = false,
        isDecode = false,
        showImg = function (url, callback) {
            var img = new Image(),
                canvas = $('#qrimg').get(0),
                ctx = canvas.getContext('2d'),
                canvasSize = 300;

            if (!url) {
                return;
            }
            img.onload = function () {
                var imgSize, zoom,
                    imgW = img.width, imgH = img.height,
                    pos = {
                        x: 0,
                        y: 0
                    };

                ctx.fillStyle = 'rgb(255, 255, 255)';
                ctx.fillRect(0, 0, canvasSize, canvasSize);

                imgSize = Math.max(imgW, imgH);

                if (imgSize > canvasSize) {
                    zoom = canvasSize / imgSize;
                    imgW = imgW * zoom;
                    imgH = imgH * zoom;
                }
                pos.x = Math.floor((canvasSize - imgW) / 2);
                pos.y = Math.floor((canvasSize - imgH) / 2);
                ctx.drawImage(img, pos.x, pos.y, imgW, imgH);

                if ($.isFunction(callback)) {
                    callback();
                }
            };
            img.src = url;
        },

        getFromClipboard = function (clipboard, callback) {
            var i = 0,
                items, item, types,
                reader = new FileReader();

            if (!clipboard || !clipboard.items) {
                return;
            }

            items = clipboard.items;

            item = items[0];
            types = clipboard.types || [];

            for (; i < types.length; i++) {
                if (types[i] === 'Files') {
                    item = items[i];
                    break;
                }
            }

            if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
                reader.onload = function (e) {
                    if ($.isFunction(callback)) {
                        callback(e.target.result);
                    }
                };

                reader.readAsDataURL(item.getAsFile());
            }
        },

        getFromDropbox = function (files, callback) {
            var i = 0,
                file,
                reader = new FileReader();

            for (; i < files.length; i++) {
                file = files[i];
                if (file.type.match(/^image\//i)) {
                    break;
                }
            }

            reader.onload = function (e) {
                if ($.isFunction(callback)) {
                    callback(e.target.result);
                }
            };

            reader.readAsDataURL(file);
        },

        showResult = function (text) {
            $('#result-text').val(text);
            $('.result').show();
        },

        closeResult = function () {
            $('.box .panel').hide();
            $('.box .upload').show();
            $('#result-text').val('');
            $('.result').hide();
        },

        togglePage = function (toggle) {
            if (toggle) {
                $('.toggle').data('sec', 'encode');
                $('.toggle').removeClass('sec');
                $('#qrencode').show();
                $('#qrdecode').hide();
                $('#header h1').html('二维码编码');
                $('title').html('二维码编码');
                isDecode = false;
                closeResult();
            } else {
                $('.toggle').data('sec', 'decode');
                $('.toggle').addClass('sec');
                $('#qrdecode').show();
                $('#qrencode').hide();
                $('#header h1').html('二维码解码');
                $('title').html('二维码解码');
                isDecode = true;
            }
        },

        init = function () {
            var hash = window.location.hash.substring(1);
            togglePage(hash !== 'decode');
        };


    // 直接粘贴图片
    $('#src-input').on('paste', function (e) {
        $(this).val('');
        getFromClipboard(e.originalEvent.clipboardData, function (url) {
            showImg(url, function () {
                $('.box .panel').hide();
                $('.box .preview').show();
                showResult($('#qrimg').qrdecode());
            });
        });
    });

    $('#src-input').on('blur focus', function () {
        $(this).val('');
    });

    // 输入图片网址(跨域问题，放弃)，可以用本域服务器做跳板解决
    /* $('.header .submit').on('click', function () {
        var url = $('#src-input').val();
        if (url) {
            showImg(url, function () {
                $('.box .panel').hide();
                $('.box .preview').show();
                showResult($('#qrimg').qrdecode());
            });
        }
    }); */

    /* 拖拽上传 */
    document.addEventListener("dragenter", function (e) {
        e.stopPropagation();
        if (isDecode) {
            $('#mask').show();
        }
    });
    document.addEventListener("dragleave", function (e) {
        e.stopPropagation();
    });

    $('#mask')[0].addEventListener("dragenter", function (e) {
        e.stopPropagation();
        $('.box').addClass('dropout').find('.drop p').html('拖拽图片到这里');
        $('.box .panel').hide();
        $('.box .drop').show();
    });

    $('#mask')[0].addEventListener("dragleave", function (e) {
        e.stopPropagation();
        setTimeout(function () {
            if (!inBox) {
                $('#mask').hide();
                $('.box').removeClass('dropout').find('.drop p').html('拖拽图片到这里');
                $('.box .panel').hide();
                $('.box .upload').show();
            }
        }, 100);
    });

    $('#mask .mbox')[0].addEventListener("dragenter", function (e) {
        e.stopPropagation();
        inBox = true;
        $('.box').addClass('dropin').find('.drop p').html('放开那只鼠标');

    });
    $('#mask .mbox')[0].addEventListener("dragleave", function (e) {
        e.stopPropagation();
        inBox = false;
        $('.box').removeClass('dropin').find('.drop p').html('拖拽图片到这里');

    });
    $('#mask .mbox')[0].addEventListener("dragover", function (e) {
        e.stopPropagation();
        e.preventDefault();
    });

    $('#mask .mbox')[0].addEventListener("drop", function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            getFromDropbox(e.dataTransfer.files, function (url) {
                showImg(url, function () {
                    $('#mask').hide();
                    $('.box').removeClass('dropin dropout');
                    $('.box .panel').hide();
                    $('.box .preview').show();
                    showResult($('#qrimg').qrdecode());
                });
            });
        }
    });

    /* 普通上传 */
    $('#src-file').on('change', function (e) {
        var file = e.target.files[0],
            reader = new FileReader();

        if (!file) {
            return;
        }

        reader.onload = function (e) {
            showImg(e.target.result, function () {
                $('#mask').hide();
                $('.box').removeClass('dropin dropout');
                $('.box .panel').hide();
                $('.box .preview').show();
                showResult($('#qrimg').qrdecode());
            });
        };

        reader.readAsDataURL(file);
    });

    /* 关闭按钮 */
    $('.box .preview .close').on('click', closeResult);

    /* 切换按钮 Hover */
    $('.toggle a').hover(function () {
        $('.toggle').addClass($(this).attr('class') + '-hover');
    }, function () {
        $('.toggle').removeClass('decode-hover encode-hover');
    });

    /* 切换按钮点击 */
    $('.toggle a').on('click', function () {
        togglePage($(this).hasClass('encode'));
    });

    /* QRCode 编码 */
    $('#input-area .submit').on('click', function () {
        var text = $('#input-text').val(),
            cfg = {};
        if (!text) {
            return;
        }

        cfg.text = text;
        $('#qrcanvas').qrcode(cfg);
        setTimeout(function () {
            var canvas = $('#qrcanvas canvas')[0],
                posW = canvas.width > 500 ? 500 : canvas.width;
            $('#resultimg').attr('src', canvas.toDataURL("image/png")).css({
                left: (500 - posW) / 2
            });
            $('.resultbox').show();
        }, 10);
    });

    window.addEventListener("hashchange", init, false);
    init();
}(jQuery, window));
