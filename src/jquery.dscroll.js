/*
 *  jQuery D-Scroll Plugin v1.0
 *  Daniel Haskell <Daniel.Haskell@Sprint.com>
 */
( function($)
    {
        $.widget('custom.dscroll',
        {
            // Establishing default configuration.
            options :
            {
                bar : '.dscroll_loading',
                bar_config :
                {
                    attr : 'width',
                    from : '0px',
                    to : '100%',
                    easing : 'linear'
                },
                transition : null,
                mouse_stop : true,
                config : null,
                easing : 'easeInExpo',
                delay : 10000,
                duration : 600,
                forward : function(){},
                backward : function(){},
                before : function(){},
            },
            
            _create : function(config)
            {
                var plugin = this;
                plugin._fnRun();

                if (plugin.options.mouse_stop)
                {
                    plugin.options.mouse_element = plugin.options.mouse_element == null ? plugin.element : plugin.options.mouse_element;
                    
                    $(plugin.options.mouse_element).unbind('mouseenter').on('mouseenter', function()
                    {
                        plugin.stop();
                        $(this).unbind('mouseleave').on('mouseleave', function()
                        {
                            plugin.resume();
                        });
                    });
                }
            },

            forward : function(callback)
            {
                var plugin = this;
                var totalHeight = 0;
                $(plugin.element).find('li').each(function(){
                    totalHeight = $(this).outerHeight() + totalHeight;
                });
                
                if(totalHeight > $(plugin.element).height())
                {
                    var height = $(plugin.element).find('li:first').height();
                    $(plugin.element).find('li:first').animate(
                    {
                        marginTop : '-' + height
                    }, plugin.options.duration, plugin.options.easing, function()
                    {
                        $(this).detach().css('marginTop', '0').appendTo(plugin.element);
                        if ($.isFunction(callback))
                        {
                            plugin.options.forward();
                            callback(element);
                        }
                    });
                }
            },

            backward : function(callback)
            {
                var plugin = this;
                var totalHeight = 0;
                $(plugin.element).find('li').each(function(){
                    totalHeight = $(this).outerHeight() + totalHeight;
                });
                
                if(totalHeight > $(plugin.element).height())
                {
                    var height = $(plugin.element).find('li:last').outerHeight() + 10;
                    $(plugin.element).find('li:last').css('marginTop', '-' + height + 'px').detach().prependTo(plugin.element);
                    $(plugin.element).find('li:first').animate(
                    {
                        marginTop : '0'
                    }, plugin.options.duration, plugin.options.easing, function()
                    {
                        if ($.isFunction(callback))
                        {
                            plugin.options.backward();
                            callback(plugin.element);
                        }
                    });
                }
            },

            _fnWait : function(type, duration, callback)
            {
                var plugin = this;
                var totalHeight = 0;
                $(plugin.element).find('li').each(function(){
                    totalHeight = $(this).outerHeight() + totalHeight;
                });
                
                if(totalHeight > $(plugin.element).height())
                {
                    if (type == 'animate' && $(plugin.options.bar).length)
                    {
                        plugin.waitMethod = 'animate';
                        var animateConfig = new Object;
                        animateConfig[plugin.options.bar_config.attr] = plugin.options.bar_config.to;
    
                        plugin.load_animation = $(plugin.options.bar).animate(animateConfig,
                        {
                            duration : duration,
                            easing : plugin.options.bar_config.easing,
                            complete : function()
                            {
                                if ($.isFunction(callback) && !(plugin.stopped == true))
                                {
                                    callback();
                                }
                            }
                        });
                    }
                    else
                    {
                        plugin.waitMethod = 'timeout';
                        plugin.load_animation = setTimeout(function()
                        {
                            if ($.isFunction(callback) && !(plugin.stopped == true))
                            {
                                callback();
                            }
                        }, duration);
                    }
                }
                else
                {
                    plugin.load_animation = setTimeout(function()
                    {
                        if ($.isFunction(callback) && !(plugin.stopped == true))
                        {
                            callback();
                        }
                    }, duration);
                }
            },

            stop : function()
            {
                var plugin = this;
                plugin.stopped = true;
                if (plugin.waitMethod == 'animate')
                {
                    plugin.load_animation.stop();
                }
                else
                {
                    clearTimeout(plugin.load_animation);
                }
            },

            resume : function()
            {
                var plugin = this;
                plugin.stopped = false;
                if(plugin.options.transition == 'animate')
                {
                    plugin.remaining_duration = plugin.options.delay - (($(plugin.options.bar)[0].style.width.split('%')[0] / 100) * plugin.options.delay);
                }
                else
                {
                    plugin.remaining_duration = plugin.options.delay;
                }
                plugin._fnWait(plugin.options.transition, plugin.remaining_duration, function()
                {
                    plugin.forward();
                    plugin._fnRun();
                });
            },

            _fnRun : function()
            {
                var plugin = this;
                $(plugin.options.bar).css(plugin.options.bar_config.attr, plugin.options.bar_config.from);
                plugin._fnWait(plugin.options.transition, plugin.options.delay, function()
                {
                    if (!plugin.stopped == true)
                    {
                        plugin.options.before($(plugin.element).find('li:first'));
                        plugin.forward();
                        plugin._fnRun();
                    }
                });
            }
        });
    }(jQuery));
