Array.prototype.remove = function(from, to) {
    this.splice(from, (to = [0, from || 1, ++to - from][arguments.length]) < 0 ? this.length + to : to);
    return this.length;
};

function viewportWrapper(args) {
    'use strict';


    console.log('trigger');
    var args = {}

    // http://webfieldmanual.com/guides/cutting-the-mustard.html

    if (window.requestAnimationFrame && document.documentElement.classList) {

        // Passes the test so add enhanced class to HTML tag
        document.documentElement.classList.add(args.targetClassname);

        // Throttle
        // https://underscorejs.org/#throttle
        var throttle = function(func, wait, options) {
            var _ = {
                now: Date.now || function() {
                    return new Date().getTime();
                }
            };
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) {
                options = {};
            }
            var later = function() {
                previous = options.leading === false ? 0 : _.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            };
            return function() {
                var now = _.now();
                if (!previous && options.leading === false) {
                    previous = now;
                }
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) {
                        context = args = null;
                    }
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        };

        // requestAnimationFrame
        // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        var _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;

        // Global class for revealing element
        var revealer = document.querySelectorAll(`.${args.targetClassname}`);

        // Get the viewport (window) dimensions
        var getViewportSize = function() {
            return {
                width: window.document.documentElement.clientWidth,
                height: window.document.documentElement.clientHeight
            };
        };

        // Get the current scoll position
        var getCurrentScroll = function() {
            return {
                x: window.pageXOffset,
                y: window.pageYOffset
            };
        };

        // Get element dimensions and position
        var getElemInfo = function(elem) {
            var offsetTop = 0;
            var offsetLeft = 0;
            var offsetHeight = elem.offsetHeight;
            var offsetWidth = elem.offsetWidth;

            do {
                if (!isNaN(elem.offsetTop)) {
                    offsetTop += elem.offsetTop;
                }
                if (!isNaN(elem.offsetLeft)) {
                    offsetLeft += elem.offsetLeft;
                }
            } while ((elem = elem.offsetParent) !== null);

            return {
                top: offsetTop,
                left: offsetLeft,
                height: offsetHeight,
                width: offsetWidth
            };
        };

        // Check visibility of the element in the viewport
        var checkVisibility = function(elem) {
            var viewportSize = getViewportSize();
            var currentScroll = getCurrentScroll();
            var elemInfo = getElemInfo(elem);
            var spaceOffset = 0.2;
            var elemHeight = elemInfo.height;
            var elemWidth = elemInfo.width;
            var elemTop = elemInfo.top;
            var elemLeft = elemInfo.left;
            var elemBottom = elemTop + elemHeight;
            var elemRight = elemLeft + elemWidth;

            var checkBoundaries = function() {
                // Defining the element boundaries and extra space offset
                var top = elemTop + elemHeight * spaceOffset;
                var left = elemLeft + elemWidth * spaceOffset;
                var bottom = elemBottom - elemHeight * spaceOffset;
                var right = elemRight - elemWidth * spaceOffset;

                // Defining the window boundaries and window offset
                var wTop = currentScroll.y + 0;
                var wLeft = currentScroll.x + 0;
                var wBottom = currentScroll.y - 0 + viewportSize.height;
                var wRight = currentScroll.x - 0 + viewportSize.width;

                // Check if the element is within boundary
                return (top < wBottom) && (bottom > wTop) && (left > wLeft) && (right < wRight);
            };

            return checkBoundaries();
        };

        // Run a loop with checkVisibility() and add / remove classes to the elements
        var toggleElement = function() {
            for (var i = 0; i < revealer.length; i++) {
                if (checkVisibility(revealer[i])) {
                    revealer[i].classList.add(args.animation);
                    revealer[i].classList.remove('vp-hidden');
                } else {
                    revealer[i].classList.remove(args.animation);
                    revealer[i].classList.add('vp-hidden');
                }
            }
        };

        // Throttle events and requestAnimationFrame
        var scrollHandler = throttle(function() {
            _requestAnimationFrame(toggleElement);
        }, 300);

        var resizeHandler = throttle(function() {
            _requestAnimationFrame(toggleElement);

        }, 300);

        if (args.type == 'scroll') scrollHandler()
        else if (args.type === 'resize') resizeHandler()

    }


};

// Listening for events
function setViewPostWrapper() {
    var scrollFunc = viewportWrapper({
        'targetClassname': 'reveal-standard',
        'animation': 'slide-in-left-animation',
        'type': 'scroll'
    })
    var resizeFunc = viewportWrapper({
        'targetClassname': 'reveal-standard',
        'animation': 'slide-in-left-animation',
        'type': 'resize'
    })

    window.addEventListener('scroll', () => scrollFunc, false)
    window.addEventListener('resize', resizeFunc, false);
    // } else if (window.attachEvent) {
    //     window.attachEvent('onscroll', scrollHandler);
    //     window.attachEvent('onresize', resizeHandler);
    // } else {
    //     window.onscroll = scrollHandler;
    //     window.onresize = resizeHandler;
    // }
}

var viewAnimations = [{
    'elements': 'reveal-standard',
    'animation': 'pop-up-animation',
}, {
    'elements': 'slide-in-left',
    'animation': 'slide-in-left',
}, {
    'elements': 'slide-in-right',
    'animation': 'slide-in-right',
}]

// setViewpointAnimations(viewAnimations)

function setViewpointAnimations(targetObjects) {
    targetObjects.forEach(target => {
        for (let i in target.elements) {
            onViewport(target.elements[i], target.animation, target.offset, target.callback);
        }
    })
}

// onViewport('section', 'slide-in-left-animation')






function isElementInViewport(element, index) {
    var rect = element.getBoundingClientRect()
    var offset = rect.height - 100
    return (
        rect.top >= -offset &&
        rect.left >= offset &&
        rect.bottom <= (window.innerHeight + offset || document.documentElement.clientHeight + offset) &&
        rect.right <= (window.innerWidth + offset || document.documentElement.clientWidth + offset)
    );
}

var elements = document.querySelectorAll(".slide-in-left");

var elementCooldowns = []

function viewpointWrapper() {
    for (var i = 0; i < elements.length; i++) {
        console.log(elementCooldowns.includes(i));
        if (!elementCooldowns.includes(i)) {
            if (isElementInViewport(elements[i])) {
                elements[i].classList.add("slide-in-left-animation");
                elementCooldowns.push(i)
                setTimeout(() => {
                    elementCooldowns.remove(i)
                }, 1000);
            } else {
                elements[i].classList.remove("slide-in-left-animation");
            }
        }
    }
}

window.addEventListener("load", viewpointWrapper);
window.addEventListener("scroll", viewpointWrapper);