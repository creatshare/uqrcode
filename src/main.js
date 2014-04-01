/* global chrome */
var menuId = {'image': 0, 'text': 0, 'link': 0, 'qrcode': 0},

    // 检查网址是否合法
    cleckUrl = function (url) {
        var regExp = /^http/;
        if (url.match(regExp)) {
            return true;
        } else {
            return false;
        }
    },

    // 生成二维码
    creatQrcode = function (argu, callback) {
        // console.log( "Data =====", val );
        var data = {},
            qrcanvas = $('<div>');

        data.type = argu.type;
        data.text = argu.text;

        qrcanvas.qrcode({text: data.text});
        setTimeout(function () {
            var canvas = qrcanvas.find('canvas')[0];
            data.qrcode = canvas.toDataURL("image/png");
            data.size = (canvas.width + canvas.height) / 2;

            if (!cleckUrl(argu.url)) {
                data.type = 'info';
                data.title = '<span class="error">错误：不是有效的网址</span>';
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
        img.onload = function() {
            qrcanvas[0].width = img.width;
            qrcanvas[0].height = img.height;
            ctx.drawImage(img, 0, 0);
            data.type = 'info';
            data.title = "二维码解码结果"
            data.qrcode = chrome.extension.getURL("images/qr.png");
            data.text = qrcanvas.qrdecode();
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
                    // console.log("showpage ");
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
