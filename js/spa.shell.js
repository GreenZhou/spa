spa.shell = (function() {
    var configMap = {
        anchor_schema_map: {
            chat: {
                open: true,
                closed: true
            }
        },
        main_html: ''
            + '<div class="spa-shell-head">'
            +   '<div class="spa-shell-head-logo"></div>'
            +    '<div class="spa-shell-head-acct"></div>'
            +   '<div class="spa-shell-head-search"></div>'
            + '</div>'
            + '<div class="spa-shell-main">'
            +   '<div class="spa-shell-main-nav"></div>'
            +    '<div class="spa-shell-main-content"></div>'
            + '</div>'
            + '<div class="spa-shell-foot"></div>'
            + '<div class="spa-shell-chat"></div>'
            + '<div class="spa-shell-modal"></div>',

        // 控制聊天滑块的时间和速度
        chat_extend_time: 250,
        chat_extend_height: 450,
        chat_extend_title: 'Click to retract',
        chat_retract_time: 300,
        chat_retract_height: 15,
        chat_retract_title: 'Click to extend'
    },

    //extend
    // 将在整个模块中共享的动态信息放在stateMap变量中
    stateMap = {
        $container: null,
        anchor_map: {},
        is_chat_retracted: true
    },
    // 将jquery集合缓存在jqueryMap中
    jqueryMap = {},

    // jqueryMap能大大减少jQuery对文档的遍历，从而提高性能
    setJqueryMap, copyAnchorMap, toggleChat, changeAnchorPart, onClickChat, onHashChange, initModule;

    setJqueryMap = function() {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $chat: $container.find('.spa-shell-chat')
        };
    };
    
    copyAnchorMap = function() {
        // true: 表示深拷贝
        // {}: 要拷贝到的对象
        // stateMap.anchor_map: 被拷贝的对象
        return $.extend(true, {}, stateMap.anchor_map);
    };

    toggleChat = function(do_extend, callback) {
        var 
            px_chat_ht = jqueryMap.$chat.height(),
            is_open = px_chat_ht === configMap.chat_extend_height,
            is_closed =  px_chat_ht === configMap.chat_retract_height,
            is_sliding = !is_open && !is_closed;
        if(is_sliding) {
            return false;
        }                   

        if(do_extend) {
            jqueryMap.$chat.animate({
                height: configMap.chat_extend_height
            }, configMap.chat_extend_time, function() {
                jqueryMap.$chat.attr('title', configMap.chat_extend_title);
                stateMap.is_chat_retracted = false;
                if(callback) {
                    callback(jqueryMap.$chat);
                }
            });
            
            return true;
        }

        jqueryMap.$chat.animate({
                height: configMap.chat_retract_height
            }, configMap.chat_retract_time, function() {
                jqueryMap.$chat.attr('title', configMap.chat_retract_title);
                stateMap.is_chat_retracted = true;
                if(callback) {
                    callback(jqueryMap.$chat);
                }
            });
            
            return true; 
    };

    // 更改锚的状态处理方法
    changeAnchorPart = function(arg_map) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;

        for(key_name in arg_map) {
            if(arg_map.hasOwnProperty(key_name)) {
                // 表示锚的关联属性
                if(key_name.indexOf('_') === 0) {
                    continue;
                }

                anchor_map_revise[key_name] = arg_map[key_name];

                // 处理关联属性
                key_name_dep = '_' + key_name;
                if(arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                } else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }

        // 更新uri的锚信息
        try { 
            $.uriAnchor.setAnchor(anchor_map_revise, null, true);
        } catch(error) {
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }

        return bool_return;
    },

    onClickChat = function(event) {
        // 点击不用直接调用toggleChat方法了，直接改uri锚的状态即可
        // toggleChat(stateMap.is_chat_retracted);
        changeAnchorPart({
            chat: (stateMap.is_chat_retracted? "open" : "closed")
        });
        
        // 返回false阻止事件冒泡
        return false;
    },

    // 监听URL的锚变化处理方法
    onHashChange = function(event) {
        var
            anchor_map_pervious = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed;
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch(error) {
            $.uriAnchor.setAnchor(anchor_map_pervious, null, true);
            return false;
        }    
        stateMap.anchor_map = anchor_map_proposed;

        _s_chat_previous = anchor_map_pervious._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        if(!anchor_map_pervious || _s_chat_previous != _s_chat_proposed) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch(s_chat_proposed) {
                case 'open':
                    toggleChat(true);
                    break;
                case 'closed':
                    toggleChat(false);
                    break;
                default:
                    toggleChat(false);
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);    
            }
        }

        return false;
    },

    // 公共方法
    initModule = function($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });

        // 监听URI变化并立即触发
        $(window).bind("hashchange", onHashChange).trigger('hashchange');
        
        // 初始化聊天滑块并绑定点击事件
        stateMap.is_chat_retracted = true;
        jqueryMap.$chat.attr('title', configMap.chat_retract_title).click(onClickChat);
    };

    return {
        initModule : initModule
    };
}());