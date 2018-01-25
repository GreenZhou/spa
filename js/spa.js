var spa = (function() {
	'use strict';

    var initModule = function($container) {
    	spa.model.initModule();
        spa.shell.initModule($container)
    }

    // 导出公开函数
    return {
        initModule : initModule
    };
} ());