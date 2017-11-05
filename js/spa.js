var spa = (function() { 
    var initModule = function($container) {
        spa.shell.initModule($container)
    }

    // 导出公开函数
    return {
        initModule : initModule
    };
} ());