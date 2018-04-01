

spa.shell = (function() {
    'use strict';
    var configMap = {
        anchor_schema_map: {
            chat: {
                opened: true,
                closed: true
            }
        },
        resize_status: false,
        resize_interval: 200,
        main_html: ''
            + '<div class="spa-shell-head">'
            +   '<div class="spa-shell-head-logo">' 
            +       '<h1>SPA</h1>'
            +       '<p>javascript end to end</p>'
            +   '</div>'
            +   '<div class="spa-shell-head-acct"></div>'
            + '</div>'
            + '<div class="spa-shell-main">'
            +   '<div class="spa-shell-main-nav"></div>'
            +    '<div class="spa-shell-main-content"></div>'
            + '</div>'
            + '<div class="spa-shell-foot"></div>'
            + '<div class="spa-shell-modal"></div>'
    },

    //extend
    // 将在整个模块中共享的动态信息放在stateMap变量中
    stateMap = {
        $container: null,
        anchor_map: {}
    },
    // 将jquery集合缓存在jqueryMap中
    jqueryMap = {},

    // jqueryMap能大大减少jQuery对文档的遍历，从而提高性能
    setJqueryMap, copyAnchorMap, changeAnchorPart, setChatAnchor, onHashChange, onResize, onTapAcct, onLogin, onLogout, initModule;

    setJqueryMap = function() {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $acct: $container.find('.spa-shell-head-acct'),
            $nav: $container.find('.spa-shell-main-nav'),
            $chat: $container.find('.spa-shell-chat')
        };
    };
    
    copyAnchorMap = function() {
        // true: 表示深拷贝
        // {}: 要拷贝到的对象
        // stateMap.anchor_map: 被拷贝的对象
        return $.extend(true, {}, stateMap.anchor_map);
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
    };

    setChatAnchor = function(position_type) {
        return changeAnchorPart({
            chat: position_type
        });
    };

    // 监听window比例方法
    onResize = function() {
        if(configMap.resize_status) {
            return;
        }

        spa.chat.handleResize();

        configMap.resize_status = setTimeout(function() {    
            configMap.resize_status = false;
        }, configMap.resize_interval);
        
    },

    // 监听URL的锚变化处理方法
    onHashChange = function(event) {
        var
            anchor_map_pervious = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed,
            is_ok = true,
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
                case 'opened':
                    is_ok = spa.chat.setSliderPosition("opened");
                    break;
                case 'closed':
                    is_ok = spa.chat.setSliderPosition("closed");
                    break;
                default:
                    is_ok = spa.chat.setSliderPosition("closed");
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);    
            }
        }

        //  会造成死循环，需要处理
        if(!is_ok) {
            if(anchor_map_pervious) {
                $.uriAnchor.setAnchor(anchor_map_pervious, null, true);
                stateMap.anchor_map = anchor_map_pervious;
            } else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }

        return false;
    };

    onTapAcct = function(event) {
        var acct_text, user_name, user = spa.model.people.get_user();
        if(user.get_is_anon()) {
            user_name = prompt('Please sign-in');
            // 特别处理用户名不输入的情况
            if(!user_name) {
                return false;
            }
            spa.model.people.login(user_name);
            jqueryMap.$acct.text('... processing ...');
        } else {
            spa.model.people.logout();
        }

        return false;

    };

    onLogin = function(event, login_user) {
        jqueryMap.$acct.text(login_user.name);
    };

    onLogout = function(event, logout_user) {
        jqueryMap.$acct.text('Please sign-in');
    };

    // 公共方法
    initModule = function($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });

        spa.chat.configModule({
            set_chat_anchor: setChatAnchor,
            chat_model: spa.model.chat,
            people_model: spa.model.people
        });
        spa.chat.initModule(jqueryMap.$container);

        spa.avtr.configModule({
            chat_model: spa.model.chat,
            people_model: spa.model.people
        });
        spa.avtr.initModule(jqueryMap.$nav);

        // 监听URI变化并立即触发
        $(window).bind("resize", onResize).bind("hashchange", onHashChange).trigger('hashchange');

        // 订阅spa-login和spa-logout事件
        $.gevent.subscribe($container, 'spa-login', onLogin);
        $.gevent.subscribe($container, 'spa-logout', onLogout);
    
        jqueryMap.$acct.text('Please sign-in').bind('utap', onTapAcct);
    };

    return {
        initModule : initModule
    };
}());