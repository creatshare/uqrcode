/* global chrome */
// 字符编码 From QWrap
var encode4Html = function (s) {
        var el = document.createElement('pre'),
            text = document.createTextNode(s);
        el.appendChild(text);
        return el.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    },

    menuId = {'image': 0, 'text': 0, 'link': 0, 'qrcode': 0},

    dpr = window.devicePixelRatio || 1,

    // 检查网址是否合法
    cleckUrl = function (url) {
        var regExp = /^http(s)?:\/\/([\w-]+\.)+[\w-]+\/.*$/;
        if (url.match(regExp)) {
            return true;
        } else {
            return false;
        }
    },

    // 文本类型识别
    typeIdentify = function (text) {
        var typeList = [
            {
                'type': 'link',
                'regExp': /^http(s)?:\/\/([\w-]+\.)+[\w-]+\/.*$/,
                'tmpl': '<a href="{$text}" target="_blank">{$text}</a>',
            },
            {
                'type': 'mail',
                'regExp': /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
                'tmpl': '<a href="mailto:{$text}" target="_blank">{$text}</a>',
            }
        ], i, type;

        for (i = 0; i < typeList.length; i++) {
            type = typeList[i];
            if (type.regExp.test(text)) {
                return type.tmpl.replace(/\{\$text\}/ig, encode4Html(text));
            }
        }
        return encode4Html(text);
    },

    // 生成二维码
    creatQrcode = function (argu, callback) {
        var data = {},
            qrcanvas = $('<div>');

        data.type = argu.type;

        qrcanvas.qrcode({text: argu.text, moduleSize: 5 * dpr});
        setTimeout(function () {
            var canvas = qrcanvas.find('canvas')[0];
            data.qrcode = canvas.toDataURL("image/png");
            data.size = (canvas.width + canvas.height) / 2 / dpr;
            data.text = typeIdentify(argu.text);

            if (!cleckUrl(argu.url)) {
                data.type = 'info';
                data.text = '<span class="error">错误：不是有效的网址</span>';
            }

            callback(data);
        }, 20);
    },

    // 二维码解码
    deQrcode = function (argu, callback) {
        var data = {},
            qrcanvas = $('<canvas>'),
            img = new Image(),
            ctx = qrcanvas[0].getContext('2d');

        img.src = argu.src;
        img.onload = function () {
            qrcanvas[0].width = img.width;
            qrcanvas[0].height = img.height;
            ctx.drawImage(img, 0, 0);
            data.type = 'info';
            data.qrcode = '';
            data.text = typeIdentify(qrcanvas.qrdecode());
            callback(data);
        };
    },

    // 注册右键菜单
    initContentMenus = function () {
        var createTextInfo = {
                type: 'normal',
                title: "转化\"%s\"为二维码",
                contexts: ['selection'],
                onclick: function (info, tab) {
                    creatQrcode({"type": 'text', "url": tab.url, "text": info.selectionText}, function (data) {
                        chrome.tabs.sendMessage(tab.id, data);
                    });
                }
            },

            createImageInfo = {
                type: 'normal',
                title: "转化图片地址为二维码",
                contexts: ['image'],
                onclick: function (info, tab) {
                    creatQrcode({ "type": 'image', "url": tab.url, "text": info.srcUrl}, function (data) {
                        chrome.tabs.sendMessage(tab.id, data);
                    });
                }
            },

            createLinkInfo = {
                type: 'normal',
                title: "转化链接为二维码",
                contexts: ['link'],
                onclick: function (info, tab) {
                    creatQrcode({ "type": 'link', "url": tab.url, "text": info.linkUrl}, function (data) {
                        chrome.tabs.sendMessage(tab.id, data);
                    });
                }
            },

            createQrcodeInfo = {
                type: 'normal',
                title: "转化二维码为文字",
                contexts: ['image'],
                onclick: function (info, tab) {
                    deQrcode({"src": info.srcUrl}, function (data) {
                        chrome.tabs.sendMessage(tab.id, data);
                    });
                }
            };

        if (!menuId.text) {
            menuId.text = chrome.contextMenus.create(createTextInfo);
        }
        if (!menuId.image) {
            menuId.image = chrome.contextMenus.create(createImageInfo);
        }
        if (!menuId.link) {
            menuId.link = chrome.contextMenus.create(createLinkInfo);
        }
        if (!menuId.qrcode) {
            menuId.qrcode = chrome.contextMenus.create(createQrcodeInfo);
        }
        // console.log( menuId );
    },

    // 移除右键菜单
    destoryContentMenu = function () {
        chrome.contextMenus.removeAll(function () {
            menuId = {'image': 0, 'text': 0, 'link': 0, 'qrcode': 0};
        });
    },

    // 初始化插件
    initExt = function () {

        // 初始化按钮
        chrome.browserAction.setPopup({'popup': ''});

        // 初始化右键菜单
        initContentMenus();

        // 监听二维码事件
        chrome.browserAction.onClicked.addListener(function (tab) {
            creatQrcode({"type": 'url', "url": tab.url, "text": tab.url}, function (data) {
                chrome.tabs.sendMessage(tab.id, data);
            });
        });

        // 监听浮层打开事件
        chrome.extension.onMessage.addListener(function (request) {
            if (request.type === 'hideContextMenus') {
                destoryContentMenu();
            } else if (request.type === 'showContextMenus') {
                initContentMenus();
            }
        });
    };
initExt();
