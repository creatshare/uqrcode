(function(){
    var config = {
        tinyUrl: {
            enabled: true, // 是否转换为短网址
            type: 'baidu' // 短网址接口
        },
        qrCode: {
            type: 'liantu' // 二维码接口
        }
    },
    
    // 弹出信息
    showInfo = function( text, type ) {
        type = type || 'success';
        $('.info').addClass( type ).html( text ).fadeIn(300, function(){
            setTimeout( function(){
                $('.info').fadeOut(300);
            }, 1000);
        });
    },
    
    // 初始化选项
    initOption = function() {
        config = localStorage["Uqrcode"] ? JSON.parse( localStorage["Uqrcode"] ) : config;
        if( !config.tinyUrl.enabled ) {
            $('#tinyUrlEnabled').removeAttr("checked");
            $('#tinyUrlType').attr("disabled", "disabled");
        };
        $('#tinyUrlType').val( config.tinyUrl.type );
        $('#qrCodeType').val( config.qrCode.type );
    },
    
    // 保存选项
    saveOption = function() {
        localStorage["Uqrcode"] = JSON.stringify( config );
        showInfo("保存配置信息成功！");
    };
    
    initOption();
    
    // 单击消失
    $('.info').on('click', function(){
        $(this).fadeOut(100);
    });
    
    // 使用短网址
    $("#tinyUrlEnabled").on("change", function() {
        if( this.checked ) {
            $('#tinyUrlType').removeAttr("disabled");
        } else {
            $('#tinyUrlType').attr("disabled", "disabled");
        }
        config.tinyUrl.enabled = this.checked;
        saveOption();
    });
    
    // 短网址类型
    $("#tinyUrlType").on("change", function() {
        config.tinyUrl.type = $(this).val();
        saveOption();
    });
    
    // 二维码服务商
    $("#qrCodeType").on("change", function() {
        config.qrCode.type = $(this).val();
        saveOption();
    });
})();