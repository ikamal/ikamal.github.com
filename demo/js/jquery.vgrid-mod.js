/**
 * jQuery VGrid v0.1.9 - variable grid layout plugin
 *
 * Terms of Use - jQuery VGrid
 * under the MIT (http://www.opensource.org/licenses/mit-license.php) License.
 *
 * Copyright 2009-2012 xlune.com All rights reserved.
 * (http://blog.xlune.com/2009/09/jqueryvgrid.html)
 */
(function ($) {
    var runningFlag = 0;


    function makePos(self) {
        var _children = self.data("_vgchild");
        var _width = self.width();
        var _matrix = [
            [0, _width, 0]
        ];
        var _hmax = 0, _c, _size, _point;
        _children.each(function (i) {
            _c = $(this);
            if (_c.css("display") == "none") {
                return true;
            }
            _size = getSize(_c);
            _point = getAttachPoint(_matrix, _size[0]);
            _matrix = updateAttachArea(_matrix, _point, _size);
            _hmax = Math.max(_hmax, _point[1] + _size[1]);
            _c.data("_vgleft", _point[0]);
            _c.data("_vgtop", _point[1]);
            _c.data("_vgwidth", _c.width());
            _c.data("_vgheight", _c.height());
        });
        self.data("_vgwrapheight", _hmax);
        heightTo(self);
    };
    function getAttachPoint(mtx, width) {
        var _mtx = mtx.concat().sort(matrixSortDepth);
        var _max = _mtx[_mtx.length - 1][2];
        for (var i = 0, imax = _mtx.length; i < imax; i++) {
            if (_mtx[i][2] >= _max) break;
            if (_mtx[i][1] - _mtx[i][0] >= width) {
                return [_mtx[i][0], _mtx[i][2]];
            }
        }
        return [0, _max];
    };
    function updateAttachArea(mtx, point, size) {
        var _mtx = mtx.concat().sort(matrixSortDepth);
        var _cell = [point[0], point[0] + size[0], point[1] + size[1]];
        for (var i = 0, imax = _mtx.length; i < imax; i++) {
            if (_cell[0] <= _mtx[i][0] && _mtx[i][1] <= _cell[1]) {
                delete _mtx[i];
            }
            else {
                _mtx[i] = matrixTrimWidth(_mtx[i], _cell);
            }
        }
        return matrixJoin(_mtx, _cell);
    };
    function matrixSortDepth(a, b) {
        if (!a || !b) return 0;
        return ((a[2] == b[2] && a[0] > b[0]) || a[2] > b[2]) ? 1 : -1;
    };
    function matrixSortX(a, b) {
        if (!a || !b) return 0;
        return (a[0] > b[0]) ? 1 : -1;
    };
    function matrixJoin(mtx, cell) {
        var _mtx = mtx.concat([cell]).sort(matrixSortX);
        var _mtx_join = [];
        for (var i = 0, imax = _mtx.length; i < imax; i++) {
            if (!_mtx[i]) continue;
            if (_mtx_join.length > 0
                && _mtx_join[_mtx_join.length - 1][1] == _mtx[i][0]
                && _mtx_join[_mtx_join.length - 1][2] == _mtx[i][2]) {
                _mtx_join[_mtx_join.length - 1][1] = _mtx[i][1];
            }
            else {
                _mtx_join.push(_mtx[i]);
            }
        }
        return _mtx_join;
    };
    function matrixTrimWidth(a, b) {
        if (a[0] >= b[0] && a[0] < b[1] || a[1] >= b[0] && a[1] < b[1]) {
            if (a[0] >= b[0] && a[0] < b[1]) {
                a[0] = b[1];
            }
            else {
                a[1] = b[0];
            }
        }
        return a;
    };
    function getSize(child) {
//        console.log(child.data('_vg-to-size'));
        var _w = 0;
        var _h = 0;
        if (child.data('_vg-to-size')) {
            _w = child.data('_vg-to-size').width;
            _h = child.data('_vg-to-size').height;
            child.removeData('_vg-to-size');
        } else {
            _w = child.width();
            _h = child.height();
        }
        _w += Number(child.css("margin-left").replace('px', ''))
            + Number(child.css("padding-left").replace('px', ''))
            + Number(child.get(0).style.borderLeftWidth.replace('px', ''))
            + Number(child.css("margin-right").replace('px', ''))
            + Number(child.css("padding-right").replace('px', ''))
            + Number(child.get(0).style.borderRightWidth.replace('px', ''));
        _h += Number(child.css("margin-top").replace('px', ''))
            + Number(child.css("padding-top").replace('px', ''))
            + Number(child.get(0).style.borderTopWidth.replace('px', ''))
            + Number(child.css("margin-bottom").replace('px', ''))
            + Number(child.css("padding-bottom").replace('px', ''))
            + Number(child.get(0).style.borderBottomWidth.replace('px', ''));
//        console.log([_w, _h]);
        return [_w, _h];
    };
    function heightTo(self) {
        var _self = self;
        var _delay = _self.data("_vgchild").length
            * (_self.data("_vgopt").delay || 0)
            + _self.data("_vgopt").time || 500;
        _self.stop();
        if (_self.height() < _self.data("_vgwrapheight")) {
            if ($.browser.msie) {
                _self.height(_self.data("_vgwrapheight"));
            }
            else {
                _self.animate(
                    {
                        height:_self.data("_vgwrapheight") + "px"
                    },
                    (_self.data("_vgopt").time || 500),
                    "easeOutQuart"
                );
            }
        }
        else {
            clearTimeout(_self.data("_vgwraptimeout"));
            _self.data("_vgwraptimeout", setTimeout(function () {
                if ($.browser.msie) {
                    _self.height(_self.data("_vgwrapheight"));
                }
                else {
                    _self.animate(
                        {
                            height:_self.data("_vgwrapheight") + "px"
                        },
                        (_self.data("_vgopt").time || 500),
                        "easeOutQuart"
                    );
                }
            }, _delay));
        }
    };
    function moveTo(children) {
        var _c;
        children.each(function (i) {
            _c = $(this);
            _c.css("left", _c.data("_vgleft") + "px");
            _c.css("top", _c.data("_vgtop") + "px");
        });
    };
    function animateTo(children, easing, time, delay) {
        var _self = $(children).parent();
        var isMove = false;
        var imax = children.length;
        var i, _c, _pos;
        for (i = 0; i < imax; i++) {
            _c = $(children[i]);
            _pos = _c.position();
            if (_pos.left != _c.data("_vgleft")
                || _pos.top != _c.data("_vgtop")
                || _c.width() != _c.data("_vgwidth")
                || _c.height() != _c.data("_vgheight")) {
                isMove = true;
            }
        }
        if (isMove) {
            if (typeof(_self.data("_vgopt").onStart) == "function") _self.data("_vgopt").onStart();
            children.each(function (i) {
                var _c = $(this);
                var _opt = {
                    duration:time,
                    easing:easing
                };
                if (children.size() - 1 == i) {
                    _opt.complete = wrapFinishFunction(_self,delay);//_self.data("_vgopt").onFinish || null;
                }
                clearTimeout(_c.data("_vgtimeout"));
                _c.data("_vgtimeout", setTimeout(function () {
                    _c.animate(
                        {
                            left:_c.data("_vgleft") + "px",
                            top:_c.data("_vgtop") + "px",
                            width:_c.data("_vgwidth") + "px",
                            height:_c.data("_vgheight") + "px"
                        },
                        _opt
                    );
                }, delay)); //i*delay
            });
        }
    };
    function refreshHandler(tg) {
        tg.each(function (num) {
            var _self = $(this);
            clearTimeout(_self.data("_vgtimeout"));
            _self.data("_vgtimeout", setTimeout(function () {
                makePos(_self);
                animateTo(
                    _self.data("_vgchild"),
                    _self.data("_vgopt").easing || "linear",
                    _self.data("_vgopt").time || 500,
                    _self.data("_vgopt").delay || 0
                );
            }, 500));
        });
    };
    function setFontSizeListener(self, func) {
        var s = $("<span />")
            .text(" ")
            .attr("id", "_vgridspan")
            .hide()
            .appendTo("body");
        s.data("size", s.css("font-size"));
        s.data("timer", setInterval(function () {
            if (s.css("font-size") != s.data("size")) {
                s.data("size", s.css("font-size"));
                func(self);
            }
        }, 1000));
    };
    function setImgLoadEvent(self, func) {
        if (!self.data("vgrid-image-event-added")) {
            self.data("vgrid-image-event-added", 1);
            self.bind("vgrid-added", function () {
                self.find("img").each(function () {
                    var img = $(this);
                    if (!img.data("vgrid-image-handler")) {
                        img.data("vgrid-image-handler", 1);
                        img.bind("load", function () {
                            func(self);
                        });
                    }
                });
            });
        }
        self.trigger("vgrid-added");
        var _append = self.append;
        var _prepend = self.prepend;
        self.append = function () {
            _append.apply(self, arguments);
            self.trigger("vgrid-added");
        };
        self.prepend = function () {
            _prepend.apply(self, arguments);
            self.trigger("vgrid-added");
        };
    };
    function bindFunc(self, target) {
        var _children = self.data("_vgchild");
        var _opt = self.data("_vgopt");
        _children.each(function (i) {
            var _c = $(this);
            _c.data('_vg-default-html', _c.html())
                .data('_vg-default-size', {width:_c.width(), height:_c.height()});

            _c.delegate(_opt.expand_btn, 'click', function (e) {
                if (runningFlag) {
                    return;
                }
                expand(_c, target);
            });
            _c.delegate(_opt.collapse_btn, 'click', function (e) {
                if (runningFlag) {
                    return;
                }
                collapse(_c, target);
            });
        });
    };
    function collapse(toSmall, target, toLarge) {
        var _defsize = toSmall.data('_vg-default-size');
        toSmall.data('_vg-to-size', _defsize);
        //{width:toLarge.width(),height:toLarge.height()}
        var _tmpsize = {width:toSmall.width(), height:toSmall.height()};
//        console.log(_tmpsize);
//        toSmall.css(_tmpsize)
//            .animate({'opacity':0.3},'fast')
//            .attr('data-enlarge', '0')
//            .animate(_defsize, 250, function () {
//                $(this).css({width:'auto', height:'auto'})
//                    .html(toSmall.data('_vg-default-html'))
//                    .animate({'opacity':1},500);
//            });
        toSmall.html(toSmall.data('_vg-default-html'));
        toSmall.data("_vgwidth", _defsize.width);
        toSmall.data("_vgheight", _defsize.height);

        if (toLarge) {
            expand(toLarge, target);
        } else {
            runningFlag = 0;
            target.vgrefresh();
        }
    }

    function expand(toLarge, target) {
        var expanded = target.find('[data-enlarge="1"]');
        var needCollapse = (expanded.length > 0);
        toLarge.append('<span class="loading_tip">loading...</span>');

        // simulate ajax loading status
        setTimeout(function () {
            var response_text = $('#ajax_content')[0].innerHTML;
            if (needCollapse) {
                collapse(expanded, target, toLarge);
            }
//            toLarge.html(response_text)
//                .attr('data-enlarge', '1')
//                .css('opacity',0.3)
//                .animate({'opacity':1},500);
            $('body').append('<div id="vg_grid_tmp" style="visibility:hidden;"></div>');
            $('#vg_grid_tmp').text(response_text);
//            $('#vg_grid_tmp').width();
            toLarge.data("_vgwidth", $('#vg_grid_tmp').width());
            toLarge.data("_vgheight",$('#vg_grid_tmp').height());
            $('#vg_grid_tmp').remove();
            toLarge.html(response_text);
            target.vgrefresh();
        }, 500);
    };
    function wrapFinishFunction(target,delay){
        var _enlarged = target.find('[data-enlarge="1"]');
        var _top = target.offset().top;
        if(_enlarged.length > 0){
            _top = _enlarged.offset().top;
        }
//        console.log(_top);
        setTimeout(function(){
            $("html, body").animate({scrollTop: _top}, 500);
        },delay);

        if(target.data("_vgopt").onFinish
            && typeof(target.data("_vgopt").onFinish) == 'function'){
            target.data("_vgopt").onFinish();
        }
    }
    $.fn.extend({
        vgrid:function (option) {
            var config = {
                "expand_btn":'.js_expand',
                "collapse_btn":'.close_ajax',
                "easeing":'linear',
                "useLoadImageEvent":true,
                "useFontSizeListener":false,
                "time":500,
                "delay":0,
                "fadeIn":null,
                "onStart":null,
                "onFinish":null
            };
            var _target = $(this);
//            var _opt = option || {};
            var _opt = $.extend({}, option, config);

            if (_opt.easeing) {
                _opt.easing = _opt.easeing;
            }
            _target.each(function () {
                var _self = $(this);
                _self.data("_vgopt", _opt);
                _self.data("_vgchild", _self.find("> *"));
                _self.data("_vgdefchild", _self.data("_vgchild"));
                _self.css({
                    "position":"relative",
                    "width":"auto"
                });
                _self.data("_vgchild").css("position", "absolute");
                bindFunc(_self, _target);
                makePos(_self);
                moveTo(_self.data("_vgchild"));
                if (_self.data("_vgopt").fadeIn) {
                    var _prop = (typeof(_self.data("_vgopt").fadeIn) == 'object')
                        ? _self.data("_vgopt").fadeIn
                        : {time:_self.data("_vgopt").fadeIn};
                    _self.data("_vgchild").each(function (i) {
                        var _c = $(this);
                        if (_c.css("display") == "none") {
                            return true;
                        }
                        _c.stop().css({opacity:0});
                        setTimeout(function () {
                            _c.stop().fadeTo(_prop.time || 250, 1);
                        }, i * (_prop.delay || 0));
                    });
                }
                $(window).resize(function (e) {
                    refreshHandler(_self);
                });
                if (_opt.useLoadImageEvent) setImgLoadEvent(_self, refreshHandler);
                if (_opt.useFontSizeListener) setFontSizeListener(_self, refreshHandler);

            });
            return _target;
        },
        vgrefresh:function (easing, time, delay, func) {
            var _target = $(this);
            _target.each(function () {
                var _obj = $(this);
                var _opt = _obj.data("_vgopt") || {};
                if (_obj.data("_vgchild")) {
                    _obj.data("_vgchild", _obj.find("> *"));
                    _obj.data("_vgchild").css("position", "absolute");
                    makePos(_obj);
                    time = typeof(time) == "number" ? time : _obj.data("_vgopt").time || 500;
                    delay = typeof(delay) == "number" ? delay : _obj.data("_vgopt").delay || 0;
                    animateTo(
                        _obj.data("_vgchild"),
                        easing || _obj.data("_vgopt").easing || "linear",
                        time,
                        delay
                    );
                    if (typeof(func) == 'function') {
                        setTimeout(
                            func,
                            _obj.data("_vgchild").length * delay + time
                        );
                    }
                }
                if (_opt.useLoadImageEvent) setImgLoadEvent(_obj, refreshHandler);
            });
            return _target;
        },
        vgsort:function (func, easing, time, delay) {
            var _target = $(this);
            _target.each(function () {
                var _obj = $(this);
                if (_obj.data("_vgchild")) {
                    _obj.data("_vgchild", _obj.data("_vgchild").sort(func));
                    _obj.data("_vgchild").each(function (num) {
                        $(this).appendTo(_obj);
                    });
                    makePos(_obj);
                    animateTo(
                        _obj.data("_vgchild"),
                        easing || _obj.data("_vgopt").easing || "linear",
                        typeof(time) == "number" ? time : _obj.data("_vgopt").time || 500,
                        typeof(delay) == "number" ? delay : _obj.data("_vgopt").delay || 0
                    );
                }
            });
            return _target;
        },
        vgfilter:function (str, easing, time, delay) {
            var _target = $(this);
            _target.each(function () {
                var _obj = $(this);
                if (_obj.data("_vgchild")) {
                    _obj.data("_vgchild").each(function () {
                        var _self = $(this);
                        var _key = $(this).attr('data-key') || '';
                        if (str != '' && _key.indexOf(str) == -1) {
                            _self.fadeOut();
                        } else {
                            _self.fadeIn();
                        }
                    });
                    clearTimeout(_target.data("_vgtimeout"));
                    _target.data("_vgtimeout", setTimeout(function () {
                        makePos(_obj);
                        animateTo(
                            _obj.data("_vgchild"),
                            easing || _obj.data("_vgopt").easing || "linear",
                            typeof(time) == "number" ? time : _obj.data("_vgopt").time || 500,
                            typeof(delay) == "number" ? delay : _obj.data("_vgopt").delay || 0
                        );
                    }, 500));
                }
            });
            return _target;
        }
    });
})(jQuery);
