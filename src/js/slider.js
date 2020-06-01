(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        window.Slider = factory();
    }
} (this, function () {
    if (!Array.prototype.reduce) {
        Array.prototype.reduce = function (callback) {
            if (this === null) {
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            var k = 0;
            var value;
    
            if (arguments.length >= 2) {
                value = arguments[1];
            } else {
                while (k < len && !(k in o)) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError( 'Reduce of empty array ' +
                        'with no initial value' );
                }
                value = o[k++];
            }
    
            while (k < len) {
                if (k in o) {
                    value = callback(value, o[k], k, o);
                }
    
                k++;
            }
    
            return value;
        }
    }

    Element.prototype.styles = function () {
        if( typeof arguments[0] == 'string' ) {
            this.style[arguments[0]] = arguments[1];
        } else {
            for( var key in arguments[0] ) {
                this.style[key] = arguments[0][key];
            }
        }    
        
        return this;
    }
    if( !('addEventListener' in Element.prototype) ) {
        document.addEventListener = function (e,fn) {
            if( document.readyState === "complete" ) {
                fn()
            } else {
                document.attachEvent('onreadystatechange',function () {
                    if( document.readyState === "complete" ) fn();
                    else document.addEventListener(null,fn);
                })
            }
        }
        window.addEventListener = function (e,fn) {
            window.attachEvent('onload',fn)
        }
    
        Element.prototype.addEventListener = function (eventName,fn) {
            var element = this;
            element.attachEvent('on'+eventName,function () {
                fn.call(element);
            })
        }
    }
    if (!('classList' in Element.prototype)) {
        function ClassList(element) {
            this.element = element;
        }
    
        ClassList.prototype = {
            add: function(name) {
                if (!this.contains(name)) {
                    this.element.className += this.element.className.length > 0 ? ' ' + name : name;
                }
                return this.element;
            },
            remove: function(name) {
                this.element.className = this.element.className.replace(regExp(name), '');
                return this.element;
            },
            toggle: function(name) {
                this.contains(name) ? this.remove(name) : this.add(name);
                return this.element;
            },
            contains: function(name) {
                return regExp(name).test(this.element.className);
            },
            replace: function(oldName, newName) {
                this.remove(oldName), this.add(newName);
                return this.element;
            }
        };
    
        Object.defineProperty(Element.prototype, 'classList', {
            get: function() {
                return new ClassList(this);
            }
        });
    }
    var EASING_TRANSLATE = {
        'easingInQuad' : 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'easeInCubic' : 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        'easeInQuart' : 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
        'easeInQuint' : 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
        'easeInSine' : 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
        'easeInExpo' : 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
        'easeInCirc' : 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
        'easeInBack' : 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
        'easeOutQuad' : 'cubic-bezier(0.250, 0.460, 0.450, 0.940),',
        'easeOutCubic' : 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        'easeOutQuart' : 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        'easeOutExpo' : 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        'easeOutCirc' : 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        'easeInOutQuad' : 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        'easeInOutCubic' : 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        'easeInOutQuart' : 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'easeInOutSine' : 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
        'easeInOutExpo' : 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
        'easeInOutCirc' : 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
        'easeInOutBack' : 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
        'default' : 'ease'
    };
    
    function Slider (options) {
        options =  [sliderDefaultOption,options].reduce(function (r,o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, {});
        this.constructor(options).init();
    }

    Slider.prototype.constructor = function (options) {
        this.slider =  typeof options.slider == 'string' ? document.querySelector(options.slider) : options.slider;
        this.root = options.root || this.slider;
        this.list = typeof options.list === 'string' ? this.root.querySelector(options.list) : options.list;
        this.item = typeof options.item === 'string' ? this.root.querySelectorAll(options.item) : options.item;

        if(!this.list) {
            this.list = this.slider.children[0];
        }
        if(!this.item && this.list) {
            this.item = [];
            var listChildren = this.list.children;
            for(var i = 0, childrenCount = listChildren.length; i < childrenCount; i ++) {
                this.item[i] = listChildren.item(i);
            }
        };
        this.navPrev = options.nav.prev
            ? typeof options.nav.prev === 'string' ? this.root.querySelector(options.nav.prev) : options.nav.prev
            : null;
        this.navNext = options.nav.next
            ? typeof options.nav.next === 'string' ? this.root.querySelector(options.nav.next) : options.nav.next
            : null;

        this.pagination = options.pagination 
            ? typeof options.pagination === 'string' 
                ? this.root.querySelector(options.pagination) 
                : options.pagination
            : null;
        this.toggle = options.toggle
            ? typeof options.toggle === 'string' 
                ? this.root.querySelector(options.toggle)
                : options.toggle
            : null;
        this.paginationOption = options.paginationOption;
        this.direction = options.direction ? options.direction : 'vertical';
        this.loop = options.loop;
        this.preview = options.preview;
        this.autoPlay = options.autoPlay;
        this.autoSize = options.autoSize;
        this.speed = options.speed;
        this.mode = options.mode;
        this.autoSpeed = options.autoSpeed;
        if( this.mode == 'slide' ) this.page = this.preview === true ? -2 : -1;
        else this.page = 0;
        this.timeout = null;
        this.onChange = options.onChange || null
        this.onInit = options.onInit || null;
        this.easing = options.easing || 'default';

        return this;
    }

    Slider.prototype._loopItem = function (callback) {
        for( var i = 0; i < this.item.length; i ++ ) {
            callback.call(this,this.item[i],i);
        }
    }

    Slider.prototype._reset = function (page, timeout) {
        var app = this;
        this.page = page;
        setTimeout(function () {
            app.list.styles({
                transitionDuration : '0ms',
                transform: 'translate'+(this.direction === 'vertical' ? 'Y' : 'X') + '('+page*app.slider.offsetWidth+'px)',
            })
        },timeout);
    }

    Slider.prototype._setElement = function () {
        var app = this;
        var executeWindowSize = window.innerWidth;

        this.slider.style.overflow = 'hidden';
        if( this.mode == 'slide' ) slide.call(this);
        if( this.mode == 'fade' ) fade.call(this);
        
        if(this.pagination) {
            var paginationTagName = this.pagination.tagName.toLowerCase();

            switch( this.pagination.tagName.toLowerCase() ) {
                case 'ul' : paginationTagName = 'li'; break;
            }

            this._loopItem(function (item,i) {
                var button = document.createElement(paginationTagName);
                button.setAttribute('data-slider', 'pagination');
                button.setAttribute('data-index', i);
                button.classList.add(app.paginationOption.className || '');
                button.appendChild(document.createTextNode(i+1));
                button.addEventListener(eventType[ executeWindowSize > 1140 ? 'desktop' : 'mobile' ].start, function (e) {
                    e.stopPropagation();
                    app.move(null,i);
                })
            
                this.pagination.appendChild(button);
            })

            this.paginations = this.root.querySelectorAll('[data-slider="pagination"]');
            if(this.paginations.length) {
                this.paginations[0].classList.add(app.paginationOption.activeClassName);
            }
        }

        if( this.direction == 'vertical' || this.autoSize === true || this.mode == 'fade' ) _setSize.call(this);

        function slide () {
            this.list.styles({
                transform: 'translate'+(this.direction === 'vertical' ? 'Y' : 'X') + '('+this.page*this.slider.offsetWidth+'px)',
                transform: 'translate'+( this.direction == 'vertical' ? 'Y' : 'X' )+'('+( this.direction == 'vertical' ? this.slider.offsetHeight*this.page : this.slider.offsetWidth*this.page )+'px)',
                transitionDuration : '0ms',
                transitionTimingFunction : EASING_TRANSLATE[this.easing],
                fontSize : 0,
            }).styles( this.direction == 'vertical' ? 'height' : 'width','100%' );
            if( this.direction != 'vertical' ) this.list.style.whiteSpace = 'nowrap';

            this._loopItem(function (item) {
                if( app.direction != 'vertical' ) item.style.display = 'inline-block';
                item.styles(app.direction == 'vertical' ? 'height' : 'width','100%').style.fontSize = window.getComputedStyle(this.slider).getPropertyValue('font-size');
                
            })
            var itemCloneFirst = this.item[0].cloneNode(true);
            var itemCloneLast = this.item[this.item.length-1].cloneNode(true);
            this.list.insertAdjacentElement('beforeend',itemCloneFirst);
            this.list.insertAdjacentElement('afterbegin',itemCloneLast);
        }

        function fade () {
            this.list.style.position = 'relative';
            this._loopItem(function (item,index) {
                item.styles({ left : '0', top: '0', opacity : '0', zIndex : '1', 'transition' : 'opacity '+app.speed+'ms '+EASING_TRANSLATE[app.easing] });
                if( index == 0 ) item.styles({ opacity : '1', zIndex : '5' });
            })
        }
        if( this.onInit ) this.onInit.call(this);
    }

    Slider.prototype._autoplay = function () {
        var app = this;
        if( this.autoPlay ) {
            this.timeout = setTimeout(function () {
                if( app.autoPlay ) {
                    app.move(-1);
                }
            },app.autoSpeed)
        }
    }
    
    Slider.prototype._drag = function () {
        var app = this;
        var isTouch = false;
        var startEvent = null;
        var startPosition = null;
        var movePosition = null;
        var windowSize = window.innerWidth;

        this.slider.addEventListener(eventType[ windowSize > 1140 ? 'desktop' : 'mobile' ].start,function (e) {
            if( app.slider.classList.contains('play') || isTouch === true ) return;
            isTouch = true;
            startEvent = e;
            startPosition = e[app.direction === 'vertical'? 'clientY' : 'clientX'];
        },false)

        this.slider.addEventListener(eventType[ windowSize > 1140 ? 'desktop' : 'mobile' ].end,function (e) {
            if( app.slider.classList.contains('play') || isTouch === false ) return;
            e.stopPropagation();
            e.stopImmediatePropagation();
            isTouch = false;
            var speed = e.timeStamp - startEvent.timeStamp;
            var position = e[app.direction === 'vertical'? 'clientY' : 'clientX'];

            if( movePosition !== null ) {
                if (position < startPosition && speed < 200) app.move(-1, null, speed * 2)
                else if (position > startPosition && speed < 200) app.move(1, null, speed * 2)
                else app.move(null, (app.page * -1) - 1, speed * 2);
            } else {
                app.move(null, (app.page * -1) - 1, speed * 2);
            }

        },false)

        this.slider.addEventListener(eventType[ windowSize > 1140 ? 'desktop' : 'mobile' ].move,function (e) {
            e.preventDefault();
            if( app.slider.classList.contains('play') || isTouch === false ) return;
            e.stopPropagation();
            e.stopImmediatePropagation();

            movePosition = e[app.direction === 'vertical'? 'clientY' : 'clientX'];
            var position = app.slider[app.direction === 'vertical'? 'offsetHeight' : 'offsetWidth' ] * app.page;
            var d = position - ( startPosition - movePosition );

            app.list.styles({
                transform: 'translate'+( app.direction == 'vertical' ? 'Y' : 'X' )+'('+d+'px)',
                transitionDuration : '0ms',
            })
        },false)
    }

    function _setSize () {
        var app = this;
        var images = this.list.querySelectorAll('img');
        var imageSizes = [];

        function imagesLoadComplate(images) {
            if( typeof index == 'undefined' ) index = 0;

            if( index != images.length-1 ) {
                var image = images[index];
                if( image.complete === true ) {
                    index += 1;
                    imageSizes.push({width:image.width, height:image.height});
                    imagesLoadComplate(images);
                } else {
                    image.addEventListener('load',function () {
                        imagesLoadComplate(images);
                    })
                }
            } else {
                var sortCriterion = app.direction == 'vertical' ? 'height' : 'width';
                if( app.mode == 'fade' ) {
                    sortCriterion = 'height';
                    app._loopItem(function (item) {
                        item.style.position = 'absolute';
                    })
                }
                imageSizes.sort(function (a,b) {
                    return ((a[sortCriterion] < b[sortCriterion]) ? -1 : ((a[sortCriterion] > b[sortCriterion]) ? 1 : 0));
                })

                app.slider.style[sortCriterion] = imageSizes[0][[sortCriterion]] + 'px';
            }
        }

        if( images.length > 0 ) {
            imagesLoadComplate(images);
        }
    }

    Slider.prototype.play = function () {
        this.autoPlay = true;
        this._autoplay();
    }

    Slider.prototype.stop = function () {
        this.autoPlay = false;
        this._autoplay();
    }

    Slider.prototype.move = function (direction,target,speed) {
        var app = this;
        if( this.slider.classList.contains('play') ) return;
        if( this.timeout !== null && this.autoPlay === true ) clearTimeout(this.timeout);
        this.slider.classList.add('play');
        speed = speed ? speed*2 : this.speed;
        if( speed > this.speed ) speed = this.speed;

        if( this.mode == 'slide' ) slide.call(this);
        if( this.mode == 'fade' ) fade.call(this);

        function slide () {
            if( target ) target = ( target * -1 ) -1;
            if( target === 0 ) target = -1;
            var page = direction === null ? target : this.page + direction;
            if( false === this.loop ) {
                if( page >= 0 || page < ( this.item.length * -1 ) ) return
            }

            this.list.styles({
                transitionDuration:speed+'ms',
                transform: 'translate'+( this.direction == 'vertical' ? 'Y' : 'X' )+'('+( this.direction == 'vertical' ? this.slider.offsetHeight*page : this.slider.offsetWidth*page )+'px)',
            });

            this.page = page;

            if( true === this.loop ) {
                if( page >= 0 && direction > 0 ) this._reset(this.item.length * -1, speed);
                if( page < ( this.item.length * -1 ) && direction < 0 ) this._reset(this.preview === true ? -2 : -1, speed);
            }
            if( this.onChange ) this.onChange( ( this.page * -1 ) -1 );
        }

        function fade () {
            var page = direction === null ? target : ( Number(this.page) + Number(direction) * -1 );
            if( page == this.item.length ) {
                this.page = this.item.length-1
                page = 0;
            }
            this.item[this.page].styles({ opacity : '0', zIndex : '1' })
            this.item[page].styles({ opacity : '1', zIndex : '5' });
            this.page = page;
        }

        if( this.pagination ) {
            this._loopItem(function (item,index) {
                app.paginations[index].classList.remove(app.paginationOption.activeClassName);
            });

            var page = this.mode == 'fade' ? this.page : (app.page*-1)-1;
            this.paginations[page].classList.add(app.paginationOption.activeClassName);
        }

        setTimeout(function () {
            app.slider.classList.remove('play');
            app._autoplay();
        },speed);
    }

    Slider.prototype.resize = function () {
        if( this.timeout !== null && this.autoPlay === true ) clearTimeout(this.timeout);
        if( this.slider.classList.contains('play') ) return;

        this.list.styles({
            transform: 'translate'+( this.direction == 'vertical' ? 'Y' : 'X' )+'('+( this.direction == 'vertical' ? this.slider.offsetHeight*this.page : this.slider.offsetWidth*this.page )+'px)',
            transitionDuration : '0ms',
        })
        if( this.autoPlay === true ) this._autoplay();
    }

    Slider.prototype.init = function () {
        var app = this;
        var executeWindowSize = window.innerWidth;
        this._setElement();
        
        if(this.navPrev) {
            this.navPrev.addEventListener(eventType[ executeWindowSize > 1140 ? 'desktop' : 'mobile' ].start, function (e) {
                e.stopPropagation();
                app.move(1);
            });
        }
        if(this.navNext) {
            this.navNext.addEventListener(eventType[ executeWindowSize > 1140 ? 'desktop' : 'mobile' ].start, function (e) {
                e.stopPropagation();
                app.move(-1);
            })
        }

        if( null !== this.toggle ) {
            this.toggle.addEventListener(eventType[ executeWindowSize > 1140 ? 'desktop' : 'mobile' ].start,function () {
                if( app.autoPlay === true ) {
                    app.autoPlay = false;
                    this.classList.add('play')
                } else {
                    app.autoPlay = true;
                    this.classList.remove('play');
                    _autoplay();
                }
            },false)
        }
        window.addEventListener('resize',function () {
            app.resize();
            if( (executeWindowSize > 1140 && this.innerWidth < 1140) || (executeWindowSize < 1140 && this.innerWidth > 1140) ) app.init();
        })

        this._drag();
        this._autoplay();
    }

    var sliderDefaultOption = {
        speed : 800,
        autoSpeed : 2000,
        autoPlay : true,
        autoSize : false,
        loop : true,
        direction : 'horizontal',
        preview : false,
        mode : 'slide',
        easing : 'default',
        paginationOption: {
            className : 'pagination',
            activeClassName : 'active'
        },
        nav: {
            prev: '',
            next: ''
        },
        onset: null,
    };

    var eventType = {
        mobile : {
            start : 'touchstart',
            move : 'touchmove',
            end : 'touchend'
        },
        desktop : {
            start : 'mousedown',
            move : 'mousemove',
            end : 'mouseup'
        }
    };


    return Slider;
}))
