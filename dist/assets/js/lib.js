/**
* NET54-Refactor-Template v1.0.0
* Author : Gergely Olah 
* Copyright 2015
* Licensed under MIT
*/
/*!
 * Modernizr v2.7.2
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.7.2',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   goo.gl/v3V4Gp
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

/*! jQuery v2.1.4 | (c) 2005, 2015 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.4",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)+1>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b="length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N=M.replace("w","w#"),O="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+N+"))|)"+L+"*\\]",P=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+O+")*)|.*)\\)|)",Q=new RegExp(L+"+","g"),R=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),S=new RegExp("^"+L+"*,"+L+"*"),T=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),U=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),V=new RegExp(P),W=new RegExp("^"+N+"$"),X={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+O),PSEUDO:new RegExp("^"+P),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,aa=/[+~]/,ba=/'|\\/g,ca=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),da=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ea=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(fa){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],k=b.nodeType,"string"!=typeof a||!a||1!==k&&9!==k&&11!==k)return d;if(!e&&p){if(11!==k&&(f=_.exec(a)))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return H.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName)return H.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=1!==k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(ba,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+ra(o[l]);w=aa.test(a)&&pa(b.parentNode)||b,x=o.join(",")}if(x)try{return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function pa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=g.documentElement,e=g.defaultView,e&&e!==e.top&&(e.addEventListener?e.addEventListener("unload",ea,!1):e.attachEvent&&e.attachEvent("onunload",ea)),p=!f(g),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(g.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(g.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!g.getElementsByName||!g.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(g.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\f]' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){var b=g.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",P)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===g||a.ownerDocument===v&&t(v,a)?-1:b===g||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,h=[a],i=[b];if(!e||!f)return a===g?-1:b===g?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?la(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},g):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ca,da),a[3]=(a[3]||a[4]||a[5]||"").replace(ca,da),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ca,da).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(Q," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(ca,da),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return W.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(ca,da).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:oa(function(){return[0]}),last:oa(function(a,b){return[b-1]}),eq:oa(function(a,b,c){return[0>c?c+b:c]}),even:oa(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:oa(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:oa(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:oa(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function qa(){}qa.prototype=d.filters=d.pseudos,d.setFilters=new qa,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function ra(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function sa(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function ta(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ua(a,b,c){for(var d=0,e=b.length;e>d;d++)ga(a,b[d],c);return c}function va(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function wa(a,b,c,d,e,f){return d&&!d[u]&&(d=wa(d)),e&&!e[u]&&(e=wa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ua(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:va(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=va(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=va(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function xa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=sa(function(a){return a===b},h,!0),l=sa(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[sa(ta(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return wa(i>1&&ta(m),i>1&&ra(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&xa(a.slice(i,e)),f>e&&xa(a=a.slice(e)),f>e&&ra(a))}m.push(c)}return ta(m)}function ya(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=F.call(i));s=va(s)}H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&ga.uniqueSort(i)}return k&&(w=v,j=t),r};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=xa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,ya(e,d)),f.selector=a}return f},i=ga.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ca,da),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ca,da),aa.test(j[0].type)&&pa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&ra(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,aa.test(a)&&pa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+K.uid++}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){
return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var aa=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,ba=/<([\w:]+)/,ca=/<|&#?\w+;/,da=/<(?:script|style|link)/i,ea=/checked\s*(?:[^=]|=\s*.checked.)/i,fa=/^$|\/(?:java|ecma)script/i,ga=/^true\/(.*)/,ha=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ia={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ia.optgroup=ia.option,ia.tbody=ia.tfoot=ia.colgroup=ia.caption=ia.thead,ia.th=ia.td;function ja(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function ka(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function la(a){var b=ga.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function ma(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function na(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function oa(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pa(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=oa(h),f=oa(a),d=0,e=f.length;e>d;d++)pa(f[d],g[d]);if(b)if(c)for(f=f||oa(a),g=g||oa(h),d=0,e=f.length;e>d;d++)na(f[d],g[d]);else na(a,h);return g=oa(h,"script"),g.length>0&&ma(g,!i&&oa(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(ca.test(e)){f=f||k.appendChild(b.createElement("div")),g=(ba.exec(e)||["",""])[1].toLowerCase(),h=ia[g]||ia._default,f.innerHTML=h[1]+e.replace(aa,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=oa(k.appendChild(e),"script"),i&&ma(f),c)){j=0;while(e=f[j++])fa.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=ja(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=ja(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(oa(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&ma(oa(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(oa(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!da.test(a)&&!ia[(ba.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(aa,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(oa(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(oa(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&ea.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(oa(c,"script"),ka),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,oa(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,la),j=0;g>j;j++)h=f[j],fa.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(ha,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qa,ra={};function sa(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function ta(a){var b=l,c=ra[a];return c||(c=sa(a,b),"none"!==c&&c||(qa=(qa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qa[0].contentDocument,b.write(),b.close(),c=sa(a,b),qa.detach()),ra[a]=c),c}var ua=/^margin/,va=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wa=function(b){return b.ownerDocument.defaultView.opener?b.ownerDocument.defaultView.getComputedStyle(b,null):a.getComputedStyle(b,null)};function xa(a,b,c){var d,e,f,g,h=a.style;return c=c||wa(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),va.test(g)&&ua.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function ya(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),f.removeChild(c),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var za=/^(none|table(?!-c[ea]).+)/,Aa=new RegExp("^("+Q+")(.*)$","i"),Ba=new RegExp("^([+-])=("+Q+")","i"),Ca={position:"absolute",visibility:"hidden",display:"block"},Da={letterSpacing:"0",fontWeight:"400"},Ea=["Webkit","O","Moz","ms"];function Fa(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Ea.length;while(e--)if(b=Ea[e]+c,b in a)return b;return d}function Ga(a,b,c){var d=Aa.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Ha(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ia(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wa(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xa(a,b,f),(0>e||null==e)&&(e=a.style[b]),va.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Ha(a,b,c||(g?"border":"content"),d,f)+"px"}function Ja(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",ta(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xa(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fa(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Ba.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fa(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xa(a,b,d)),"normal"===e&&b in Da&&(e=Da[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?za.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Ca,function(){return Ia(a,b,d)}):Ia(a,b,d):void 0},set:function(a,c,d){var e=d&&wa(a);return Ga(a,c,d?Ha(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=ya(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ua.test(a)||(n.cssHooks[a+b].set=Ga)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wa(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Ja(this,!0)},hide:function(){return Ja(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Ka(a,b,c,d,e){return new Ka.prototype.init(a,b,c,d,e)}n.Tween=Ka,Ka.prototype={constructor:Ka,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ka.propHooks[this.prop];return a&&a.get?a.get(this):Ka.propHooks._default.get(this)},run:function(a){var b,c=Ka.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ka.propHooks._default.set(this),this}},Ka.prototype.init.prototype=Ka.prototype,Ka.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Ka.propHooks.scrollTop=Ka.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Ka.prototype.init,n.fx.step={};var La,Ma,Na=/^(?:toggle|show|hide)$/,Oa=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pa=/queueHooks$/,Qa=[Va],Ra={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Oa.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Oa.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sa(){return setTimeout(function(){La=void 0}),La=n.now()}function Ta(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ua(a,b,c){for(var d,e=(Ra[b]||[]).concat(Ra["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Va(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||ta(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Na.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?ta(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ua(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wa(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xa(a,b,c){var d,e,f=0,g=Qa.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=La||Sa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:La||Sa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wa(k,j.opts.specialEasing);g>f;f++)if(d=Qa[f].call(j,a,k,j.opts))return d;return n.map(k,Ua,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xa,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Ra[c]=Ra[c]||[],Ra[c].unshift(b)},prefilter:function(a,b){b?Qa.unshift(a):Qa.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xa(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pa.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Ta(b,!0),a,d,e)}}),n.each({slideDown:Ta("show"),slideUp:Ta("hide"),slideToggle:Ta("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(La=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),La=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ma||(Ma=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Ma),Ma=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Ya,Za,$a=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Za:Ya)),
void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Za={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$a[b]||n.find.attr;$a[b]=function(a,b,d){var e,f;return d||(f=$a[b],$a[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$a[b]=f),e}});var _a=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_a.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ab=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ab," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ab," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ab," ").indexOf(b)>=0)return!0;return!1}});var bb=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cb=n.now(),db=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var eb=/#.*$/,fb=/([?&])_=[^&]*/,gb=/^(.*?):[ \t]*([^\r\n]*)$/gm,hb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,ib=/^(?:GET|HEAD)$/,jb=/^\/\//,kb=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,lb={},mb={},nb="*/".concat("*"),ob=a.location.href,pb=kb.exec(ob.toLowerCase())||[];function qb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function rb(a,b,c,d){var e={},f=a===mb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function sb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function tb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function ub(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:ob,type:"GET",isLocal:hb.test(pb[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":nb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?sb(sb(a,n.ajaxSettings),b):sb(n.ajaxSettings,a)},ajaxPrefilter:qb(lb),ajaxTransport:qb(mb),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=gb.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||ob)+"").replace(eb,"").replace(jb,pb[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=kb.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===pb[1]&&h[2]===pb[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(pb[3]||("http:"===pb[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),rb(lb,k,b,v),2===t)return v;i=n.event&&k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!ib.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(db.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=fb.test(d)?d.replace(fb,"$1_="+cb++):d+(db.test(d)?"&":"?")+"_="+cb++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+nb+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=rb(mb,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=tb(k,v,f)),u=ub(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var vb=/%20/g,wb=/\[\]$/,xb=/\r?\n/g,yb=/^(?:submit|button|image|reset|file)$/i,zb=/^(?:input|select|textarea|keygen)/i;function Ab(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||wb.test(a)?d(a,e):Ab(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Ab(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Ab(c,a[c],b,e);return d.join("&").replace(vb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&zb.test(this.nodeName)&&!yb.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(xb,"\r\n")}}):{name:b.name,value:c.replace(xb,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Bb=0,Cb={},Db={0:200,1223:204},Eb=n.ajaxSettings.xhr();a.attachEvent&&a.attachEvent("onunload",function(){for(var a in Cb)Cb[a]()}),k.cors=!!Eb&&"withCredentials"in Eb,k.ajax=Eb=!!Eb,n.ajaxTransport(function(a){var b;return k.cors||Eb&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Bb;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Cb[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Db[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Cb[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Fb=[],Gb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Fb.pop()||n.expando+"_"+cb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Gb.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Gb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Gb,"$1"+e):b.jsonp!==!1&&(b.url+=(db.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Fb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Hb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Hb)return Hb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Ib=a.document.documentElement;function Jb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Jb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Ib;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ib})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Jb(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=ya(k.pixelPosition,function(a,c){return c?(c=xa(a,b),va.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Kb=a.jQuery,Lb=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Lb),b&&a.jQuery===n&&(a.jQuery=Kb),n},typeof b===U&&(a.jQuery=a.$=n),n});
//# sourceMappingURL=jquery.min.map
/*!
 * Bootstrap v3.3.5 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under the MIT license
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.5",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a(f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.5",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")?(c.prop("checked")&&(a=!1),b.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==c.prop("type")&&(c.prop("checked")!==this.$element.hasClass("active")&&(a=!1),this.$element.toggleClass("active")),c.prop("checked",this.$element.hasClass("active")),a&&c.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),a(c.target).is('input[type="radio"]')||a(c.target).is('input[type="checkbox"]')||c.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.5",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));return a>this.$items.length-1||0>a?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.5",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function c(c){c&&3===c.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=b(d),f={relatedTarget:this};e.hasClass("open")&&(c&&"click"==c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(e[0],c.target)||(e.trigger(c=a.Event("hide.bs.dropdown",f)),c.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger("hidden.bs.dropdown",f))))}))}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.5",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=b(e),g=f.hasClass("open");if(c(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click",c);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)){var d=a(this);if(c.preventDefault(),c.stopPropagation(),!d.is(".disabled, :disabled")){var e=b(d),g=e.hasClass("open");if(!g&&27!=c.which||g&&27==c.which)return 27==c.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find(".dropdown-menu"+h);if(i.length){var j=i.index(c.target);38==c.which&&j>0&&j--,40==c.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",c).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.5",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in"),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a(document.createElement("div")).addClass("modal-backdrop "+e).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",a,b)};c.VERSION="3.3.5",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(a.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusin"==b.type?"focus":"hover"]=!0),c.tip().hasClass("in")||"in"==c.hoverState?void(c.hoverState="in"):(clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.isInStateTrue=function(){for(var a in this.inState)if(this.inState[a])return!0;return!1},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusout"==b.type?"focus":"hover"]=!1),c.isInStateTrue()?void 0:(clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide())},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.getPosition(this.$viewport);h="bottom"==h&&k.bottom+m>o.bottom?"top":"top"==h&&k.top-m<o.top?"bottom":"right"==h&&k.right+l>o.width?"left":"left"==h&&k.left-l<o.left?"right":h,f.removeClass(n).addClass(h)}var p=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(p,h);var q=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",q).emulateTransitionEnd(c.TRANSITION_DURATION):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top+=g,b.left+=h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);return this.$element.trigger(g),g.isDefaultPrevented()?void 0:(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=d?{top:0,left:0}:b.offset(),g={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},h=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,g,h,f)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.right&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){if(!this.$tip&&(this.$tip=a(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),b?(c.inState.click=!c.inState.click,c.isInStateTrue()?c.enter(c):c.leave(c)):c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type),a.$tip&&a.$tip.detach(),a.$tip=null,a.$arrow=null,a.$viewport=null})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.5",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.5",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),
d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.5",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.5",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return c>e?"top":!1;if("bottom"==this.affixed)return null!=c?e+this.unpin<=f.top?!1:"bottom":a-d>=e+g?!1:"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&c>=e?"top":null!=d&&i+j>=a-d?"bottom":!1},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=Math.max(a(document).height(),a(document.body).height());"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = getParsingFlags(from);
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function Locale() {
    }

    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && typeof module !== 'undefined' &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (typeof values === 'undefined') {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function get_set__set (mom, unit, value) {
        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

    var regexes = {};

    function isFunction (sth) {
        // https://github.com/moment/moment/issues/2325
        return typeof sth === 'function' &&
            Object.prototype.toString.call(sth) === '[object Function]';
    }


    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  matchWord);
    addRegexToken('MMMM', matchWord);

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m) {
        return this._months[m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m) {
        return this._monthsShort[m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
        ['YYYY-DDD', /\d{4}-\d{3}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
        ['HH:mm', /(T| )\d\d:\d\d/],
        ['HH', /(T| )\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = from_string__isoRegex.exec(string);

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0];
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    // match[6] should be 'T' or space
                    config._f += (match[6] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (string.match(matchOffset)) {
                config._f += 'Z';
            }
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
        if (d < firstDayOfWeek) {
            d += 7;
        }

        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;

        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
        }
        return [now.getFullYear(), now.getMonth(), now.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             return other < this ? this : other;
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            return other > this ? this : other;
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchOffset);
    addRegexToken('ZZ', matchOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(string) {
        var matches = ((string || '').match(matchOffset) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(input);
            }
            if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (typeof this._isDSTShifted !== 'undefined') {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return !this._isUTC;
    }

    function isUtcOffset () {
        return this._isUTC;
    }

    function isUtc () {
        return this._isUTC && this._offset === 0;
    }

    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = create__isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                d : parseIso(match[4], sign),
                h : parseIso(match[5], sign),
                m : parseIso(match[6], sign),
                s : parseIso(match[7], sign),
                w : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this > +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return inputMs < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this < +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return +this.clone().endOf(units) < inputMs;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var inputMs;
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this === +input;
        } else {
            inputMs = +local__createLocal(input);
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function diff (input, units, asFloat) {
        var that = cloneWithOffset(input, this),
            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
            delta, output;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if ('function' === typeof Date.prototype.toISOString) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function weeksInYear(year, dow, doy) {
        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    // MOMENTS

    function getSetWeekYear (input) {
        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getSetISOWeekYear (input) {
        var year = weekOfYear(this, 1, 4).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    addFormatToken('Q', 0, 0, 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
        var weekday = config._locale.weekdaysParse(input);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m) {
        return this._weekdays[m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName) {
        var i, mom, regex;

        this._weekdaysParse = this._weekdaysParse || [];

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            if (!this._weekdaysParse[i]) {
                mom = local__createLocal([2000, 1]).day(i);
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, function () {
        return this.hours() % 12 || 12;
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add          = add_subtract__add;
    momentPrototype__proto.calendar     = moment_calendar__calendar;
    momentPrototype__proto.clone        = clone;
    momentPrototype__proto.diff         = diff;
    momentPrototype__proto.endOf        = endOf;
    momentPrototype__proto.format       = format;
    momentPrototype__proto.from         = from;
    momentPrototype__proto.fromNow      = fromNow;
    momentPrototype__proto.to           = to;
    momentPrototype__proto.toNow        = toNow;
    momentPrototype__proto.get          = getSet;
    momentPrototype__proto.invalidAt    = invalidAt;
    momentPrototype__proto.isAfter      = isAfter;
    momentPrototype__proto.isBefore     = isBefore;
    momentPrototype__proto.isBetween    = isBetween;
    momentPrototype__proto.isSame       = isSame;
    momentPrototype__proto.isValid      = moment_valid__isValid;
    momentPrototype__proto.lang         = lang;
    momentPrototype__proto.locale       = locale;
    momentPrototype__proto.localeData   = localeData;
    momentPrototype__proto.max          = prototypeMax;
    momentPrototype__proto.min          = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set          = getSet;
    momentPrototype__proto.startOf      = startOf;
    momentPrototype__proto.subtract     = add_subtract__subtract;
    momentPrototype__proto.toArray      = toArray;
    momentPrototype__proto.toObject     = toObject;
    momentPrototype__proto.toDate       = toDate;
    momentPrototype__proto.toISOString  = moment_format__toISOString;
    momentPrototype__proto.toJSON       = moment_format__toISOString;
    momentPrototype__proto.toString     = toString;
    momentPrototype__proto.unix         = unix;
    momentPrototype__proto.valueOf      = to_type__valueOf;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return typeof output === 'function' ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (typeof output === 'function') ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (typeof prop === 'function') {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months       =        localeMonths;
    prototype__proto._months      = defaultLocaleMonths;
    prototype__proto.monthsShort  =        localeMonthsShort;
    prototype__proto._monthsShort = defaultLocaleMonthsShort;
    prototype__proto.monthsParse  =        localeMonthsParse;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes === 1          && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   === 1          && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    === 1          && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  === 1          && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   === 1          && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.10.6';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
/*! version : 4.15.35
 =========================================================
 bootstrap-datetimejs
 https://github.com/Eonasdan/bootstrap-datetimepicker
 Copyright (c) 2015 Jonathan Peterson
 =========================================================
 */
!function(a){"use strict";if("function"==typeof define&&define.amd)define(["jquery","moment"],a);else if("object"==typeof exports)a(require("jquery"),require("moment"));else{if("undefined"==typeof jQuery)throw"bootstrap-datetimepicker requires jQuery to be loaded first";if("undefined"==typeof moment)throw"bootstrap-datetimepicker requires Moment.js to be loaded first";a(jQuery,moment)}}(function(a,b){"use strict";if(!b)throw new Error("bootstrap-datetimepicker requires Moment.js to be loaded first");var c=function(c,d){var e,f,g,h,i,j={},k=b().startOf("d"),l=k.clone(),m=!0,n=!1,o=!1,p=0,q=[{clsName:"days",navFnc:"M",navStep:1},{clsName:"months",navFnc:"y",navStep:1},{clsName:"years",navFnc:"y",navStep:10},{clsName:"decades",navFnc:"y",navStep:100}],r=["days","months","years","decades"],s=["top","bottom","auto"],t=["left","right","auto"],u=["default","top","bottom"],v={up:38,38:"up",down:40,40:"down",left:37,37:"left",right:39,39:"right",tab:9,9:"tab",escape:27,27:"escape",enter:13,13:"enter",pageUp:33,33:"pageUp",pageDown:34,34:"pageDown",shift:16,16:"shift",control:17,17:"control",space:32,32:"space",t:84,84:"t","delete":46,46:"delete"},w={},x=function(a){if("string"!=typeof a||a.length>1)throw new TypeError("isEnabled expects a single character string parameter");switch(a){case"y":return-1!==g.indexOf("Y");case"M":return-1!==g.indexOf("M");case"d":return-1!==g.toLowerCase().indexOf("d");case"h":case"H":return-1!==g.toLowerCase().indexOf("h");case"m":return-1!==g.indexOf("m");case"s":return-1!==g.indexOf("s");default:return!1}},y=function(){return x("h")||x("m")||x("s")},z=function(){return x("y")||x("M")||x("d")},A=function(){var b=a("<thead>").append(a("<tr>").append(a("<th>").addClass("prev").attr("data-action","previous").append(a("<span>").addClass(d.icons.previous))).append(a("<th>").addClass("picker-switch").attr("data-action","pickerSwitch").attr("colspan",d.calendarWeeks?"6":"5")).append(a("<th>").addClass("next").attr("data-action","next").append(a("<span>").addClass(d.icons.next)))),c=a("<tbody>").append(a("<tr>").append(a("<td>").attr("colspan",d.calendarWeeks?"8":"7")));return[a("<div>").addClass("datepicker-days").append(a("<table>").addClass("table-condensed").append(b).append(a("<tbody>"))),a("<div>").addClass("datepicker-months").append(a("<table>").addClass("table-condensed").append(b.clone()).append(c.clone())),a("<div>").addClass("datepicker-years").append(a("<table>").addClass("table-condensed").append(b.clone()).append(c.clone())),a("<div>").addClass("datepicker-decades").append(a("<table>").addClass("table-condensed").append(b.clone()).append(c.clone()))]},B=function(){var b=a("<tr>"),c=a("<tr>"),e=a("<tr>");return x("h")&&(b.append(a("<td>").append(a("<a>").attr({href:"#",tabindex:"-1",title:"Increment Hour"}).addClass("btn").attr("data-action","incrementHours").append(a("<span>").addClass(d.icons.up)))),c.append(a("<td>").append(a("<span>").addClass("timepicker-hour").attr({"data-time-component":"hours",title:"Pick Hour"}).attr("data-action","showHours"))),e.append(a("<td>").append(a("<a>").attr({href:"#",tabindex:"-1",title:"Decrement Hour"}).addClass("btn").attr("data-action","decrementHours").append(a("<span>").addClass(d.icons.down))))),x("m")&&(x("h")&&(b.append(a("<td>").addClass("separator")),c.append(a("<td>").addClass("separator").html(":")),e.append(a("<td>").addClass("separator"))),b.append(a("<td>").append(a("<a>").attr({href:"#",tabindex:"-1",title:"Increment Minute"}).addClass("btn").attr("data-action","incrementMinutes").append(a("<span>").addClass(d.icons.up)))),c.append(a("<td>").append(a("<span>").addClass("timepicker-minute").attr({"data-time-component":"minutes",title:"Pick Minute"}).attr("data-action","showMinutes"))),e.append(a("<td>").append(a("<a>").attr({href:"#",tabindex:"-1",title:"Decrement Minute"}).addClass("btn").attr("data-action","decrementMinutes").append(a("<span>").addClass(d.icons.down))))),x("s")&&(x("m")&&(b.append(a("<td>").addClass("separator")),c.append(a("<td>").addClass("separator").html(":")),e.append(a("<td>").addClass("separator"))),b.append(a("<td>").append(a("<a>").attr({href:"#",tabindex:"-1",title:"Increment Second"}).addClass("btn").attr("data-action","incrementSeconds").append(a("<span>").addClass(d.icons.up)))),c.append(a("<td>").append(a("<span>").addClass("timepicker-second").attr({"data-time-component":"seconds",title:"Pick Second"}).attr("data-action","showSeconds"))),e.append(a("<td>").append(a("<a>").attr({href:"#",tabindex:"-1",title:"Decrement Second"}).addClass("btn").attr("data-action","decrementSeconds").append(a("<span>").addClass(d.icons.down))))),f||(b.append(a("<td>").addClass("separator")),c.append(a("<td>").append(a("<button>").addClass("btn btn-primary").attr({"data-action":"togglePeriod",tabindex:"-1",title:"Toggle Period"}))),e.append(a("<td>").addClass("separator"))),a("<div>").addClass("timepicker-picker").append(a("<table>").addClass("table-condensed").append([b,c,e]))},C=function(){var b=a("<div>").addClass("timepicker-hours").append(a("<table>").addClass("table-condensed")),c=a("<div>").addClass("timepicker-minutes").append(a("<table>").addClass("table-condensed")),d=a("<div>").addClass("timepicker-seconds").append(a("<table>").addClass("table-condensed")),e=[B()];return x("h")&&e.push(b),x("m")&&e.push(c),x("s")&&e.push(d),e},D=function(){var b=[];return d.showTodayButton&&b.push(a("<td>").append(a("<a>").attr({"data-action":"today",title:d.tooltips.today}).append(a("<span>").addClass(d.icons.today)))),!d.sideBySide&&z()&&y()&&b.push(a("<td>").append(a("<a>").attr({"data-action":"togglePicker",title:"Select Time"}).append(a("<span>").addClass(d.icons.time)))),d.showClear&&b.push(a("<td>").append(a("<a>").attr({"data-action":"clear",title:d.tooltips.clear}).append(a("<span>").addClass(d.icons.clear)))),d.showClose&&b.push(a("<td>").append(a("<a>").attr({"data-action":"close",title:d.tooltips.close}).append(a("<span>").addClass(d.icons.close)))),a("<table>").addClass("table-condensed").append(a("<tbody>").append(a("<tr>").append(b)))},E=function(){var b=a("<div>").addClass("bootstrap-datetimepicker-widget dropdown-menu"),c=a("<div>").addClass("datepicker").append(A()),e=a("<div>").addClass("timepicker").append(C()),g=a("<ul>").addClass("list-unstyled"),h=a("<li>").addClass("picker-switch"+(d.collapse?" accordion-toggle":"")).append(D());return d.inline&&b.removeClass("dropdown-menu"),f&&b.addClass("usetwentyfour"),x("s")&&!f&&b.addClass("wider"),d.sideBySide&&z()&&y()?(b.addClass("timepicker-sbs"),"top"===d.toolbarPlacement&&b.append(h),b.append(a("<div>").addClass("row").append(c.addClass("col-md-6")).append(e.addClass("col-md-6"))),"bottom"===d.toolbarPlacement&&b.append(h),b):("top"===d.toolbarPlacement&&g.append(h),z()&&g.append(a("<li>").addClass(d.collapse&&y()?"collapse in":"").append(c)),"default"===d.toolbarPlacement&&g.append(h),y()&&g.append(a("<li>").addClass(d.collapse&&z()?"collapse":"").append(e)),"bottom"===d.toolbarPlacement&&g.append(h),b.append(g))},F=function(){var b,e={};return b=c.is("input")||d.inline?c.data():c.find("input").data(),b.dateOptions&&b.dateOptions instanceof Object&&(e=a.extend(!0,e,b.dateOptions)),a.each(d,function(a){var c="date"+a.charAt(0).toUpperCase()+a.slice(1);void 0!==b[c]&&(e[a]=b[c])}),e},G=function(){var b,e=(n||c).position(),f=(n||c).offset(),g=d.widgetPositioning.vertical,h=d.widgetPositioning.horizontal;if(d.widgetParent)b=d.widgetParent.append(o);else if(c.is("input"))b=c.after(o).parent();else{if(d.inline)return void(b=c.append(o));b=c,c.children().first().after(o)}if("auto"===g&&(g=f.top+1.5*o.height()>=a(window).height()+a(window).scrollTop()&&o.height()+c.outerHeight()<f.top?"top":"bottom"),"auto"===h&&(h=b.width()<f.left+o.outerWidth()/2&&f.left+o.outerWidth()>a(window).width()?"right":"left"),"top"===g?o.addClass("top").removeClass("bottom"):o.addClass("bottom").removeClass("top"),"right"===h?o.addClass("pull-right"):o.removeClass("pull-right"),"relative"!==b.css("position")&&(b=b.parents().filter(function(){return"relative"===a(this).css("position")}).first()),0===b.length)throw new Error("datetimepicker component should be placed within a relative positioned container");o.css({top:"top"===g?"auto":e.top+c.outerHeight(),bottom:"top"===g?e.top+c.outerHeight():"auto",left:"left"===h?b===c?0:e.left:"auto",right:"left"===h?"auto":b.outerWidth()-c.outerWidth()-(b===c?0:e.left)})},H=function(a){"dp.change"===a.type&&(a.date&&a.date.isSame(a.oldDate)||!a.date&&!a.oldDate)||c.trigger(a)},I=function(a){"y"===a&&(a="YYYY"),H({type:"dp.update",change:a,viewDate:l.clone()})},J=function(a){o&&(a&&(i=Math.max(p,Math.min(3,i+a))),o.find(".datepicker > div").hide().filter(".datepicker-"+q[i].clsName).show())},K=function(){var b=a("<tr>"),c=l.clone().startOf("w").startOf("d");for(d.calendarWeeks===!0&&b.append(a("<th>").addClass("cw").text("#"));c.isBefore(l.clone().endOf("w"));)b.append(a("<th>").addClass("dow").text(c.format("dd"))),c.add(1,"d");o.find(".datepicker-days thead").append(b)},L=function(a){return d.disabledDates[a.format("YYYY-MM-DD")]===!0},M=function(a){return d.enabledDates[a.format("YYYY-MM-DD")]===!0},N=function(a){return d.disabledHours[a.format("H")]===!0},O=function(a){return d.enabledHours[a.format("H")]===!0},P=function(b,c){if(!b.isValid())return!1;if(d.disabledDates&&"d"===c&&L(b))return!1;if(d.enabledDates&&"d"===c&&!M(b))return!1;if(d.minDate&&b.isBefore(d.minDate,c))return!1;if(d.maxDate&&b.isAfter(d.maxDate,c))return!1;if(d.daysOfWeekDisabled&&"d"===c&&-1!==d.daysOfWeekDisabled.indexOf(b.day()))return!1;if(d.disabledHours&&("h"===c||"m"===c||"s"===c)&&N(b))return!1;if(d.enabledHours&&("h"===c||"m"===c||"s"===c)&&!O(b))return!1;if(d.disabledTimeIntervals&&("h"===c||"m"===c||"s"===c)){var e=!1;if(a.each(d.disabledTimeIntervals,function(){return b.isBetween(this[0],this[1])?(e=!0,!1):void 0}),e)return!1}return!0},Q=function(){for(var b=[],c=l.clone().startOf("y").startOf("d");c.isSame(l,"y");)b.push(a("<span>").attr("data-action","selectMonth").addClass("month").text(c.format("MMM"))),c.add(1,"M");o.find(".datepicker-months td").empty().append(b)},R=function(){var b=o.find(".datepicker-months"),c=b.find("th"),e=b.find("tbody").find("span");c.eq(0).find("span").attr("title",d.tooltips.prevYear),c.eq(1).attr("title",d.tooltips.selectYear),c.eq(2).find("span").attr("title",d.tooltips.nextYear),b.find(".disabled").removeClass("disabled"),P(l.clone().subtract(1,"y"),"y")||c.eq(0).addClass("disabled"),c.eq(1).text(l.year()),P(l.clone().add(1,"y"),"y")||c.eq(2).addClass("disabled"),e.removeClass("active"),k.isSame(l,"y")&&!m&&e.eq(k.month()).addClass("active"),e.each(function(b){P(l.clone().month(b),"M")||a(this).addClass("disabled")})},S=function(){var a=o.find(".datepicker-years"),b=a.find("th"),c=l.clone().subtract(5,"y"),e=l.clone().add(6,"y"),f="";for(b.eq(0).find("span").attr("title",d.tooltips.nextDecade),b.eq(1).attr("title",d.tooltips.selectDecade),b.eq(2).find("span").attr("title",d.tooltips.prevDecade),a.find(".disabled").removeClass("disabled"),d.minDate&&d.minDate.isAfter(c,"y")&&b.eq(0).addClass("disabled"),b.eq(1).text(c.year()+"-"+e.year()),d.maxDate&&d.maxDate.isBefore(e,"y")&&b.eq(2).addClass("disabled");!c.isAfter(e,"y");)f+='<span data-action="selectYear" class="year'+(c.isSame(k,"y")&&!m?" active":"")+(P(c,"y")?"":" disabled")+'">'+c.year()+"</span>",c.add(1,"y");a.find("td").html(f)},T=function(){var a=o.find(".datepicker-decades"),c=a.find("th"),e=b(l.isBefore(b({y:1999}))?{y:1899}:{y:1999}),f=e.clone().add(100,"y"),g="";for(c.eq(0).find("span").attr("title",d.tooltips.prevCentury),c.eq(2).find("span").attr("title",d.tooltips.nextCentury),a.find(".disabled").removeClass("disabled"),(e.isSame(b({y:1900}))||d.minDate&&d.minDate.isAfter(e,"y"))&&c.eq(0).addClass("disabled"),c.eq(1).text(e.year()+"-"+f.year()),(e.isSame(b({y:2e3}))||d.maxDate&&d.maxDate.isBefore(f,"y"))&&c.eq(2).addClass("disabled");!e.isAfter(f,"y");)g+='<span data-action="selectDecade" class="decade'+(e.isSame(k,"y")?" active":"")+(P(e,"y")?"":" disabled")+'" data-selection="'+(e.year()+6)+'">'+(e.year()+1)+" - "+(e.year()+12)+"</span>",e.add(12,"y");g+="<span></span><span></span><span></span>",a.find("td").html(g)},U=function(){var c,e,f,g,h=o.find(".datepicker-days"),i=h.find("th"),j=[];if(z()){for(i.eq(0).find("span").attr("title",d.tooltips.prevMonth),i.eq(1).attr("title",d.tooltips.selectMonth),i.eq(2).find("span").attr("title",d.tooltips.nextMonth),h.find(".disabled").removeClass("disabled"),i.eq(1).text(l.format(d.dayViewHeaderFormat)),P(l.clone().subtract(1,"M"),"M")||i.eq(0).addClass("disabled"),P(l.clone().add(1,"M"),"M")||i.eq(2).addClass("disabled"),c=l.clone().startOf("M").startOf("w").startOf("d"),g=0;42>g;g++)0===c.weekday()&&(e=a("<tr>"),d.calendarWeeks&&e.append('<td class="cw">'+c.week()+"</td>"),j.push(e)),f="",c.isBefore(l,"M")&&(f+=" old"),c.isAfter(l,"M")&&(f+=" new"),c.isSame(k,"d")&&!m&&(f+=" active"),P(c,"d")||(f+=" disabled"),c.isSame(b(),"d")&&(f+=" today"),(0===c.day()||6===c.day())&&(f+=" weekend"),e.append('<td data-action="selectDay" data-day="'+c.format("L")+'" class="day'+f+'">'+c.date()+"</td>"),c.add(1,"d");h.find("tbody").empty().append(j),R(),S(),T()}},V=function(){var b=o.find(".timepicker-hours table"),c=l.clone().startOf("d"),d=[],e=a("<tr>");for(l.hour()>11&&!f&&c.hour(12);c.isSame(l,"d")&&(f||l.hour()<12&&c.hour()<12||l.hour()>11);)c.hour()%4===0&&(e=a("<tr>"),d.push(e)),e.append('<td data-action="selectHour" class="hour'+(P(c,"h")?"":" disabled")+'">'+c.format(f?"HH":"hh")+"</td>"),c.add(1,"h");b.empty().append(d)},W=function(){for(var b=o.find(".timepicker-minutes table"),c=l.clone().startOf("h"),e=[],f=a("<tr>"),g=1===d.stepping?5:d.stepping;l.isSame(c,"h");)c.minute()%(4*g)===0&&(f=a("<tr>"),e.push(f)),f.append('<td data-action="selectMinute" class="minute'+(P(c,"m")?"":" disabled")+'">'+c.format("mm")+"</td>"),c.add(g,"m");b.empty().append(e)},X=function(){for(var b=o.find(".timepicker-seconds table"),c=l.clone().startOf("m"),d=[],e=a("<tr>");l.isSame(c,"m");)c.second()%20===0&&(e=a("<tr>"),d.push(e)),e.append('<td data-action="selectSecond" class="second'+(P(c,"s")?"":" disabled")+'">'+c.format("ss")+"</td>"),c.add(5,"s");b.empty().append(d)},Y=function(){var a,b,c=o.find(".timepicker span[data-time-component]");f||(a=o.find(".timepicker [data-action=togglePeriod]"),b=k.clone().add(k.hours()>=12?-12:12,"h"),a.text(k.format("A")),P(b,"h")?a.removeClass("disabled"):a.addClass("disabled")),c.filter("[data-time-component=hours]").text(k.format(f?"HH":"hh")),c.filter("[data-time-component=minutes]").text(k.format("mm")),c.filter("[data-time-component=seconds]").text(k.format("ss")),V(),W(),X()},Z=function(){o&&(U(),Y())},$=function(a){var b=m?null:k;return a?(a=a.clone().locale(d.locale),1!==d.stepping&&a.minutes(Math.round(a.minutes()/d.stepping)*d.stepping%60).seconds(0),void(P(a)?(k=a,l=k.clone(),e.val(k.format(g)),c.data("date",k.format(g)),m=!1,Z(),H({type:"dp.change",date:k.clone(),oldDate:b})):(d.keepInvalid||e.val(m?"":k.format(g)),H({type:"dp.error",date:a})))):(m=!0,e.val(""),c.data("date",""),H({type:"dp.change",date:!1,oldDate:b}),void Z())},_=function(){var b=!1;return o?(o.find(".collapse").each(function(){var c=a(this).data("collapse");return c&&c.transitioning?(b=!0,!1):!0}),b?j:(n&&n.hasClass("btn")&&n.toggleClass("active"),o.hide(),a(window).off("resize",G),o.off("click","[data-action]"),o.off("mousedown",!1),o.remove(),o=!1,H({type:"dp.hide",date:k.clone()}),e.blur(),j)):j},aa=function(){$(null)},ba={next:function(){var a=q[i].navFnc;l.add(q[i].navStep,a),U(),I(a)},previous:function(){var a=q[i].navFnc;l.subtract(q[i].navStep,a),U(),I(a)},pickerSwitch:function(){J(1)},selectMonth:function(b){var c=a(b.target).closest("tbody").find("span").index(a(b.target));l.month(c),i===p?($(k.clone().year(l.year()).month(l.month())),d.inline||_()):(J(-1),U()),I("M")},selectYear:function(b){var c=parseInt(a(b.target).text(),10)||0;l.year(c),i===p?($(k.clone().year(l.year())),d.inline||_()):(J(-1),U()),I("YYYY")},selectDecade:function(b){var c=parseInt(a(b.target).data("selection"),10)||0;l.year(c),i===p?($(k.clone().year(l.year())),d.inline||_()):(J(-1),U()),I("YYYY")},selectDay:function(b){var c=l.clone();a(b.target).is(".old")&&c.subtract(1,"M"),a(b.target).is(".new")&&c.add(1,"M"),$(c.date(parseInt(a(b.target).text(),10))),y()||d.keepOpen||d.inline||_()},incrementHours:function(){var a=k.clone().add(1,"h");P(a,"h")&&$(a)},incrementMinutes:function(){var a=k.clone().add(d.stepping,"m");P(a,"m")&&$(a)},incrementSeconds:function(){var a=k.clone().add(1,"s");P(a,"s")&&$(a)},decrementHours:function(){var a=k.clone().subtract(1,"h");P(a,"h")&&$(a)},decrementMinutes:function(){var a=k.clone().subtract(d.stepping,"m");P(a,"m")&&$(a)},decrementSeconds:function(){var a=k.clone().subtract(1,"s");P(a,"s")&&$(a)},togglePeriod:function(){$(k.clone().add(k.hours()>=12?-12:12,"h"))},togglePicker:function(b){var c,e=a(b.target),f=e.closest("ul"),g=f.find(".in"),h=f.find(".collapse:not(.in)");if(g&&g.length){if(c=g.data("collapse"),c&&c.transitioning)return;g.collapse?(g.collapse("hide"),h.collapse("show")):(g.removeClass("in"),h.addClass("in")),e.is("span")?e.toggleClass(d.icons.time+" "+d.icons.date):e.find("span").toggleClass(d.icons.time+" "+d.icons.date)}},showPicker:function(){o.find(".timepicker > div:not(.timepicker-picker)").hide(),o.find(".timepicker .timepicker-picker").show()},showHours:function(){o.find(".timepicker .timepicker-picker").hide(),o.find(".timepicker .timepicker-hours").show()},showMinutes:function(){o.find(".timepicker .timepicker-picker").hide(),o.find(".timepicker .timepicker-minutes").show()},showSeconds:function(){o.find(".timepicker .timepicker-picker").hide(),o.find(".timepicker .timepicker-seconds").show()},selectHour:function(b){var c=parseInt(a(b.target).text(),10);f||(k.hours()>=12?12!==c&&(c+=12):12===c&&(c=0)),$(k.clone().hours(c)),ba.showPicker.call(j)},selectMinute:function(b){$(k.clone().minutes(parseInt(a(b.target).text(),10))),ba.showPicker.call(j)},selectSecond:function(b){$(k.clone().seconds(parseInt(a(b.target).text(),10))),ba.showPicker.call(j)},clear:aa,today:function(){P(b(),"d")&&$(b())},close:_},ca=function(b){return a(b.currentTarget).is(".disabled")?!1:(ba[a(b.currentTarget).data("action")].apply(j,arguments),!1)},da=function(){var c,f={year:function(a){return a.month(0).date(1).hours(0).seconds(0).minutes(0)},month:function(a){return a.date(1).hours(0).seconds(0).minutes(0)},day:function(a){return a.hours(0).seconds(0).minutes(0)},hour:function(a){return a.seconds(0).minutes(0)},minute:function(a){return a.seconds(0)}};return e.prop("disabled")||!d.ignoreReadonly&&e.prop("readonly")||o?j:(void 0!==e.val()&&0!==e.val().trim().length?$(fa(e.val().trim())):d.useCurrent&&m&&(e.is("input")&&0===e.val().trim().length||d.inline)&&(c=b(),"string"==typeof d.useCurrent&&(c=f[d.useCurrent](c)),$(c)),o=E(),K(),Q(),o.find(".timepicker-hours").hide(),o.find(".timepicker-minutes").hide(),o.find(".timepicker-seconds").hide(),Z(),J(),a(window).on("resize",G),o.on("click","[data-action]",ca),o.on("mousedown",!1),n&&n.hasClass("btn")&&n.toggleClass("active"),o.show(),G(),d.focusOnShow&&!e.is(":focus")&&e.focus(),H({type:"dp.show"}),j)},ea=function(){return o?_():da()},fa=function(a){return a=void 0===d.parseInputDate?b.isMoment(a)||a instanceof Date?b(a):b(a,h,d.useStrict):d.parseInputDate(a),a.locale(d.locale),a},ga=function(a){var b,c,e,f,g=null,h=[],i={},k=a.which,l="p";w[k]=l;for(b in w)w.hasOwnProperty(b)&&w[b]===l&&(h.push(b),parseInt(b,10)!==k&&(i[b]=!0));for(b in d.keyBinds)if(d.keyBinds.hasOwnProperty(b)&&"function"==typeof d.keyBinds[b]&&(e=b.split(" "),e.length===h.length&&v[k]===e[e.length-1])){for(f=!0,c=e.length-2;c>=0;c--)if(!(v[e[c]]in i)){f=!1;break}if(f){g=d.keyBinds[b];break}}g&&(g.call(j,o),a.stopPropagation(),a.preventDefault())},ha=function(a){w[a.which]="r",a.stopPropagation(),a.preventDefault()},ia=function(b){var c=a(b.target).val().trim(),d=c?fa(c):null;return $(d),b.stopImmediatePropagation(),!1},ja=function(){e.on({change:ia,blur:d.debug?"":_,keydown:ga,keyup:ha,focus:d.allowInputToggle?da:""}),c.is("input")?e.on({focus:da}):n&&(n.on("click",ea),n.on("mousedown",!1))},ka=function(){e.off({change:ia,blur:blur,keydown:ga,keyup:ha,focus:d.allowInputToggle?_:""}),c.is("input")?e.off({focus:da}):n&&(n.off("click",ea),n.off("mousedown",!1))},la=function(b){var c={};return a.each(b,function(){var a=fa(this);a.isValid()&&(c[a.format("YYYY-MM-DD")]=!0)}),Object.keys(c).length?c:!1},ma=function(b){var c={};return a.each(b,function(){c[this]=!0}),Object.keys(c).length?c:!1},na=function(){var a=d.format||"L LT";g=a.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,function(a){var b=k.localeData().longDateFormat(a)||a;return b.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,function(a){return k.localeData().longDateFormat(a)||a})}),h=d.extraFormats?d.extraFormats.slice():[],h.indexOf(a)<0&&h.indexOf(g)<0&&h.push(g),f=g.toLowerCase().indexOf("a")<1&&g.replace(/\[.*?\]/g,"").indexOf("h")<1,x("y")&&(p=2),x("M")&&(p=1),x("d")&&(p=0),i=Math.max(p,i),m||$(k)};if(j.destroy=function(){_(),ka(),c.removeData("DateTimePicker"),c.removeData("date")},j.toggle=ea,j.show=da,j.hide=_,j.disable=function(){return _(),n&&n.hasClass("btn")&&n.addClass("disabled"),e.prop("disabled",!0),j},j.enable=function(){return n&&n.hasClass("btn")&&n.removeClass("disabled"),e.prop("disabled",!1),j},j.ignoreReadonly=function(a){if(0===arguments.length)return d.ignoreReadonly;if("boolean"!=typeof a)throw new TypeError("ignoreReadonly () expects a boolean parameter");return d.ignoreReadonly=a,j},j.options=function(b){if(0===arguments.length)return a.extend(!0,{},d);if(!(b instanceof Object))throw new TypeError("options() options parameter should be an object");return a.extend(!0,d,b),a.each(d,function(a,b){if(void 0===j[a])throw new TypeError("option "+a+" is not recognized!");j[a](b)}),j},j.date=function(a){if(0===arguments.length)return m?null:k.clone();if(!(null===a||"string"==typeof a||b.isMoment(a)||a instanceof Date))throw new TypeError("date() parameter must be one of [null, string, moment or Date]");return $(null===a?null:fa(a)),j},j.format=function(a){if(0===arguments.length)return d.format;if("string"!=typeof a&&("boolean"!=typeof a||a!==!1))throw new TypeError("format() expects a sting or boolean:false parameter "+a);return d.format=a,g&&na(),j},j.dayViewHeaderFormat=function(a){if(0===arguments.length)return d.dayViewHeaderFormat;if("string"!=typeof a)throw new TypeError("dayViewHeaderFormat() expects a string parameter");return d.dayViewHeaderFormat=a,j},j.extraFormats=function(a){if(0===arguments.length)return d.extraFormats;if(a!==!1&&!(a instanceof Array))throw new TypeError("extraFormats() expects an array or false parameter");return d.extraFormats=a,h&&na(),j},j.disabledDates=function(b){if(0===arguments.length)return d.disabledDates?a.extend({},d.disabledDates):d.disabledDates;if(!b)return d.disabledDates=!1,Z(),j;if(!(b instanceof Array))throw new TypeError("disabledDates() expects an array parameter");return d.disabledDates=la(b),d.enabledDates=!1,Z(),j},j.enabledDates=function(b){if(0===arguments.length)return d.enabledDates?a.extend({},d.enabledDates):d.enabledDates;if(!b)return d.enabledDates=!1,Z(),j;if(!(b instanceof Array))throw new TypeError("enabledDates() expects an array parameter");return d.enabledDates=la(b),d.disabledDates=!1,Z(),j},j.daysOfWeekDisabled=function(a){if(0===arguments.length)return d.daysOfWeekDisabled.splice(0);if("boolean"==typeof a&&!a)return d.daysOfWeekDisabled=!1,Z(),j;if(!(a instanceof Array))throw new TypeError("daysOfWeekDisabled() expects an array parameter");if(d.daysOfWeekDisabled=a.reduce(function(a,b){return b=parseInt(b,10),b>6||0>b||isNaN(b)?a:(-1===a.indexOf(b)&&a.push(b),a)},[]).sort(),d.useCurrent&&!d.keepInvalid){for(var b=0;!P(k,"d");){if(k.add(1,"d"),7===b)throw"Tried 7 times to find a valid date";b++}$(k)}return Z(),j},j.maxDate=function(a){if(0===arguments.length)return d.maxDate?d.maxDate.clone():d.maxDate;if("boolean"==typeof a&&a===!1)return d.maxDate=!1,Z(),j;"string"==typeof a&&("now"===a||"moment"===a)&&(a=b());var c=fa(a);if(!c.isValid())throw new TypeError("maxDate() Could not parse date parameter: "+a);if(d.minDate&&c.isBefore(d.minDate))throw new TypeError("maxDate() date parameter is before options.minDate: "+c.format(g));return d.maxDate=c,d.useCurrent&&!d.keepInvalid&&k.isAfter(a)&&$(d.maxDate),l.isAfter(c)&&(l=c.clone().subtract(d.stepping,"m")),Z(),j},j.minDate=function(a){if(0===arguments.length)return d.minDate?d.minDate.clone():d.minDate;if("boolean"==typeof a&&a===!1)return d.minDate=!1,Z(),j;"string"==typeof a&&("now"===a||"moment"===a)&&(a=b());var c=fa(a);if(!c.isValid())throw new TypeError("minDate() Could not parse date parameter: "+a);if(d.maxDate&&c.isAfter(d.maxDate))throw new TypeError("minDate() date parameter is after options.maxDate: "+c.format(g));return d.minDate=c,d.useCurrent&&!d.keepInvalid&&k.isBefore(a)&&$(d.minDate),l.isBefore(c)&&(l=c.clone().add(d.stepping,"m")),Z(),j},j.defaultDate=function(a){if(0===arguments.length)return d.defaultDate?d.defaultDate.clone():d.defaultDate;if(!a)return d.defaultDate=!1,j;"string"==typeof a&&("now"===a||"moment"===a)&&(a=b());var c=fa(a);if(!c.isValid())throw new TypeError("defaultDate() Could not parse date parameter: "+a);if(!P(c))throw new TypeError("defaultDate() date passed is invalid according to component setup validations");return d.defaultDate=c,(d.defaultDate&&d.inline||""===e.val().trim()&&void 0===e.attr("placeholder"))&&$(d.defaultDate),j},j.locale=function(a){if(0===arguments.length)return d.locale;if(!b.localeData(a))throw new TypeError("locale() locale "+a+" is not loaded from moment locales!");return d.locale=a,k.locale(d.locale),l.locale(d.locale),g&&na(),o&&(_(),da()),j},j.stepping=function(a){return 0===arguments.length?d.stepping:(a=parseInt(a,10),(isNaN(a)||1>a)&&(a=1),d.stepping=a,j)},j.useCurrent=function(a){var b=["year","month","day","hour","minute"];if(0===arguments.length)return d.useCurrent;if("boolean"!=typeof a&&"string"!=typeof a)throw new TypeError("useCurrent() expects a boolean or string parameter");if("string"==typeof a&&-1===b.indexOf(a.toLowerCase()))throw new TypeError("useCurrent() expects a string parameter of "+b.join(", "));return d.useCurrent=a,j},j.collapse=function(a){if(0===arguments.length)return d.collapse;if("boolean"!=typeof a)throw new TypeError("collapse() expects a boolean parameter");return d.collapse===a?j:(d.collapse=a,o&&(_(),da()),j)},j.icons=function(b){if(0===arguments.length)return a.extend({},d.icons);if(!(b instanceof Object))throw new TypeError("icons() expects parameter to be an Object");return a.extend(d.icons,b),o&&(_(),da()),j},j.tooltips=function(b){if(0===arguments.length)return a.extend({},d.tooltips);if(!(b instanceof Object))throw new TypeError("tooltips() expects parameter to be an Object");return a.extend(d.tooltips,b),o&&(_(),da()),j},j.useStrict=function(a){if(0===arguments.length)return d.useStrict;if("boolean"!=typeof a)throw new TypeError("useStrict() expects a boolean parameter");return d.useStrict=a,j},j.sideBySide=function(a){if(0===arguments.length)return d.sideBySide;if("boolean"!=typeof a)throw new TypeError("sideBySide() expects a boolean parameter");return d.sideBySide=a,o&&(_(),da()),j},j.viewMode=function(a){if(0===arguments.length)return d.viewMode;if("string"!=typeof a)throw new TypeError("viewMode() expects a string parameter");if(-1===r.indexOf(a))throw new TypeError("viewMode() parameter must be one of ("+r.join(", ")+") value");return d.viewMode=a,i=Math.max(r.indexOf(a),p),J(),j},j.toolbarPlacement=function(a){if(0===arguments.length)return d.toolbarPlacement;if("string"!=typeof a)throw new TypeError("toolbarPlacement() expects a string parameter");if(-1===u.indexOf(a))throw new TypeError("toolbarPlacement() parameter must be one of ("+u.join(", ")+") value");return d.toolbarPlacement=a,o&&(_(),da()),j},j.widgetPositioning=function(b){if(0===arguments.length)return a.extend({},d.widgetPositioning);if("[object Object]"!=={}.toString.call(b))throw new TypeError("widgetPositioning() expects an object variable");if(b.horizontal){if("string"!=typeof b.horizontal)throw new TypeError("widgetPositioning() horizontal variable must be a string");if(b.horizontal=b.horizontal.toLowerCase(),-1===t.indexOf(b.horizontal))throw new TypeError("widgetPositioning() expects horizontal parameter to be one of ("+t.join(", ")+")");d.widgetPositioning.horizontal=b.horizontal}if(b.vertical){if("string"!=typeof b.vertical)throw new TypeError("widgetPositioning() vertical variable must be a string");if(b.vertical=b.vertical.toLowerCase(),-1===s.indexOf(b.vertical))throw new TypeError("widgetPositioning() expects vertical parameter to be one of ("+s.join(", ")+")");d.widgetPositioning.vertical=b.vertical}return Z(),j},j.calendarWeeks=function(a){if(0===arguments.length)return d.calendarWeeks;if("boolean"!=typeof a)throw new TypeError("calendarWeeks() expects parameter to be a boolean value");return d.calendarWeeks=a,Z(),j},j.showTodayButton=function(a){if(0===arguments.length)return d.showTodayButton;if("boolean"!=typeof a)throw new TypeError("showTodayButton() expects a boolean parameter");return d.showTodayButton=a,o&&(_(),da()),j},j.showClear=function(a){if(0===arguments.length)return d.showClear;if("boolean"!=typeof a)throw new TypeError("showClear() expects a boolean parameter");return d.showClear=a,o&&(_(),da()),j},j.widgetParent=function(b){if(0===arguments.length)return d.widgetParent;if("string"==typeof b&&(b=a(b)),null!==b&&"string"!=typeof b&&!(b instanceof a))throw new TypeError("widgetParent() expects a string or a jQuery object parameter");return d.widgetParent=b,o&&(_(),da()),j},j.keepOpen=function(a){if(0===arguments.length)return d.keepOpen;if("boolean"!=typeof a)throw new TypeError("keepOpen() expects a boolean parameter");return d.keepOpen=a,j},j.focusOnShow=function(a){if(0===arguments.length)return d.focusOnShow;if("boolean"!=typeof a)throw new TypeError("focusOnShow() expects a boolean parameter");return d.focusOnShow=a,j},j.inline=function(a){if(0===arguments.length)return d.inline;if("boolean"!=typeof a)throw new TypeError("inline() expects a boolean parameter");return d.inline=a,j},j.clear=function(){return aa(),j},j.keyBinds=function(a){return d.keyBinds=a,j},j.debug=function(a){if("boolean"!=typeof a)throw new TypeError("debug() expects a boolean parameter");return d.debug=a,j},j.allowInputToggle=function(a){if(0===arguments.length)return d.allowInputToggle;if("boolean"!=typeof a)throw new TypeError("allowInputToggle() expects a boolean parameter");return d.allowInputToggle=a,j},j.showClose=function(a){if(0===arguments.length)return d.showClose;if("boolean"!=typeof a)throw new TypeError("showClose() expects a boolean parameter");return d.showClose=a,j},j.keepInvalid=function(a){if(0===arguments.length)return d.keepInvalid;if("boolean"!=typeof a)throw new TypeError("keepInvalid() expects a boolean parameter");return d.keepInvalid=a,j},j.datepickerInput=function(a){if(0===arguments.length)return d.datepickerInput;if("string"!=typeof a)throw new TypeError("datepickerInput() expects a string parameter");return d.datepickerInput=a,j},j.parseInputDate=function(a){if(0===arguments.length)return d.parseInputDate;if("function"!=typeof a)throw new TypeError("parseInputDate() sholud be as function");return d.parseInputDate=a,j},j.disabledTimeIntervals=function(b){if(0===arguments.length)return d.disabledTimeIntervals?a.extend({},d.disabledTimeIntervals):d.disabledTimeIntervals;if(!b)return d.disabledTimeIntervals=!1,Z(),j;if(!(b instanceof Array))throw new TypeError("disabledTimeIntervals() expects an array parameter");return d.disabledTimeIntervals=b,Z(),j},j.disabledHours=function(b){if(0===arguments.length)return d.disabledHours?a.extend({},d.disabledHours):d.disabledHours;if(!b)return d.disabledHours=!1,Z(),j;if(!(b instanceof Array))throw new TypeError("disabledHours() expects an array parameter");
if(d.disabledHours=ma(b),d.enabledHours=!1,d.useCurrent&&!d.keepInvalid){for(var c=0;!P(k,"h");){if(k.add(1,"h"),24===c)throw"Tried 24 times to find a valid date";c++}$(k)}return Z(),j},j.enabledHours=function(b){if(0===arguments.length)return d.enabledHours?a.extend({},d.enabledHours):d.enabledHours;if(!b)return d.enabledHours=!1,Z(),j;if(!(b instanceof Array))throw new TypeError("enabledHours() expects an array parameter");if(d.enabledHours=ma(b),d.disabledHours=!1,d.useCurrent&&!d.keepInvalid){for(var c=0;!P(k,"h");){if(k.add(1,"h"),24===c)throw"Tried 24 times to find a valid date";c++}$(k)}return Z(),j},j.viewDate=function(a){if(0===arguments.length)return l.clone();if(!a)return l=k.clone(),j;if(!("string"==typeof a||b.isMoment(a)||a instanceof Date))throw new TypeError("viewDate() parameter must be one of [string, moment or Date]");return l=fa(a),I(),j},c.is("input"))e=c;else if(e=c.find(d.datepickerInput),0===e.size())e=c.find("input");else if(!e.is("input"))throw new Error('CSS class "'+d.datepickerInput+'" cannot be applied to non input element');if(c.hasClass("input-group")&&(n=0===c.find(".datepickerbutton").size()?c.find(".input-group-addon"):c.find(".datepickerbutton")),!d.inline&&!e.is("input"))throw new Error("Could not initialize DateTimePicker without an input element");return a.extend(!0,d,F()),j.options(d),na(),ja(),e.prop("disabled")&&j.disable(),e.is("input")&&0!==e.val().trim().length?$(fa(e.val().trim())):d.defaultDate&&void 0===e.attr("placeholder")&&$(d.defaultDate),d.inline&&da(),j};a.fn.datetimepicker=function(b){return this.each(function(){var d=a(this);d.data("DateTimePicker")||(b=a.extend(!0,{},a.fn.datetimepicker.defaults,b),d.data("DateTimePicker",c(d,b)))})},a.fn.datetimepicker.defaults={format:!1,dayViewHeaderFormat:"MMMM YYYY",extraFormats:!1,stepping:1,minDate:!1,maxDate:!1,useCurrent:!0,collapse:!0,locale:b.locale(),defaultDate:!1,disabledDates:!1,enabledDates:!1,icons:{time:"glyphicon glyphicon-time",date:"glyphicon glyphicon-calendar",up:"glyphicon glyphicon-chevron-up",down:"glyphicon glyphicon-chevron-down",previous:"glyphicon glyphicon-chevron-left",next:"glyphicon glyphicon-chevron-right",today:"glyphicon glyphicon-screenshot",clear:"glyphicon glyphicon-trash",close:"glyphicon glyphicon-remove"},tooltips:{today:"Go to today",clear:"Clear selection",close:"Close the picker",selectMonth:"Select Month",prevMonth:"Previous Month",nextMonth:"Next Month",selectYear:"Select Year",prevYear:"Previous Year",nextYear:"Next Year",selectDecade:"Select Decade",prevDecade:"Previous Decade",nextDecade:"Next Decade",prevCentury:"Previous Century",nextCentury:"Next Century"},useStrict:!1,sideBySide:!1,daysOfWeekDisabled:!1,calendarWeeks:!1,viewMode:"days",toolbarPlacement:"default",showTodayButton:!1,showClear:!1,showClose:!1,widgetPositioning:{horizontal:"auto",vertical:"auto"},widgetParent:null,ignoreReadonly:!1,keepOpen:!1,focusOnShow:!0,inline:!1,keepInvalid:!1,datepickerInput:".datepickerinput",keyBinds:{up:function(a){if(a){var c=this.date()||b();a.find(".datepicker").is(":visible")?this.date(c.clone().subtract(7,"d")):this.date(c.clone().add(this.stepping(),"m"))}},down:function(a){if(!a)return void this.show();var c=this.date()||b();a.find(".datepicker").is(":visible")?this.date(c.clone().add(7,"d")):this.date(c.clone().subtract(this.stepping(),"m"))},"control up":function(a){if(a){var c=this.date()||b();a.find(".datepicker").is(":visible")?this.date(c.clone().subtract(1,"y")):this.date(c.clone().add(1,"h"))}},"control down":function(a){if(a){var c=this.date()||b();a.find(".datepicker").is(":visible")?this.date(c.clone().add(1,"y")):this.date(c.clone().subtract(1,"h"))}},left:function(a){if(a){var c=this.date()||b();a.find(".datepicker").is(":visible")&&this.date(c.clone().subtract(1,"d"))}},right:function(a){if(a){var c=this.date()||b();a.find(".datepicker").is(":visible")&&this.date(c.clone().add(1,"d"))}},pageUp:function(a){if(a){var c=this.date()||b();a.find(".datepicker").is(":visible")&&this.date(c.clone().subtract(1,"M"))}},pageDown:function(a){if(a){var c=this.date()||b();a.find(".datepicker").is(":visible")&&this.date(c.clone().add(1,"M"))}},enter:function(){this.hide()},escape:function(){this.hide()},"control space":function(a){a.find(".timepicker").is(":visible")&&a.find('.btn[data-action="togglePeriod"]').click()},t:function(){this.date(b())},"delete":function(){this.clear()}},debug:!1,allowInputToggle:!1,disabledTimeIntervals:!1,disabledHours:!1,enabledHours:!1,viewDate:!1}});
!function(t,e){"use strict";"undefined"!=typeof module&&module.exports?module.exports=e(require("jquery"),require("bootstrap")):"function"==typeof define&&define.amd?define("bootstrap-dialog",["jquery","bootstrap"],function(t){return e(t)}):t.BootstrapDialog=e(t.jQuery)}(this,function(t){"use strict";var e=t.fn.modal.Constructor,n=function(t,n){e.call(this,t,n)};n.getModalVersion=function(){var e=null;return e="undefined"==typeof t.fn.modal.Constructor.VERSION?"v3.1":/3\.2\.\d+/.test(t.fn.modal.Constructor.VERSION)?"v3.2":/3\.3\.[1,2]/.test(t.fn.modal.Constructor.VERSION)?"v3.3":"v3.3.4"},n.ORIGINAL_BODY_PADDING=parseInt(t("body").css("padding-right")||0,10),n.METHODS_TO_OVERRIDE={},n.METHODS_TO_OVERRIDE["v3.1"]={},n.METHODS_TO_OVERRIDE["v3.2"]={hide:function(e){if(e&&e.preventDefault(),e=t.Event("hide.bs.modal"),this.$element.trigger(e),this.isShown&&!e.isDefaultPrevented()){this.isShown=!1;var n=this.getGlobalOpenedDialogs();0===n.length&&this.$body.removeClass("modal-open"),this.resetScrollbar(),this.escape(),t(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),t.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",t.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()}}},n.METHODS_TO_OVERRIDE["v3.3"]={setScrollbar:function(){var t=n.ORIGINAL_BODY_PADDING;this.bodyIsOverflowing&&this.$body.css("padding-right",t+this.scrollbarWidth)},resetScrollbar:function(){var t=this.getGlobalOpenedDialogs();0===t.length&&this.$body.css("padding-right",n.ORIGINAL_BODY_PADDING)},hideModal:function(){this.$element.hide(),this.backdrop(t.proxy(function(){var t=this.getGlobalOpenedDialogs();0===t.length&&this.$body.removeClass("modal-open"),this.resetAdjustments(),this.resetScrollbar(),this.$element.trigger("hidden.bs.modal")},this))}},n.METHODS_TO_OVERRIDE["v3.3.4"]=t.extend({},n.METHODS_TO_OVERRIDE["v3.3"]),n.prototype={constructor:n,getGlobalOpenedDialogs:function(){var e=[];return t.each(o.dialogs,function(t,n){n.isRealized()&&n.isOpened()&&e.push(n)}),e}},n.prototype=t.extend(n.prototype,e.prototype,n.METHODS_TO_OVERRIDE[n.getModalVersion()]);var o=function(e){this.defaultOptions=t.extend(!0,{id:o.newGuid(),buttons:[],data:{},onshow:null,onshown:null,onhide:null,onhidden:null},o.defaultOptions),this.indexedButtons={},this.registeredButtonHotkeys={},this.draggableData={isMouseDown:!1,mouseOffset:{}},this.realized=!1,this.opened=!1,this.initOptions(e),this.holdThisInstance()};return o.BootstrapDialogModal=n,o.NAMESPACE="bootstrap-dialog",o.TYPE_DEFAULT="type-default",o.TYPE_INFO="type-info",o.TYPE_PRIMARY="type-primary",o.TYPE_SUCCESS="type-success",o.TYPE_WARNING="type-warning",o.TYPE_DANGER="type-danger",o.DEFAULT_TEXTS={},o.DEFAULT_TEXTS[o.TYPE_DEFAULT]="Information",o.DEFAULT_TEXTS[o.TYPE_INFO]="Information",o.DEFAULT_TEXTS[o.TYPE_PRIMARY]="Information",o.DEFAULT_TEXTS[o.TYPE_SUCCESS]="Success",o.DEFAULT_TEXTS[o.TYPE_WARNING]="Warning",o.DEFAULT_TEXTS[o.TYPE_DANGER]="Danger",o.DEFAULT_TEXTS.OK="OK",o.DEFAULT_TEXTS.CANCEL="Cancel",o.DEFAULT_TEXTS.CONFIRM="Confirmation",o.SIZE_NORMAL="size-normal",o.SIZE_SMALL="size-small",o.SIZE_WIDE="size-wide",o.SIZE_LARGE="size-large",o.BUTTON_SIZES={},o.BUTTON_SIZES[o.SIZE_NORMAL]="",o.BUTTON_SIZES[o.SIZE_SMALL]="",o.BUTTON_SIZES[o.SIZE_WIDE]="",o.BUTTON_SIZES[o.SIZE_LARGE]="btn-lg",o.ICON_SPINNER="glyphicon glyphicon-asterisk",o.defaultOptions={type:o.TYPE_PRIMARY,size:o.SIZE_NORMAL,cssClass:"",title:null,message:null,nl2br:!0,closable:!0,closeByBackdrop:!0,closeByKeyboard:!0,spinicon:o.ICON_SPINNER,autodestroy:!0,draggable:!1,animate:!0,description:"",tabindex:-1},o.configDefaultOptions=function(e){o.defaultOptions=t.extend(!0,o.defaultOptions,e)},o.dialogs={},o.openAll=function(){t.each(o.dialogs,function(t,e){e.open()})},o.closeAll=function(){t.each(o.dialogs,function(t,e){e.close()})},o.moveFocus=function(){var e=null;t.each(o.dialogs,function(t,n){e=n}),null!==e&&e.isRealized()&&e.getModal().focus()},o.METHODS_TO_OVERRIDE={},o.METHODS_TO_OVERRIDE["v3.1"]={handleModalBackdropEvent:function(){return this.getModal().on("click",{dialog:this},function(t){t.target===this&&t.data.dialog.isClosable()&&t.data.dialog.canCloseByBackdrop()&&t.data.dialog.close()}),this},updateZIndex:function(){var e=1040,n=1050,i=0;t.each(o.dialogs,function(t,e){i++});var s=this.getModal(),a=s.data("bs.modal").$backdrop;return s.css("z-index",n+20*(i-1)),a.css("z-index",e+20*(i-1)),this},open:function(){return!this.isRealized()&&this.realize(),this.getModal().modal("show"),this.updateZIndex(),this}},o.METHODS_TO_OVERRIDE["v3.2"]={handleModalBackdropEvent:o.METHODS_TO_OVERRIDE["v3.1"].handleModalBackdropEvent,updateZIndex:o.METHODS_TO_OVERRIDE["v3.1"].updateZIndex,open:o.METHODS_TO_OVERRIDE["v3.1"].open},o.METHODS_TO_OVERRIDE["v3.3"]={},o.METHODS_TO_OVERRIDE["v3.3.4"]=t.extend({},o.METHODS_TO_OVERRIDE["v3.1"]),o.prototype={constructor:o,initOptions:function(e){return this.options=t.extend(!0,this.defaultOptions,e),this},holdThisInstance:function(){return o.dialogs[this.getId()]=this,this},initModalStuff:function(){return this.setModal(this.createModal()).setModalDialog(this.createModalDialog()).setModalContent(this.createModalContent()).setModalHeader(this.createModalHeader()).setModalBody(this.createModalBody()).setModalFooter(this.createModalFooter()),this.getModal().append(this.getModalDialog()),this.getModalDialog().append(this.getModalContent()),this.getModalContent().append(this.getModalHeader()).append(this.getModalBody()).append(this.getModalFooter()),this},createModal:function(){var e=t('<div class="modal" role="dialog" aria-hidden="true"></div>');return e.prop("id",this.getId()),e.attr("aria-labelledby",this.getId()+"_title"),e},getModal:function(){return this.$modal},setModal:function(t){return this.$modal=t,this},createModalDialog:function(){return t('<div class="modal-dialog"></div>')},getModalDialog:function(){return this.$modalDialog},setModalDialog:function(t){return this.$modalDialog=t,this},createModalContent:function(){return t('<div class="modal-content"></div>')},getModalContent:function(){return this.$modalContent},setModalContent:function(t){return this.$modalContent=t,this},createModalHeader:function(){return t('<div class="modal-header"></div>')},getModalHeader:function(){return this.$modalHeader},setModalHeader:function(t){return this.$modalHeader=t,this},createModalBody:function(){return t('<div class="modal-body"></div>')},getModalBody:function(){return this.$modalBody},setModalBody:function(t){return this.$modalBody=t,this},createModalFooter:function(){return t('<div class="modal-footer"></div>')},getModalFooter:function(){return this.$modalFooter},setModalFooter:function(t){return this.$modalFooter=t,this},createDynamicContent:function(t){var e=null;return e="function"==typeof t?t.call(t,this):t,"string"==typeof e&&(e=this.formatStringContent(e)),e},formatStringContent:function(t){return this.options.nl2br?t.replace(/\r\n/g,"<br />").replace(/[\r\n]/g,"<br />"):t},setData:function(t,e){return this.options.data[t]=e,this},getData:function(t){return this.options.data[t]},setId:function(t){return this.options.id=t,this},getId:function(){return this.options.id},getType:function(){return this.options.type},setType:function(t){return this.options.type=t,this.updateType(),this},updateType:function(){if(this.isRealized()){var t=[o.TYPE_DEFAULT,o.TYPE_INFO,o.TYPE_PRIMARY,o.TYPE_SUCCESS,o.TYPE_WARNING,o.TYPE_DANGER];this.getModal().removeClass(t.join(" ")).addClass(this.getType())}return this},getSize:function(){return this.options.size},setSize:function(t){return this.options.size=t,this.updateSize(),this},updateSize:function(){if(this.isRealized()){var e=this;this.getModal().removeClass(o.SIZE_NORMAL).removeClass(o.SIZE_SMALL).removeClass(o.SIZE_WIDE).removeClass(o.SIZE_LARGE),this.getModal().addClass(this.getSize()),this.getModalDialog().removeClass("modal-sm"),this.getSize()===o.SIZE_SMALL&&this.getModalDialog().addClass("modal-sm"),this.getModalDialog().removeClass("modal-lg"),this.getSize()===o.SIZE_WIDE&&this.getModalDialog().addClass("modal-lg"),t.each(this.options.buttons,function(n,o){var i=e.getButton(o.id),s=["btn-lg","btn-sm","btn-xs"],a=!1;if("string"==typeof o.cssClass){var d=o.cssClass.split(" ");t.each(d,function(e,n){-1!==t.inArray(n,s)&&(a=!0)})}a||(i.removeClass(s.join(" ")),i.addClass(e.getButtonSize()))})}return this},getCssClass:function(){return this.options.cssClass},setCssClass:function(t){return this.options.cssClass=t,this},getTitle:function(){return this.options.title},setTitle:function(t){return this.options.title=t,this.updateTitle(),this},updateTitle:function(){if(this.isRealized()){var t=null!==this.getTitle()?this.createDynamicContent(this.getTitle()):this.getDefaultText();this.getModalHeader().find("."+this.getNamespace("title")).html("").append(t).prop("id",this.getId()+"_title")}return this},getMessage:function(){return this.options.message},setMessage:function(t){return this.options.message=t,this.updateMessage(),this},updateMessage:function(){if(this.isRealized()){var t=this.createDynamicContent(this.getMessage());this.getModalBody().find("."+this.getNamespace("message")).html("").append(t)}return this},isClosable:function(){return this.options.closable},setClosable:function(t){return this.options.closable=t,this.updateClosable(),this},setCloseByBackdrop:function(t){return this.options.closeByBackdrop=t,this},canCloseByBackdrop:function(){return this.options.closeByBackdrop},setCloseByKeyboard:function(t){return this.options.closeByKeyboard=t,this},canCloseByKeyboard:function(){return this.options.closeByKeyboard},isAnimate:function(){return this.options.animate},setAnimate:function(t){return this.options.animate=t,this},updateAnimate:function(){return this.isRealized()&&this.getModal().toggleClass("fade",this.isAnimate()),this},getSpinicon:function(){return this.options.spinicon},setSpinicon:function(t){return this.options.spinicon=t,this},addButton:function(t){return this.options.buttons.push(t),this},addButtons:function(e){var n=this;return t.each(e,function(t,e){n.addButton(e)}),this},getButtons:function(){return this.options.buttons},setButtons:function(t){return this.options.buttons=t,this.updateButtons(),this},getButton:function(t){return"undefined"!=typeof this.indexedButtons[t]?this.indexedButtons[t]:null},getButtonSize:function(){return"undefined"!=typeof o.BUTTON_SIZES[this.getSize()]?o.BUTTON_SIZES[this.getSize()]:""},updateButtons:function(){return this.isRealized()&&(0===this.getButtons().length?this.getModalFooter().hide():this.getModalFooter().show().find("."+this.getNamespace("footer")).html("").append(this.createFooterButtons())),this},isAutodestroy:function(){return this.options.autodestroy},setAutodestroy:function(t){this.options.autodestroy=t},getDescription:function(){return this.options.description},setDescription:function(t){return this.options.description=t,this},setTabindex:function(t){return this.options.tabindex=t,this},getTabindex:function(){return this.options.tabindex},updateTabindex:function(){return this.isRealized()&&this.getModal().attr("tabindex",this.getTabindex()),this},getDefaultText:function(){return o.DEFAULT_TEXTS[this.getType()]},getNamespace:function(t){return o.NAMESPACE+"-"+t},createHeaderContent:function(){var e=t("<div></div>");return e.addClass(this.getNamespace("header")),e.append(this.createTitleContent()),e.prepend(this.createCloseButton()),e},createTitleContent:function(){var e=t("<div></div>");return e.addClass(this.getNamespace("title")),e},createCloseButton:function(){var e=t("<div></div>");e.addClass(this.getNamespace("close-button"));var n=t('<button class="close">&times;</button>');return e.append(n),e.on("click",{dialog:this},function(t){t.data.dialog.close()}),e},createBodyContent:function(){var e=t("<div></div>");return e.addClass(this.getNamespace("body")),e.append(this.createMessageContent()),e},createMessageContent:function(){var e=t("<div></div>");return e.addClass(this.getNamespace("message")),e},createFooterContent:function(){var e=t("<div></div>");return e.addClass(this.getNamespace("footer")),e},createFooterButtons:function(){var e=this,n=t("<div></div>");return n.addClass(this.getNamespace("footer-buttons")),this.indexedButtons={},t.each(this.options.buttons,function(t,i){i.id||(i.id=o.newGuid());var s=e.createButton(i);e.indexedButtons[i.id]=s,n.append(s)}),n},createButton:function(e){var n=t('<button class="btn"></button>');return n.prop("id",e.id),n.data("button",e),"undefined"!=typeof e.icon&&""!==t.trim(e.icon)&&n.append(this.createButtonIcon(e.icon)),"undefined"!=typeof e.label&&n.append(e.label),n.addClass("undefined"!=typeof e.cssClass&&""!==t.trim(e.cssClass)?e.cssClass:"btn-default"),"undefined"!=typeof e.hotkey&&(this.registeredButtonHotkeys[e.hotkey]=n),n.on("click",{dialog:this,$button:n,button:e},function(t){var e=t.data.dialog,n=t.data.$button,o=n.data("button");"function"==typeof o.action&&o.action.call(n,e,t),o.autospin&&n.toggleSpin(!0)}),this.enhanceButton(n),n},enhanceButton:function(t){return t.dialog=this,t.toggleEnable=function(t){var e=this;return"undefined"!=typeof t?e.prop("disabled",!t).toggleClass("disabled",!t):e.prop("disabled",!e.prop("disabled")),e},t.enable=function(){var t=this;return t.toggleEnable(!0),t},t.disable=function(){var t=this;return t.toggleEnable(!1),t},t.toggleSpin=function(e){var n=this,o=n.dialog,i=n.find("."+o.getNamespace("button-icon"));return"undefined"==typeof e&&(e=!(t.find(".icon-spin").length>0)),e?(i.hide(),t.prepend(o.createButtonIcon(o.getSpinicon()).addClass("icon-spin"))):(i.show(),t.find(".icon-spin").remove()),n},t.spin=function(){var t=this;return t.toggleSpin(!0),t},t.stopSpin=function(){var t=this;return t.toggleSpin(!1),t},this},createButtonIcon:function(e){var n=t("<span></span>");return n.addClass(this.getNamespace("button-icon")).addClass(e),n},enableButtons:function(e){return t.each(this.indexedButtons,function(t,n){n.toggleEnable(e)}),this},updateClosable:function(){return this.isRealized()&&this.getModalHeader().find("."+this.getNamespace("close-button")).toggle(this.isClosable()),this},onShow:function(t){return this.options.onshow=t,this},onShown:function(t){return this.options.onshown=t,this},onHide:function(t){return this.options.onhide=t,this},onHidden:function(t){return this.options.onhidden=t,this},isRealized:function(){return this.realized},setRealized:function(t){return this.realized=t,this},isOpened:function(){return this.opened},setOpened:function(t){return this.opened=t,this},handleModalEvents:function(){return this.getModal().on("show.bs.modal",{dialog:this},function(t){var e=t.data.dialog;if(e.setOpened(!0),e.isModalEvent(t)&&"function"==typeof e.options.onshow){var n=e.options.onshow(e);return n===!1&&e.setOpened(!1),n}}),this.getModal().on("shown.bs.modal",{dialog:this},function(t){var e=t.data.dialog;e.isModalEvent(t)&&"function"==typeof e.options.onshown&&e.options.onshown(e)}),this.getModal().on("hide.bs.modal",{dialog:this},function(t){var e=t.data.dialog;if(e.setOpened(!1),e.isModalEvent(t)&&"function"==typeof e.options.onhide){var n=e.options.onhide(e);return n===!1&&e.setOpened(!0),n}}),this.getModal().on("hidden.bs.modal",{dialog:this},function(e){var n=e.data.dialog;n.isModalEvent(e)&&"function"==typeof n.options.onhidden&&n.options.onhidden(n),n.isAutodestroy()&&(delete o.dialogs[n.getId()],t(this).remove()),o.moveFocus()}),this.handleModalBackdropEvent(),this.getModal().on("keyup",{dialog:this},function(t){27===t.which&&t.data.dialog.isClosable()&&t.data.dialog.canCloseByKeyboard()&&t.data.dialog.close()}),this.getModal().on("keyup",{dialog:this},function(e){var n=e.data.dialog;if("undefined"!=typeof n.registeredButtonHotkeys[e.which]){var o=t(n.registeredButtonHotkeys[e.which]);!o.prop("disabled")&&o.focus().trigger("click")}}),this},handleModalBackdropEvent:function(){return this.getModal().on("click",{dialog:this},function(e){t(e.target).hasClass("modal-backdrop")&&e.data.dialog.isClosable()&&e.data.dialog.canCloseByBackdrop()&&e.data.dialog.close()}),this},isModalEvent:function(t){return"undefined"!=typeof t.namespace&&"bs.modal"===t.namespace},makeModalDraggable:function(){return this.options.draggable&&(this.getModalHeader().addClass(this.getNamespace("draggable")).on("mousedown",{dialog:this},function(t){var e=t.data.dialog;e.draggableData.isMouseDown=!0;var n=e.getModalDialog().offset();e.draggableData.mouseOffset={top:t.clientY-n.top,left:t.clientX-n.left}}),this.getModal().on("mouseup mouseleave",{dialog:this},function(t){t.data.dialog.draggableData.isMouseDown=!1}),t("body").on("mousemove",{dialog:this},function(t){var e=t.data.dialog;e.draggableData.isMouseDown&&e.getModalDialog().offset({top:t.clientY-e.draggableData.mouseOffset.top,left:t.clientX-e.draggableData.mouseOffset.left})})),this},realize:function(){return this.initModalStuff(),this.getModal().addClass(o.NAMESPACE).addClass(this.getCssClass()),this.updateSize(),this.getDescription()&&this.getModal().attr("aria-describedby",this.getDescription()),this.getModalFooter().append(this.createFooterContent()),this.getModalHeader().append(this.createHeaderContent()),this.getModalBody().append(this.createBodyContent()),this.getModal().data("bs.modal",new n(this.getModal(),{backdrop:"static",keyboard:!1,show:!1})),this.makeModalDraggable(),this.handleModalEvents(),this.setRealized(!0),this.updateButtons(),this.updateType(),this.updateTitle(),this.updateMessage(),this.updateClosable(),this.updateAnimate(),this.updateSize(),this.updateTabindex(),this},open:function(){return!this.isRealized()&&this.realize(),this.getModal().modal("show"),this},close:function(){return this.getModal().modal("hide"),this}},o.prototype=t.extend(o.prototype,o.METHODS_TO_OVERRIDE[n.getModalVersion()]),o.newGuid=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=16*Math.random()|0,n="x"===t?e:3&e|8;return n.toString(16)})},o.show=function(t){return new o(t).open()},o.alert=function(){var e={},n={type:o.TYPE_PRIMARY,title:null,message:null,closable:!1,draggable:!1,buttonLabel:o.DEFAULT_TEXTS.OK,callback:null};return e="object"==typeof arguments[0]&&arguments[0].constructor==={}.constructor?t.extend(!0,n,arguments[0]):t.extend(!0,n,{message:arguments[0],callback:"undefined"!=typeof arguments[1]?arguments[1]:null}),new o({type:e.type,title:e.title,message:e.message,closable:e.closable,draggable:e.draggable,data:{callback:e.callback},onhide:function(t){!t.getData("btnClicked")&&t.isClosable()&&"function"==typeof t.getData("callback")&&t.getData("callback")(!1)},buttons:[{label:e.buttonLabel,action:function(t){t.setData("btnClicked",!0),"function"==typeof t.getData("callback")&&t.getData("callback")(!0),t.close()}}]}).open()},o.confirm=function(){var e={},n={type:o.TYPE_PRIMARY,title:null,message:null,closable:!1,draggable:!1,btnCancelLabel:o.DEFAULT_TEXTS.CANCEL,btnOKLabel:o.DEFAULT_TEXTS.OK,btnOKClass:null,callback:null};return e="object"==typeof arguments[0]&&arguments[0].constructor==={}.constructor?t.extend(!0,n,arguments[0]):t.extend(!0,n,{message:arguments[0],closable:!1,buttonLabel:o.DEFAULT_TEXTS.OK,callback:"undefined"!=typeof arguments[1]?arguments[1]:null}),null===e.btnOKClass&&(e.btnOKClass=["btn",e.type.split("-")[1]].join("-")),new o({type:e.type,title:e.title,message:e.message,closable:e.closable,draggable:e.draggable,data:{callback:e.callback},buttons:[{label:e.btnCancelLabel,action:function(t){"function"==typeof t.getData("callback")&&t.getData("callback")(!1),t.close()}},{label:e.btnOKLabel,cssClass:e.btnOKClass,action:function(t){"function"==typeof t.getData("callback")&&t.getData("callback")(!0),t.close()}}]}).open()},o.warning=function(t,e){return new o({type:o.TYPE_WARNING,message:t}).open()},o.danger=function(t,e){return new o({type:o.TYPE_DANGER,message:t}).open()},o.success=function(t,e){return new o({type:o.TYPE_SUCCESS,message:t}).open()},o});
/*!
 * Fuel UX v3.11.3 
 * Copyright 2012-2015 ExactTarget
 * Licensed under the BSD-3-Clause license (https://github.com/ExactTarget/fuelux/blob/master/LICENSE)
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery","bootstrap"],a):a(jQuery)}(function(a){if("undefined"==typeof a)throw new Error("Fuel UX's JavaScript requires jQuery");if("undefined"==typeof a.fn.dropdown||"undefined"==typeof a.fn.collapse)throw new Error("Fuel UX's JavaScript requires Bootstrap");!function(a){var b=a.fn.checkbox,c=function(b,c){if(this.options=a.extend({},a.fn.checkbox.defaults,c),"label"===b.tagName.toLowerCase()){this.$label=a(b),this.$chk=this.$label.find('input[type="checkbox"]'),this.$container=a(b).parent(".checkbox");var d=this.$chk.attr("data-toggle");this.$toggleContainer=a(d),this.$chk.on("change",a.proxy(this.itemchecked,this)),this.setInitialState()}};c.prototype={constructor:c,setInitialState:function(){var a=this.$chk,b=(this.$label,a.prop("checked")),c=a.prop("disabled");this.setCheckedState(a,b),this.setDisabledState(a,c)},setCheckedState:function(a,b){var c=a,d=this.$label,e=(this.$container,this.$toggleContainer);b?(c.prop("checked",!0),d.addClass("checked"),e.removeClass("hide hidden"),d.trigger("checked.fu.checkbox")):(c.prop("checked",!1),d.removeClass("checked"),e.addClass("hidden"),d.trigger("unchecked.fu.checkbox")),d.trigger("changed.fu.checkbox",b)},setDisabledState:function(a,b){var c=this.$label;b?(this.$chk.prop("disabled",!0),c.addClass("disabled"),c.trigger("disabled.fu.checkbox")):(this.$chk.prop("disabled",!1),c.removeClass("disabled"),c.trigger("enabled.fu.checkbox"))},itemchecked:function(b){var c=a(b.target),d=c.prop("checked");this.setCheckedState(c,d)},toggle:function(){var a=this.isChecked();a?this.uncheck():this.check()},check:function(){this.setCheckedState(this.$chk,!0)},uncheck:function(){this.setCheckedState(this.$chk,!1)},isChecked:function(){var a=this.$chk.prop("checked");return a},enable:function(){this.setDisabledState(this.$chk,!1)},disable:function(){this.setDisabledState(this.$chk,!0)},destroy:function(){return this.$label.remove(),this.$label[0].outerHTML}},c.prototype.getValue=c.prototype.isChecked,a.fn.checkbox=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.checkbox"),h="object"==typeof b&&b;g||f.data("fu.checkbox",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.checkbox.defaults={},a.fn.checkbox.Constructor=c,a.fn.checkbox.noConflict=function(){return a.fn.checkbox=b,this},a(document).on("mouseover.fu.checkbox.data-api","[data-initialize=checkbox]",function(b){var c=a(b.target);c.data("fu.checkbox")||c.checkbox(c.data())}),a(function(){a("[data-initialize=checkbox]").each(function(){var b=a(this);b.data("fu.checkbox")||b.checkbox(b.data())})})}(a),function(a){var b=a.fn.combobox,c=function(b,c){this.$element=a(b),this.options=a.extend({},a.fn.combobox.defaults,c),this.$dropMenu=this.$element.find(".dropdown-menu"),this.$input=this.$element.find("input"),this.$button=this.$element.find(".btn"),this.$element.on("click.fu.combobox","a",a.proxy(this.itemclicked,this)),this.$element.on("change.fu.combobox","input",a.proxy(this.inputchanged,this)),this.$element.on("shown.bs.dropdown",a.proxy(this.menuShown,this)),this.setDefaultSelection();var d=this.$dropMenu.children("li");0===d.length&&this.$button.addClass("disabled")};c.prototype={constructor:c,destroy:function(){return this.$element.remove(),this.$element.find("input").each(function(){a(this).attr("value",a(this).val())}),this.$element[0].outerHTML},doSelect:function(a){"undefined"!=typeof a[0]?(this.$selectedItem=a,this.$input.val(this.$selectedItem.text().trim())):this.$selectedItem=null},menuShown:function(){this.options.autoResizeMenu&&this.resizeMenu()},resizeMenu:function(){var a=this.$element.outerWidth();this.$dropMenu.outerWidth(a)},selectedItem:function(){var b=this.$selectedItem,c={};if(b){var d=this.$selectedItem.text().trim();c=a.extend({text:d},this.$selectedItem.data())}else c={text:this.$input.val()};return c},selectByText:function(b){var c=a([]);this.$element.find("li").each(function(){return(this.textContent||this.innerText||a(this).text()||"").toLowerCase()===(b||"").toLowerCase()?(c=a(this),!1):void 0}),this.doSelect(c)},selectByValue:function(a){var b='li[data-value="'+a+'"]';this.selectBySelector(b)},selectByIndex:function(a){var b="li:eq("+a+")";this.selectBySelector(b)},selectBySelector:function(a){var b=this.$element.find(a);this.doSelect(b)},setDefaultSelection:function(){var a="li[data-selected=true]:first",b=this.$element.find(a);b.length>0&&(this.selectBySelector(a),b.removeData("selected"),b.removeAttr("data-selected"))},enable:function(){this.$element.removeClass("disabled"),this.$input.removeAttr("disabled"),this.$button.removeClass("disabled")},disable:function(){this.$element.addClass("disabled"),this.$input.attr("disabled",!0),this.$button.addClass("disabled")},itemclicked:function(b){this.$selectedItem=a(b.target).parent(),this.$input.val(this.$selectedItem.text().trim()).trigger("change",{synthetic:!0});var c=this.selectedItem();this.$element.trigger("changed.fu.combobox",c),b.preventDefault(),this.$element.find(".dropdown-toggle").focus()},inputchanged:function(b,c){if(!c||!c.synthetic){var d=a(b.target).val();this.selectByText(d);var e=this.selectedItem();0===e.text.length&&(e={text:d}),this.$element.trigger("changed.fu.combobox",e)}}},c.prototype.getValue=c.prototype.selectedItem,a.fn.combobox=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.combobox"),h="object"==typeof b&&b;g||f.data("fu.combobox",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.combobox.defaults={autoResizeMenu:!0},a.fn.combobox.Constructor=c,a.fn.combobox.noConflict=function(){return a.fn.combobox=b,this},a(document).on("mousedown.fu.combobox.data-api","[data-initialize=combobox]",function(b){var c=a(b.target).closest(".combobox");c.data("fu.combobox")||c.combobox(c.data())}),a(function(){a("[data-initialize=combobox]").each(function(){var b=a(this);b.data("fu.combobox")||b.combobox(b.data())})})}(a),function(a){var b="Invalid Date",c="moment.js is not available so you cannot use this function",d=[],e=!1,f=a.fn.datepicker,g=!1,h=function(){var a,b;for(g=!0,a=0,b=d.length;b>a;a++)d[a].init.call(d[a].scope);d=[]};"function"==typeof define&&define.amd?require(["moment"],function(a){e=a,h()},function(a){var b=a.requireModules&&a.requireModules[0];"moment"===b&&h()}):h();var i=function(b,c){this.$element=a(b),this.options=a.extend(!0,{},a.fn.datepicker.defaults,c),this.$calendar=this.$element.find(".datepicker-calendar"),this.$days=this.$calendar.find(".datepicker-calendar-days"),this.$header=this.$calendar.find(".datepicker-calendar-header"),this.$headerTitle=this.$header.find(".title"),this.$input=this.$element.find("input"),this.$wheels=this.$element.find(".datepicker-wheels"),this.$wheelsMonth=this.$element.find(".datepicker-wheels-month"),this.$wheelsYear=this.$element.find(".datepicker-wheels-year"),this.artificialScrolling=!1,this.formatDate=this.options.formatDate||this.formatDate,this.inputValue=null,this.moment=!1,this.momentFormat=null,this.parseDate=this.options.parseDate||this.parseDate,this.preventBlurHide=!1,this.restricted=this.options.restricted||[],this.restrictedParsed=[],this.restrictedText=this.options.restrictedText,this.sameYearOnly=this.options.sameYearOnly,this.selectedDate=null,this.yearRestriction=null,this.$calendar.find(".datepicker-today").on("click.fu.datepicker",a.proxy(this.todayClicked,this)),this.$days.on("click.fu.datepicker","tr td button",a.proxy(this.dateClicked,this)),this.$header.find(".next").on("click.fu.datepicker",a.proxy(this.next,this)),this.$header.find(".prev").on("click.fu.datepicker",a.proxy(this.prev,this)),this.$headerTitle.on("click.fu.datepicker",a.proxy(this.titleClicked,this)),this.$input.on("change.fu.datepicker",a.proxy(this.inputChanged,this)),this.$input.on("mousedown.fu.datepicker",a.proxy(this.showDropdown,this)),this.$wheels.find(".datepicker-wheels-back").on("click.fu.datepicker",a.proxy(this.backClicked,this)),this.$wheels.find(".datepicker-wheels-select").on("click.fu.datepicker",a.proxy(this.selectClicked,this)),this.$wheelsMonth.on("click.fu.datepicker","ul button",a.proxy(this.monthClicked,this)),this.$wheelsYear.on("click.fu.datepicker","ul button",a.proxy(this.yearClicked,this)),this.$wheelsYear.find("ul").on("scroll.fu.datepicker",a.proxy(this.onYearScroll,this));var f=function(){this.checkForMomentJS()&&(e=e||window.moment,this.moment=!0,this.momentFormat=this.options.momentConfig.format,this.setCulture(this.options.momentConfig.culture),e.locale=e.locale||e.lang),this.setRestrictedDates(this.restricted),this.setDate(this.options.date)||(this.$input.val(""),this.inputValue=this.$input.val()),this.sameYearOnly&&(this.yearRestriction=this.selectedDate?this.selectedDate.getFullYear():(new Date).getFullYear())};g?f.call(this):d.push({init:f,scope:this})};i.prototype={constructor:i,backClicked:function(){this.changeView("calendar")},changeView:function(a,b){"wheels"===a?(this.$calendar.hide().attr("aria-hidden","true"),this.$wheels.show().removeAttr("aria-hidden",""),b&&this.renderWheel(b)):(this.$wheels.hide().attr("aria-hidden","true"),this.$calendar.show().removeAttr("aria-hidden",""),b&&this.renderMonth(b))},checkForMomentJS:function(){return(a.isFunction(window.moment)||"undefined"!=typeof e&&a.isFunction(e))&&a.isPlainObject(this.options.momentConfig)&&"string"==typeof this.options.momentConfig.culture&&"string"==typeof this.options.momentConfig.format?!0:!1},dateClicked:function(b){var c,d=a(b.currentTarget).parents("td:first");d.hasClass("restricted")||(this.$days.find("td.selected").removeClass("selected"),d.addClass("selected"),c=new Date(d.attr("data-year"),d.attr("data-month"),d.attr("data-date")),this.selectedDate=c,this.$input.val(this.formatDate(c)),this.inputValue=this.$input.val(),this.hideDropdown(),this.$input.focus(),this.$element.trigger("dateClicked.fu.datepicker",c))},destroy:function(){return this.$element.remove(),this.$days.find("tbody").empty(),this.$wheelsYear.find("ul").empty(),this.$element[0].outerHTML},disable:function(){this.$element.addClass("disabled"),this.$element.find("input, button").attr("disabled","disabled"),this.$element.find(".input-group-btn").removeClass("open")},enable:function(){this.$element.removeClass("disabled"),this.$element.find("input, button").removeAttr("disabled")},formatDate:function(a){var b=function(a){var b="0"+a;return b.substr(b.length-2)};return this.moment?e(a).format(this.momentFormat):b(a.getMonth()+1)+"/"+b(a.getDate())+"/"+a.getFullYear()},getCulture:function(){if(this.moment)return e.locale();throw c},getDate:function(){return this.selectedDate?this.selectedDate:new Date(0/0)},getFormat:function(){if(this.moment)return this.momentFormat;throw c},getFormattedDate:function(){return this.selectedDate?this.formatDate(this.selectedDate):b},getRestrictedDates:function(){return this.restricted},inputChanged:function(){var a,b=this.$input.val();b!==this.inputValue&&(a=this.setDate(b),null===a?this.$element.trigger("inputParsingFailed.fu.datepicker",b):a===!1?this.$element.trigger("inputRestrictedDate.fu.datepicker",a):this.$element.trigger("changed.fu.datepicker",a))},showDropdown:function(){this.$input.is(":focus")||this.$element.find(".input-group-btn").addClass("open")},hideDropdown:function(){this.$element.find(".input-group-btn").removeClass("open")},isInvalidDate:function(a){var c=a.toString();return c===b||"NaN"===c?!0:!1},isRestricted:function(a,b,c){var d,e,f,g,h=this.restrictedParsed;if(this.sameYearOnly&&null!==this.yearRestriction&&c!==this.yearRestriction)return!0;for(d=0,f=h.length;f>d;d++)if(e=h[d].from,g=h[d].to,(c>e.year||c===e.year&&b>e.month||c===e.year&&b===e.month&&a>=e.date)&&(c<g.year||c===g.year&&b<g.month||c===g.year&&b===g.month&&a<=g.date))return!0;return!1},monthClicked:function(b){this.$wheelsMonth.find(".selected").removeClass("selected"),a(b.currentTarget).parent().addClass("selected")},next:function(){var a=this.$headerTitle.attr("data-month"),b=this.$headerTitle.attr("data-year");if(a++,a>11){if(this.sameYearOnly)return;a=0,b++}this.renderMonth(new Date(b,a,1))},onYearScroll:function(b){if(!this.artificialScrolling){var c,d,e=a(b.currentTarget),f="border-box"===e.css("box-sizing")?e.outerHeight():e.height(),g=e.get(0).scrollHeight,h=e.scrollTop(),i=f/(g-h)*100,j=h/g*100;if(5>j){for(d=parseInt(e.find("li:first").attr("data-year"),10),c=d-1;c>d-11;c--)e.prepend('<li data-year="'+c+'"><button type="button">'+c+"</button></li>");this.artificialScrolling=!0,e.scrollTop(e.get(0).scrollHeight-g+h),this.artificialScrolling=!1}else if(i>90)for(d=parseInt(e.find("li:last").attr("data-year"),10),c=d+1;d+11>c;c++)e.append('<li data-year="'+c+'"><button type="button">'+c+"</button></li>")}},parseDate:function(a){var b,c,d,f,g,h,i,j=this,k=new Date(0/0);if(a){if(this.moment)return f=function(a){var b=e(a,j.momentFormat);return!0===b.isValid()?b.toDate():k},d=function(a){var b=e(new Date(a));return!0===b.isValid()?b.toDate():k},g=function(a,b,c){var d=b(a);return j.isInvalidDate(d)?(d=c(d),j.isInvalidDate(d)?k:d):d},"string"==typeof a?g(a,f,d):g(a,d,f);if("string"==typeof a){if(b=new Date(Date.parse(a)),!this.isInvalidDate(b))return b;if(a=a.split("T")[0],c=/^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,i=c.exec(a),i&&(h=parseInt(i[2],10),b=new Date(i[1],h-1,i[3]),h===b.getMonth()+1))return b}else if(b=new Date(a),!this.isInvalidDate(b))return b}return new Date(0/0)},prev:function(){var a=this.$headerTitle.attr("data-month"),b=this.$headerTitle.attr("data-year");if(a--,0>a){if(this.sameYearOnly)return;a=11,b--}this.renderMonth(new Date(b,a,1))},renderMonth:function(b){b=b||new Date;var c,d,e,f,g,h,i,j,k,l,m,n=new Date(b.getFullYear(),b.getMonth(),1).getDay(),o=new Date(b.getFullYear(),b.getMonth()+1,0).getDate(),p=new Date(b.getFullYear(),b.getMonth(),0).getDate(),q=this.$headerTitle.find(".month"),r=b.getMonth(),s=new Date,t=s.getDate(),u=s.getMonth(),v=s.getFullYear(),w=this.selectedDate,x=this.$days.find("tbody"),y=b.getFullYear();for(w&&(w={date:w.getDate(),month:w.getMonth(),year:w.getFullYear()}),q.find(".current").removeClass("current"),q.find('span[data-month="'+r+'"]').addClass("current"),this.$headerTitle.find(".year").text(y),this.$headerTitle.attr({"data-month":r,"data-year":y}),x.empty(),0!==n?(c=p-n+1,i=-1):(c=1,i=0),h=35-n>=o?5:6,f=0;h>f;f++){for(m=a("<tr></tr>"),g=0;7>g;g++)l=a("<td></td>"),-1===i?(l.addClass("last-month"),j!==i&&l.addClass("first")):1===i&&(l.addClass("next-month"),j!==i&&l.addClass("first")),d=r+i,e=y,0>d?(d=11,e--):d>11&&(d=0,e++),l.attr({"data-date":c,"data-month":d,"data-year":e}),e===v&&d===u&&c===t?l.addClass("current-day"):(v>e||e===v&&u>d||e===v&&d===u&&t>c)&&(l.addClass("past"),this.options.allowPastDates||l.addClass("restricted").attr("title",this.restrictedText)),this.isRestricted(c,d,e)&&l.addClass("restricted").attr("title",this.restrictedText),w&&e===w.year&&d===w.month&&c===w.date&&l.addClass("selected"),l.html(l.hasClass("restricted")?'<span><b class="datepicker-date">'+c+"</b></span>":'<span><button type="button" class="datepicker-date">'+c+"</button></span>"),c++,k=j,j=i,-1===i&&c>p?(c=1,i=0,k!==i&&l.addClass("last")):0===i&&c>o&&(c=1,i=1,k!==i&&l.addClass("last")),f===h-1&&6===g&&l.addClass("last"),m.append(l);x.append(m)}},renderWheel:function(a){var b,c,d,e=a.getMonth(),f=this.$wheelsMonth.find("ul"),g=a.getFullYear(),h=this.$wheelsYear.find("ul");for(this.sameYearOnly?(this.$wheelsMonth.addClass("full"),this.$wheelsYear.addClass("hidden")):(this.$wheelsMonth.removeClass("full"),this.$wheelsYear.removeClass("hide hidden")),f.find(".selected").removeClass("selected"),c=f.find('li[data-month="'+e+'"]'),c.addClass("selected"),f.scrollTop(f.scrollTop()+(c.position().top-f.outerHeight()/2-c.outerHeight(!0)/2)),h.empty(),b=g-10;g+11>b;b++)h.append('<li data-year="'+b+'"><button type="button">'+b+"</button></li>");d=h.find('li[data-year="'+g+'"]'),d.addClass("selected"),this.artificialScrolling=!0,h.scrollTop(h.scrollTop()+(d.position().top-h.outerHeight()/2-d.outerHeight(!0)/2)),this.artificialScrolling=!1,c.find("button").focus()},selectClicked:function(){var a=this.$wheelsMonth.find(".selected").attr("data-month"),b=this.$wheelsYear.find(".selected").attr("data-year");this.changeView("calendar",new Date(b,a,1))},setCulture:function(a){if(!a)return!1;if(!this.moment)throw c;e.locale(a)},setDate:function(a){var b=this.parseDate(a);return this.isInvalidDate(b)?(this.selectedDate=null,this.renderMonth()):this.isRestricted(b.getDate(),b.getMonth(),b.getFullYear())?(this.selectedDate=!1,this.renderMonth()):(this.selectedDate=b,this.renderMonth(b),this.$input.val(this.formatDate(b))),this.inputValue=this.$input.val(),this.selectedDate},setFormat:function(a){if(!a)return!1;if(!this.moment)throw c;this.momentFormat=a},setRestrictedDates:function(a){var b,c,d=[],e=this,f=function(a){return a===-1/0?{date:-1/0,month:-1/0,year:-1/0}:1/0===a?{date:1/0,month:1/0,year:1/0}:(a=e.parseDate(a),{date:a.getDate(),month:a.getMonth(),year:a.getFullYear()})};for(this.restricted=a,b=0,c=a.length;c>b;b++)d.push({from:f(a[b].from),to:f(a[b].to)});this.restrictedParsed=d},titleClicked:function(){this.changeView("wheels",new Date(this.$headerTitle.attr("data-year"),this.$headerTitle.attr("data-month"),1))},todayClicked:function(){var a=new Date;(a.getMonth()+""!==this.$headerTitle.attr("data-month")||a.getFullYear()+""!==this.$headerTitle.attr("data-year"))&&this.renderMonth(a)},yearClicked:function(b){this.$wheelsYear.find(".selected").removeClass("selected"),a(b.currentTarget).parent().addClass("selected")}},i.prototype.getValue=i.prototype.getDate,a.fn.datepicker=function(b){var c,d=Array.prototype.slice.call(arguments,1),e=this.each(function(){var e=a(this),f=e.data("fu.datepicker"),g="object"==typeof b&&b;f||e.data("fu.datepicker",f=new i(this,g)),"string"==typeof b&&(c=f[b].apply(f,d))});return void 0===c?e:c},a.fn.datepicker.defaults={allowPastDates:!1,date:new Date,formatDate:null,momentConfig:{culture:"en",format:"L"},parseDate:null,restricted:[],restrictedText:"Restricted",sameYearOnly:!1},a.fn.datepicker.Constructor=i,a.fn.datepicker.noConflict=function(){return a.fn.datepicker=f,this},a(document).on("mousedown.fu.datepicker.data-api","[data-initialize=datepicker]",function(b){var c=a(b.target).closest(".datepicker");c.data("datepicker")||c.datepicker(c.data())}),a(document).on("click.fu.datepicker.data-api",".datepicker .dropdown-menu",function(b){var c=a(b.target);(!c.is(".datepicker-date")||c.closest(".restricted").length)&&b.stopPropagation()}),a(document).on("click.fu.datepicker.data-api",".datepicker input",function(a){a.stopPropagation()}),a(function(){a("[data-initialize=datepicker]").each(function(){var b=a(this);b.data("datepicker")||b.datepicker(b.data())})})}(a),function(a){function b(b){a(b).css({visibility:"hidden"}),c(b)?b.parent().addClass("dropup"):b.parent().removeClass("dropup"),a(b).css({visibility:"visible"})}function c(a){var b=d(a),c={};return c.parentHeight=a.parent().outerHeight(),c.parentOffsetTop=a.parent().offset().top,c.dropdownHeight=a.outerHeight(),c.containerHeight=b.overflowElement.outerHeight(),c.containerOffsetTop=b.isWindow?b.overflowElement.scrollTop():b.overflowElement.offset().top,c.fromTop=c.parentOffsetTop-c.containerOffsetTop,c.fromBottom=c.containerHeight-c.parentHeight-(c.parentOffsetTop-c.containerOffsetTop),c.dropdownHeight<c.fromBottom?!1:c.dropdownHeight<c.fromTop?!0:c.dropdownHeight>=c.fromTop&&c.dropdownHeight>=c.fromBottom?c.fromTop>=c.fromBottom?!0:!1:void 0}function d(b){var c,d;return b.attr("data-target")?(c=b.attr("data-target"),d=!1):(c=window,d=!0),a.each(b.parents(),function(b,e){return"visible"!==a(e).css("overflow")?(c=e,d=!1,!1):void 0}),{overflowElement:a(c),isWindow:d}}a(document.body).on("click.fu.dropdown-autoflip","[data-toggle=dropdown][data-flip]",function(){"auto"===a(this).data().flip&&b(a(this).next(".dropdown-menu"))}),a(document.body).on("suggested.fu.pillbox",function(c,d){b(a(d)),a(d).parent().addClass("open")}),a.fn.dropdownautoflip=function(){}}(a),function(a){var b=a.fn.loader,c=function(b,c){this.$element=a(b),this.options=a.extend({},a.fn.loader.defaults,c),this.begin=this.$element.is("[data-begin]")?parseInt(this.$element.attr("data-begin"),10):1,this.delay=this.$element.is("[data-delay]")?parseFloat(this.$element.attr("data-delay")):150,this.end=this.$element.is("[data-end]")?parseInt(this.$element.attr("data-end"),10):8,this.frame=this.$element.is("[data-frame]")?parseInt(this.$element.attr("data-frame"),10):this.begin,this.isIElt9=!1,this.timeout={};var d=this.msieVersion();d!==!1&&9>d&&(this.$element.addClass("iefix"),this.isIElt9=!0),this.$element.attr("data-frame",this.frame+""),this.play()};c.prototype={constructor:c,destroy:function(){return this.pause(),this.$element.remove(),this.$element[0].outerHTML},ieRepaint:function(){this.isIElt9&&this.$element.addClass("iefix_repaint").removeClass("iefix_repaint")},msieVersion:function(){var a=window.navigator.userAgent,b=a.indexOf("MSIE ");return b>0?parseInt(a.substring(b+5,a.indexOf(".",b)),10):!1},next:function(){this.frame++,this.frame>this.end&&(this.frame=this.begin),this.$element.attr("data-frame",this.frame+""),this.ieRepaint()},pause:function(){clearTimeout(this.timeout)},play:function(){var a=this;clearTimeout(this.timeout),this.timeout=setTimeout(function(){a.next(),a.play()},this.delay)},previous:function(){this.frame--,this.frame<this.begin&&(this.frame=this.end),this.$element.attr("data-frame",this.frame+""),this.ieRepaint()},reset:function(){this.frame=this.begin,this.$element.attr("data-frame",this.frame+""),this.ieRepaint()}},a.fn.loader=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.loader"),h="object"==typeof b&&b;g||f.data("fu.loader",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.loader.defaults={},a.fn.loader.Constructor=c,a.fn.loader.noConflict=function(){return a.fn.loader=b,this},a(function(){a("[data-initialize=loader]").each(function(){var b=a(this);b.data("fu.loader")||b.loader(b.data())})})}(a),function(a){var b=a.fn.placard,c={accepted:"onAccept",cancelled:"onCancel"},d=function(b,c){var d=this;this.$element=a(b),this.options=a.extend({},a.fn.placard.defaults,c),"true"===this.$element.attr("data-ellipsis")&&(this.options.applyEllipsis=!0),this.$accept=this.$element.find(".placard-accept"),this.$cancel=this.$element.find(".placard-cancel"),this.$field=this.$element.find(".placard-field"),this.$footer=this.$element.find(".placard-footer"),this.$header=this.$element.find(".placard-header"),this.$popup=this.$element.find(".placard-popup"),this.actualValue=null,this.clickStamp="_",this.previousValue="",-1===this.options.revertOnCancel&&(this.options.revertOnCancel=this.$accept.length>0?!0:!1),this.isInput=this.$field.is("input"),this.$field.on("focus.fu.placard",a.proxy(this.show,this)),this.$field.on("keydown.fu.placard",a.proxy(this.keyComplete,this)),this.$element.on("close.fu.placard",a.proxy(this.hide,this)),this.$accept.on("click.fu.placard",a.proxy(this.complete,this,"accepted")),this.$cancel.on("click.fu.placard",function(a){a.preventDefault(),d.complete("cancelled")}),this.applyEllipsis()},e=function(a){return a.$element.hasClass("showing")?!0:!1},f=function(){var b;if(b=a(document).find(".placard.showing"),b.length>0){if(b.data("fu.placard")&&b.data("fu.placard").options.explicit)return!1;b.placard("externalClickListener",{},!0)}return!0};d.prototype={constructor:d,complete:function(a){var b=this.options[c[a]],d={previousValue:this.previousValue,value:this.getValue()};b?(b(d),this.$element.trigger(a+".fu.placard",d)):("cancelled"===a&&this.options.revertOnCancel&&this.setValue(this.previousValue,!0),this.$element.trigger(a+".fu.placard",d),this.hide())},keyComplete:function(a){this.isInput&&13===a.keyCode?(this.complete("accepted"),this.$field.blur()):27===a.keyCode&&(this.complete("cancelled"),this.$field.blur())},destroy:function(){return this.$element.remove(),a(document).off("click.fu.placard.externalClick."+this.clickStamp),this.$element.find("input").each(function(){a(this).attr("value",a(this).val())}),this.$element[0].outerHTML},disable:function(){this.$element.addClass("disabled"),this.$field.attr("disabled","disabled"),this.hide()},applyEllipsis:function(){var a,b,c;if(this.options.applyEllipsis)if(a=this.$field.get(0),this.$field.is("input"))a.scrollLeft=0;else if(a.scrollTop=0,a.clientHeight<a.scrollHeight){for(this.actualValue=this.getValue(),this.setValue("",!0),c="",b=0;a.clientHeight>=a.scrollHeight;)c+=this.actualValue[b],this.setValue(c+"...",!0),b++;c=c.length>0?c.substring(0,c.length-1):"",this.setValue(c+"...",!0)}},enable:function(){this.$element.removeClass("disabled"),this.$field.removeAttr("disabled")},externalClickListener:function(a,b){(b===!0||this.isExternalClick(a))&&this.complete(this.options.externalClickAction)},getValue:function(){return null!==this.actualValue?this.actualValue:this.$field.val()},hide:function(){this.$element.hasClass("showing")&&(this.$element.removeClass("showing"),this.applyEllipsis(),a(document).off("click.fu.placard.externalClick."+this.clickStamp),this.$element.trigger("hidden.fu.placard"))},isExternalClick:function(b){var c,d,e=this.$element.get(0),f=this.options.externalClickExceptions||[],g=a(b.target);if(b.target===e||g.parents(".placard:first").get(0)===e)return!1;for(c=0,d=f.length;d>c;c++)if(g.is(f[c])||g.parents(f[c]).length>0)return!1;return!0},setValue:function(a,b){return"undefined"==typeof b&&(b=!this.options.applyEllipsis),this.$field.val(a),b||e(this)||this.applyEllipsis(),this.$field},show:function(){e(this)||f()&&(this.previousValue=this.$field.val(),null!==this.actualValue&&(this.setValue(this.actualValue),this.actualValue=null),this.showPlacard())},showPlacard:function(){this.$element.addClass("showing"),this.$header.length>0&&this.$popup.css("top","-"+this.$header.outerHeight(!0)+"px"),this.$footer.length>0&&this.$popup.css("bottom","-"+this.$footer.outerHeight(!0)+"px"),this.$element.trigger("shown.fu.placard"),this.clickStamp=(new Date).getTime()+(Math.floor(100*Math.random())+1),this.options.explicit||a(document).on("click.fu.placard.externalClick."+this.clickStamp,a.proxy(this.externalClickListener,this))}},a.fn.placard=function(b){var c,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.placard"),h="object"==typeof b&&b;g||f.data("fu.placard",g=new d(this,h)),"string"==typeof b&&(c=g[b].apply(g,e))});return void 0===c?f:c},a.fn.placard.defaults={onAccept:void 0,onCancel:void 0,externalClickAction:"cancelled",externalClickExceptions:[],explicit:!1,revertOnCancel:-1,applyEllipsis:!1},a.fn.placard.Constructor=d,a.fn.placard.noConflict=function(){return a.fn.placard=b,this},a(document).on("focus.fu.placard.data-api","[data-initialize=placard]",function(b){var c=a(b.target).closest(".placard");c.data("fu.placard")||c.placard(c.data())}),a(function(){a("[data-initialize=placard]").each(function(){var b=a(this);b.data("fu.placard")||b.placard(b.data())})})}(a),function(a){var b=a.fn.radio,c=function(b,c){if(this.options=a.extend({},a.fn.radio.defaults,c),"label"===b.tagName.toLowerCase()){this.$label=a(b),this.$radio=this.$label.find('input[type="radio"]'),this.groupName=this.$radio.attr("name");var d=this.$radio.attr("data-toggle");this.$toggleContainer=a(d),this.$radio.on("change",a.proxy(this.itemchecked,this)),this.setInitialState()}};c.prototype={constructor:c,setInitialState:function(){var a=this.$radio,b=(this.$label,a.prop("checked")),c=a.prop("disabled");this.setCheckedState(a,b),this.setDisabledState(a,c)},resetGroup:function(){var b=a('input[name="'+this.groupName+'"]');b.each(function(b,c){var d=a(c),e=d.parent(),f=d.attr("data-toggle"),g=a(f);e.removeClass("checked"),g.addClass("hidden")})},setCheckedState:function(b,c){var d=b,e=d.parent(),f=d.attr("data-toggle"),g=a(f);c?(this.resetGroup(),d.prop("checked",!0),e.addClass("checked"),g.removeClass("hide hidden"),e.trigger("checked.fu.radio")):(d.prop("checked",!1),e.removeClass("checked"),g.addClass("hidden"),e.trigger("unchecked.fu.radio")),e.trigger("changed.fu.radio",c)},setDisabledState:function(a,b){var c=this.$label;b?(this.$radio.prop("disabled",!0),c.addClass("disabled"),c.trigger("disabled.fu.radio")):(this.$radio.prop("disabled",!1),c.removeClass("disabled"),c.trigger("enabled.fu.radio"))},itemchecked:function(b){var c=a(b.target);this.setCheckedState(c,!0)},check:function(){this.setCheckedState(this.$radio,!0)},uncheck:function(){this.setCheckedState(this.$radio,!1)},isChecked:function(){var a=this.$radio.prop("checked");return a},enable:function(){this.setDisabledState(this.$radio,!1)},disable:function(){this.setDisabledState(this.$radio,!0)},destroy:function(){return this.$label.remove(),this.$label[0].outerHTML}},c.prototype.getValue=c.prototype.isChecked,a.fn.radio=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.radio"),h="object"==typeof b&&b;g||f.data("fu.radio",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.radio.defaults={},a.fn.radio.Constructor=c,a.fn.radio.noConflict=function(){return a.fn.radio=b,this},a(document).on("mouseover.fu.radio.data-api","[data-initialize=radio]",function(b){var c=a(b.target);c.data("fu.radio")||c.radio(c.data())}),a(function(){a("[data-initialize=radio]").each(function(){var b=a(this);b.data("fu.radio")||b.radio(b.data())})})}(a),function(a){var b=a.fn.search,c=function(b,c){this.$element=a(b),this.options=a.extend({},a.fn.search.defaults,c),this.$button=this.$element.find("button"),this.$input=this.$element.find("input"),this.$icon=this.$element.find(".glyphicon"),this.$button.on("click.fu.search",a.proxy(this.buttonclicked,this)),this.$input.on("keydown.fu.search",a.proxy(this.keypress,this)),this.$input.on("keyup.fu.search",a.proxy(this.keypressed,this)),this.activeSearch=""};c.prototype={constructor:c,destroy:function(){return this.$element.remove(),this.$element.find("input").each(function(){a(this).attr("value",a(this).val())}),this.$element[0].outerHTML},search:function(a){this.$icon.hasClass("glyphicon")&&this.$icon.removeClass("glyphicon-search").addClass("glyphicon-remove"),this.activeSearch=a,this.$element.addClass("searched"),this.$element.trigger("searched.fu.search",a)},clear:function(){this.$icon.hasClass("glyphicon")&&this.$icon.removeClass("glyphicon-remove").addClass("glyphicon-search"),this.activeSearch="",this.$input.val(""),this.$element.removeClass("searched"),this.$element.trigger("cleared.fu.search")},action:function(){var a=this.$input.val(),b=""===a||a===this.activeSearch;this.activeSearch&&b?this.clear():a&&this.search(a)},buttonclicked:function(b){b.preventDefault(),a(b.currentTarget).is(".disabled, :disabled")||this.action()},keypress:function(a){13===a.which&&a.preventDefault()},keypressed:function(a){var b,c="glyphicon-remove",d="glyphicon-search";13===a.which?(a.preventDefault(),this.action()):9===a.which?a.preventDefault():(b=this.$input.val(),b===this.activeSearch&&b?this.$icon.removeClass(d).addClass(c):(this.$icon.removeClass(c).addClass(d),b?this.$element.removeClass("searched"):this.options.clearOnEmpty&&this.clear()))},disable:function(){this.$element.addClass("disabled"),this.$input.attr("disabled","disabled"),this.$button.addClass("disabled")},enable:function(){this.$element.removeClass("disabled"),this.$input.removeAttr("disabled"),this.$button.removeClass("disabled")}},a.fn.search=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.search"),h="object"==typeof b&&b;g||f.data("fu.search",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.search.defaults={clearOnEmpty:!1},a.fn.search.Constructor=c,a.fn.search.noConflict=function(){return a.fn.search=b,this
},a(document).on("mousedown.fu.search.data-api","[data-initialize=search]",function(b){var c=a(b.target).closest(".search");c.data("fu.search")||c.search(c.data())}),a(function(){a("[data-initialize=search]").each(function(){var b=a(this);b.data("fu.search")||b.search(b.data())})})}(a),function(a){var b=a.fn.selectlist,c=function(b,c){this.$element=a(b),this.options=a.extend({},a.fn.selectlist.defaults,c),this.$button=this.$element.find(".btn.dropdown-toggle"),this.$hiddenField=this.$element.find(".hidden-field"),this.$label=this.$element.find(".selected-label"),this.$dropdownMenu=this.$element.find(".dropdown-menu"),this.$element.on("click.fu.selectlist",".dropdown-menu a",a.proxy(this.itemClicked,this)),this.setDefaultSelection(),("auto"===c.resize||"auto"===this.$element.attr("data-resize"))&&this.resize();var d=this.$dropdownMenu.children("li");0===d.length&&(this.disable(),this.doSelect(a(this.options.emptyLabelHTML))),this.$element.on("shown.bs.dropdown",function(){var b=a(this);a(document).on("keypress.fu.selectlist",function(c){var d=String.fromCharCode(c.which);b.find("li").each(function(b,c){return a(c).text().charAt(0).toLowerCase()===d?(a(c).children("a").focus(),!1):void 0})})}),this.$element.on("hide.bs.dropdown",function(){a(document).off("keypress.fu.selectlist")})};c.prototype={constructor:c,destroy:function(){return this.$element.remove(),this.$element[0].outerHTML},doSelect:function(b){var c;this.$selectedItem=c=b,this.$hiddenField.val(this.$selectedItem.attr("data-value")),this.$label.html(a(this.$selectedItem.children()[0]).html()),this.$element.find("li").each(function(){c.is(a(this))?a(this).attr("data-selected",!0):a(this).removeData("selected").removeAttr("data-selected")})},itemClicked:function(b){this.$element.trigger("clicked.fu.selectlist",this.$selectedItem),b.preventDefault(),a(b.currentTarget).parent("li").is(".disabled, :disabled")||(a(b.target).parent().is(this.$selectedItem)||this.itemChanged(b),this.$element.find(".dropdown-toggle").focus())},itemChanged:function(b){this.doSelect(a(b.target).closest("li"));var c=this.selectedItem();this.$element.trigger("changed.fu.selectlist",c)},resize:function(){var b=0,c=0,d=a("<div/>").addClass("selectlist-sizer");Boolean(a(document).find("html").hasClass("fuelux"))?a(document.body).append(d):a(".fuelux:first").append(d),d.append(this.$element.clone()),this.$element.find("a").each(function(){d.find(".selected-label").text(a(this).text()),c=d.find(".selectlist").outerWidth(),c+=d.find(".sr-only").outerWidth(),c>b&&(b=c)}),1>=b||(this.$button.css("width",b),this.$dropdownMenu.css("width",b),d.remove())},selectedItem:function(){var b=this.$selectedItem.text();return a.extend({text:b},this.$selectedItem.data())},selectByText:function(b){var c=a([]);this.$element.find("li").each(function(){return(this.textContent||this.innerText||a(this).text()||"").toLowerCase()===(b||"").toLowerCase()?(c=a(this),!1):void 0}),this.doSelect(c)},selectByValue:function(a){var b='li[data-value="'+a+'"]';this.selectBySelector(b)},selectByIndex:function(a){var b="li:eq("+a+")";this.selectBySelector(b)},selectBySelector:function(a){var b=this.$element.find(a);this.doSelect(b)},setDefaultSelection:function(){var a=this.$element.find("li[data-selected=true]").eq(0);0===a.length&&(a=this.$element.find("li").has("a").eq(0)),this.doSelect(a)},enable:function(){this.$element.removeClass("disabled"),this.$button.removeClass("disabled")},disable:function(){this.$element.addClass("disabled"),this.$button.addClass("disabled")}},c.prototype.getValue=c.prototype.selectedItem,a.fn.selectlist=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.selectlist"),h="object"==typeof b&&b;g||f.data("fu.selectlist",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.selectlist.defaults={emptyLabelHTML:'<li data-value=""><a href="#">No items</a></li>'},a.fn.selectlist.Constructor=c,a.fn.selectlist.noConflict=function(){return a.fn.selectlist=b,this},a(document).on("mousedown.fu.selectlist.data-api","[data-initialize=selectlist]",function(b){var c=a(b.target).closest(".selectlist");c.data("fu.selectlist")||c.selectlist(c.data())}),a(function(){a("[data-initialize=selectlist]").each(function(){var b=a(this);b.data("fu.selectlist")||b.selectlist(b.data())})})}(a),function(a){var b=a.fn.spinbox,c=function(b,c){this.$element=a(b),this.$element.find(".btn").on("click",function(a){a.preventDefault()}),this.options=a.extend({},a.fn.spinbox.defaults,c),this.options.step=this.$element.data("step")||this.options.step,this.$input=this.$element.find(".spinbox-input"),this.$element.on("focusin.fu.spinbox",this.$input,a.proxy(this.changeFlag,this)),this.$element.on("focusout.fu.spinbox",this.$input,a.proxy(this.change,this)),this.$element.on("keydown.fu.spinbox",this.$input,a.proxy(this.keydown,this)),this.$element.on("keyup.fu.spinbox",this.$input,a.proxy(this.keyup,this)),this.bindMousewheelListeners(),this.mousewheelTimeout={},this.options.hold?(this.$element.on("mousedown.fu.spinbox",".spinbox-up",a.proxy(function(){this.startSpin(!0)},this)),this.$element.on("mouseup.fu.spinbox",".spinbox-up, .spinbox-down",a.proxy(this.stopSpin,this)),this.$element.on("mouseout.fu.spinbox",".spinbox-up, .spinbox-down",a.proxy(this.stopSpin,this)),this.$element.on("mousedown.fu.spinbox",".spinbox-down",a.proxy(function(){this.startSpin(!1)},this))):(this.$element.on("click.fu.spinbox",".spinbox-up",a.proxy(function(){this.step(!0)},this)),this.$element.on("click.fu.spinbox",".spinbox-down",a.proxy(function(){this.step(!1)},this))),this.switches={count:1,enabled:!0},this.switches.speed="medium"===this.options.speed?300:"fast"===this.options.speed?100:500,this.lastValue=this.options.value,this.render(),this.options.disabled&&this.disable()};c.prototype={constructor:c,destroy:function(){return this.$element.remove(),this.$element.find("input").each(function(){a(this).attr("value",a(this).val())}),this.$element[0].outerHTML},render:function(){var b=this.parseInput(this.$input.val()),c="";""!==b&&0===this.options.value?this.value(b):this.output(this.options.value),this.options.units.length&&a.each(this.options.units,function(a,b){b.length>c.length&&(c=b)})},output:function(a,b){return a=(a+"").split(".").join(this.options.decimalMark),""!==this.options.defaultUnit&&this.options.defaultUnit!==a.slice(-Math.abs(this.options.defaultUnit.length))&&this.isUnitLegal(this.options.defaultUnit)&&(a+=this.options.defaultUnit),b=b||!0,b&&this.$input.val(a),a},parseInput:function(a){return a=(a+"").split(this.options.decimalMark).join(".")},change:function(){var a=this.parseInput(this.$input.val())||"";this.options.units.length||"."!==this.options.decimalMark?a=this.parseValueWithUnit(a):a/1?a=this.options.value=this.checkMaxMin(a/1):(a=this.checkMaxMin(a.replace(/[^0-9.-]/g,"")||""),this.options.value=a/1),this.output(a),this.changeFlag=!1,this.triggerChangedEvent()},changeFlag:function(){this.changeFlag=!0},stopSpin:function(){void 0!==this.switches.timeout&&(clearTimeout(this.switches.timeout),this.switches.count=1,this.triggerChangedEvent())},triggerChangedEvent:function(){var a=this.value();a!==this.lastValue&&(this.lastValue=a,this.$element.trigger("changed.fu.spinbox",this.output(a,!1)))},startSpin:function(b){if(!this.options.disabled){var c=this.switches.count;1===c?(this.step(b),c=1):c=3>c?1.5:8>c?2.5:4,this.switches.timeout=setTimeout(a.proxy(function(){this.iterate(b)},this),this.switches.speed/c),this.switches.count++}},iterate:function(a){this.step(a),this.startSpin(a)},step:function(a){var b,c,d,e;if(this.changeFlag&&this.change(),d=this.options.value,e=a?this.options.max:this.options.min,a?e>d:d>e){var f=d+(a?1:-1)*this.options.step;this.options.step%1!==0&&(b=(this.options.step+"").split(".")[1].length,c=Math.pow(10,b),f=Math.round(f*c)/c),this.value((a?f>e:e>f)?e:f)}else if(this.options.cycle){var g=a?this.options.min:this.options.max;this.value(g)}},getValue:function(){return this.value()},value:function(a){return a||0===a?this.options.units.length||"."!==this.options.decimalMark?(this.output(this.parseValueWithUnit(a+(this.unit||""))),this):!isNaN(parseFloat(a))&&isFinite(a)?(this.options.value=a/1,this.output(a+(this.unit?this.unit:"")),this):void 0:(this.changeFlag&&this.change(),this.unit?this.options.value+this.unit:this.output(this.options.value,!1))},isUnitLegal:function(b){var c;return a.each(this.options.units,function(a,d){return d.toLowerCase()===b.toLowerCase()?(c=b.toLowerCase(),!1):void 0}),c},parseValueWithUnit:function(a){var b=a.replace(/[^a-zA-Z]/g,""),c=a.replace(/[^0-9.-]/g,"");return b&&(b=this.isUnitLegal(b)),this.options.value=this.checkMaxMin(c/1),this.unit=b||void 0,this.options.value+(b||"")},checkMaxMin:function(a){return isNaN(parseFloat(a))?a:(a<=this.options.max&&a>=this.options.min||(a=a>=this.options.max?this.options.max:this.options.min),a)},disable:function(){this.options.disabled=!0,this.$element.addClass("disabled"),this.$input.attr("disabled",""),this.$element.find("button").addClass("disabled")},enable:function(){this.options.disabled=!1,this.$element.removeClass("disabled"),this.$input.removeAttr("disabled"),this.$element.find("button").removeClass("disabled")},keydown:function(a){var b=a.keyCode;38===b?this.step(!0):40===b&&this.step(!1)},keyup:function(a){var b=a.keyCode;(38===b||40===b)&&this.triggerChangedEvent()},bindMousewheelListeners:function(){var b=this.$input.get(0);b.addEventListener?(b.addEventListener("mousewheel",a.proxy(this.mousewheelHandler,this),!1),b.addEventListener("DOMMouseScroll",a.proxy(this.mousewheelHandler,this),!1)):b.attachEvent("onmousewheel",a.proxy(this.mousewheelHandler,this))},mousewheelHandler:function(a){if(!this.options.disabled){var b=window.event||a,c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail)),d=this;return clearTimeout(this.mousewheelTimeout),this.mousewheelTimeout=setTimeout(function(){d.triggerChangedEvent()},300),this.step(0>c?!0:!1),b.preventDefault?b.preventDefault():b.returnValue=!1,!1}}},a.fn.spinbox=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.spinbox"),h="object"==typeof b&&b;g||f.data("fu.spinbox",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.spinbox.defaults={value:0,min:0,max:999,step:1,hold:!0,speed:"medium",disabled:!1,cycle:!1,units:[],decimalMark:".",defaultUnit:""},a.fn.spinbox.Constructor=c,a.fn.spinbox.noConflict=function(){return a.fn.spinbox=b,this},a(document).on("mousedown.fu.spinbox.data-api","[data-initialize=spinbox]",function(b){var c=a(b.target).closest(".spinbox");c.data("fu.spinbox")||c.spinbox(c.data())}),a(function(){a("[data-initialize=spinbox]").each(function(){var b=a(this);b.data("fu.spinbox")||b.spinbox(b.data())})})}(a),function(a){function b(a,b){a.addClass("tree-selected"),"item"===a.data("type")&&b.hasClass("fueluxicon-bullet")&&b.removeClass("fueluxicon-bullet").addClass("glyphicon-ok")}function c(a,b){a.removeClass("tree-selected"),"item"===a.data("type")&&b.hasClass("glyphicon-ok")&&b.removeClass("glyphicon-ok").addClass("fueluxicon-bullet")}function d(d,e,f){a.each(f.$elements,function(b,c){var d=a(c);d[0]!==e.$element[0]&&f.dataForEvent.push(a(d).data())}),e.$element.hasClass("tree-selected")?(c(e.$element,e.$icon),f.eventType="deselected"):(b(e.$element,e.$icon),f.eventType="selected",f.dataForEvent.push(e.elementData))}function e(a,d,e){if(e.$elements[0]!==d.$element[0]){{a.deselectAll(a.$element)}b(d.$element,d.$icon),e.eventType="selected",e.dataForEvent=[d.elementData]}else c(d.$element,d.$icon),e.eventType="deselected",e.dataForEvent=[]}var f=a.fn.tree,g=function(b,c){this.$element=a(b),this.options=a.extend({},a.fn.tree.defaults,c),this.options.itemSelect&&this.$element.on("click.fu.tree",".tree-item",a.proxy(function(a){this.selectItem(a.currentTarget)},this)),this.$element.on("click.fu.tree",".tree-branch-name",a.proxy(function(a){this.toggleFolder(a.currentTarget)},this)),this.options.folderSelect&&(this.$element.addClass("tree-folder-select"),this.$element.off("click.fu.tree",".tree-branch-name"),this.$element.on("click.fu.tree",".icon-caret",a.proxy(function(b){this.toggleFolder(a(b.currentTarget).parent())},this)),this.$element.on("click.fu.tree",".tree-branch-name",a.proxy(function(b){this.selectFolder(a(b.currentTarget))},this))),this.render()};g.prototype={constructor:g,deselectAll:function(b){b=b||this.$element;var d=a(b).find(".tree-selected");return d.each(function(b,d){c(a(d),a(d).find(".glyphicon"))}),d},destroy:function(){return this.$element.find("li:not([data-template])").remove(),this.$element.remove(),this.$element[0].outerHTML},render:function(){this.populate(this.$element)},populate:function(b){var c=this,d=b.hasClass("tree")?b:b.parent(),e=d.find(".tree-loader:eq(0)"),f=d.data();e.removeClass("hide hidden"),this.options.dataSource(f?f:{},function(f){e.addClass("hidden"),a.each(f.data,function(e,f){var g;"folder"===f.type?(g=c.$element.find("[data-template=treebranch]:eq(0)").clone().removeClass("hide hidden").removeData("template"),g.data(f),g.find(".tree-branch-name > .tree-label").html(f.text||f.name)):"item"===f.type&&(g=c.$element.find("[data-template=treeitem]:eq(0)").clone().removeClass("hide hidden").removeData("template"),g.find(".tree-item-name > .tree-label").html(f.text||f.name),g.data(f));var h=f.attr||f.dataAttributes||[];a.each(h,function(a,b){switch(a){case"cssClass":case"class":case"className":g.addClass(b);break;case"data-icon":g.find(".icon-item").removeClass().addClass("icon-item "+b),g.attr(a,b);break;case"id":g.attr(a,b),g.attr("aria-labelledby",b+"-label"),g.find(".tree-branch-name > .tree-label").attr("id",b+"-label");break;default:g.attr(a,b)}}),b.hasClass("tree-branch-header")?d.find(".tree-branch-children:eq(0)").append(g):b.append(g)}),c.$element.trigger("loaded.fu.tree",d)})},selectTreeNode:function(b,c){var f={};f.$element=a(b);var g={};g.$elements=this.$element.find(".tree-selected"),g.dataForEvent=[],"folder"===c?(f.$element=f.$element.closest(".tree-branch"),f.$icon=f.$element.find(".icon-folder")):f.$icon=f.$element.find(".icon-item"),f.elementData=f.$element.data(),this.options.multiSelect?d(this,f,g):e(this,f,g),this.$element.trigger(g.eventType+".fu.tree",{target:f.elementData,selected:g.dataForEvent}),f.$element.trigger("updated.fu.tree",{selected:g.dataForEvent,item:f.$element,eventType:g.eventType})},discloseFolder:function(b){var c=a(b),d=c.closest(".tree-branch"),e=d.find(".tree-branch-children"),f=e.eq(0);d.addClass("tree-open"),d.attr("aria-expanded","true"),f.removeClass("hide hidden"),d.find("> .tree-branch-header .icon-folder").eq(0).removeClass("glyphicon-folder-close").addClass("glyphicon-folder-open"),e.children().length||this.populate(e),this.$element.trigger("disclosedFolder.fu.tree",d.data())},closeFolder:function(b){var c=a(b),d=c.closest(".tree-branch"),e=d.find(".tree-branch-children"),f=e.eq(0);d.removeClass("tree-open"),d.attr("aria-expanded","false"),f.addClass("hidden"),d.find("> .tree-branch-header .icon-folder").eq(0).removeClass("glyphicon-folder-open").addClass("glyphicon-folder-close"),this.options.cacheItems||f.empty(),this.$element.trigger("closed.fu.tree",d.data())},toggleFolder:function(b){var c=a(b);c.find(".glyphicon-folder-close").length?this.discloseFolder(b):c.find(".glyphicon-folder-open").length&&this.closeFolder(b)},selectFolder:function(a){this.options.folderSelect&&this.selectTreeNode(a,"folder")},selectItem:function(a){this.options.itemSelect&&this.selectTreeNode(a,"item")},selectedItems:function(){var b=this.$element.find(".tree-selected"),c=[];return a.each(b,function(b,d){c.push(a(d).data())}),c},collapse:function(){var a=this,b=[],c=function d(c,e){b.push(e),0===a.$element.find(".tree-branch.tree-open:not('.hidden, .hide')").length&&(a.$element.trigger("closedAll.fu.tree",{tree:a.$element,reportedClosed:b}),a.$element.off("loaded.fu.tree",a.$element,d))};a.$element.on("closed.fu.tree",c),a.$element.find(".tree-branch.tree-open:not('.hidden, .hide')").each(function(){a.closeFolder(this)})},discloseVisible:function(){var b=this,c=b.$element.find(".tree-branch:not('.tree-open, .hidden, .hide')"),d=[],e=function f(a,e){d.push(e),d.length===c.length&&(b.$element.trigger("disclosedVisible.fu.tree",{tree:b.$element,reportedOpened:d}),b.$element.off("loaded.fu.tree",b.$element,f))};b.$element.on("loaded.fu.tree",e),b.$element.find(".tree-branch:not('.tree-open, .hidden, .hide')").each(function(){b.discloseFolder(a(this).find(".tree-branch-header"))})},discloseAll:function(){var a=this;"undefined"==typeof a.$element.data("disclosures")&&a.$element.data("disclosures",0);var b=a.options.disclosuresUpperLimit>=1&&a.$element.data("disclosures")>=a.options.disclosuresUpperLimit,c=0===a.$element.find(".tree-branch:not('.tree-open, .hidden, .hide')").length;if(c)a.$element.trigger("disclosedAll.fu.tree",{tree:a.$element,disclosures:a.$element.data("disclosures")}),a.options.cacheItems||a.$element.one("closeAll.fu.tree",function(){a.$element.data("disclosures",0)});else{if(b&&(a.$element.trigger("exceededDisclosuresLimit.fu.tree",{tree:a.$element,disclosures:a.$element.data("disclosures")}),!a.$element.data("ignore-disclosures-limit")))return;a.$element.data("disclosures",a.$element.data("disclosures")+1),a.$element.one("disclosedVisible.fu.tree",function(){a.discloseAll()}),a.discloseVisible()}}},g.prototype.closeAll=g.prototype.collapse,g.prototype.openFolder=g.prototype.discloseFolder,g.prototype.getValue=g.prototype.selectedItems,a.fn.tree=function(b){var c,d=Array.prototype.slice.call(arguments,1),e=this.each(function(){var e=a(this),f=e.data("fu.tree"),h="object"==typeof b&&b;f||e.data("fu.tree",f=new g(this,h)),"string"==typeof b&&(c=f[b].apply(f,d))});return void 0===c?e:c},a.fn.tree.defaults={dataSource:function(){},multiSelect:!1,cacheItems:!0,folderSelect:!0,itemSelect:!0,disclosuresUpperLimit:0},a.fn.tree.Constructor=g,a.fn.tree.noConflict=function(){return a.fn.tree=f,this}}(a),function(a){var b=a.fn.wizard,c=function(b,c){var d;this.$element=a(b),this.options=a.extend({},a.fn.wizard.defaults,c),this.options.disablePreviousStep="previous"===this.$element.attr("data-restrict")?!0:this.options.disablePreviousStep,this.currentStep=this.options.selectedItem.step,this.numSteps=this.$element.find(".steps li").length,this.$prevBtn=this.$element.find("button.btn-prev"),this.$nextBtn=this.$element.find("button.btn-next"),0===this.$element.children(".steps-container").length&&(this.$element.addClass("no-steps-container"),window&&window.console&&window.console.warn&&window.console.warn('please update your wizard markup to include ".steps-container" as seen in http://getfuelux.com/javascript.html#wizard-usage-markup')),d=this.$nextBtn.children().detach(),this.nextText=a.trim(this.$nextBtn.text()),this.$nextBtn.append(d),this.$prevBtn.on("click.fu.wizard",a.proxy(this.previous,this)),this.$nextBtn.on("click.fu.wizard",a.proxy(this.next,this)),this.$element.on("click.fu.wizard","li.complete",a.proxy(this.stepclicked,this)),this.selectedItem(this.options.selectedItem),this.options.disablePreviousStep&&(this.$prevBtn.attr("disabled",!0),this.$element.find(".steps").addClass("previous-disabled"))};c.prototype={constructor:c,destroy:function(){return this.$element.remove(),this.$element[0].outerHTML},addSteps:function(b){var c,d,e,f,g,h,i=[].slice.call(arguments).slice(1),j=this.$element.find(".steps"),k=this.$element.find(".step-content");for(b=-1===b||b>this.numSteps+1?this.numSteps+1:b,i[0]instanceof Array&&(i=i[0]),g=j.find("li:nth-child("+b+")"),f=k.find(".step-pane:nth-child("+b+")"),g.length<1&&(g=null),c=0,d=i.length;d>c;c++)h=a('<li data-step="'+b+'"><span class="badge badge-info"></span></li>'),h.append(i[c].label||"").append('<span class="chevron"></span>'),h.find(".badge").append(i[c].badge||b),e=a('<div class="step-pane" data-step="'+b+'"></div>'),e.append(i[c].pane||""),g?(g.before(h),f.before(e)):(j.append(h),k.append(e)),b++;this.syncSteps(),this.numSteps=j.find("li").length,this.setState()},removeSteps:function(b,c){var d,e="nextAll",f=0,g=this.$element.find(".steps"),h=this.$element.find(".step-content");c=void 0!==c?c:1,b>g.find("li").length?d=g.find("li:last"):(d=g.find("li:nth-child("+b+")").prev(),d.length<1&&(e="children",d=g)),d[e]().each(function(){var b=a(this),d=b.attr("data-step");return c>f?(b.remove(),h.find('.step-pane[data-step="'+d+'"]:first').remove(),void f++):!1}),this.syncSteps(),this.numSteps=g.find("li").length,this.setState()},setState:function(){var b=this.currentStep>1,c=1===this.currentStep,d=this.currentStep===this.numSteps;this.options.disablePreviousStep||this.$prevBtn.attr("disabled",c===!0||b===!1);var e=this.$nextBtn.attr("data-last");if(e){this.lastText=e;var f=this.nextText;d===!0?(f=this.lastText,this.$element.addClass("complete")):this.$element.removeClass("complete");var g=this.$nextBtn.children().detach();this.$nextBtn.text(f).append(g)}var h=this.$element.find(".steps li");h.removeClass("active").removeClass("complete"),h.find("span.badge").removeClass("badge-info").removeClass("badge-success");var i=".steps li:lt("+(this.currentStep-1)+")",j=this.$element.find(i);j.addClass("complete"),j.find("span.badge").addClass("badge-success");var k=".steps li:eq("+(this.currentStep-1)+")",l=this.$element.find(k);l.addClass("active"),l.find("span.badge").addClass("badge-info");var m=this.$element.find(".step-content"),n=l.attr("data-step");m.find(".step-pane").removeClass("active"),m.find('.step-pane[data-step="'+n+'"]:first').addClass("active"),this.$element.find(".steps").first().attr("style","margin-left: 0");var o=0;this.$element.find(".steps > li").each(function(){o+=a(this).outerWidth()});var p=0;if(p=this.$element.find(".actions").length?this.$element.width()-this.$element.find(".actions").first().outerWidth():this.$element.width(),o>p){var q=o-p;this.$element.find(".steps").first().attr("style","margin-left: -"+q+"px"),this.$element.find("li.active").first().position().left<200&&(q+=this.$element.find("li.active").first().position().left-200,1>q?this.$element.find(".steps").first().attr("style","margin-left: 0"):this.$element.find(".steps").first().attr("style","margin-left: -"+q+"px"))}if("undefined"!=typeof this.initialized){var r=a.Event("changed.fu.wizard");this.$element.trigger(r,{step:this.currentStep})}this.initialized=!0},stepclicked:function(b){var c=a(b.currentTarget),d=this.$element.find(".steps li").index(c);if(!(d<this.currentStep&&this.options.disablePreviousStep)){var e=a.Event("stepclicked.fu.wizard");this.$element.trigger(e,{step:d+1}),e.isDefaultPrevented()||(this.currentStep=d+1,this.setState())}},syncSteps:function(){var b=1,c=this.$element.find(".steps"),d=this.$element.find(".step-content");c.children().each(function(){var c=a(this),e=c.find(".badge"),f=c.attr("data-step");isNaN(parseInt(e.html(),10))||e.html(b),c.attr("data-step",b),d.find('.step-pane[data-step="'+f+'"]:last').attr("data-step",b),b++})},previous:function(){if(!this.options.disablePreviousStep&&1!==this.currentStep){var b=a.Event("actionclicked.fu.wizard");if(this.$element.trigger(b,{step:this.currentStep,direction:"previous"}),!b.isDefaultPrevented()&&(this.currentStep-=1,this.setState(),this.$prevBtn.is(":focus"))){var c=this.$element.find(".active").find("input, select, textarea")[0];"undefined"!=typeof c?a(c).focus():0===this.$element.find(".active input:first").length&&this.$prevBtn.is(":disabled")&&this.$nextBtn.focus()}}},next:function(){var b=a.Event("actionclicked.fu.wizard");if(this.$element.trigger(b,{step:this.currentStep,direction:"next"}),!b.isDefaultPrevented()&&(this.currentStep<this.numSteps?(this.currentStep+=1,this.setState()):this.$element.trigger("finished.fu.wizard"),this.$nextBtn.is(":focus"))){var c=this.$element.find(".active").find("input, select, textarea")[0];"undefined"!=typeof c?a(c).focus():0===this.$element.find(".active input:first").length&&this.$nextBtn.is(":disabled")&&this.$prevBtn.focus()}},selectedItem:function(a){var b,c;return a?(c=a.step||-1,c=Number(this.$element.find('.steps li[data-name="'+c+'"]').first().attr("data-step"))||Number(c),c>=1&&c<=this.numSteps?(this.currentStep=c,this.setState()):(c=this.$element.find(".steps li.active:first").attr("data-step"),isNaN(c)||(this.currentStep=parseInt(c,10),this.setState())),b=this):(b={step:this.currentStep},this.$element.find(".steps li.active:first[data-name]").length&&(b.stepname=this.$element.find(".steps li.active:first").attr("data-name"))),b}},a.fn.wizard=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.wizard"),h="object"==typeof b&&b;g||f.data("fu.wizard",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.wizard.defaults={disablePreviousStep:!1,selectedItem:{step:-1}},a.fn.wizard.Constructor=c,a.fn.wizard.noConflict=function(){return a.fn.wizard=b,this},a(document).on("mouseover.fu.wizard.data-api","[data-initialize=wizard]",function(b){var c=a(b.target).closest(".wizard");c.data("fu.wizard")||c.wizard(c.data())}),a(function(){a("[data-initialize=wizard]").each(function(){var b=a(this);b.data("fu.wizard")||b.wizard(b.data())})})}(a),function(a){var b=a.fn.infinitescroll,c=function(b,c){this.$element=a(b),this.$element.addClass("infinitescroll"),this.options=a.extend({},a.fn.infinitescroll.defaults,c),this.curScrollTop=this.$element.scrollTop(),this.curPercentage=this.getPercentage(),this.fetchingData=!1,this.$element.on("scroll.fu.infinitescroll",a.proxy(this.onScroll,this)),this.onScroll()};c.prototype={constructor:c,destroy:function(){return this.$element.remove(),this.$element.empty(),this.$element[0].outerHTML},disable:function(){this.$element.off("scroll.fu.infinitescroll")},enable:function(){this.$element.on("scroll.fu.infinitescroll",a.proxy(this.onScroll,this))},end:function(b){var c=a('<div class="infinitescroll-end"></div>');c.append(b?b:"---------"),this.$element.append(c),this.disable()},getPercentage:function(){var a="border-box"===this.$element.css("box-sizing")?this.$element.outerHeight():this.$element.height(),b=this.$element.get(0).scrollHeight;return b>a?a/(b-this.curScrollTop)*100:0},fetchData:function(b){var c,d=a('<div class="infinitescroll-load"></div>'),e=this,f=function(){var b={percentage:e.curPercentage,scrollTop:e.curScrollTop},c=a('<div class="loader"></div>');d.append(c),c.loader(),e.options.dataSource&&e.options.dataSource(b,function(a){var b;d.remove(),a.content&&e.$element.append(a.content),a.end&&(b=a.end!==!0?a.end:void 0,e.end(b)),e.fetchingData=!1})};this.fetchingData=!0,this.$element.append(d),this.options.hybrid&&b!==!0?(c=a('<button type="button" class="btn btn-primary"></button>'),c.append("object"==typeof this.options.hybrid?this.options.hybrid.label:'<span class="glyphicon glyphicon-repeat"></span>'),c.on("click.fu.infinitescroll",function(){c.remove(),f()}),d.append(c)):f()},onScroll:function(){this.curScrollTop=this.$element.scrollTop(),this.curPercentage=this.getPercentage(),!this.fetchingData&&this.curPercentage>=this.options.percentage&&this.fetchData()}},a.fn.infinitescroll=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.infinitescroll"),h="object"==typeof b&&b;g||f.data("fu.infinitescroll",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.infinitescroll.defaults={dataSource:null,hybrid:!1,percentage:95},a.fn.infinitescroll.Constructor=c,a.fn.infinitescroll.noConflict=function(){return a.fn.infinitescroll=b,this}}(a),function(a){var b=a.fn.pillbox,c=function(b,c){this.$element=a(b),this.$moreCount=this.$element.find(".pillbox-more-count"),this.$pillGroup=this.$element.find(".pill-group"),this.$addItem=this.$element.find(".pillbox-add-item"),this.$addItemWrap=this.$addItem.parent(),this.$suggest=this.$element.find(".suggest"),this.$pillHTML='<li class="btn btn-default pill">	<span></span>	<span class="glyphicon glyphicon-close">		<span class="sr-only">Remove</span>	</span></li>',this.options=a.extend({},a.fn.pillbox.defaults,c),-1===this.options.readonly?void 0!==this.$element.attr("data-readonly")&&this.readonly(!0):this.options.readonly&&this.readonly(!0),this.acceptKeyCodes=this._generateObject(this.options.acceptKeyCodes),this.$element.on("click.fu.pillbox",".pill-group > .pill",a.proxy(this.itemClicked,this)),this.$element.on("click.fu.pillbox",a.proxy(this.inputFocus,this)),this.$element.on("keydown.fu.pillbox",".pillbox-add-item",a.proxy(this.inputEvent,this)),this.options.onKeyDown&&this.$element.on("mousedown.fu.pillbox",".suggest > li",a.proxy(this.suggestionClick,this)),this.options.edit&&(this.$element.addClass("pills-editable"),this.$element.on("blur.fu.pillbox",".pillbox-add-item",a.proxy(this.cancelEdit,this)))};c.prototype={constructor:c,destroy:function(){return this.$element.remove(),this.$element[0].outerHTML},items:function(){var b=this;return this.$pillGroup.children(".pill").map(function(){return b.getItemData(a(this))}).get()},itemClicked:function(b){var c,d=a(b.target);if(b.preventDefault(),b.stopPropagation(),this._closeSuggestions(),d.hasClass("pill"))c=d;else if(c=d.parent(),void 0===this.$element.attr("data-readonly")){if(d.hasClass("glyphicon-close"))return this.options.onRemove?this.options.onRemove(this.getItemData(c,{el:c}),a.proxy(this._removeElement,this)):this._removeElement(this.getItemData(c,{el:c})),!1;if(this.options.edit){if(c.find(".pillbox-list-edit").length)return!1;this.openEdit(c)}}this.$element.trigger("clicked.fu.pillbox",this.getItemData(c))},readonly:function(a){a?this.$element.attr("data-readonly","readonly"):this.$element.removeAttr("data-readonly"),this.options.truncate&&this.truncate(a)},suggestionClick:function(b){var c=a(b.currentTarget),d={text:c.html(),value:c.data("value")};b.preventDefault(),this.$addItem.val(""),c.data("attr")&&(d.attr=JSON.parse(c.data("attr"))),d.data=c.data("data"),this.addItems(d,!0),this._closeSuggestions()},itemCount:function(){return this.$pillGroup.children(".pill").length},addItems:function(){var b,c,d,e=this;!isFinite(String(arguments[0]))||arguments[0]instanceof Array?(b=[].slice.call(arguments).slice(0),d=b[1]&&!b[1].text):(b=[].slice.call(arguments).slice(1),c=arguments[0]),b[0]instanceof Array&&(b=b[0]),b.length&&(a.each(b,function(a,c){var d={text:c.text,value:c.value?c.value:c.text,el:e.$pillHTML};c.attr&&(d.attr=c.attr),c.data&&(d.data=c.data),b[a]=d}),this.options.edit&&this.currentEdit&&(b[0].el=this.currentEdit.wrap("<div></div>").parent().html()),d&&b.pop(1),e.options.onAdd&&d?this.options.edit&&this.currentEdit?e.options.onAdd(b[0],a.proxy(e.saveEdit,this)):e.options.onAdd(b[0],a.proxy(e.placeItems,this)):this.options.edit&&this.currentEdit?e.saveEdit(b):c?e.placeItems(c,b):e.placeItems(b,d))},removeItems:function(a,b){var c,d,e=this;if(a)for(b=b?b:1,c=0;b>c&&(d=e.$pillGroup.find("> .pill:nth-child("+a+")"),d);c++)d.remove();else this.$pillGroup.find(".pill").remove(),this._removePillTrigger({method:"removeAll"})},placeItems:function(){var b,c,d,e,f=[];!isFinite(String(arguments[0]))||arguments[0]instanceof Array?(b=[].slice.call(arguments).slice(0),e=b[1]&&!b[1].text):(b=[].slice.call(arguments).slice(1),c=arguments[0]),b[0]instanceof Array&&(b=b[0]),b.length&&(a.each(b,function(b,c){var d=a(c.el);d.attr("data-value",c.value),d.find("span:first").html(c.text),c.attr&&a.each(c.attr,function(a,b){"cssClass"===a||"class"===a?d.addClass(b):d.attr(a,b)}),c.data&&d.data("data",c.data),f.push(d)}),this.$pillGroup.children(".pill").length>0?c?(d=this.$pillGroup.find(".pill:nth-child("+c+")"),d.length?d.before(f):this.$pillGroup.children(".pill:last").after(f)):this.$pillGroup.children(".pill:last").after(f):this.$pillGroup.prepend(f),e&&this.$element.trigger("added.fu.pillbox",{text:b[0].text,value:b[0].value}))},inputEvent:function(a){var b,c,d,e,f=this,g=this.$addItem.val();if(this.acceptKeyCodes[a.keyCode])return this.options.onKeyDown&&this._isSuggestionsOpen()&&(e=this.$suggest.find(".pillbox-suggest-sel"),e.length&&(g=e.html(),b=e.data("value"),c=e.data("attr"))),(g.replace(/[ ]*\,[ ]*/,"").match(/\S/)||this.options.allowEmptyPills&&g.length)&&(this._closeSuggestions(),this.$addItem.hide(),c?this.addItems({text:g,value:b,attr:JSON.parse(c)},!0):this.addItems({text:g,value:b},!0),setTimeout(function(){f.$addItem.show().val("").attr({size:10})
},0)),a.preventDefault(),!0;if(8===a.keyCode||46===a.keyCode){if(!g.length)return a.preventDefault(),this.options.edit&&this.currentEdit?(this.cancelEdit(),!0):(this._closeSuggestions(),d=this.$pillGroup.children(".pill:last"),d.hasClass("pillbox-highlight")?this._removeElement(this.getItemData(d,{el:d})):d.addClass("pillbox-highlight"),!0)}else g.length>10&&this.$addItem.width()<this.$pillGroup.width()-6&&this.$addItem.attr({size:g.length+3});if(this.$pillGroup.find(".pill").removeClass("pillbox-highlight"),this.options.onKeyDown){if(9===a.keyCode||38===a.keyCode||40===a.keyCode)return this._isSuggestionsOpen()&&this._keySuggestions(a),!0;this.callbackId=a.timeStamp,this.options.onKeyDown({event:a,value:g},function(b){f._openSuggestions(a,b)})}},openEdit:function(a){var b=a.index()+1,c=this.$addItemWrap.detach().hide();this.$pillGroup.find(".pill:nth-child("+b+")").before(c),this.currentEdit=a.detach(),c.addClass("editing"),this.$addItem.val(a.find("span:first").html()),c.show(),this.$addItem.focus().select()},cancelEdit:function(a){var b;return this.currentEdit?(this._closeSuggestions(),a&&this.$addItemWrap.before(this.currentEdit),this.currentEdit=!1,b=this.$addItemWrap.detach(),b.removeClass("editing"),this.$addItem.val(""),void this.$pillGroup.append(b)):!1},saveEdit:function(){var b=arguments[0][0]?arguments[0][0]:arguments[0];this.currentEdit=a(b.el),this.currentEdit.data("value",b.value),this.currentEdit.find("span:first").html(b.text),this.$addItemWrap.hide(),this.$addItemWrap.before(this.currentEdit),this.currentEdit=!1,this.$addItem.val(""),this.$addItemWrap.removeClass("editing"),this.$pillGroup.append(this.$addItemWrap.detach().show()),this.$element.trigger("edited.fu.pillbox",{value:b.value,text:b.text})},removeBySelector:function(){var b=[].slice.call(arguments).slice(0),c=this;a.each(b,function(a,b){c.$pillGroup.find(b).remove()}),this._removePillTrigger({method:"removeBySelector",removedSelectors:b})},removeByValue:function(){var b=[].slice.call(arguments).slice(0),c=this;a.each(b,function(a,b){c.$pillGroup.find('> .pill[data-value="'+b+'"]').remove()}),this._removePillTrigger({method:"removeByValue",removedValues:b})},removeByText:function(){var b=[].slice.call(arguments).slice(0),c=this;a.each(b,function(a,b){c.$pillGroup.find('> .pill:contains("'+b+'")').remove()}),this._removePillTrigger({method:"removeByText",removedText:b})},truncate:function(b){var c,d,e,f,g,h=this;this.$element.removeClass("truncate"),this.$addItemWrap.removeClass("truncated"),this.$pillGroup.find(".pill").removeClass("truncated"),b&&(this.$element.addClass("truncate"),c=this.$element.width(),d=!1,e=0,f=this.$pillGroup.find(".pill").length,g=0,this.$pillGroup.find(".pill").each(function(){var b=a(this);d?b.addClass("truncated"):(e++,h.$moreCount.text(f-e),g+b.outerWidth(!0)+h.$addItemWrap.outerWidth(!0)<=c?g+=b.outerWidth(!0):(h.$moreCount.text(f-e+1),b.addClass("truncated"),d=!0))}),e===f&&this.$addItemWrap.addClass("truncated"))},inputFocus:function(){this.$element.find(".pillbox-add-item").focus()},getItemData:function(b,c){return a.extend({text:b.find("span:first").html()},b.data(),c)},_removeElement:function(a){a.el.remove(),delete a.el,this.$element.trigger("removed.fu.pillbox",a)},_removePillTrigger:function(a){this.$element.trigger("removed.fu.pillbox",a)},_generateObject:function(b){var c={};return a.each(b,function(a,b){c[b]=!0}),c},_openSuggestions:function(b,c){var d=a("<ul>");return this.callbackId!==b.timeStamp?!1:void(c.data&&c.data.length&&(a.each(c.data,function(b,c){var e=c.value?c.value:c.text,f=a('<li data-value="'+e+'">'+c.text+"</li>");c.attr&&f.data("attr",JSON.stringify(c.attr)),c.data&&f.data("data",c.data),d.append(f)}),this.$suggest.html("").append(d.children()),a(document.body).trigger("suggested.fu.pillbox",this.$suggest)))},_closeSuggestions:function(){this.$suggest.html("").parent().removeClass("open")},_isSuggestionsOpen:function(){return this.$suggest.parent().hasClass("open")},_keySuggestions:function(a){var b,c=this.$suggest.find("li.pillbox-suggest-sel"),d=38===a.keyCode;a.preventDefault(),c.length?(b=d?c.prev():c.next(),b.length||(b=this.$suggest.find(d?"li:last":"li:first")),b&&(b.addClass("pillbox-suggest-sel"),c.removeClass("pillbox-suggest-sel"))):(c=this.$suggest.find("li:first"),c.addClass("pillbox-suggest-sel"))}},c.prototype.getValue=c.prototype.items,a.fn.pillbox=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.pillbox"),h="object"==typeof b&&b;g||f.data("fu.pillbox",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.pillbox.defaults={onAdd:void 0,onRemove:void 0,onKeyDown:void 0,edit:!1,readonly:-1,truncate:!1,acceptKeyCodes:[13,188],allowEmptyPills:!1},a.fn.pillbox.Constructor=c,a.fn.pillbox.noConflict=function(){return a.fn.pillbox=b,this},a(document).on("mousedown.fu.pillbox.data-api","[data-initialize=pillbox]",function(b){var c=a(b.target).closest(".pillbox");c.data("fu.pillbox")||c.pillbox(c.data())}),a(function(){a("[data-initialize=pillbox]").each(function(){var b=a(this);b.data("fu.pillbox")||b.pillbox(b.data())})})}(a),function(a){var b=a.fn.repeater,c=function(b,c){var d,e,f=this;this.$element=a(b),this.$canvas=this.$element.find(".repeater-canvas"),this.$count=this.$element.find(".repeater-count"),this.$end=this.$element.find(".repeater-end"),this.$filters=this.$element.find(".repeater-filters"),this.$loader=this.$element.find(".repeater-loader"),this.$pageSize=this.$element.find(".repeater-itemization .selectlist"),this.$nextBtn=this.$element.find(".repeater-next"),this.$pages=this.$element.find(".repeater-pages"),this.$prevBtn=this.$element.find(".repeater-prev"),this.$primaryPaging=this.$element.find(".repeater-primaryPaging"),this.$search=this.$element.find(".repeater-search").find(".search"),this.$secondaryPaging=this.$element.find(".repeater-secondaryPaging"),this.$start=this.$element.find(".repeater-start"),this.$viewport=this.$element.find(".repeater-viewport"),this.$views=this.$element.find(".repeater-views"),this.currentPage=0,this.currentView=null,this.infiniteScrollingCallback=function(){},this.infiniteScrollingCont=null,this.infiniteScrollingEnabled=!1,this.infiniteScrollingEnd=null,this.infiniteScrollingOptions={},this.lastPageInput=0,this.options=a.extend({},a.fn.repeater.defaults,c),this.pageIncrement=0,this.resizeTimeout={},this.stamp=(new Date).getTime()+(Math.floor(100*Math.random())+1),this.storedDataSourceOpts=null,this.viewOptions={},this.viewType=null,this.$filters.selectlist(),this.$pageSize.selectlist(),this.$primaryPaging.find(".combobox").combobox(),this.$search.search(),this.$filters.on("changed.fu.selectlist",function(a,b){f.$element.trigger("filtered.fu.repeater",b),f.render({clearInfinite:!0,pageIncrement:null})}),this.$nextBtn.on("click.fu.repeater",a.proxy(this.next,this)),this.$pageSize.on("changed.fu.selectlist",function(a,b){f.$element.trigger("pageSizeChanged.fu.repeater",b),f.render({pageIncrement:null})}),this.$prevBtn.on("click.fu.repeater",a.proxy(this.previous,this)),this.$primaryPaging.find(".combobox").on("changed.fu.combobox",function(a,b){f.$element.trigger("pageChanged.fu.repeater",[b.text,b]),f.pageInputChange(b.text)}),this.$search.on("searched.fu.search cleared.fu.search",function(a,b){f.$element.trigger("searchChanged.fu.repeater",b),f.render({clearInfinite:!0,pageIncrement:null})}),this.$secondaryPaging.on("blur.fu.repeater",function(){f.pageInputChange(f.$secondaryPaging.val())}),this.$secondaryPaging.on("keyup",function(a){13===a.keyCode&&f.pageInputChange(f.$secondaryPaging.val())}),this.$views.find("input").on("change.fu.repeater",a.proxy(this.viewChanged,this)),a(window).on("resize.fu.repeater."+this.stamp,function(){clearTimeout(f.resizeTimeout),f.resizeTimeout=setTimeout(function(){f.resize(),f.$element.trigger("resized.fu.repeater")},75)}),this.$loader.loader(),this.$loader.loader("pause"),-1!==this.options.defaultView?e=this.options.defaultView:(d=this.$views.find("label.active input"),e=d.length>0?d.val():"list"),this.setViewOptions(e),this.initViewTypes(function(){f.resize(),f.$element.trigger("resized.fu.repeater"),f.render({changeView:e})})};c.prototype={constructor:c,clear:function(b){function c(b){var d=[];b.children().each(function(){var b=a(this),e=b.attr("data-preserve");"deep"===e?(b.detach(),d.push(b)):"shallow"===e&&(c(b),b.detach(),d.push(b))}),b.empty(),b.append(d)}var d,e;b=b||{},b.preserve?(!this.infiniteScrollingEnabled||b.clearInfinite)&&c(this.$canvas):this.$canvas.empty(),d=void 0!==b.viewChanged?b.viewChanged:!1,e=a.fn.repeater.viewTypes[this.viewType]||{},!d&&e.cleared&&e.cleared.call(this,{options:b})},clearPreservedDataSourceOptions:function(){this.storedDataSourceOpts=null},destroy:function(){var b;return this.$element.find("input").each(function(){a(this).attr("value",a(this).val())}),this.$canvas.empty(),b=this.$element[0].outerHTML,this.$element.find(".combobox").combobox("destroy"),this.$element.find(".selectlist").selectlist("destroy"),this.$element.find(".search").search("destroy"),this.infiniteScrollingEnabled&&a(this.infiniteScrollingCont).infinitescroll("destroy"),this.$element.remove(),a(window).off("resize.fu.repeater."+this.stamp),b},disable:function(){var a="disable",b="disabled";this.$search.search(a),this.$filters.selectlist(a),this.$views.find("label").attr(b,b),this.$pageSize.selectlist(a),this.$primaryPaging.find(".combobox").combobox(a),this.$secondaryPaging.attr(b,b),this.$prevBtn.attr(b,b),this.$nextBtn.attr(b,b),this.$element.addClass("disabled"),this.$element.trigger("disabled.fu.repeater")},enable:function(){var a="disabled",b="enable",c="page-end";this.$search.search(b),this.$filters.selectlist(b),this.$views.find("label").removeAttr(a),this.$pageSize.selectlist("enable"),this.$primaryPaging.find(".combobox").combobox(b),this.$secondaryPaging.removeAttr(a),this.$prevBtn.hasClass(c)||this.$prevBtn.removeAttr(a),this.$nextBtn.hasClass(c)||this.$nextBtn.removeAttr(a),this.$prevBtn.hasClass(c)&&this.$nextBtn.hasClass(c)&&this.$primaryPaging.combobox("disable"),this.$pageSize.selectlist(0!==parseInt(this.$count.html())?"enable":"disable"),this.$element.removeClass("disabled"),this.$element.trigger("enabled.fu.repeater")},getDataOptions:function(b){var c,d,e={},f={};return b=b||{},f.filter=this.$filters.length>0?this.$filters.selectlist("selectedItem"):{text:"All",value:"all"},f.view=this.currentView,this.infiniteScrollingEnabled||(f.pageSize=this.$pageSize.length>0?parseInt(this.$pageSize.selectlist("selectedItem").value,10):25),void 0!==b.pageIncrement&&(null===b.pageIncrement?this.currentPage=0:this.currentPage+=b.pageIncrement),f.pageIndex=this.currentPage,c=this.$search.length>0?this.$search.find("input").val():"",""!==c&&(f.search=c),b.dataSourceOptions&&(e=b.dataSourceOptions,b.preserveDataSourceOptions&&(this.storedDataSourceOpts=this.storedDataSourceOpts?a.extend(this.storedDataSourceOpts,e):e)),this.storedDataSourceOpts&&(e=a.extend(this.storedDataSourceOpts,e)),d=a.fn.repeater.viewTypes[this.viewType]||{},d=d.dataOptions,d?(d=d.call(this,f),f=a.extend(d,e)):f=a.extend(f,e),f},infiniteScrolling:function(a,b){var c,d,e=this.$element.find(".repeater-footer"),f=this.$element.find(".repeater-viewport");b=b||{},a?(this.infiniteScrollingEnabled=!0,this.infiniteScrollingEnd=b.end,delete b.dataSource,delete b.end,this.infiniteScrollingOptions=b,f.css({height:f.height()+e.outerHeight()}),e.hide()):(c=this.infiniteScrollingCont,d=c.data(),delete d.infinitescroll,c.off("scroll"),c.removeClass("infinitescroll"),this.infiniteScrollingCont=null,this.infiniteScrollingEnabled=!1,this.infiniteScrollingEnd=null,this.infiniteScrollingOptions={},f.css({height:f.height()-e.outerHeight()}),e.show())},infiniteScrollPaging:function(a){var b=this.infiniteScrollingEnd!==!0?this.infiniteScrollingEnd:void 0,c=a.page,d=a.pages;this.currentPage=void 0!==c?c:0/0,this.currentPage+1>=d&&this.infiniteScrollingCont.infinitescroll("end",b)},initInfiniteScrolling:function(){var b,c,d=this.$canvas.find('[data-infinite="true"]:first');d=d.length<1?this.$canvas:d,d.data("fu.infinitescroll")?d.infinitescroll("enable"):(c=this,b=a.extend({},this.infiniteScrollingOptions),b.dataSource=function(a,b){c.infiniteScrollingCallback=b,c.render({pageIncrement:1})},d.infinitescroll(b),this.infiniteScrollingCont=d)},initViewTypes:function(b){function c(a){function d(){a++,e>a?c(a):b()}g[a].initialize?g[a].initialize.call(f,{},function(){d()}):d()}var d,e,f=this,g=[];for(d in a.fn.repeater.viewTypes)g.push(a.fn.repeater.viewTypes[d]);e=g.length,e>0?c(0):b()},itemization:function(a){this.$count.html(void 0!==a.count?a.count:"?"),this.$end.html(void 0!==a.end?a.end:"?"),this.$start.html(void 0!==a.start?a.start:"?")},next:function(){var a="disabled";this.$nextBtn.attr(a,a),this.$prevBtn.attr(a,a),this.pageIncrement=1,this.$element.trigger("nextClicked.fu.repeater"),this.render({pageIncrement:this.pageIncrement})},pageInputChange:function(a){var b;a!==this.lastPageInput&&(this.lastPageInput=a,a=parseInt(a,10)-1,b=a-this.currentPage,this.$element.trigger("pageChanged.fu.repeater",a),this.render({pageIncrement:b}))},pagination:function(a){var b,c,d,e,f="active",g="disabled",h=a.page,i="page-end",j=a.pages;if(this.currentPage=void 0!==h?h:0/0,this.$primaryPaging.removeClass(f),this.$secondaryPaging.removeClass(f),e=0===j?0:this.currentPage+1,j<=this.viewOptions.dropPagingCap){for(this.$primaryPaging.addClass(f),b=this.$primaryPaging.find(".dropdown-menu"),b.empty(),c=0;j>c;c++)d=c+1,b.append('<li data-value="'+d+'"><a href="#">'+d+"</a></li>");this.$primaryPaging.find("input.form-control").val(e)}else this.$secondaryPaging.addClass(f),this.$secondaryPaging.val(e);this.lastPageInput=this.currentPage+1+"",this.$pages.html(""+j),this.currentPage+1<j?(this.$nextBtn.removeAttr(g),this.$nextBtn.removeClass(i)):(this.$nextBtn.attr(g,g),this.$nextBtn.addClass(i)),this.currentPage-1>=0?(this.$prevBtn.removeAttr(g),this.$prevBtn.removeClass(i)):(this.$prevBtn.attr(g,g),this.$prevBtn.addClass(i)),0!==this.pageIncrement&&(this.pageIncrement>0?this.$nextBtn.is(":disabled")?this.$prevBtn.focus():this.$nextBtn.focus():this.$prevBtn.is(":disabled")?this.$nextBtn.focus():this.$prevBtn.focus())},previous:function(){var a="disabled";this.$nextBtn.attr(a,a),this.$prevBtn.attr(a,a),this.pageIncrement=-1,this.$element.trigger("previousClicked.fu.repeater"),this.render({pageIncrement:this.pageIncrement})},render:function(b){var c,d,e=this,f=!1,g=a.fn.repeater.viewTypes[this.viewType]||{};b=b||{},this.disable(),b.changeView&&this.currentView!==b.changeView&&(d=this.currentView,this.currentView=b.changeView,this.viewType=this.currentView.split(".")[0],this.setViewOptions(this.currentView),this.$element.attr("data-currentview",this.currentView),this.$element.attr("data-viewtype",this.viewType),f=!0,b.viewChanged=f,this.$element.trigger("viewChanged.fu.repeater",this.currentView),this.infiniteScrollingEnabled&&e.infiniteScrolling(!1),g=a.fn.repeater.viewTypes[this.viewType]||{},g.selected&&g.selected.call(this,{prevView:d})),b.preserve=void 0!==b.preserve?b.preserve:!f,this.clear(b),(!this.infiniteScrollingEnabled||this.infiniteScrollingEnabled&&f)&&this.$loader.show().loader("play"),c=this.getDataOptions(b),this.viewOptions.dataSource(c,function(a){a=a||{},e.infiniteScrollingEnabled?e.infiniteScrollingCallback({}):(e.itemization(a),e.pagination(a)),e.runRenderer(g,a,function(){e.infiniteScrollingEnabled&&((f||b.clearInfinite)&&e.initInfiniteScrolling(),e.infiniteScrollPaging(a,b)),e.$loader.hide().loader("pause"),e.$element.trigger("rendered.fu.repeater",{data:a,options:c,renderOptions:b}),e.$element.trigger("loaded.fu.repeater",c),e.enable()})})},resize:function(){var b,c,d=-1===this.viewOptions.staticHeight?this.$element.attr("data-staticheight"):this.viewOptions.staticHeight,e={};this.viewType&&(e=a.fn.repeater.viewTypes[this.viewType]||{}),void 0!==d&&d!==!1&&"false"!==d?(this.$canvas.addClass("scrolling"),c={bottom:this.$viewport.css("margin-bottom"),top:this.$viewport.css("margin-top")},b=("true"===d||d===!0?this.$element.height():parseInt(d,10))-this.$element.find(".repeater-header").outerHeight()-this.$element.find(".repeater-footer").outerHeight()-("auto"===c.bottom?0:parseInt(c.bottom,10))-("auto"===c.top?0:parseInt(c.top,10)),this.$viewport.outerHeight(b)):this.$canvas.removeClass("scrolling"),e.resize&&e.resize.call(this,{height:this.$element.outerHeight(),width:this.$element.outerWidth()})},runRenderer:function(b,c,d){function e(b,c){var d;c&&(d=c.action?c.action:"append","none"!==d&&void 0!==c.item&&(b=void 0!==c.container?a(c.container):b,b[d](c.item)))}var f,g,h,i,j,k;if(b.render)b.render.call(this,{container:this.$canvas,data:c},function(){d()});else{if(b.before&&(i=b.before.call(this,{container:this.$canvas,data:c}),e(this.$canvas,i)),f=this.$canvas.find('[data-container="true"]:last'),f=f.length>0?f:this.$canvas,b.renderItem){for(j=b.repeat||"data.items",j=j.split("."),"data"===j[0]||"this"===j[0]?(k="this"===j[0]?this:c,j.shift()):(j=[],k=[],window.console&&window.console.warn&&window.console.warn('WARNING: Repeater plugin "repeat" value must start with either "data" or "this"')),g=0,h=j.length;h>g;g++){if(void 0===k[j[g]]){k=[],window.console&&window.console.warn&&window.console.warn("WARNING: Repeater unable to find property to iterate renderItem on.");break}k=k[j[g]]}for(g=0,h=k.length;h>g;g++)i=b.renderItem.call(this,{container:f,data:c,index:g,subset:k}),e(f,i)}b.after&&(i=b.after.call(this,{container:this.$canvas,data:c}),e(this.$canvas,i)),d()}},setViewOptions:function(b){var c={},d=b.split(".")[1];c=this.options.views?this.options.views[d]||this.options.views[b]||{}:{},this.viewOptions=a.extend({},this.options,c)},viewChanged:function(b){var c=a(b.target),d=c.val();this.render({changeView:d,pageIncrement:null})}},a.fn.repeater=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.repeater"),h="object"==typeof b&&b;g||f.data("fu.repeater",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.repeater.defaults={dataSource:function(a,b){b({count:0,end:0,items:[],page:0,pages:1,start:0})},defaultView:-1,dropPagingCap:10,staticHeight:-1,views:null},a.fn.repeater.viewTypes={},a.fn.repeater.Constructor=c,a.fn.repeater.noConflict=function(){return a.fn.repeater=b,this}}(a),function(a){function b(b,c,d,e,f){var g=e[f].className,h=c[d][e[f].property],i=a("<td></td>"),j=e[f]._auto_width,k=e[f].property;if(this.viewOptions.list_actions!==!1&&"@_ACTIONS_@"===k&&(h='<div class="repeater-list-actions-placeholder" style="width: '+this.list_actions_width+'px"></div>'),h=void 0!==h?h:"",i.addClass(void 0!==g?g:"").append(h),void 0!==j&&i.outerWidth(j),b.append(i),"multi"===this.viewOptions.list_selectable&&"@_CHECKBOX_@"===e[f].property){var l='<label data-row="'+d+'" class="checkbox-custom checkbox-inline body-checkbox"><input class="sr-only" type="checkbox"></label>';i.html(l)}"@_CHECKBOX_@"!==e[f].property&&"@_ACTIONS_@"!==e[f].property&&this.viewOptions.list_columnRendered&&this.viewOptions.list_columnRendered({container:b,columnAttr:e[f].property,item:i,rowData:c[d]},function(){})}function c(b,c,d){var e,f,g,h,i,j="glyphicon-chevron-down",k=".glyphicon.rlc:first",l="glyphicon-chevron-up",m=a('<div class="repeater-list-heading"><span class="glyphicon rlc"></span></div>'),n='<div class="repeater-list-heading header-checkbox"><label class="checkbox-custom checkbox-inline"><input class="sr-only" type="checkbox"></label><div class="clearfix"></div></div>',o=a("<th></th>"),p=this;if(m.data("fu_item_index",d),m.prepend(c[d].label),o.html(m.html()).find("[id]").removeAttr("id"),o.append("@_CHECKBOX_@"!==c[d].property?m:n),e=o.add(m),h=m.find(k),i=h.add(o.find(k)),this.viewOptions.list_actions&&"@_ACTIONS_@"===c[d].property){var q=this.list_actions_width;o.css("width",q),m.css("width",q)}f=c[d].className,void 0!==f&&e.addClass(f),g=c[d].sortable,g&&(e.addClass("sortable"),m.on("click.fu.repeaterList",function(){p.list_sortProperty="string"==typeof g?g:c[d].property,m.hasClass("sorted")?h.hasClass(l)?(i.removeClass(l).addClass(j),p.list_sortDirection="desc"):p.viewOptions.list_sortClearing?(e.removeClass("sorted"),i.removeClass(j),p.list_sortDirection=null,p.list_sortProperty=null):(i.removeClass(j).addClass(l),p.list_sortDirection="asc"):(b.find("th, .repeater-list-heading").removeClass("sorted"),i.removeClass(j).addClass(l),p.list_sortDirection="asc",e.addClass("sorted")),p.render({clearInfinite:!0,pageIncrement:null})})),("asc"===c[d].sortDirection||"desc"===c[d].sortDirection)&&(b.find("th, .repeater-list-heading").removeClass("sorted"),e.addClass("sortable sorted"),"asc"===c[d].sortDirection?(i.addClass(l),this.list_sortDirection="asc"):(i.addClass(j),this.list_sortDirection="desc"),this.list_sortProperty="string"==typeof g?g:c[d].property),b.append(o)}function d(c,d,e){var f,g,h=a("<tr></tr>"),i=this,j="multi"===this.viewOptions.list_selectable,k=this.viewOptions.list_actions;for(this.viewOptions.list_selectable&&(h.addClass("selectable"),h.attr("tabindex",0),h.data("item_data",d[e]),h.on("click.fu.repeaterList",function(){var b=a(this),c=a(this).index();c+=1;var d=i.$element.find(".frozen-column-wrapper tr:nth-child("+c+")"),e=i.$element.find(".actions-column-wrapper tr:nth-child("+c+")"),f=i.$element.find(".frozen-column-wrapper tr:nth-child("+c+") .checkbox-inline");b.is(".selected")?(b.removeClass("selected"),j?(f.checkbox("uncheck"),d.removeClass("selected"),k&&e.removeClass("selected")):b.find(".repeater-list-check").remove(),i.$element.trigger("deselected.fu.repeaterList",b)):(j?(f.checkbox("check"),b.addClass("selected"),d.addClass("selected"),k&&e.addClass("selected")):(i.$canvas.find(".repeater-list-check").remove(),i.$canvas.find(".repeater-list tbody tr.selected").each(function(){a(this).removeClass("selected"),i.$element.trigger("deselected.fu.repeaterList",a(this))}),b.find("td:first").prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>'),b.addClass("selected"),d.addClass("selected")),i.$element.trigger("selected.fu.repeaterList",b));var g=i.$canvas.find(".repeater-list-wrapper > table .selected"),h=i.$element.find(".table-actions");g.length>0?h.find("thead .btn").removeAttr("disabled"):h.find("thead .btn").attr("disabled","disabled")}),h.keyup(function(a){13===a.keyCode&&h.trigger("click.fu.repeaterList")})),this.viewOptions.list_actions&&!this.viewOptions.list_selectable&&h.data("item_data",d[e]),c.append(h),f=0,g=this.list_columns.length;g>f;f++)b.call(this,h,d,e,this.list_columns,f);this.viewOptions.list_rowRendered&&this.viewOptions.list_rowRendered({container:c,item:h,rowData:d[e]},function(){})}function e(b,c){var d,e=b.find("tbody");e.length<1&&(e=a('<tbody data-container="true"></tbody>'),b.append(e)),"string"==typeof c.error&&c.error.length>0?(d=a('<tr class="empty text-danger"><td colspan="'+this.list_columns.length+'"></td></tr>'),d.find("td").append(c.error),e.append(d)):c.items&&c.items.length<1&&(d=a('<tr class="empty"><td colspan="'+this.list_columns.length+'"></td></tr>'),d.find("td").append(this.viewOptions.list_noItemsHTML),e.append(d))}function f(b,d){function e(a,b){if(!b)return!1;if(!a||b.length!==a.length)return!0;for(f=0,i=b.length;i>f;f++){if(!a[f])return!0;for(h in b[f])if(a[f][h]!==b[f][h])return!0}return!1}var f,h,i,j,k=d.columns||[],l=b.find("thead");if(this.list_firstRender||e(this.list_columns,k)||0===l.length){if(l.remove(),d.count<1&&(this.list_noItems=!0),"multi"===this.viewOptions.list_selectable&&!this.list_noItems){var m={label:"c",property:"@_CHECKBOX_@",sortable:!1};k.splice(0,0,m)}if(this.list_columns=k,this.list_firstRender=!1,this.$loader.removeClass("noHeader"),this.viewOptions.list_actions&&!this.list_noItems){var n={label:this.viewOptions.list_actions.label||'<span class="actions-hidden">a</span>',property:"@_ACTIONS_@",sortable:!1,width:this.list_actions_width};k.push(n)}for(l=a('<thead data-preserve="deep"><tr></tr></thead>'),j=l.find("tr"),f=0,i=k.length;i>f;f++)c.call(this,j,k,f);if(b.prepend(l),"multi"===this.viewOptions.list_selectable&&!this.list_noItems){var o=this.$element.find(".repeater-list-wrapper .header-checkbox").outerWidth(),p=a.grep(k,function(a){return"@_CHECKBOX_@"===a.property})[0];p.width=o}g.call(this,j)}}function g(b){var c,d,e,f,g,h=[],i=this;if(this.viewOptions.list_columnSizing&&(c=0,f=0,g=0,b.find("th").each(function(){var b,d=a(this),e=0===d.next("th").length;if(void 0!==i.list_columns[c].width)b=i.list_columns[c].width,d.outerWidth(b),f+=d.outerWidth(),g+=d.outerWidth(),e?d.outerWidth(""):i.list_columns[c]._auto_width=b;else{var j=d.find(".repeater-list-heading").outerWidth();g+=d.outerWidth(),h.push({col:d,index:c,last:e,minWidth:j})}c++}),d=h.length,d>0)){var j=this.$canvas.find(".repeater-list-wrapper").outerWidth();for(e=Math.floor((j-f)/d),c=0;d>c;c++)h[c].minWidth>e&&(e=h[c].minWidth),(!h[c].last||g>j)&&(h[c].col.outerWidth(e),this.list_columns[h[c].index]._auto_width=e)}}function h(){var a=window.navigator.userAgent,b=a.indexOf("MSIE "),c=a.indexOf("Firefox");return b>0?"ie-"+parseInt(a.substring(b+5,a.indexOf(".",b))):c>0?"firefox":""}a.fn.repeater&&(a.fn.repeater.Constructor.prototype.list_clearSelectedItems=function(){this.$canvas.find(".repeater-list-check").remove(),this.$canvas.find(".repeater-list table tbody tr.selected").removeClass("selected")},a.fn.repeater.Constructor.prototype.list_highlightColumn=function(b,c){var d=this.$canvas.find(".repeater-list-wrapper > table tbody");(this.viewOptions.list_highlightSortedColumn||c)&&(d.find("td.sorted").removeClass("sorted"),d.find("tr").each(function(){var c=a(this).find("td:nth-child("+(b+1)+")").filter(function(){return!a(this).parent().hasClass("empty")});c.addClass("sorted")}))},a.fn.repeater.Constructor.prototype.list_getSelectedItems=function(){var b=[];return this.$canvas.find(".repeater-list .repeater-list-wrapper > table tbody tr.selected").each(function(){var c=a(this);b.push({data:c.data("item_data"),element:c})}),b},a.fn.repeater.Constructor.prototype.getValue=a.fn.repeater.Constructor.prototype.list_getSelectedItems,a.fn.repeater.Constructor.prototype.list_positionHeadings=function(){var b=this.$element.find(".repeater-list-wrapper"),c=b.offset().left,d=b.scrollLeft();b.find(".repeater-list-heading").each(d>0?function(){var b=a(this),d=b.parents("th:first").offset().left-c+"px";b.addClass("shifted").css("left",d)}:function(){a(this).removeClass("shifted").css("left","")})},a.fn.repeater.Constructor.prototype.list_setSelectedItems=function(b,c){function d(){h=a(this),f=h.data("item_data")||{},f[b[g].property]===b[g].value&&e(h,b[g].selected)}function e(a,b){b=void 0!==b?b:!0,b?(c||"multi"===j||k.list_clearSelectedItems(),a.hasClass("selected")||(a.addClass("selected"),a.find("td:first").prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>'))):(a.find(".repeater-list-check").remove(),a.removeClass("selected"))}var f,g,h,i,j=this.viewOptions.list_selectable,k=this;for(a.isArray(b)||(b=[b]),i=c===!0||"multi"===j?b.length:j&&b.length>0?1:0,g=0;i>g;g++)void 0!==b[g].index?(h=this.$canvas.find(".repeater-list table tbody tr:nth-child("+(b[g].index+1)+")"),h.length>0&&e(h,b[g].selected)):void 0!==b[g].property&&void 0!==b[g].value&&this.$canvas.find(".repeater-list table tbody tr").each(d)},a.fn.repeater.Constructor.prototype.list_sizeHeadings=function(){var b=this.$element.find(".repeater-list table");b.find("thead th").each(function(){var b=a(this),c=b.find(".repeater-list-heading");c.outerHeight(b.outerHeight()),c.outerWidth(b.outerWidth())})},a.fn.repeater.Constructor.prototype.list_setFrozenColumns=function(){var b=this.$canvas.find(".table-frozen"),c=this.$element.find(".repeater-canvas"),d=this.$element.find(".repeater-list .repeater-list-wrapper > table"),e=this.$element.find(".repeater-list"),f=this.viewOptions.list_frozenColumns,g=this;if("multi"===this.viewOptions.list_selectable&&(f+=1,c.addClass("multi-select-enabled")),b.length<1){var h=a('<div class="frozen-column-wrapper"></div>').insertBefore(d),i=d.clone().addClass("table-frozen");i.find("th:not(:lt("+f+"))").remove(),i.find("td:not(:nth-child(n+0):nth-child(-n+"+f+"))").remove();var j=i.clone().removeClass("table-frozen");j.find("tbody").remove();var k=a('<div class="frozen-thead-wrapper"></div>').append(j);h.append(i),e.append(k),this.$canvas.addClass("frozen-enabled")}this.$element.find(".repeater-list table.table-frozen tr").each(function(b){a(this).height(d.find("tr:eq("+b+")").height())});var l=d.find("td:eq(0)").outerWidth();this.$element.find(".frozen-column-wrapper, .frozen-thead-wrapper").width(l),a(".frozen-thead-wrapper .repeater-list-heading").on("click",function(){var b=a(this).parent("th").index();b+=1,g.$element.find(".repeater-list-wrapper > table thead th:nth-child("+b+") .repeater-list-heading")[0].click()})},a.fn.repeater.Constructor.prototype.list_positionColumns=function(){var a=this.$element.find(".repeater-canvas"),b=a.scrollTop(),c=a.scrollLeft(),d=this.viewOptions.list_frozenColumns||"multi"===this.viewOptions.list_selectable,e=this.viewOptions.list_actions,f=this.$element.find(".repeater-canvas").outerWidth(),g=this.$element.find(".repeater-list .repeater-list-wrapper > table").outerWidth(),h=this.$element.find(".table-actions")?this.$element.find(".table-actions").outerWidth():0,i=g-(f-h)>=c;b>0?a.find(".repeater-list-heading").css("top",b):a.find(".repeater-list-heading").css("top","0"),c>0?(d&&(a.find(".frozen-thead-wrapper").css("left",c),a.find(".frozen-column-wrapper").css("left",c)),e&&i&&(a.find(".actions-thead-wrapper").css("right",-c),a.find(".actions-column-wrapper").css("right",-c))):(d&&(a.find(".frozen-thead-wrapper").css("left","0"),a.find(".frozen-column-wrapper").css("left","0")),e&&(a.find(".actions-thead-wrapper").css("right","0"),a.find(".actions-column-wrapper").css("right","0")))},a.fn.repeater.Constructor.prototype.list_createItemActions=function(){var b,c,d="",e=this,f=this.$element.find(".repeater-list .repeater-list-wrapper > table"),g=this.$canvas.find(".table-actions");for(b=0,c=this.viewOptions.list_actions.items.length;c>b;b++){var h=this.viewOptions.list_actions.items[b],i=h.html;d+='<li><a href="#" data-action="'+h.name+'" class="action-item"> '+i+"</a></li>"}var j='<div class="btn-group"><button type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" data-flip="auto" aria-expanded="false"><span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right" role="menu">'+d+"</ul></div>";if(g.length<1){var k=a('<div class="actions-column-wrapper" style="width: '+this.list_actions_width+'px"></div>').insertBefore(f),l=f.clone().addClass("table-actions");if(l.find("th:not(:last-child)").remove(),l.find("tr td:not(:last-child)").remove(),"multi"===this.viewOptions.list_selectable)l.find("thead tr").html('<th><div class="repeater-list-heading">'+j+"</div></th>"),l.find("thead .btn").attr("disabled","disabled");else{var m=this.viewOptions.list_actions.label||'<span class="actions-hidden">a</span>';l.find("thead tr").addClass("empty-heading").html("<th>"+m+'<div class="repeater-list-heading">'+m+"</div></th>")}var n=l.find("td");n.each(function(b){a(this).html(j),a(this).find("a").attr("data-row",parseInt([b])+1)}),k.append(l),this.$canvas.addClass("actions-enabled")}this.$element.find(".repeater-list table.table-actions thead tr th").outerHeight(f.find("thead tr th").outerHeight()),this.$element.find(".repeater-list table.table-actions tbody tr td:first-child").each(function(b){a(this).outerHeight(f.find("tbody tr:eq("+b+") td").outerHeight())}),this.$element.find(".table-actions tbody .action-item").on("click",function(){var b=a(this).data("action"),c=a(this).data("row"),d={actionName:b,rows:[c]};e.list_getActionItems(d)}),this.$element.find(".table-actions thead .action-item").on("click",function(){var b=a(this).data("action"),c={actionName:b,rows:[]};
e.$element.find(".repeater-list-wrapper > table .selected").each(function(){var b=a(this).index();b+=1,c.rows.push(b)}),e.list_getActionItems(c)})},a.fn.repeater.Constructor.prototype.list_getActionItems=function(b){var c,d=[],e=a.grep(this.viewOptions.list_actions.items,function(a){return a.name===b.actionName})[0];for(c=0;c<b.rows.length;c++){var f=this.$canvas.find(".repeater-list-wrapper > table tbody tr:nth-child("+b.rows[c]+")");d.push({item:f,rowData:f.data("item_data")})}1===d.length&&(d=d[0]),e.clickAction&&e.clickAction(d,function(){})},a.fn.repeater.Constructor.prototype.list_sizeActionsTable=function(){var a=this.$element.find(".repeater-list-wrapper > table"),b=this.$element.find(".repeater-list-wrapper .actions-column-wrapper thead th .repeater-list-heading");b.outerHeight(a.find("thead th .repeater-list-heading").outerHeight())},a.fn.repeater.Constructor.prototype.list_frozenOptionsInitialize=function(){var b=this,c=(this.viewOptions.list_frozenColumns,this.viewOptions.list_actions,"multi"===this.viewOptions.list_selectable,this.$element.find(".frozen-column-wrapper .checkbox-inline")),d=this.$element.find(".repeater-list table");this.$element.find("tr.selectable").on("mouseover mouseleave",function(b){var c=a(this).index();c+=1,"mouseover"===b.type?d.find("tbody tr:nth-child("+c+")").addClass("hovered"):d.find("tbody tr:nth-child("+c+")").removeClass("hovered")}),c.checkbox(),this.$element.find(".table-frozen tbody .checkbox-inline").on("change",function(c){c.preventDefault();var d=a(this).attr("data-row");d=parseInt(d)+1,b.$element.find(".repeater-list-wrapper > table tbody tr:nth-child("+d+")").click()}),this.$element.find(".frozen-thead-wrapper thead .checkbox-inline").on("change",function(){a(this).checkbox("isChecked")?(b.$element.find(".repeater-list-wrapper > table tbody tr:not(.selected)").click(),b.$element.trigger("selected.fu.repeaterList",c)):(b.$element.find(".repeater-list-wrapper > table tbody tr.selected").click(),b.$element.trigger("deselected.fu.repeaterList",c))})},a.fn.repeater.defaults=a.extend({},a.fn.repeater.defaults,{list_columnRendered:null,list_columnSizing:!0,list_columnSyncing:!0,list_highlightSortedColumn:!0,list_infiniteScroll:!1,list_noItemsHTML:"no items found",list_selectable:!1,list_sortClearing:!1,list_rowRendered:null,list_frozenColumns:0,list_actions:!1}),a.fn.repeater.viewTypes.list={cleared:function(){this.viewOptions.list_columnSyncing&&this.list_sizeHeadings()},dataOptions:function(a){return this.list_sortDirection&&(a.sortDirection=this.list_sortDirection),this.list_sortProperty&&(a.sortProperty=this.list_sortProperty),a},initialize:function(a,b){this.list_sortDirection=null,this.list_sortProperty=null,this.list_actions_width=void 0!==this.viewOptions.list_actions.width?this.viewOptions.list_actions.width:37,this.list_noItems=!1,b()},resize:function(){this.viewOptions.list_columnSyncing&&this.list_sizeHeadings()},selected:function(){var a,b=this.viewOptions.list_infiniteScroll;this.list_firstRender=!0,this.$loader.addClass("noHeader"),b&&(a="object"==typeof b?b:{},this.infiniteScrolling(!0,a))},before:function(b){var c,d=b.container.find(".repeater-list"),g=this;return d.length<1&&(d=a('<div class="repeater-list '+h()+'" data-preserve="shallow"><div class="repeater-list-wrapper" data-infinite="true" data-preserve="shallow"><table aria-readonly="true" class="table" data-preserve="shallow" role="grid"></table></div></div>'),d.find(".repeater-list-wrapper").on("scroll.fu.repeaterList",function(){g.viewOptions.list_columnSyncing&&g.list_positionHeadings()}),(g.viewOptions.list_frozenColumns||g.viewOptions.list_actions||"multi"===g.viewOptions.list_selectable)&&b.container.on("scroll.fu.repeaterList",function(){g.list_positionColumns()}),b.container.append(d)),b.container.removeClass("actions-enabled actions-enabled multi-select-enabled"),c=d.find("table"),f.call(this,c,b.data),e.call(this,c,b.data),!1},renderItem:function(a){return d.call(this,a.container,a.subset,a.index),!1},after:function(){var a;return!this.viewOptions.list_frozenColumns&&"multi"!==this.viewOptions.list_selectable||this.list_noItems||this.list_setFrozenColumns(),this.viewOptions.list_actions&&!this.list_noItems&&(this.list_createItemActions(),this.list_sizeActionsTable()),!this.viewOptions.list_frozenColumns&&!this.viewOptions.list_actions&&"multi"!==this.viewOptions.list_selectable||this.list_noItems||(this.list_positionColumns(),this.list_frozenOptionsInitialize()),this.viewOptions.list_columnSyncing&&(this.list_sizeHeadings(),this.list_positionHeadings()),a=this.$canvas.find(".repeater-list-wrapper > table .repeater-list-heading.sorted"),a.length>0&&this.list_highlightColumn(a.data("fu_item_index")),!1}})}(a),function(a){function b(b,c){function d(){var d,f,g;f=c.indexOf("{{"),d=c.indexOf("}}",f+2),f>-1&&d>-1?(g=a.trim(c.substring(f+2,d)),g=void 0!==b[g]?b[g]:"",c=c.substring(0,f)+g+c.substring(d+2)):e=!0}for(var e=!1;!e&&c.search("{{")>=0;)d(c);return c}a.fn.repeater&&(a.fn.repeater.Constructor.prototype.thumbnail_clearSelectedItems=function(){this.$canvas.find(".repeater-thumbnail-cont .selectable.selected").removeClass("selected")},a.fn.repeater.Constructor.prototype.thumbnail_getSelectedItems=function(){var b=[];return this.$canvas.find(".repeater-thumbnail-cont .selectable.selected").each(function(){b.push(a(this))}),b},a.fn.repeater.Constructor.prototype.thumbnail_setSelectedItems=function(b,c){function d(){return j===b[g].index?(h=a(this),!1):void j++}function e(){h=a(this),h.is(b[g].selector)&&f(h,b[g].selected)}function f(a,b){b=void 0!==b?b:!0,b?(c||"multi"===k||l.thumbnail_clearSelectedItems(),a.addClass("selected")):a.removeClass("selected")}var g,h,i,j,k=this.viewOptions.thumbnail_selectable,l=this;for(a.isArray(b)||(b=[b]),i=c===!0||"multi"===k?b.length:k&&b.length>0?1:0,g=0;i>g;g++)void 0!==b[g].index?(h=a(),j=0,this.$canvas.find(".repeater-thumbnail-cont .selectable").each(d),h.length>0&&f(h,b[g].selected)):b[g].selector&&this.$canvas.find(".repeater-thumbnail-cont .selectable").each(e)},a.fn.repeater.defaults=a.extend({},a.fn.repeater.defaults,{thumbnail_alignment:"left",thumbnail_infiniteScroll:!1,thumbnail_itemRendered:null,thumbnail_noItemsHTML:"no items found",thumbnail_selectable:!1,thumbnail_template:'<div class="thumbnail repeater-thumbnail"><img height="75" src="{{src}}" width="65"><span>{{name}}</span></div>'}),a.fn.repeater.viewTypes.thumbnail={selected:function(){var a,b=this.viewOptions.thumbnail_infiniteScroll;b&&(a="object"==typeof b?b:{},this.infiniteScrolling(!0,a))},before:function(b){var c,d,e=this.viewOptions.thumbnail_alignment,f=this.$canvas.find(".repeater-thumbnail-cont"),g=b.data,h={};return f.length<1?(f=a('<div class="clearfix repeater-thumbnail-cont" data-container="true" data-infinite="true" data-preserve="shallow"></div>'),e&&"none"!==e?(d={center:1,justify:1,left:1,right:1},e=d[e]?e:"justify",f.addClass("align-"+e),this.thumbnail_injectSpacers=!0):this.thumbnail_injectSpacers=!1,h.item=f):h.action="none",g.items&&g.items.length<1?(c=a('<div class="empty"></div>'),c.append(this.viewOptions.thumbnail_noItemsHTML),f.append(c)):f.find(".empty:first").remove(),h},renderItem:function(c){var d=this.viewOptions.thumbnail_selectable,e="selected",f=this,g=a(b(c.subset[c.index],this.viewOptions.thumbnail_template));return d&&(g.addClass("selectable"),g.on("click",function(){g.hasClass(e)?(g.removeClass(e),f.$element.trigger("deselected.fu.repeaterThumbnail",g)):("multi"!==d&&f.$canvas.find(".repeater-thumbnail-cont .selectable.selected").each(function(){var b=a(this);b.removeClass(e),f.$element.trigger("deselected.fu.repeaterThumbnail",b)}),g.addClass(e),f.$element.trigger("selected.fu.repeaterThumbnail",g))})),c.container.append(g),this.thumbnail_injectSpacers&&g.after('<span class="spacer">&nbsp;</span>'),this.viewOptions.thumbnail_itemRendered&&this.viewOptions.thumbnail_itemRendered({container:c.container,item:g,itemData:c.subset[c.index]},function(){}),!1}})}(a),function(a){var b=a.fn.scheduler,c=function(b,c){var d=this;this.$element=a(b),this.options=a.extend({},a.fn.scheduler.defaults,c),this.$startDate=this.$element.find(".start-datetime .start-date"),this.$startTime=this.$element.find(".start-datetime .start-time"),this.$timeZone=this.$element.find(".timezone-container .timezone"),this.$repeatIntervalPanel=this.$element.find(".repeat-every-panel"),this.$repeatIntervalSelect=this.$element.find(".repeat-options"),this.$repeatIntervalSpinbox=this.$element.find(".repeat-every"),this.$repeatIntervalTxt=this.$element.find(".repeat-every-text"),this.$end=this.$element.find(".repeat-end"),this.$endSelect=this.$end.find(".end-options"),this.$endAfter=this.$end.find(".end-after"),this.$endDate=this.$end.find(".end-on-date"),this.$recurrencePanels=this.$element.find(".repeat-panel"),this.$repeatIntervalSelect.selectlist(),this.$element.find(".selectlist").selectlist(),this.$startDate.datepicker(this.options.startDateOptions),this.$startTime.combobox(),""===this.$startTime.find("input").val()&&this.$startTime.combobox("selectByIndex",0),this.$repeatIntervalSpinbox.spinbox("0"===this.$repeatIntervalSpinbox.find("input").val()?{value:1,min:1}:{min:1}),this.$endAfter.spinbox({value:1,min:1}),this.$endDate.datepicker(this.options.endDateOptions),this.$element.find(".radio-custom").radio(),this.$repeatIntervalSelect.on("changed.fu.selectlist",a.proxy(this.repeatIntervalSelectChanged,this)),this.$endSelect.on("changed.fu.selectlist",a.proxy(this.endSelectChanged,this)),this.$element.find(".repeat-days-of-the-week .btn-group .btn").on("change.fu.scheduler",function(a,b){d.changed(a,b,!0)}),this.$element.find(".combobox").on("changed.fu.combobox",a.proxy(this.changed,this)),this.$element.find(".datepicker").on("changed.fu.datepicker",a.proxy(this.changed,this)),this.$element.find(".datepicker").on("dateClicked.fu.datepicker",a.proxy(this.changed,this)),this.$element.find(".selectlist").on("changed.fu.selectlist",a.proxy(this.changed,this)),this.$element.find(".spinbox").on("changed.fu.spinbox",a.proxy(this.changed,this)),this.$element.find(".repeat-monthly .radio-custom, .repeat-yearly .radio-custom").on("change.fu.scheduler",a.proxy(this.changed,this))};c.prototype={constructor:c,destroy:function(){var b;return this.$element.find("input").each(function(){a(this).attr("value",a(this).val())}),this.$element.find(".datepicker .calendar").empty(),b=this.$element[0].outerHTML,this.$element.find(".combobox").combobox("destroy"),this.$element.find(".datepicker").datepicker("destroy"),this.$element.find(".selectlist").selectlist("destroy"),this.$element.find(".spinbox").spinbox("destroy"),this.$element.find(".radio-custom").radio("destroy"),this.$element.remove(),b},changed:function(b,c,d){d||b.stopPropagation(),this.$element.trigger("changed.fu.scheduler",{data:void 0!==c?c:a(b.currentTarget).data(),originalEvent:b,value:this.getValue()})},disable:function(){this.toggleState("disable")},enable:function(){this.toggleState("enable")},setUtcTime:function(a,b,c){var d=a.split("-"),e=b.split(":"),f=new Date(Date.UTC(d[0],d[1]-1,d[2],e[0],e[1],e[2]?e[2]:0));if("Z"===c)f.setUTCHours(f.getUTCHours()+0);else{var g="(.)",h=".*?",i="\\d",j=".*?",k="(\\d)",l=new RegExp(g+h+i+j+k,["i"]),m=l.exec(c);if(null!==m){var n=m[1],o=m[2],p="+"===n?1:-1;f.setUTCHours(f.getUTCHours()+p*parseInt(o,10))}}var q=f.getTimezoneOffset();return f.setMinutes(q),f},endSelectChanged:function(a,b){var c,d;b?d=b.value:(c=this.$endSelect.selectlist("selectedItem"),d=c.value),this.$endAfter.parent().addClass("hidden"),this.$endAfter.parent().attr("aria-hidden","true"),this.$endDate.parent().addClass("hidden"),this.$endDate.parent().attr("aria-hidden","true"),"after"===d?(this.$endAfter.parent().removeClass("hide hidden"),this.$endAfter.parent().attr("aria-hidden","false")):"date"===d&&(this.$endDate.parent().removeClass("hide hidden"),this.$endDate.parent().attr("aria-hidden","false"))},getValue:function(){var b,c=this.$repeatIntervalSpinbox.spinbox("value"),d="",e=this.$repeatIntervalSelect.selectlist("selectedItem").value;this.$startTime.combobox("selectedItem").value?(b=this.$startTime.combobox("selectedItem").value,b=b.toLowerCase()):b=this.$startTime.combobox("selectedItem").text.toLowerCase();var f,g=this.$timeZone.selectlist("selectedItem");f=function(a,b){var c,d="";return d+=a.getFullYear(),d+=b,c=a.getMonth()+1,d+=10>c?"0"+c:c,d+=b,c=a.getDate(),d+=10>c?"0"+c:c};var h,i,j,k,l,m,n,o;n=""+f(this.$startDate.datepicker("getDate"),"-"),n+="T",j=b.search("am")>=0,k=b.search("pm")>=0,b=a.trim(b.replace(/am/g,"").replace(/pm/g,"")).split(":"),b[0]=parseInt(b[0],10),b[1]=parseInt(b[1],10),j&&b[0]>11?b[0]=0:k&&b[0]<12&&(b[0]+=12),n+=b[0]<10?"0"+b[0]:b[0],n+=":",n+=b[1]<10?"0"+b[1]:b[1],n+="+00:00"===g.offset?"Z":g.offset,"none"===e?d="FREQ=DAILY;INTERVAL=1;COUNT=1;":"secondly"===e?(d="FREQ=SECONDLY;",d+="INTERVAL="+c+";"):"minutely"===e?(d="FREQ=MINUTELY;",d+="INTERVAL="+c+";"):"hourly"===e?(d="FREQ=HOURLY;",d+="INTERVAL="+c+";"):"daily"===e?(d+="FREQ=DAILY;",d+="INTERVAL="+c+";"):"weekdays"===e?(d+="FREQ=DAILY;",d+="BYDAY=MO,TU,WE,TH,FR;",d+="INTERVAL=1;"):"weekly"===e?(i=[],this.$element.find(".repeat-days-of-the-week .btn-group input:checked").each(function(){i.push(a(this).data().value)}),d+="FREQ=WEEKLY;",d+="BYDAY="+i.join(",")+";",d+="INTERVAL="+c+";"):"monthly"===e?(d+="FREQ=MONTHLY;",d+="INTERVAL="+c+";",o=this.$element.find("input[name=repeat-monthly]:checked").val(),"bymonthday"===o?(h=parseInt(this.$element.find(".repeat-monthly-date .selectlist").selectlist("selectedItem").text,10),d+="BYMONTHDAY="+h+";"):"bysetpos"===o&&(i=this.$element.find(".repeat-monthly-day .month-days").selectlist("selectedItem").value,m=this.$element.find(".repeat-monthly-day .month-day-pos").selectlist("selectedItem").value,d+="BYDAY="+i+";",d+="BYSETPOS="+m+";")):"yearly"===e&&(d+="FREQ=YEARLY;",o=this.$element.find("input[name=repeat-yearly]:checked").val(),"bymonthday"===o?(l=this.$element.find(".repeat-yearly-date .year-month").selectlist("selectedItem").value,h=this.$element.find(".repeat-yearly-date .year-month-day").selectlist("selectedItem").text,d+="BYMONTH="+l+";",d+="BYMONTHDAY="+h+";"):"bysetpos"===o&&(i=this.$element.find(".repeat-yearly-day .year-month-days").selectlist("selectedItem").value,m=this.$element.find(".repeat-yearly-day .year-month-day-pos").selectlist("selectedItem").value,l=this.$element.find(".repeat-yearly-day .year-month").selectlist("selectedItem").value,d+="BYDAY="+i+";",d+="BYSETPOS="+m+";",d+="BYMONTH="+l+";"));var p=this.$endSelect.selectlist("selectedItem").value,q="";"none"!==e&&("after"===p?q="COUNT="+this.$endAfter.spinbox("value")+";":"date"===p&&(q="UNTIL="+f(this.$endDate.datepicker("getDate"),"")+";")),d+=q,d=";"===d.substring(d.length-1)?d.substring(0,d.length-1):d;var r={startDateTime:n,timeZone:g,recurrencePattern:d};return r},repeatIntervalSelectChanged:function(a,b){var c,d,e;switch(b?(d=b.value,e=b.text):(c=this.$repeatIntervalSelect.selectlist("selectedItem"),d=c.value||"",e=c.text||""),this.$repeatIntervalTxt.text(e),d.toLowerCase()){case"hourly":case"daily":case"weekly":case"monthly":this.$repeatIntervalPanel.removeClass("hide hidden"),this.$repeatIntervalPanel.attr("aria-hidden","false");break;default:this.$repeatIntervalPanel.addClass("hidden"),this.$repeatIntervalPanel.attr("aria-hidden","true")}this.$recurrencePanels.addClass("hidden"),this.$recurrencePanels.attr("aria-hidden","true"),this.$element.find(".repeat-"+d).removeClass("hide hidden"),this.$element.find(".repeat-"+d).attr("aria-hidden","false"),"none"===d?(this.$end.addClass("hidden"),this.$end.attr("aria-hidden","true")):(this.$end.removeClass("hide hidden"),this.$end.attr("aria-hidden","false"))},setValue:function(b){var c,d,e,f,g,h,i,j,k,l,m;if(b.startDateTime)j=b.startDateTime.split("T"),k=j[0],j[1]?(j[1]=j[1].split(":"),c=parseInt(j[1][0],10),g=j[1][1]?parseInt(j[1][1].split("+")[0].split("-")[0].split("Z")[0],10):0,h=12>c?"AM":"PM",0===c?c=12:c>12&&(c-=12),g=10>g?"0"+g:g,l=c+":"+g,j=c+":"+g+" "+h,this.$startTime.find("input").val(j),this.$startTime.combobox("selectByText",j)):l="00:00";else{l="00:00";var n=this.$startDate.datepicker("getDate");k=n.getFullYear()+"-"+n.getMonth()+"-"+n.getDate()}if(e="li",b.timeZone?("string"==typeof b.timeZone?e+='[data-name="'+b.timeZone+'"]':a.each(b.timeZone,function(a,b){e+="[data-"+a+'="'+b+'"]'}),m=b.timeZone.offset,this.$timeZone.selectlist("selectBySelector",e)):b.startDateTime?(j=b.startDateTime.split("T")[1],j=j?j.search(/\+/)>-1?"+"+a.trim(j.split("+")[1]):j.search(/\-/)>-1?"-"+a.trim(j.split("-")[1]):"+00:00":"+00:00",m="+00:00"===j?"Z":j,e+='[data-offset="'+j+'"]',this.$timeZone.selectlist("selectBySelector",e)):m="Z",b.recurrencePattern){for(i={},j=b.recurrencePattern.toUpperCase().split(";"),d=0,f=j.length;f>d;d++)""!==j[d]&&(e=j[d].split("="),i[e[0]]=e[1]);if("DAILY"===i.FREQ)e="MO,TU,WE,TH,FR"===i.BYDAY?"weekdays":"1"===i.INTERVAL&&"1"===i.COUNT?"none":"daily";else if("SECONDLY"===i.FREQ)e="secondly";else if("MINUTELY"===i.FREQ)e="minutely";else if("HOURLY"===i.FREQ)e="hourly";else if("WEEKLY"===i.FREQ){if(i.BYDAY)for(e=this.$element.find(".repeat-days-of-the-week .btn-group"),e.find("label").removeClass("active"),j=i.BYDAY.split(","),d=0,f=j.length;f>d;d++)e.find('input[data-value="'+j[d]+'"]').prop("checked",!0).parent().addClass("active");e="weekly"}else"MONTHLY"===i.FREQ?(this.$element.find(".repeat-monthly input").removeAttr("checked").removeClass("checked"),this.$element.find(".repeat-monthly label.radio-custom").removeClass("checked"),i.BYMONTHDAY?(j=this.$element.find(".repeat-monthly-date"),j.find("input").addClass("checked").prop("checked",!0),j.find("label.radio-custom").addClass("checked"),j.find(".selectlist").selectlist("selectByValue",i.BYMONTHDAY)):i.BYDAY&&(j=this.$element.find(".repeat-monthly-day"),j.find("input").addClass("checked").prop("checked",!0),j.find("label.radio-custom").addClass("checked"),i.BYSETPOS&&j.find(".month-day-pos").selectlist("selectByValue",i.BYSETPOS),j.find(".month-days").selectlist("selectByValue",i.BYDAY)),e="monthly"):"YEARLY"===i.FREQ?(this.$element.find(".repeat-yearly input").removeAttr("checked").removeClass("checked"),this.$element.find(".repeat-yearly label.radio-custom").removeClass("checked"),i.BYMONTHDAY?(j=this.$element.find(".repeat-yearly-date"),j.find("input").addClass("checked").prop("checked",!0),j.find("label.radio-custom").addClass("checked"),i.BYMONTH&&j.find(".year-month").selectlist("selectByValue",i.BYMONTH),j.find(".year-month-day").selectlist("selectByValue",i.BYMONTHDAY)):i.BYSETPOS&&(j=this.$element.find(".repeat-yearly-day"),j.find("input").addClass("checked").prop("checked",!0),j.find("label.radio-custom").addClass("checked"),j.find(".year-month-day-pos").selectlist("selectByValue",i.BYSETPOS),i.BYDAY&&j.find(".year-month-days").selectlist("selectByValue",i.BYDAY),i.BYMONTH&&j.find(".year-month").selectlist("selectByValue",i.BYMONTH)),e="yearly"):e="none";if(i.COUNT)this.$endAfter.spinbox("value",parseInt(i.COUNT,10)),this.$endSelect.selectlist("selectByValue","after");else if(i.UNTIL){j=i.UNTIL,8===j.length&&(j=j.split(""),j.splice(4,0,"-"),j.splice(7,0,"-"),j=j.join(""));var o=this.$timeZone.selectlist("selectedItem"),p="+00:00"===o.offset?"Z":o.offset,q=this.setUtcTime(j,l,p);this.$endDate.datepicker("setDate",q),this.$endSelect.selectlist("selectByValue","date")}else this.$endSelect.selectlist("selectByValue","never");this.endSelectChanged(),i.INTERVAL&&this.$repeatIntervalSpinbox.spinbox("value",parseInt(i.INTERVAL,10)),this.$repeatIntervalSelect.selectlist("selectByValue",e),this.repeatIntervalSelectChanged()}var r=this.setUtcTime(k,l,m);this.$startDate.datepicker("setDate",r)},toggleState:function(a){this.$element.find(".combobox").combobox(a),this.$element.find(".datepicker").datepicker(a),this.$element.find(".selectlist").selectlist(a),this.$element.find(".spinbox").spinbox(a),this.$element.find(".radio-custom").radio(a),a="disable"===a?"addClass":"removeClass",this.$element.find(".repeat-days-of-the-week .btn-group")[a]("disabled")},value:function(a){return a?this.setValue(a):this.getValue()}},a.fn.scheduler=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.scheduler"),h="object"==typeof b&&b;g||f.data("fu.scheduler",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.scheduler.defaults={},a.fn.scheduler.Constructor=c,a.fn.scheduler.noConflict=function(){return a.fn.scheduler=b,this},a(document).on("mousedown.fu.scheduler.data-api","[data-initialize=scheduler]",function(b){var c=a(b.target).closest(".scheduler");c.data("fu.scheduler")||c.scheduler(c.data())}),a(function(){a("[data-initialize=scheduler]").each(function(){var b=a(this);b.data("scheduler")||b.scheduler(b.data())})})}(a),function(a){var b=a.fn.picker,c=function(b,c){var d=this;this.$element=a(b),this.options=a.extend({},a.fn.picker.defaults,c),this.$accept=this.$element.find(".picker-accept"),this.$cancel=this.$element.find(".picker-cancel"),this.$trigger=this.$element.find(".picker-trigger"),this.$footer=this.$element.find(".picker-footer"),this.$header=this.$element.find(".picker-header"),this.$popup=this.$element.find(".picker-popup"),this.$body=this.$element.find(".picker-body"),this.clickStamp="_",this.isInput=this.$trigger.is("input"),this.$trigger.on("keydown.fu.picker",a.proxy(this.keyComplete,this)),this.$trigger.on("focus.fu.picker",a.proxy(function(b){("undefined"==typeof b||a(b.target).is("input[type=text]"))&&a.proxy(this.show(),this)},this)),this.$trigger.on("click.fu.picker",a.proxy(function(b){a(b.target).is("input[type=text]")?a.proxy(this.show(),this):a.proxy(this.toggle(),this)},this)),this.$accept.on("click.fu.picker",a.proxy(this.complete,this,"accepted")),this.$cancel.on("click.fu.picker",function(a){a.preventDefault(),d.complete("cancelled")})},d=function(b){var c=Math.max(document.documentElement.clientHeight,window.innerHeight||0),d=a(document).scrollTop(),e=b.$popup.offset(),f=e.top+b.$popup.outerHeight(!0);return f>c+d||e.top<d?!0:!1},e=function(a){a.$popup.css("visibility","hidden"),g(a),d(a)&&(f(a),d(a)&&g(a)),a.$popup.css("visibility","visible")},f=function(a){a.$popup.css("top",-a.$popup.outerHeight(!0)+"px")},g=function(a){a.$popup.css("top",a.$trigger.outerHeight(!0)+"px")};c.prototype={constructor:c,complete:function(a){var b={accepted:"onAccept",cancelled:"onCancel",exited:"onExit"},c=this.options[b[a]],d={contents:this.$body};c?(c(d),this.$element.trigger(a+".fu.picker",d)):(this.$element.trigger(a+".fu.picker",d),this.hide())},keyComplete:function(a){this.isInput&&13===a.keyCode?(this.complete("accepted"),this.$trigger.blur()):27===a.keyCode&&(this.complete("exited"),this.$trigger.blur())},destroy:function(){return this.$element.remove(),a(document).off("click.fu.picker.externalClick."+this.clickStamp),this.$element[0].outerHTML},disable:function(){this.$element.addClass("disabled"),this.$trigger.attr("disabled","disabled")},enable:function(){this.$element.removeClass("disabled"),this.$trigger.removeAttr("disabled")},toggle:function(){this.$element.hasClass("showing")?this.hide():this.show()},hide:function(){this.$element.hasClass("showing")&&(this.$element.removeClass("showing"),a(document).off("click.fu.picker.externalClick."+this.clickStamp),this.$element.trigger("hidden.fu.picker"))},externalClickListener:function(a,b){(b===!0||this.isExternalClick(a))&&this.complete("exited")},isExternalClick:function(b){var c,d,e=this.$element.get(0),f=this.options.externalClickExceptions||[],g=a(b.target);if(b.target===e||g.parents(".picker:first").get(0)===e)return!1;for(c=0,d=f.length;d>c;c++)if(g.is(f[c])||g.parents(f[c]).length>0)return!1;return!0},show:function(){var b;if(b=a(document).find(".picker.showing"),b.length>0){if(b.data("fu.picker")&&b.data("fu.picker").options.explicit)return;b.picker("externalClickListener",{},!0)}this.$element.addClass("showing"),e(this),this.$element.trigger("shown.fu.picker"),this.clickStamp=(new Date).getTime()+(Math.floor(100*Math.random())+1),this.options.explicit||a(document).on("click.fu.picker.externalClick."+this.clickStamp,a.proxy(this.externalClickListener,this))}},a.fn.picker=function(b){var d,e=Array.prototype.slice.call(arguments,1),f=this.each(function(){var f=a(this),g=f.data("fu.picker"),h="object"==typeof b&&b;g||f.data("fu.picker",g=new c(this,h)),"string"==typeof b&&(d=g[b].apply(g,e))});return void 0===d?f:d},a.fn.picker.defaults={onAccept:void 0,onCancel:void 0,onExit:void 0,externalClickExceptions:[],explicit:!1},a.fn.picker.Constructor=c,a.fn.picker.noConflict=function(){return a.fn.picker=b,this},a(document).on("focus.fu.picker.data-api","[data-initialize=picker]",function(b){var c=a(b.target).closest(".picker");c.data("fu.picker")||c.picker(c.data())}),a(function(){a("[data-initialize=picker]").each(function(){var b=a(this);b.data("fu.picker")||b.picker(b.data())})})}(a)});
/*! iCheck v1.0.2 by Damir Sultanov, http://git.io/arlzeA, MIT Licensed */
(function(f){function A(a,b,d){var c=a[0],g=/er/.test(d)?_indeterminate:/bl/.test(d)?n:k,e=d==_update?{checked:c[k],disabled:c[n],indeterminate:"true"==a.attr(_indeterminate)||"false"==a.attr(_determinate)}:c[g];if(/^(ch|di|in)/.test(d)&&!e)x(a,g);else if(/^(un|en|de)/.test(d)&&e)q(a,g);else if(d==_update)for(var f in e)e[f]?x(a,f,!0):q(a,f,!0);else if(!b||"toggle"==d){if(!b)a[_callback]("ifClicked");e?c[_type]!==r&&q(a,g):x(a,g)}}function x(a,b,d){var c=a[0],g=a.parent(),e=b==k,u=b==_indeterminate,
v=b==n,s=u?_determinate:e?y:"enabled",F=l(a,s+t(c[_type])),B=l(a,b+t(c[_type]));if(!0!==c[b]){if(!d&&b==k&&c[_type]==r&&c.name){var w=a.closest("form"),p='input[name="'+c.name+'"]',p=w.length?w.find(p):f(p);p.each(function(){this!==c&&f(this).data(m)&&q(f(this),b)})}u?(c[b]=!0,c[k]&&q(a,k,"force")):(d||(c[b]=!0),e&&c[_indeterminate]&&q(a,_indeterminate,!1));D(a,e,b,d)}c[n]&&l(a,_cursor,!0)&&g.find("."+C).css(_cursor,"default");g[_add](B||l(a,b)||"");g.attr("role")&&!u&&g.attr("aria-"+(v?n:k),"true");
g[_remove](F||l(a,s)||"")}function q(a,b,d){var c=a[0],g=a.parent(),e=b==k,f=b==_indeterminate,m=b==n,s=f?_determinate:e?y:"enabled",q=l(a,s+t(c[_type])),r=l(a,b+t(c[_type]));if(!1!==c[b]){if(f||!d||"force"==d)c[b]=!1;D(a,e,s,d)}!c[n]&&l(a,_cursor,!0)&&g.find("."+C).css(_cursor,"pointer");g[_remove](r||l(a,b)||"");g.attr("role")&&!f&&g.attr("aria-"+(m?n:k),"false");g[_add](q||l(a,s)||"")}function E(a,b){if(a.data(m)){a.parent().html(a.attr("style",a.data(m).s||""));if(b)a[_callback](b);a.off(".i").unwrap();
f(_label+'[for="'+a[0].id+'"]').add(a.closest(_label)).off(".i")}}function l(a,b,f){if(a.data(m))return a.data(m).o[b+(f?"":"Class")]}function t(a){return a.charAt(0).toUpperCase()+a.slice(1)}function D(a,b,f,c){if(!c){if(b)a[_callback]("ifToggled");a[_callback]("ifChanged")[_callback]("if"+t(f))}}var m="iCheck",C=m+"-helper",r="radio",k="checked",y="un"+k,n="disabled";_determinate="determinate";_indeterminate="in"+_determinate;_update="update";_type="type";_click="click";_touch="touchbegin.i touchend.i";
_add="addClass";_remove="removeClass";_callback="trigger";_label="label";_cursor="cursor";_mobile=/ipad|iphone|ipod|android|blackberry|windows phone|opera mini|silk/i.test(navigator.userAgent);f.fn[m]=function(a,b){var d='input[type="checkbox"], input[type="'+r+'"]',c=f(),g=function(a){a.each(function(){var a=f(this);c=a.is(d)?c.add(a):c.add(a.find(d))})};if(/^(check|uncheck|toggle|indeterminate|determinate|disable|enable|update|destroy)$/i.test(a))return a=a.toLowerCase(),g(this),c.each(function(){var c=
f(this);"destroy"==a?E(c,"ifDestroyed"):A(c,!0,a);f.isFunction(b)&&b()});if("object"!=typeof a&&a)return this;var e=f.extend({checkedClass:k,disabledClass:n,indeterminateClass:_indeterminate,labelHover:!0},a),l=e.handle,v=e.hoverClass||"hover",s=e.focusClass||"focus",t=e.activeClass||"active",B=!!e.labelHover,w=e.labelHoverClass||"hover",p=(""+e.increaseArea).replace("%","")|0;if("checkbox"==l||l==r)d='input[type="'+l+'"]';-50>p&&(p=-50);g(this);return c.each(function(){var a=f(this);E(a);var c=this,
b=c.id,g=-p+"%",d=100+2*p+"%",d={position:"absolute",top:g,left:g,display:"block",width:d,height:d,margin:0,padding:0,background:"#fff",border:0,opacity:0},g=_mobile?{position:"absolute",visibility:"hidden"}:p?d:{position:"absolute",opacity:0},l="checkbox"==c[_type]?e.checkboxClass||"icheckbox":e.radioClass||"i"+r,z=f(_label+'[for="'+b+'"]').add(a.closest(_label)),u=!!e.aria,y=m+"-"+Math.random().toString(36).substr(2,6),h='<div class="'+l+'" '+(u?'role="'+c[_type]+'" ':"");u&&z.each(function(){h+=
'aria-labelledby="';this.id?h+=this.id:(this.id=y,h+=y);h+='"'});h=a.wrap(h+"/>")[_callback]("ifCreated").parent().append(e.insert);d=f('<ins class="'+C+'"/>').css(d).appendTo(h);a.data(m,{o:e,s:a.attr("style")}).css(g);e.inheritClass&&h[_add](c.className||"");e.inheritID&&b&&h.attr("id",m+"-"+b);"static"==h.css("position")&&h.css("position","relative");A(a,!0,_update);if(z.length)z.on(_click+".i mouseover.i mouseout.i "+_touch,function(b){var d=b[_type],e=f(this);if(!c[n]){if(d==_click){if(f(b.target).is("a"))return;
A(a,!1,!0)}else B&&(/ut|nd/.test(d)?(h[_remove](v),e[_remove](w)):(h[_add](v),e[_add](w)));if(_mobile)b.stopPropagation();else return!1}});a.on(_click+".i focus.i blur.i keyup.i keydown.i keypress.i",function(b){var d=b[_type];b=b.keyCode;if(d==_click)return!1;if("keydown"==d&&32==b)return c[_type]==r&&c[k]||(c[k]?q(a,k):x(a,k)),!1;if("keyup"==d&&c[_type]==r)!c[k]&&x(a,k);else if(/us|ur/.test(d))h["blur"==d?_remove:_add](s)});d.on(_click+" mousedown mouseup mouseover mouseout "+_touch,function(b){var d=
b[_type],e=/wn|up/.test(d)?t:v;if(!c[n]){if(d==_click)A(a,!1,!0);else{if(/wn|er|in/.test(d))h[_add](e);else h[_remove](e+" "+t);if(z.length&&B&&e==v)z[/ut|nd/.test(d)?_remove:_add](w)}if(_mobile)b.stopPropagation();else return!1}})})}})(window.jQuery||window.Zepto);

!function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery","../grid.base"],a):a(jQuery)}(function(a){a.jgrid=a.jgrid||{},a.jgrid.hasOwnProperty("regional")||(a.jgrid.regional=[]),a.jgrid.regional.hu={defaults:{recordtext:"Oldal {0} - {1} / {2}",emptyrecords:"Nincs találat",loadtext:"Betöltés...",pgtext:"Oldal {0} / {1}",savetext:"Saving...",pgfirst:"First Page",pglast:"Last Page",pgnext:"Next Page",pgprev:"Previous Page",pgrecs:"Records per Page",showhide:"Toggle Expand Collapse Grid",pagerCaption:"Grid::Page Settings",pageText:"Page:",recordPage:"Records per Page",nomorerecs:"No more records...",scrollPullup:"Pull up to load more...",scrollPulldown:"Pull down to refresh...",scrollRefresh:"Release to refresh..."},search:{caption:"Keresés...",Find:"Keres",Reset:"Alapértelmezett",odata:[{oper:"eq",text:"egyenlő"},{oper:"ne",text:"nem egyenlő"},{oper:"lt",text:"kevesebb"},{oper:"le",text:"kevesebb vagy egyenlő"},{oper:"gt",text:"nagyobb"},{oper:"ge",text:"nagyobb vagy egyenlő"},{oper:"bw",text:"ezzel kezdődik"},{oper:"bn",text:"nem ezzel kezdődik"},{oper:"in",text:"tartalmaz"},{oper:"ni",text:"nem tartalmaz"},{oper:"ew",text:"végződik"},{oper:"en",text:"nem végződik"},{oper:"cn",text:"tartalmaz"},{oper:"nc",text:"nem tartalmaz"},{oper:"nu",text:"is null"},{oper:"nn",text:"is not null"}],groupOps:[{op:"AND",text:"all"},{op:"OR",text:"any"}],operandTitle:"Click to select search operation.",resetTitle:"Reset Search Value"},edit:{addCaption:"Új tétel",editCaption:"Tétel szerkesztése",bSubmit:"Mentés",bCancel:"Mégse",bClose:"Bezárás",saveData:"A tétel megváltozott! Tétel mentése?",bYes:"Igen",bNo:"Nem",bExit:"Mégse",msg:{required:"Kötelező mező",number:"Kérjük, adjon meg egy helyes számot",minValue:"Nagyobb vagy egyenlőnek kell lenni mint ",maxValue:"Kisebb vagy egyenlőnek kell lennie mint",email:"hibás emailcím",integer:"Kérjük adjon meg egy helyes egész számot",date:"Kérjük adjon meg egy helyes dátumot",url:"nem helyes cím. Előtag kötelező ('http://' vagy 'https://')",nodefined:" nem definiált!",novalue:" visszatérési érték kötelező!!",customarray:"Custom function should return array!",customfcheck:"Custom function should be present in case of custom checking!"}},view:{caption:"Tétel megtekintése",bClose:"Bezárás"},del:{caption:"Törlés",msg:"Kiválaztott tétel(ek) törlése?",bSubmit:"Törlés",bCancel:"Mégse"},nav:{edittext:"",edittitle:"Tétel szerkesztése",addtext:"",addtitle:"Új tétel hozzáadása",deltext:"",deltitle:"Tétel törlése",searchtext:"",searchtitle:"Keresés",refreshtext:"",refreshtitle:"Frissítés",alertcap:"Figyelmeztetés",alerttext:"Kérem válasszon tételt.",viewtext:"",viewtitle:"Tétel megtekintése",savetext:"",savetitle:"Save row",canceltext:"",canceltitle:"Cancel row editing",selectcaption:"Actions..."},col:{caption:"Oszlopok kiválasztása",bSubmit:"Ok",bCancel:"Mégse"},errors:{errcap:"Hiba",nourl:"Nincs URL beállítva",norecords:"Nincs feldolgozásra váró tétel",model:"colNames és colModel hossza nem egyenlő!"},formatter:{integer:{thousandsSeparator:" ",defaultValue:"0"},number:{decimalSeparator:",",thousandsSeparator:" ",decimalPlaces:2,defaultValue:"0,00"},currency:{decimalSeparator:",",thousandsSeparator:" ",decimalPlaces:2,prefix:"",suffix:"",defaultValue:"0,00"},date:{dayNames:["Va","Hé","Ke","Sze","Csü","Pé","Szo","Vasárnap","Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat"],monthNames:["Jan","Feb","Már","Ápr","Máj","Jún","Júl","Aug","Szep","Okt","Nov","Dec","Január","Február","Március","Áprili","Május","Június","Július","Augusztus","Szeptember","Október","November","December"],AmPm:["de","du","DE","DU"],S:function(){return".-ik"},srcformat:"Y-m-d",newformat:"Y/m/d",parseRe:/[#%\\\/:_;.,\t\s-]/,masks:{ISO8601Long:"Y-m-d H:i:s",ISO8601Short:"Y-m-d",ShortDate:"Y/j/n",LongDate:"Y. F hó d., l",FullDateTime:"l, F d, Y g:i:s A",MonthDay:"F d",ShortTime:"a g:i",LongTime:"a g:i:s",SortableDateTime:"Y-m-d\\TH:i:s",UniversalSortableDateTime:"Y-m-d H:i:sO",YearMonth:"Y, F"},reformatAfterEdit:!1,userLocalTime:!1},baseLinkUrl:"",showAction:"",target:"",checkbox:{disabled:!0},idName:"id"}}});
/**
*
* @license Guriddo jqGrid JS - v5.0.0 - 2015-08-03
* Copyright(c) 2008, Tony Tomov, tony@trirand.com
* 
* License: http://guriddo.net/?page_id=103334
*/

!function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function($){"use strict";function _pivotfilter(a,b){var c,d,e,f=[];if(!this||"function"!=typeof a||a instanceof RegExp)throw new TypeError;for(e=this.length,c=0;e>c;c++)if(this.hasOwnProperty(c)&&(d=this[c],a.call(b,d,c,this))){f.push(d);break}return f}$.jgrid=$.jgrid||{},$.jgrid.hasOwnProperty("defaults")||($.jgrid.defaults={}),$.extend($.jgrid,{version:"5.0.0",htmlDecode:function(a){return a&&("&nbsp;"===a||"&#160;"===a||1===a.length&&160===a.charCodeAt(0))?"":a?String(a).replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&quot;/g,'"').replace(/&amp;/g,"&"):a},htmlEncode:function(a){return a?String(a).replace(/&/g,"&amp;").replace(/\"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):a},template:function(a){var b,c=$.makeArray(arguments).slice(1),d=c.length;return null==a&&(a=""),a.replace(/\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,function(a,e){if(!isNaN(parseInt(e,10)))return c[parseInt(e,10)];for(b=0;d>b;b++)if($.isArray(c[b]))for(var f=c[b],g=f.length;g--;)if(e===f[g].nm)return f[g].v})},msie:"Microsoft Internet Explorer"===navigator.appName,msiever:function(){var a=-1,b=navigator.userAgent,c=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");return null!=c.exec(b)&&(a=parseFloat(RegExp.$1)),a},getCellIndex:function(a){var b=$(a);return b.is("tr")?-1:(b=(b.is("td")||b.is("th")?b:b.closest("td,th"))[0],$.jgrid.msie?$.inArray(b,b.parentNode.cells):b.cellIndex)},stripHtml:function(a){a=String(a);var b=/<("[^"]*"|'[^']*'|[^'">])*>/gi;return a?(a=a.replace(b,""),a&&"&nbsp;"!==a&&"&#160;"!==a?a.replace(/\"/g,"'"):""):a},stripPref:function(a,b){var c=$.type(a);return("string"===c||"number"===c)&&(a=String(a),b=""!==a?String(b).replace(String(a),""):b),b},parse:function(jsonString){var js=jsonString;return"while(1);"===js.substr(0,9)&&(js=js.substr(9)),"/*"===js.substr(0,2)&&(js=js.substr(2,js.length-4)),js||(js="{}"),$.jgrid.useJSON===!0&&"object"==typeof JSON&&"function"==typeof JSON.parse?JSON.parse(js):eval("("+js+")")},parseDate:function(a,b,c,d){var e,f,g,h=/\\.|[dDjlNSwzWFmMntLoYyaABgGhHisueIOPTZcrU]/g,i=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,j=/[^-+\dA-Z]/g,k=new RegExp("^/Date\\((([-+])?[0-9]+)(([-+])([0-9]{2})([0-9]{2}))?\\)/$"),l="string"==typeof b?b.match(k):null,m=function(a,b){for(a=String(a),b=parseInt(b,10)||2;a.length<b;)a="0"+a;return a},n={m:1,d:1,y:1970,h:0,i:0,s:0,u:0},o=0,p=function(a,b){return 0===a?12===b&&(b=0):12!==b&&(b+=12),b},q=0;if(void 0===d&&(d=$.jgrid.getRegional(this,"formatter.date")),void 0===d.parseRe&&(d.parseRe=/[#%\\\/:_;.,\t\s-]/),d.masks.hasOwnProperty(a)&&(a=d.masks[a]),b&&null!=b)if(isNaN(b-0)||"u"!==String(a).toLowerCase())if(b.constructor===Date)o=b;else if(null!==l)o=new Date(parseInt(l[1],10)),l[3]&&(q=60*Number(l[5])+Number(l[6]),q*="-"===l[4]?1:-1,q-=o.getTimezoneOffset(),o.setTime(Number(Number(o)+60*q*1e3)));else{for("ISO8601Long"===d.srcformat&&"Z"===b.charAt(b.length-1)&&(q-=(new Date).getTimezoneOffset()),b=String(b).replace(/\T/g,"#").replace(/\t/,"%").split(d.parseRe),a=a.replace(/\T/g,"#").replace(/\t/,"%").split(d.parseRe),f=0,g=a.length;g>f;f++){switch(a[f]){case"M":e=$.inArray(b[f],d.monthNames),-1!==e&&12>e&&(b[f]=e+1,n.m=b[f]);break;case"F":e=$.inArray(b[f],d.monthNames,12),-1!==e&&e>11&&(b[f]=e+1-12,n.m=b[f]);break;case"n":a[f]="m";break;case"j":a[f]="d";break;case"a":e=$.inArray(b[f],d.AmPm),-1!==e&&2>e&&b[f]===d.AmPm[e]&&(b[f]=e,n.h=p(b[f],n.h));break;case"A":e=$.inArray(b[f],d.AmPm),-1!==e&&e>1&&b[f]===d.AmPm[e]&&(b[f]=e-2,n.h=p(b[f],n.h));break;case"g":n.h=parseInt(b[f],10)}void 0!==b[f]&&(n[a[f].toLowerCase()]=parseInt(b[f],10))}if(n.f&&(n.m=n.f),0===n.m&&0===n.y&&0===n.d)return"&#160;";n.m=parseInt(n.m,10)-1;var r=n.y;r>=70&&99>=r?n.y=1900+n.y:r>=0&&69>=r&&(n.y=2e3+n.y),o=new Date(n.y,n.m,n.d,n.h,n.i,n.s,n.u),q>0&&o.setTime(Number(Number(o)+60*q*1e3))}else o=new Date(1e3*parseFloat(b));else o=new Date(n.y,n.m,n.d,n.h,n.i,n.s,n.u);if(d.userLocalTime&&0===q&&(q-=(new Date).getTimezoneOffset(),q>0&&o.setTime(Number(Number(o)+60*q*1e3))),void 0===c)return o;d.masks.hasOwnProperty(c)?c=d.masks[c]:c||(c="Y-m-d");var s=o.getHours(),t=o.getMinutes(),u=o.getDate(),v=o.getMonth()+1,w=o.getTimezoneOffset(),x=o.getSeconds(),y=o.getMilliseconds(),z=o.getDay(),A=o.getFullYear(),B=(z+6)%7+1,C=(new Date(A,v-1,u)-new Date(A,0,1))/864e5,D={d:m(u),D:d.dayNames[z],j:u,l:d.dayNames[z+7],N:B,S:d.S(u),w:z,z:C,W:5>B?Math.floor((C+B-1)/7)+1:Math.floor((C+B-1)/7)||((new Date(A-1,0,1).getDay()+6)%7<4?53:52),F:d.monthNames[v-1+12],m:m(v),M:d.monthNames[v-1],n:v,t:"?",L:"?",o:"?",Y:A,y:String(A).substring(2),a:12>s?d.AmPm[0]:d.AmPm[1],A:12>s?d.AmPm[2]:d.AmPm[3],B:"?",g:s%12||12,G:s,h:m(s%12||12),H:m(s),i:m(t),s:m(x),u:y,e:"?",I:"?",O:(w>0?"-":"+")+m(100*Math.floor(Math.abs(w)/60)+Math.abs(w)%60,4),P:"?",T:(String(o).match(i)||[""]).pop().replace(j,""),Z:"?",c:"?",r:"?",U:Math.floor(o/1e3)};return c.replace(h,function(a){return D.hasOwnProperty(a)?D[a]:a.substring(1)})},jqID:function(a){return String(a).replace(/[!"#$%&'()*+,.\/:; <=>?@\[\\\]\^`{|}~]/g,"\\$&")},guid:1,uidPref:"jqg",randId:function(a){return(a||$.jgrid.uidPref)+$.jgrid.guid++},getAccessor:function(a,b){var c,d,e,f=[];if("function"==typeof b)return b(a);if(c=a[b],void 0===c)try{if("string"==typeof b&&(f=b.split(".")),e=f.length)for(c=a;c&&e--;)d=f.shift(),c=c[d]}catch(g){}return c},getXmlData:function(a,b,c){var d,e="string"==typeof b?b.match(/^(.*)\[(\w+)\]$/):null;return"function"==typeof b?b(a):e&&e[2]?e[1]?$(e[1],a).attr(e[2]):$(a).attr(e[2]):(d=$(b,a),c?d:d.length>0?$(d).text():void 0)},cellWidth:function(){var a=$("<div class='ui-jqgrid' style='left:10000px'><table class='ui-jqgrid-btable ui-common-table' style='width:5px;'><tr class='jqgrow'><td style='width:5px;display:block;'></td></tr></table></div>"),b=a.appendTo("body").find("td").width();return a.remove(),Math.abs(b-5)>.1},isLocalStorage:function(){try{return"localStorage"in window&&null!==window.localStorage}catch(a){return!1}},getRegional:function(a,b,c){var d;return void 0!==c?c:(a.p&&a.p.regional&&$.jgrid.regional&&(d=$.jgrid.getAccessor($.jgrid.regional[a.p.regional]||{},b)),void 0===d&&(d=$.jgrid.getAccessor($.jgrid,b)),d)},isMobile:function(){try{return/Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(navigator.userAgent)?!0:!1}catch(a){return!1}},cell_width:!0,ajaxOptions:{},from:function(source){var $t=this,QueryObject=function(d,q){"string"==typeof d&&(d=$.data(d));var self=this,_data=d,_usecase=!0,_trim=!1,_query=q,_stripNum=/[\$,%]/g,_lastCommand=null,_lastField=null,_orDepth=0,_negate=!1,_queuedOperator="",_sorting=[],_useProperties=!0;if("object"!=typeof d||!d.push)throw"data provides is not an array";return d.length>0&&(_useProperties="object"!=typeof d[0]?!1:!0),this._hasData=function(){return null===_data?!1:0===_data.length?!1:!0},this._getStr=function(a){var b=[];return _trim&&b.push("jQuery.trim("),b.push("String("+a+")"),_trim&&b.push(")"),_usecase||b.push(".toLowerCase()"),b.join("")},this._strComp=function(a){return"string"==typeof a?".toString()":""},this._group=function(a,b){return{field:a.toString(),unique:b,items:[]}},this._toStr=function(a){return _trim&&(a=$.trim(a)),a=a.toString().replace(/\\/g,"\\\\").replace(/\"/g,'\\"'),_usecase?a:a.toLowerCase()},this._funcLoop=function(a){var b=[];return $.each(_data,function(c,d){b.push(a(d))}),b},this._append=function(a){var b;for(null===_query?_query="":_query+=""===_queuedOperator?" && ":_queuedOperator,b=0;_orDepth>b;b++)_query+="(";_negate&&(_query+="!"),_query+="("+a+")",_negate=!1,_queuedOperator="",_orDepth=0},this._setCommand=function(a,b){_lastCommand=a,_lastField=b},this._resetNegate=function(){_negate=!1},this._repeatCommand=function(a,b){return null===_lastCommand?self:null!==a&&null!==b?_lastCommand(a,b):null===_lastField?_lastCommand(a):_useProperties?_lastCommand(_lastField,a):_lastCommand(a)},this._equals=function(a,b){return 0===self._compare(a,b,1)},this._compare=function(a,b,c){var d=Object.prototype.toString;return void 0===c&&(c=1),void 0===a&&(a=null),void 0===b&&(b=null),null===a&&null===b?0:null===a&&null!==b?1:null!==a&&null===b?-1:"[object Date]"===d.call(a)&&"[object Date]"===d.call(b)?b>a?-c:a>b?c:0:(_usecase||"number"==typeof a||"number"==typeof b||(a=String(a),b=String(b)),b>a?-c:a>b?c:0)},this._performSort=function(){0!==_sorting.length&&(_data=self._doSort(_data,0))},this._doSort=function(a,b){var c=_sorting[b].by,d=_sorting[b].dir,e=_sorting[b].type,f=_sorting[b].datefmt,g=_sorting[b].sfunc;if(b===_sorting.length-1)return self._getOrder(a,c,d,e,f,g);b++;var h,i,j,k=self._getGroup(a,c,d,e,f),l=[];for(h=0;h<k.length;h++)for(j=self._doSort(k[h].items,b),i=0;i<j.length;i++)l.push(j[i]);return l},this._getOrder=function(a,b,c,d,e,f){var g,h,i,j,k=[],l=[],m="a"===c?1:-1;void 0===d&&(d="text"),j="float"===d||"number"===d||"currency"===d||"numeric"===d?function(a){var b=parseFloat(String(a).replace(_stripNum,""));return isNaN(b)?Number.NEGATIVE_INFINITY:b}:"int"===d||"integer"===d?function(a){return a?parseFloat(String(a).replace(_stripNum,"")):Number.NEGATIVE_INFINITY}:"date"===d||"datetime"===d?function(a){return $.jgrid.parseDate.call($t,e,a).getTime()}:$.isFunction(d)?d:function(a){return a=a?$.trim(String(a)):"",_usecase?a:a.toLowerCase()},$.each(a,function(a,c){h=""!==b?$.jgrid.getAccessor(c,b):c,void 0===h&&(h=""),h=j(h,c),l.push({vSort:h,index:a})}),l.sort($.isFunction(f)?function(a,b){return a=a.vSort,b=b.vSort,f.call(this,a,b,m)}:function(a,b){return a=a.vSort,b=b.vSort,self._compare(a,b,m)}),i=0;for(var n=a.length;n>i;)g=l[i].index,k.push(a[g]),i++;return k},this._getGroup=function(a,b,c,d,e){var f,g=[],h=null,i=null;return $.each(self._getOrder(a,b,c,d,e),function(a,c){f=$.jgrid.getAccessor(c,b),null==f&&(f=""),self._equals(i,f)||(i=f,null!==h&&g.push(h),h=self._group(b,f)),h.items.push(c)}),null!==h&&g.push(h),g},this.ignoreCase=function(){return _usecase=!1,self},this.useCase=function(){return _usecase=!0,self},this.trim=function(){return _trim=!0,self},this.noTrim=function(){return _trim=!1,self},this.execute=function(){var match=_query,results=[];return null===match?self:($.each(_data,function(){eval(match)&&results.push(this)}),_data=results,self)},this.data=function(){return _data},this.select=function(a){if(self._performSort(),!self._hasData())return[];if(self.execute(),$.isFunction(a)){var b=[];return $.each(_data,function(c,d){b.push(a(d))}),b}return _data},this.hasMatch=function(){return self._hasData()?(self.execute(),_data.length>0):!1},this.andNot=function(a,b,c){return _negate=!_negate,self.and(a,b,c)},this.orNot=function(a,b,c){return _negate=!_negate,self.or(a,b,c)},this.not=function(a,b,c){return self.andNot(a,b,c)},this.and=function(a,b,c){return _queuedOperator=" && ",void 0===a?self:self._repeatCommand(a,b,c)},this.or=function(a,b,c){return _queuedOperator=" || ",void 0===a?self:self._repeatCommand(a,b,c)},this.orBegin=function(){return _orDepth++,self},this.orEnd=function(){return null!==_query&&(_query+=")"),self},this.isNot=function(a){return _negate=!_negate,self.is(a)},this.is=function(a){return self._append("this."+a),self._resetNegate(),self},this._compareValues=function(a,b,c,d,e){var f;f=_useProperties?"jQuery.jgrid.getAccessor(this,'"+b+"')":"this",void 0===c&&(c=null);var g=c,h=void 0===e.stype?"text":e.stype;if(null!==c)switch(h){case"int":case"integer":g=isNaN(Number(g))||""===g?"0":g,f="parseInt("+f+",10)",g="parseInt("+g+",10)";break;case"float":case"number":case"numeric":g=String(g).replace(_stripNum,""),g=isNaN(Number(g))||""===g?"0":g,f="parseFloat("+f+")",g="parseFloat("+g+")";break;case"date":case"datetime":g=String($.jgrid.parseDate.call($t,e.srcfmt||"Y-m-d",g).getTime()),f='jQuery.jgrid.parseDate.call(jQuery("#'+$.jgrid.jqID($t.p.id)+'")[0],"'+e.srcfmt+'",'+f+").getTime()";break;default:f=self._getStr(f),g=self._getStr('"'+self._toStr(g)+'"')}return self._append(f+" "+d+" "+g),self._setCommand(a,b),self._resetNegate(),self},this.equals=function(a,b,c){return self._compareValues(self.equals,a,b,"==",c)},this.notEquals=function(a,b,c){return self._compareValues(self.equals,a,b,"!==",c)},this.isNull=function(a,b,c){return self._compareValues(self.equals,a,null,"===",c)},this.greater=function(a,b,c){return self._compareValues(self.greater,a,b,">",c)},this.less=function(a,b,c){return self._compareValues(self.less,a,b,"<",c)},this.greaterOrEquals=function(a,b,c){return self._compareValues(self.greaterOrEquals,a,b,">=",c)},this.lessOrEquals=function(a,b,c){return self._compareValues(self.lessOrEquals,a,b,"<=",c)},this.startsWith=function(a,b){var c=null==b?a:b,d=_trim?$.trim(c.toString()).length:c.toString().length;return _useProperties?self._append(self._getStr("jQuery.jgrid.getAccessor(this,'"+a+"')")+".substr(0,"+d+") == "+self._getStr('"'+self._toStr(b)+'"')):(null!=b&&(d=_trim?$.trim(b.toString()).length:b.toString().length),self._append(self._getStr("this")+".substr(0,"+d+") == "+self._getStr('"'+self._toStr(a)+'"'))),self._setCommand(self.startsWith,a),self._resetNegate(),self},this.endsWith=function(a,b){var c=null==b?a:b,d=_trim?$.trim(c.toString()).length:c.toString().length;return self._append(_useProperties?self._getStr("jQuery.jgrid.getAccessor(this,'"+a+"')")+".substr("+self._getStr("jQuery.jgrid.getAccessor(this,'"+a+"')")+".length-"+d+","+d+') == "'+self._toStr(b)+'"':self._getStr("this")+".substr("+self._getStr("this")+'.length-"'+self._toStr(a)+'".length,"'+self._toStr(a)+'".length) == "'+self._toStr(a)+'"'),self._setCommand(self.endsWith,a),self._resetNegate(),self},this.contains=function(a,b){return self._append(_useProperties?self._getStr("jQuery.jgrid.getAccessor(this,'"+a+"')")+'.indexOf("'+self._toStr(b)+'",0) > -1':self._getStr("this")+'.indexOf("'+self._toStr(a)+'",0) > -1'),self._setCommand(self.contains,a),self._resetNegate(),self},this.groupBy=function(a,b,c,d){return self._hasData()?self._getGroup(_data,a,b,c,d):null},this.orderBy=function(a,b,c,d,e){return b=null==b?"a":$.trim(b.toString().toLowerCase()),null==c&&(c="text"),null==d&&(d="Y-m-d"),null==e&&(e=!1),("desc"===b||"descending"===b)&&(b="d"),("asc"===b||"ascending"===b)&&(b="a"),_sorting.push({by:a,dir:b,type:c,datefmt:d,sfunc:e}),self},self};return new QueryObject(source,null)},getMethod:function(a){return this.getAccessor($.fn.jqGrid,a)},extend:function(a){$.extend($.fn.jqGrid,a),this.no_legacy_api||$.fn.extend(a)},clearBeforeUnload:function(a){var b,c=$("#"+$.jgrid.jqID(a))[0];if(c.grid){b=c.grid,$.isFunction(b.emptyRows)&&b.emptyRows.call(c,!0,!0),$(document).unbind("mouseup.jqGrid"+c.p.id),$(b.hDiv).unbind("mousemove"),$(c).unbind();var d,e=b.headers.length,f=["formatCol","sortData","updatepager","refreshIndex","setHeadCheckBox","constructTr","formatter","addXmlData","addJSONData","grid","p"];for(d=0;e>d;d++)b.headers[d].el=null;for(d in b)b.hasOwnProperty(d)&&(b[d]=null);for(d in c.p)c.p.hasOwnProperty(d)&&(c.p[d]=$.isArray(c.p[d])?[]:null);for(e=f.length,d=0;e>d;d++)c.hasOwnProperty(f[d])&&(c[f[d]]=null,delete c[f[d]])}},gridUnload:function(a){if(a){a=$.trim(a),0===a.indexOf("#")&&(a=a.substring(1));var b=$("#"+$.jgrid.jqID(a))[0];if(b.grid){var c={id:$(b).attr("id"),cl:$(b).attr("class")};b.p.pager&&$(b.p.pager).unbind().empty().removeClass("ui-state-default ui-jqgrid-pager ui-corner-bottom");var d=document.createElement("table");d.className=c.cl;var e=$.jgrid.jqID(b.id);$(d).removeClass("ui-jqgrid-btable ui-common-table").insertBefore("#gbox_"+e),1===$(b.p.pager).parents("#gbox_"+e).length&&$(b.p.pager).insertBefore("#gbox_"+e),$.jgrid.clearBeforeUnload(a),$("#gbox_"+e).remove(),$(d).attr({id:c.id}),$("#alertmod_"+$.jgrid.jqID(a)).remove()}}},gridDestroy:function(a){if(a){a=$.trim(a),0===a.indexOf("#")&&(a=a.substring(1));var b=$("#"+$.jgrid.jqID(a))[0];if(b.grid){b.p.pager&&$(b.p.pager).remove();try{$.jgrid.clearBeforeUnload(a),$("#gbox_"+$.jgrid.jqID(a)).remove()}catch(c){}}}},styleUI:{jQueryUI:{common:{disabled:"ui-state-disabled",highlight:"ui-state-highlight",hover:"ui-state-hover",cornerall:"ui-corner-all",cornertop:"ui-corner-top",cornerbottom:"ui-corner-bottom",hidden:"ui-helper-hidden",icon_base:"ui-icon",overlay:"ui-widget-overlay",active:"ui-state-active",error:"ui-state-error",button:"ui-state-default ui-corner-all",content:"ui-widget-content"},base:{entrieBox:"ui-widget ui-widget-content ui-corner-all",viewBox:"",headerTable:"",headerBox:"ui-state-default",rowTable:"",rowBox:"ui-widget-content",footerTable:"",footerBox:"ui-widget-content",headerDiv:"ui-state-default",gridtitleBox:"ui-widget-header ui-corner-top ui-helper-clearfix",customtoolbarBox:"ui-state-default",loadingBox:"ui-state-default ui-state-active",rownumBox:"ui-state-default",scrollBox:"ui-widget-content",multiBox:"cbox",pagerBox:"ui-state-default ui-corner-bottom",toppagerBox:"ui-state-default",pgInput:"ui-corner-all",pgSelectBox:"ui-widget-content ui-corner-all",pgButtonBox:"ui-corner-all",icon_first:"ui-icon-seek-first",icon_prev:"ui-icon-seek-prev",icon_next:"ui-icon-seek-next",icon_end:"ui-icon-seek-end",icon_asc:"ui-icon-triangle-1-n",icon_desc:"ui-icon-triangle-1-s",icon_caption_open:"ui-icon-circle-triangle-n",icon_caption_close:"ui-icon-circle-triangle-s"},modal:{modal:"ui-widget ui-widget-content ui-corner-all",header:"ui-widget-header ui-corner-all ui-helper-clearfix",content:"ui-widget-content",resizable:"ui-resizable-handle ui-resizable-se",icon_close:"ui-icon-closethick",icon_resizable:"ui-icon-gripsmall-diagonal-se"},celledit:{inputClass:"ui-widget-content ui-corner-all"},inlinedit:{inputClass:"ui-widget-content ui-corner-all",icon_edit_nav:"ui-icon-pencil",icon_add_nav:"ui-icon-plus",icon_save_nav:"ui-icon-disk",icon_cancel_nav:"ui-icon-cancel"},formedit:{inputClass:"ui-widget-content ui-corner-all",icon_prev:"ui-icon-triangle-1-w",icon_next:"ui-icon-triangle-1-e",icon_save:"ui-icon-disk",icon_close:"ui-icon-close",icon_del:"ui-icon-scissors",icon_cancel:"ui-icon-cancel"},navigator:{icon_edit_nav:"ui-icon-pencil",icon_add_nav:"ui-icon-plus",icon_del_nav:"ui-icon-trash",icon_search_nav:"ui-icon-search",icon_refresh_nav:"ui-icon-refresh",icon_view_nav:"ui-icon-document",icon_newbutton_nav:"ui-icon-newwin"},grouping:{icon_plus:"ui-icon-circlesmall-plus",icon_minus:"ui-icon-circlesmall-minus"},filter:{table_widget:"ui-widget ui-widget-content",srSelect:"ui-widget-content ui-corner-all",srInput:"ui-widget-content ui-corner-all",menu_widget:"ui-widget ui-widget-content ui-corner-all",icon_search:"ui-icon-search",icon_reset:"ui-icon-arrowreturnthick-1-w",icon_query:"ui-icon-comment"},subgrid:{icon_plus:"ui-icon-plus",icon_minus:"ui-icon-minus",icon_open:"ui-icon-carat-1-sw"},treegrid:{icon_plus:"ui-icon-triangle-1-",icon_minus:"ui-icon-triangle-1-s",icon_leaf:"ui-icon-radio-off"},fmatter:{icon_edit:"ui-icon-pencil",icon_add:"ui-icon-plus",icon_save:"ui-icon-disk",icon_cancel:"ui-icon-cancel",icon_del:"ui-icon-trash"}},Bootstrap:{common:{disabled:"ui-disabled",highlight:"success",hover:"active",cornerall:"",cornertop:"",cornerbottom:"",hidden:"",icon_base:"glyphicon",overlay:"ui-overlay",active:"active",error:"bg-danger",button:"btn btn-default",content:""},base:{entrieBox:"",viewBox:"table-responsive",headerTable:"table table-bordered",headerBox:"",rowTable:"table table-bordered",rowBox:"",footerTable:"table table-bordered",footerBox:"",headerDiv:"",gridtitleBox:"",customtoolbarBox:"",loadingBox:"row",rownumBox:"active",scrollBox:"",multiBox:"checkbox",pagerBox:"",toppagerBox:"",pgInput:"form-control",pgSelectBox:"form-control",pgButtonBox:"",icon_first:"glyphicon-step-backward",icon_prev:"glyphicon-backward",icon_next:"glyphicon-forward",icon_end:"glyphicon-step-forward",icon_asc:"glyphicon-triangle-top",icon_desc:"glyphicon-triangle-bottom",icon_caption_open:"glyphicon-circle-arrow-up",icon_caption_close:"glyphicon-circle-arrow-down"},modal:{modal:"modal-content",header:"modal-header",title:"modal-title",content:"modal-body",resizable:"ui-resizable-handle ui-resizable-se",icon_close:"glyphicon-remove-circle",icon_resizable:"glyphicon-import"},celledit:{inputClass:"form-control"},inlinedit:{inputClass:"form-control",icon_edit_nav:"glyphicon-edit",icon_add_nav:"glyphicon-plus",icon_save_nav:"glyphicon-save",icon_cancel_nav:"glyphicon-remove-circle"},formedit:{inputClass:"form-control",icon_prev:"glyphicon-step-backward",icon_next:"glyphicon-step-forward",icon_save:"glyphicon-save",icon_close:"glyphicon-remove-circle",icon_del:"glyphicon-trash",icon_cancel:"glyphicon-remove-circle"},navigator:{icon_edit_nav:"glyphicon-edit",icon_add_nav:"glyphicon-plus",icon_del_nav:"glyphicon-trash",icon_search_nav:"glyphicon-search",icon_refresh_nav:"glyphicon-refresh",icon_view_nav:"glyphicon-info-sign",icon_newbutton_nav:"glyphicon-new-window"},grouping:{icon_plus:"glyphicon-triangle-right",icon_minus:"glyphicon-triangle-bottom"},filter:{table_widget:"table table-condensed",srSelect:"form-control",srInput:"form-control",menu_widget:"",icon_search:"glyphicon-search",icon_reset:"glyphicon-refresh",icon_query:"glyphicon-comment"},subgrid:{icon_plus:"glyphicon-triangle-right",icon_minus:"glyphicon-triangle-bottom",icon_open:"glyphicon-indent-left"},treegrid:{icon_plus:"glyphicon-triangle-right",icon_minus:"glyphicon-triangle-bottom",icon_leaf:"glyphicon-unchecked"},fmatter:{icon_edit:"glyphicon-edit",icon_add:"glyphicon-plus",icon_save:"glyphicon-save",icon_cancel:"glyphicon-remove-circle",icon_del:"glyphicon-trash"}}}}),$.fn.jqGrid=function(a){if("string"==typeof a){var b=$.jgrid.getMethod(a);if(!b)throw"jqGrid - No such method: "+a;var c=$.makeArray(arguments).slice(1);return b.apply(this,c)}return this.each(function(){if(!this.grid){var b;null!=a&&void 0!==a.data&&(b=a.data,a.data=[]);var c=$.extend(!0,{url:"",height:150,page:1,rowNum:20,rowTotal:null,records:0,pager:"",pgbuttons:!0,pginput:!0,colModel:[],rowList:[],colNames:[],sortorder:"asc",sortname:"",datatype:"xml",mtype:"GET",altRows:!1,selarrrow:[],savedRow:[],shrinkToFit:!0,xmlReader:{},jsonReader:{},subGrid:!1,subGridModel:[],reccount:0,lastpage:0,lastsort:0,selrow:null,beforeSelectRow:null,onSelectRow:null,onSortCol:null,ondblClickRow:null,onRightClickRow:null,onPaging:null,onSelectAll:null,onInitGrid:null,loadComplete:null,gridComplete:null,loadError:null,loadBeforeSend:null,afterInsertRow:null,beforeRequest:null,beforeProcessing:null,onHeaderClick:null,viewrecords:!1,loadonce:!1,multiselect:!1,multikey:!1,editurl:null,search:!1,caption:"",hidegrid:!0,hiddengrid:!1,postData:{},userData:{},treeGrid:!1,treeGridModel:"nested",treeReader:{},treeANode:-1,ExpandColumn:null,tree_root_level:0,prmNames:{page:"page",rows:"rows",sort:"sidx",order:"sord",search:"_search",nd:"nd",id:"id",oper:"oper",editoper:"edit",addoper:"add",deloper:"del",subgridid:"id",npage:null,totalrows:"totalrows"},forceFit:!1,gridstate:"visible",cellEdit:!1,cellsubmit:"remote",nv:0,loadui:"enable",toolbar:[!1,""],scroll:!1,multiboxonly:!1,deselectAfterSort:!0,scrollrows:!1,autowidth:!1,scrollOffset:18,cellLayout:5,subGridWidth:20,multiselectWidth:30,gridview:!0,rownumWidth:35,rownumbers:!1,pagerpos:"center",recordpos:"right",footerrow:!1,userDataOnFooter:!1,hoverrows:!0,altclass:"ui-priority-secondary",viewsortcols:[!1,"vertical",!0],resizeclass:"",autoencode:!1,remapColumns:[],ajaxGridOptions:{},direction:"ltr",toppager:!1,headertitles:!1,scrollTimeout:40,data:[],_index:{},grouping:!1,groupingView:{groupField:[],groupOrder:[],groupText:[],groupColumnShow:[],groupSummary:[],showSummaryOnHide:!1,sortitems:[],sortnames:[],summary:[],summaryval:[],plusicon:"",minusicon:"",displayField:[],groupSummaryPos:[],formatDisplayField:[],_locgr:!1},ignoreCase:!0,cmTemplate:{},idPrefix:"",multiSort:!1,minColWidth:33,scrollPopUp:!1,scrollTopOffset:0,scrollLeftOffset:"100%",storeNavOptions:!1,regional:"en",styleUI:"jQueryUI",responsive:!1},$.jgrid.defaults,a);void 0!==b&&(c.data=b,a.data=b);var d=this,e={headers:[],cols:[],footers:[],dragStart:function(a,b,e){var f=$(this.bDiv).offset().left;this.resizing={idx:a,startX:b.pageX,sOL:b.pageX-f},this.hDiv.style.cursor="col-resize",this.curGbox=$("#rs_m"+$.jgrid.jqID(c.id),"#gbox_"+$.jgrid.jqID(c.id)),this.curGbox.css({display:"block",left:b.pageX-f,top:e[1],height:e[2]}),$(d).triggerHandler("jqGridResizeStart",[b,a]),$.isFunction(c.resizeStart)&&c.resizeStart.call(d,b,a),document.onselectstart=function(){return!1}},dragMove:function(a){if(this.resizing){var b,d,e=a.pageX-this.resizing.startX,f=this.headers[this.resizing.idx],g="ltr"===c.direction?f.width+e:f.width-e;g>33&&(this.curGbox.css({left:this.resizing.sOL+e}),c.forceFit===!0?(b=this.headers[this.resizing.idx+c.nv],d="ltr"===c.direction?b.width-e:b.width+e,d>c.minColWidth&&(f.newWidth=g,b.newWidth=d)):(this.newWidth="ltr"===c.direction?c.tblwidth+e:c.tblwidth-e,f.newWidth=g))}},dragEnd:function(a){if(this.hDiv.style.cursor="default",this.resizing){var b=this.resizing.idx,e=this.headers[b].newWidth||this.headers[b].width;e=parseInt(e,10),this.resizing=!1,$("#rs_m"+$.jgrid.jqID(c.id)).css("display","none"),c.colModel[b].width=e,this.headers[b].width=e,this.headers[b].el.style.width=e+"px",this.cols[b].style.width=e+"px",this.footers.length>0&&(this.footers[b].style.width=e+"px"),c.forceFit===!0?(e=this.headers[b+c.nv].newWidth||this.headers[b+c.nv].width,this.headers[b+c.nv].width=e,this.headers[b+c.nv].el.style.width=e+"px",this.cols[b+c.nv].style.width=e+"px",this.footers.length>0&&(this.footers[b+c.nv].style.width=e+"px"),c.colModel[b+c.nv].width=e):(c.tblwidth=this.newWidth||c.tblwidth,$("table:first",this.bDiv).css("width",c.tblwidth+"px"),$("table:first",this.hDiv).css("width",c.tblwidth+"px"),this.hDiv.scrollLeft=this.bDiv.scrollLeft,c.footerrow&&($("table:first",this.sDiv).css("width",c.tblwidth+"px"),this.sDiv.scrollLeft=this.bDiv.scrollLeft)),a&&($(d).triggerHandler("jqGridResizeStop",[e,b]),$.isFunction(c.resizeStop)&&c.resizeStop.call(d,e,b))}this.curGbox=null,document.onselectstart=function(){return!0}},populateVisible:function(){e.timer&&clearTimeout(e.timer),e.timer=null;var a=$(e.bDiv).height();if(a){var b,f,g=$("table:first",e.bDiv);if(g[0].rows.length)try{b=g[0].rows[1],f=b?$(b).outerHeight()||e.prevRowHeight:e.prevRowHeight}catch(h){f=e.prevRowHeight}if(f){e.prevRowHeight=f;var i,j,k,l=c.rowNum,m=e.scrollTop=e.bDiv.scrollTop,n=Math.round(g.position().top)-m,o=n+g.height(),p=f*l;if(a>o&&0>=n&&(void 0===c.lastpage||(parseInt((o+m+p-1)/p,10)||0)<=c.lastpage)&&(j=parseInt((a-o+p-1)/p,10)||1,o>=0||2>j||c.scroll===!0?(i=(Math.round((o+m)/p)||0)+1,n=-1):n=1),n>0&&(i=(parseInt(m/p,10)||0)+1,j=(parseInt((m+a)/p,10)||0)+2-i,k=!0),j){if(c.lastpage&&(i>c.lastpage||1===c.lastpage||i===c.page&&i===c.lastpage))return;e.hDiv.loading?e.timer=setTimeout(e.populateVisible,c.scrollTimeout):(c.page=i,k&&(e.selectionPreserver(g[0]),e.emptyRows.call(g[0],!1,!1)),e.populate(j)),c.scrollPopUp&&null!=c.lastpage&&($("#scroll_g"+c.id).show().html($.jgrid.template($.jgrid.getRegional(d,"defaults.pgtext",c.pgtext),c.page,c.lastpage)).css({top:c.scrollTopOffset+m*((parseInt(c.height,10)-45)/(parseInt(f,10)*parseInt(c.records,10)))+"px",left:c.scrollLeftOffset}),$(this).mouseout(function(){$("#scroll_g"+c.id).hide()}))}}}},scrollGrid:function(a){if(c.scroll){var b=e.bDiv.scrollTop;void 0===e.scrollTop&&(e.scrollTop=0),b!==e.scrollTop&&(e.scrollTop=b,e.timer&&clearTimeout(e.timer),e.timer=setTimeout(e.populateVisible,c.scrollTimeout))}e.hDiv.scrollLeft=e.bDiv.scrollLeft,c.footerrow&&(e.sDiv.scrollLeft=e.bDiv.scrollLeft),c.frozenColumns&&$(e.fbDiv).scrollTop(e.bDiv.scrollTop),a&&a.stopPropagation()},selectionPreserver:function(a){var b=a.p,c=b.selrow,d=b.selarrrow?$.makeArray(b.selarrrow):null,e=a.grid.bDiv.scrollLeft,f=function(){var g;if(b.selrow=null,b.selarrrow=[],b.multiselect&&d&&d.length>0)for(g=0;g<d.length;g++)d[g]!==c&&$(a).jqGrid("setSelection",d[g],!1,null);c&&$(a).jqGrid("setSelection",c,!1,null),a.grid.bDiv.scrollLeft=e,$(a).unbind(".selectionPreserver",f)};$(a).bind("jqGridGridComplete.selectionPreserver",f)}};if("TABLE"!==this.tagName.toUpperCase()||null==this.id)return void alert("Element is not a table or has no id!");if(void 0!==document.documentMode&&document.documentMode<=5)return void alert("Grid can not be used in this ('quirks') mode!");var f,g,h,i=0;for(g in $.jgrid.regional)$.jgrid.regional.hasOwnProperty(g)&&(0===i&&(f=g),i++);if(1===i&&f!==c.regional&&(c.regional=f),$(this).empty().attr("tabindex","0"),this.p=c,this.p.useProp=!!$.fn.prop,0===this.p.colNames.length)for(i=0;i<this.p.colModel.length;i++)this.p.colNames[i]=this.p.colModel[i].label||this.p.colModel[i].name;if(this.p.colNames.length!==this.p.colModel.length)return void alert($.jgrid.getRegional(this,"errors.model"));var j,k=$.jgrid.getMethod("getStyleUI"),l=d.p.styleUI+".common",m=k(l,"disabled",!0),n=k(l,"highlight",!0),o=k(l,"hover",!0),p=k(l,"cornerall",!0),q=k(l,"icon_base",!0),r=$.jgrid.msie,s=[],t=[],u=[];l=d.p.styleUI+".base",j=$("<div "+k(l,"viewBox",!1,"ui-jqgrid-view")+" role='grid'></div>"),d.p.direction=$.trim(d.p.direction.toLowerCase()),d.p._ald=!1,-1===$.inArray(d.p.direction,["ltr","rtl"])&&(d.p.direction="ltr"),h=d.p.direction,$(j).insertBefore(this),$(this).appendTo(j);var v=$("<div "+k(l,"entrieBox",!1,"ui-jqgrid")+"></div>");$(v).attr({id:"gbox_"+this.id,dir:h}).insertBefore(j),$(j).attr("id","gview_"+this.id).appendTo(v),$("<div "+k(d.p.styleUI+".common","overlay",!1,"jqgrid-overlay")+" id='lui_"+this.id+"'></div>").insertBefore(j),$("<div "+k(l,"loadingBox",!1,"loading")+" id='load_"+this.id+"'>"+$.jgrid.getRegional(d,"defaults.loadtext",this.p.loadtext)+"</div>").insertBefore(j),$(this).attr({role:"presentation","aria-multiselectable":!!this.p.multiselect,"aria-labelledby":"gbox_"+this.id});var w,x=["shiftKey","altKey","ctrlKey"],y=function(a,b){return a=parseInt(a,10),isNaN(a)?b||0:a},z=function(a,b,c,f,g,h){var i,j,k=d.p.colModel[a],l=k.align,m='style="',n=k.classes,o=k.name,p=[];return l&&(m+="text-align:"+l+";"),k.hidden===!0&&(m+="display:none;"),0===b?m+="width: "+e.headers[a].width+"px;":($.isFunction(k.cellattr)||"string"==typeof k.cellattr&&null!=$.jgrid.cellattr&&$.isFunction($.jgrid.cellattr[k.cellattr]))&&(i=$.isFunction(k.cellattr)?k.cellattr:$.jgrid.cellattr[k.cellattr],j=i.call(d,g,c,f,k,h),j&&"string"==typeof j&&(j=j.replace(/style/i,"style").replace(/title/i,"title"),j.indexOf("title")>-1&&(k.title=!1),j.indexOf("class")>-1&&(n=void 0),p=j.replace(/\-style/g,"-sti").split(/style/),2===p.length?(p[1]=$.trim(p[1].replace(/\-sti/g,"-style").replace("=","")),(0===p[1].indexOf("'")||0===p[1].indexOf('"'))&&(p[1]=p[1].substring(1)),m+=p[1].replace(/'/gi,'"')):m+='"')),p.length||(p[0]="",m+='"'),m+=(void 0!==n?' class="'+n+'"':"")+(k.title&&c?' title="'+$.jgrid.stripHtml(c)+'"':""),m+=' aria-describedby="'+d.p.id+"_"+o+'"',m+p[0]},A=function(a){return null==a||""===a?"&#160;":d.p.autoencode?$.jgrid.htmlEncode(a):String(a)},B=function(a,b,c,e,f){var g,h=d.p.colModel[c];if(void 0!==h.formatter){a=""!==String(d.p.idPrefix)?$.jgrid.stripPref(d.p.idPrefix,a):a;var i={rowId:a,colModel:h,gid:d.p.id,pos:c,styleUI:d.p.styleUI};g=$.isFunction(h.formatter)?h.formatter.call(d,b,i,e,f):$.fmatter?$.fn.fmatter.call(d,h.formatter,b,i,e,f):A(b)}else g=A(b);return g},C=function(a,b,c,d,e,f){var g,h;return g=B(a,b,c,e,"add"),h=z(c,d,g,e,a,f),'<td role="gridcell" '+h+">"+g+"</td>"},D=function(a,b,c,e,f){var g='<input role="checkbox" type="checkbox" id="jqg_'+d.p.id+"_"+a+'" '+f+' name="jqg_'+d.p.id+"_"+a+'"'+(e?'checked="checked"':"")+"/>",h=z(b,c,"",null,a,!0);return'<td role="gridcell" '+h+">"+g+"</td>"},E=function(a,b,c,d,e){var f=(parseInt(c,10)-1)*parseInt(d,10)+1+b,g=z(a,b,f,null,b,!0);return'<td role="gridcell" '+e+" "+g+">"+f+"</td>"},F=function(a){var b,c,e=[],f=0;for(c=0;c<d.p.colModel.length;c++)b=d.p.colModel[c],"cb"!==b.name&&"subgrid"!==b.name&&"rn"!==b.name&&(e[f]="local"===a?b.name:"xml"===a||"xmlstring"===a?b.xmlmap||b.name:b.jsonmap||b.name,d.p.keyName!==!1&&b.key===!0&&(d.p.keyName=e[f]),f++);
return e},G=function(a){var b=d.p.remapColumns;return b&&b.length||(b=$.map(d.p.colModel,function(a,b){return b})),a&&(b=$.map(b,function(b){return a>b?null:b-a})),b},H=function(a,b){var c;this.p.deepempty?$(this.rows).slice(1).remove():(c=this.rows.length>0?this.rows[0]:null,$(this.firstChild).empty().append(c)),a&&this.p.scroll&&($(this.grid.bDiv.firstChild).css({height:"auto"}),$(this.grid.bDiv.firstChild.firstChild).css({height:"0px",display:"none"}),0!==this.grid.bDiv.scrollTop&&(this.grid.bDiv.scrollTop=0)),b===!0&&this.p.treeGrid&&!this.p.loadonce&&(this.p.data=[],this.p._index={})},I=function(){var a,b,c,e,f,g,h,i,j,k,l,m=d.p,n=m.data,o=n.length,p=m.localReader,q=m.colModel,r=p.cell,s=(m.multiselect===!0?1:0)+(m.subGrid===!0?1:0)+(m.rownumbers===!0?1:0),t=m.scroll?$.jgrid.randId():1;if("local"===m.datatype&&p.repeatitems===!0)for(j=G(s),k=F("local"),e=m.keyIndex===!1?$.isFunction(p.id)?p.id.call(d,n):p.id:m.keyIndex,a=0;o>a;a++){for(c=n[a],f=$.jgrid.getAccessor(c,e),void 0===f&&("number"==typeof e&&null!=q[e+s]&&(f=$.jgrid.getAccessor(c,q[e+s].name)),void 0===f&&(f=t+a,r&&(g=$.jgrid.getAccessor(c,r)||c,f=null!=g&&void 0!==g[e]?g[e]:f,g=null))),i={},i[p.id]=f,r&&(c=$.jgrid.getAccessor(c,r)||c),l=$.isArray(c)?j:k,b=0;b<l.length;b++)h=$.jgrid.getAccessor(c,l[b]),i[q[b+s].name]=h;$.extend(!0,n[a],i)}},J=function(){var a,b,c,e=d.p.data.length;for(a=d.p.keyName===!1||d.p.loadonce===!0?d.p.localReader.id:d.p.keyName,d.p._index=[],b=0;e>b;b++)c=$.jgrid.getAccessor(d.p.data[b],a),void 0===c&&(c=String(b+1)),d.p._index[c]=b},K=function(a,b,c,e,f){var g,h="-1",i="",j=b?"display:none;":"",k=$(d).triggerHandler("jqGridRowAttr",[e,f,a]);if("object"!=typeof k&&(k=$.isFunction(d.p.rowattr)?d.p.rowattr.call(d,e,f,a):"string"==typeof d.p.rowattr&&null!=$.jgrid.rowattr&&$.isFunction($.jgrid.rowattr[d.p.rowattr])?$.jgrid.rowattr[d.p.rowattr].call(d,e,f,a):{}),!$.isEmptyObject(k)){k.hasOwnProperty("id")&&(a=k.id,delete k.id),k.hasOwnProperty("tabindex")&&(h=k.tabindex,delete k.tabindex),k.hasOwnProperty("style")&&(j+=k.style,delete k.style),k.hasOwnProperty("class")&&(c+=" "+k["class"],delete k["class"]);try{delete k.role}catch(l){}for(g in k)k.hasOwnProperty(g)&&(i+=" "+g+"="+k[g])}return'<tr role="row" id="'+a+'" tabindex="'+h+'" class="'+c+'"'+(""===j?"":' style="'+j+'"')+i+">"},L=function(a,b,c,e){var f=new Date,g="local"!==d.p.datatype&&d.p.loadonce||"xmlstring"===d.p.datatype,h="_id_",i=d.p.xmlReader,j="local"===d.p.datatype?"local":"xml";if(g&&(d.p.data=[],d.p._index={},d.p.localReader.id=h),d.p.reccount=0,$.isXMLDoc(a)){-1!==d.p.treeANode||d.p.scroll?b=b>1?b:1:(H.call(d,!1,!0),b=1);var m,n,o,p,q,r,s,t,u,v,w=$(d),x=0,z=d.p.multiselect===!0?1:0,A=0,B=d.p.rownumbers===!0?1:0,I=[],J={},L=[],M=d.p.altRows===!0?d.p.altclass:"",N=k(l,"rowBox",!0,"jqgrow ui-row-"+d.p.direction);d.p.subGrid===!0&&(A=1,p=$.jgrid.getMethod("addSubGridCell")),i.repeatitems||(I=F(j)),q=d.p.keyName===!1?$.isFunction(i.id)?i.id.call(d,a):i.id:d.p.keyName,r=-1===String(q).indexOf("[")?I.length?function(a,b){return $(q,a).text()||b}:function(a,b){return $(i.cell,a).eq(q).text()||b}:function(a,b){return a.getAttribute(q.replace(/[\[\]]/g,""))||b},d.p.userData={},d.p.page=y($.jgrid.getXmlData(a,i.page),d.p.page),d.p.lastpage=y($.jgrid.getXmlData(a,i.total),1),d.p.records=y($.jgrid.getXmlData(a,i.records)),$.isFunction(i.userdata)?d.p.userData=i.userdata.call(d,a)||{}:$.jgrid.getXmlData(a,i.userdata,!0).each(function(){d.p.userData[this.getAttribute("name")]=$(this).text()});var O=$.jgrid.getXmlData(a,i.root,!0);O=$.jgrid.getXmlData(O,i.row,!0),O||(O=[]);var P,Q=O.length,R=0,S=[],T=parseInt(d.p.rowNum,10),U=d.p.scroll?$.jgrid.randId():1;if(Q>0&&d.p.page<=0&&(d.p.page=1),O&&Q){e&&(T*=e+1);var V,W=$.isFunction(d.p.afterInsertRow),X=!1,Y=$("#"+$.jgrid.jqID(d.p.id)+" tbody:first"),Z=B?k(l,"rownumBox",!1,"jqgrid-rownum"):"",_=z?k(l,"multiBox",!1,"cbox"):"";for(d.p.grouping&&(X=d.p.groupingView.groupCollapse===!0,V=$.jgrid.getMethod("groupingPrepare"));Q>R;){t=O[R],u=r(t,U+R),u=d.p.idPrefix+u,P=0===b?0:b+1,v=N+((P+R)%2===1?" "+M:"");var ab=L.length;if(L.push(""),B&&L.push(E(0,R,d.p.page,d.p.rowNum,Z)),z&&L.push(D(u,B,R,!1,_)),A&&L.push(p.call(w,z+B,R+b)),i.repeatitems){s||(s=G(z+A+B));var bb=$.jgrid.getXmlData(t,i.cell,!0);$.each(s,function(a){var c=bb[this];return c?(o=c.textContent||c.text,J[d.p.colModel[a+z+A+B].name]=o,void L.push(C(u,o,a+z+A+B,R+b,t,J))):!1})}else for(m=0;m<I.length;m++)o=$.jgrid.getXmlData(t,I[m]),J[d.p.colModel[m+z+A+B].name]=o,L.push(C(u,o,m+z+A+B,R+b,t,J));if(L[ab]=K(u,X,v,J,t),L.push("</tr>"),d.p.grouping&&(S.push(L),d.p.groupingView._locgr||V.call(w,J,R),L=[]),(g||d.p.treeGrid===!0&&!d.p._ald)&&(J[h]=$.jgrid.stripPref(d.p.idPrefix,u),d.p.data.push(J),d.p._index[J[h]]=d.p.data.length-1),d.p.gridview===!1&&(Y.append(L.join("")),w.triggerHandler("jqGridAfterInsertRow",[u,J,t]),W&&d.p.afterInsertRow.call(d,u,J,t),L=[]),J={},x++,R++,x===T)break}}if(d.p.gridview===!0&&(n=d.p.treeANode>-1?d.p.treeANode:0,d.p.grouping?g||(w.jqGrid("groupingRender",S,d.p.colModel.length,d.p.page,T),S=null):d.p.treeGrid===!0&&n>0?$(d.rows[n]).after(L.join("")):(Y.append(L.join("")),d.grid.cols=d.rows[0].cells)),d.p.subGrid===!0)try{w.jqGrid("addSubGrid",z+B)}catch(cb){}if(d.p.totaltime=new Date-f,x>0&&0===d.p.records&&(d.p.records=Q),L=null,d.p.treeGrid===!0)try{w.jqGrid("setTreeNode",n+1,x+n+1)}catch(db){}if(d.p.reccount=x,d.p.treeANode=-1,d.p.userDataOnFooter&&w.jqGrid("footerData","set",d.p.userData,!0),g&&(d.p.records=Q,d.p.lastpage=Math.ceil(Q/T)),c||d.updatepager(!1,!0),g){for(;Q>x;){if(t=O[x],u=r(t,x+U),u=d.p.idPrefix+u,i.repeatitems){s||(s=G(z+A+B));var eb=$.jgrid.getXmlData(t,i.cell,!0);$.each(s,function(a){var b=eb[this];return b?(o=b.textContent||b.text,void(J[d.p.colModel[a+z+A+B].name]=o)):!1})}else for(m=0;m<I.length;m++)o=$.jgrid.getXmlData(t,I[m]),J[d.p.colModel[m+z+A+B].name]=o;J[h]=$.jgrid.stripPref(d.p.idPrefix,u),d.p.grouping&&V.call(w,J,x),d.p.data.push(J),d.p._index[J[h]]=d.p.data.length-1,J={},x++}d.p.grouping&&(d.p.groupingView._locgr=!0,w.jqGrid("groupingRender",S,d.p.colModel.length,d.p.page,T),S=null)}}},M=function(a,b,c,e){var f=new Date;if(a){-1!==d.p.treeANode||d.p.scroll?b=b>1?b:1:(H.call(d,!1,!0),b=1);var g,h,i="_id_",j="local"!==d.p.datatype&&d.p.loadonce||"jsonstring"===d.p.datatype;j&&(d.p.data=[],d.p._index={},d.p.localReader.id=i),d.p.reccount=0,"local"===d.p.datatype?(g=d.p.localReader,h="local"):(g=d.p.jsonReader,h="json");var m,o,p,q,r,s,t,u,v,w,x,z,A=$(d),B=0,I=[],J=d.p.multiselect?1:0,L=d.p.subGrid===!0?1:0,M=d.p.rownumbers===!0?1:0,N=G(J+L+M),O=F(h),P={},Q=[],R=d.p.altRows===!0?d.p.altclass:"",S=k(l,"rowBox",!0,"jqgrow ui-row-"+d.p.direction);d.p.page=y($.jgrid.getAccessor(a,g.page),d.p.page),d.p.lastpage=y($.jgrid.getAccessor(a,g.total),1),d.p.records=y($.jgrid.getAccessor(a,g.records)),d.p.userData=$.jgrid.getAccessor(a,g.userdata)||{},L&&(r=$.jgrid.getMethod("addSubGridCell")),v=d.p.keyName===!1?$.isFunction(g.id)?g.id.call(d,a):g.id:d.p.keyName,u=$.jgrid.getAccessor(a,g.root),null==u&&$.isArray(a)&&(u=a),u||(u=[]),t=u.length,o=0,t>0&&d.p.page<=0&&(d.p.page=1);var T,U,V=parseInt(d.p.rowNum,10),W=d.p.scroll?$.jgrid.randId():1,X=!1;e&&(V*=e+1),"local"!==d.p.datatype||d.p.deselectAfterSort||(X=!0);var Y,Z=$.isFunction(d.p.afterInsertRow),_=[],ab=!1,bb=$("#"+$.jgrid.jqID(d.p.id)+" tbody:first"),cb=M?k(l,"rownumBox",!1,"jqgrid-rownum"):"",db=J?k(l,"multiBox",!1,"cbox"):"";for(d.p.grouping&&(ab=d.p.groupingView.groupCollapse===!0,Y=$.jgrid.getMethod("groupingPrepare"));t>o;){if(q=u[o],x=$.jgrid.getAccessor(q,v),void 0===x&&("number"==typeof v&&null!=d.p.colModel[v+J+L+M]&&(x=$.jgrid.getAccessor(q,d.p.colModel[v+J+L+M].name)),void 0===x&&(x=W+o,0===I.length&&g.cell))){var eb=$.jgrid.getAccessor(q,g.cell)||q;x=null!=eb&&void 0!==eb[v]?eb[v]:x,eb=null}x=d.p.idPrefix+x,T=1===b?0:b,z=S+((T+o)%2===1?" "+R:""),X&&(U=d.p.multiselect?-1!==$.inArray(x,d.p.selarrrow):x===d.p.selrow);var fb=Q.length;for(Q.push(""),M&&Q.push(E(0,o,d.p.page,d.p.rowNum,cb)),J&&Q.push(D(x,M,o,U,db)),L&&Q.push(r.call(A,J+M,o+b)),s=O,g.repeatitems&&(g.cell&&(q=$.jgrid.getAccessor(q,g.cell)||q),$.isArray(q)&&(s=N)),p=0;p<s.length;p++)m=$.jgrid.getAccessor(q,s[p]),P[d.p.colModel[p+J+L+M].name]=m,Q.push(C(x,m,p+J+L+M,o+b,q,P));if(z+=U?" "+n:"",Q[fb]=K(x,ab,z,P,q),Q.push("</tr>"),d.p.grouping&&(_.push(Q),d.p.groupingView._locgr||Y.call(A,P,o),Q=[]),(j||d.p.treeGrid===!0&&!d.p._ald)&&(P[i]=$.jgrid.stripPref(d.p.idPrefix,x),d.p.data.push(P),d.p._index[P[i]]=d.p.data.length-1),d.p.gridview===!1&&(bb.append(Q.join("")),A.triggerHandler("jqGridAfterInsertRow",[x,P,q]),Z&&d.p.afterInsertRow.call(d,x,P,q),Q=[]),P={},B++,o++,B===V)break}if(d.p.gridview===!0&&(w=d.p.treeANode>-1?d.p.treeANode:0,d.p.grouping?j||(A.jqGrid("groupingRender",_,d.p.colModel.length,d.p.page,V),_=null):d.p.treeGrid===!0&&w>0?$(d.rows[w]).after(Q.join("")):(bb.append(Q.join("")),d.grid.cols=d.rows[0].cells)),d.p.subGrid===!0)try{A.jqGrid("addSubGrid",J+M)}catch(gb){}if(d.p.totaltime=new Date-f,B>0&&0===d.p.records&&(d.p.records=t),Q=null,d.p.treeGrid===!0)try{A.jqGrid("setTreeNode",w+1,B+w+1)}catch(hb){}if(d.p.reccount=B,d.p.treeANode=-1,d.p.userDataOnFooter&&A.jqGrid("footerData","set",d.p.userData,!0),j&&(d.p.records=t,d.p.lastpage=Math.ceil(t/V)),c||d.updatepager(!1,!0),j){for(;t>B&&u[B];){if(q=u[B],x=$.jgrid.getAccessor(q,v),void 0===x&&("number"==typeof v&&null!=d.p.colModel[v+J+L+M]&&(x=$.jgrid.getAccessor(q,d.p.colModel[v+J+L+M].name)),void 0===x&&(x=W+B,0===I.length&&g.cell))){var ib=$.jgrid.getAccessor(q,g.cell)||q;x=null!=ib&&void 0!==ib[v]?ib[v]:x,ib=null}if(q){for(x=d.p.idPrefix+x,s=O,g.repeatitems&&(g.cell&&(q=$.jgrid.getAccessor(q,g.cell)||q),$.isArray(q)&&(s=N)),p=0;p<s.length;p++)P[d.p.colModel[p+J+L+M].name]=$.jgrid.getAccessor(q,s[p]);P[i]=$.jgrid.stripPref(d.p.idPrefix,x),d.p.grouping&&Y.call(A,P,B),d.p.data.push(P),d.p._index[P[i]]=d.p.data.length-1,P={}}B++}d.p.grouping&&(d.p.groupingView._locgr=!0,A.jqGrid("groupingRender",_,d.p.colModel.length,d.p.page,V),_=null)}}},N=function(){function a(b){var c,e,f,g,h,i,k=0;if(null!=b.groups){for(e=b.groups.length&&"OR"===b.groupOp.toString().toUpperCase(),e&&q.orBegin(),c=0;c<b.groups.length;c++){k>0&&e&&q.or();try{a(b.groups[c])}catch(l){alert(l)}k++}e&&q.orEnd()}if(null!=b.rules)try{for(f=b.rules.length&&"OR"===b.groupOp.toString().toUpperCase(),f&&q.orBegin(),c=0;c<b.rules.length;c++)h=b.rules[c],g=b.groupOp.toString().toUpperCase(),p[h.op]&&h.field&&(k>0&&g&&"OR"===g&&(q=q.or()),i=j[h.field],"date"===i.stype&&i.srcfmt&&i.newfmt&&i.srcfmt!==i.newfmt&&(h.data=$.jgrid.parseDate.call(d,i.newfmt,h.data,i.srcfmt)),q=p[h.op](q,g)(h.field,h.data,j[h.field])),k++;f&&q.orEnd()}catch(m){alert(m)}}var b,c,e,f,g=d.p.multiSort?[]:"",h=[],i=!1,j={},k=[],l=[];if($.isArray(d.p.data)){var m,n,o=d.p.grouping?d.p.groupingView:!1;if($.each(d.p.colModel,function(){if(c=this.sorttype||"text","date"===c||"datetime"===c?(this.formatter&&"string"==typeof this.formatter&&"date"===this.formatter?(b=this.formatoptions&&this.formatoptions.srcformat?this.formatoptions.srcformat:$.jgrid.getRegional(d,"formatter.date.srcformat"),e=this.formatoptions&&this.formatoptions.newformat?this.formatoptions.newformat:$.jgrid.getRegional(d,"formatter.date.newformat")):b=e=this.datefmt||"Y-m-d",j[this.name]={stype:c,srcfmt:b,newfmt:e,sfunc:this.sortfunc||null}):j[this.name]={stype:c,srcfmt:"",newfmt:"",sfunc:this.sortfunc||null},d.p.grouping)for(n=0,m=o.groupField.length;m>n;n++)if(this.name===o.groupField[n]){var a=this.name;this.index&&(a=this.index),k[n]=j[a],l[n]=a}d.p.multiSort||i||this.index!==d.p.sortname&&this.name!==d.p.sortname||(g=this.name,i=!0)}),d.p.multiSort&&(g=s,h=t),d.p.treeGrid&&d.p._sort)return void $(d).jqGrid("SortTree",g,d.p.sortorder,j[g].stype||"text",j[g].srcfmt||"");var p={eq:function(a){return a.equals},ne:function(a){return a.notEquals},lt:function(a){return a.less},le:function(a){return a.lessOrEquals},gt:function(a){return a.greater},ge:function(a){return a.greaterOrEquals},cn:function(a){return a.contains},nc:function(a,b){return"OR"===b?a.orNot().contains:a.andNot().contains},bw:function(a){return a.startsWith},bn:function(a,b){return"OR"===b?a.orNot().startsWith:a.andNot().startsWith},en:function(a,b){return"OR"===b?a.orNot().endsWith:a.andNot().endsWith},ew:function(a){return a.endsWith},ni:function(a,b){return"OR"===b?a.orNot().equals:a.andNot().equals},"in":function(a){return a.equals},nu:function(a){return a.isNull},nn:function(a,b){return"OR"===b?a.orNot().isNull:a.andNot().isNull}},q=$.jgrid.from.call(d,d.p.data);if(d.p.ignoreCase&&(q=q.ignoreCase()),d.p.search===!0){var r=d.p.postData.filters;if(r)"string"==typeof r&&(r=$.jgrid.parse(r)),a(r);else try{f=j[d.p.postData.searchField],"date"===f.stype&&f.srcfmt&&f.newfmt&&f.srcfmt!==f.newfmt&&(d.p.postData.searchString=$.jgrid.parseDate.call(d,f.newfmt,d.p.postData.searchString,f.srcfmt)),q=p[d.p.postData.searchOper](q)(d.p.postData.searchField,d.p.postData.searchString,j[d.p.postData.searchField])}catch(u){}}else d.p.treeGrid&&"nested"===d.p.treeGridModel&&q.orderBy(d.p.treeReader.left_field,"asc","integer","",null);if(d.p.treeGrid&&"adjacency"===d.p.treeGridModel&&(m=0,g=null),d.p.grouping)for(n=0;m>n;n++)q.orderBy(l[n],o.groupOrder[n],k[n].stype,k[n].srcfmt);d.p.multiSort?$.each(g,function(a){q.orderBy(this,h[a],j[this].stype,j[this].srcfmt,j[this].sfunc)}):g&&d.p.sortorder&&i&&("DESC"===d.p.sortorder.toUpperCase()?q.orderBy(d.p.sortname,"d",j[g].stype,j[g].srcfmt,j[g].sfunc):q.orderBy(d.p.sortname,"a",j[g].stype,j[g].srcfmt,j[g].sfunc));var v=q.select(),w=parseInt(d.p.rowNum,10),x=v.length,y=parseInt(d.p.page,10),z=Math.ceil(x/w),A={};if((d.p.search||d.p.resetsearch)&&d.p.grouping&&d.p.groupingView._locgr){d.p.groupingView.groups=[];var B,C,D,E=$.jgrid.getMethod("groupingPrepare");if(d.p.footerrow&&d.p.userDataOnFooter){for(C in d.p.userData)d.p.userData.hasOwnProperty(C)&&(d.p.userData[C]=0);D=!0}for(B=0;x>B;B++){if(D)for(C in d.p.userData)d.p.userData.hasOwnProperty(C)&&(d.p.userData[C]+=parseFloat(v[B][C]||0));E.call($(d),v[B],B,w)}}return v=d.p.treeGrid&&d.p.search?$(d).jqGrid("searchTree",v):v.slice((y-1)*w,y*w),q=null,j=null,A[d.p.localReader.total]=z,A[d.p.localReader.page]=y,A[d.p.localReader.records]=x,A[d.p.localReader.root]=v,A[d.p.localReader.userdata]=d.p.userData,v=null,A}},O=function(a,b){var c,e,f,g,h,i,j,n,p="",q=d.p.pager?$.jgrid.jqID(d.p.pager.substr(1)):"",r=q?"_"+q:"",s=d.p.toppager?"_"+d.p.toppager.substr(1):"";if(f=parseInt(d.p.page,10)-1,0>f&&(f=0),f*=parseInt(d.p.rowNum,10),h=f+d.p.reccount,d.p.scroll){var t=$("tbody:first > tr:gt(0)",d.grid.bDiv);f=h-t.length,d.p.reccount=t.length;var u=t.outerHeight()||d.grid.prevRowHeight;if(u){var v=f*u,w=parseInt(d.p.records,10)*u;$(">div:first",d.grid.bDiv).css({height:w}).children("div:first").css({height:v,display:v?"":"none"}),0===d.grid.bDiv.scrollTop&&d.p.page>1&&(d.grid.bDiv.scrollTop=d.p.rowNum*(d.p.page-1)*u)}d.grid.bDiv.scrollLeft=d.grid.hDiv.scrollLeft}if(p=d.p.pager||"",p+=d.p.toppager?p?","+d.p.toppager:d.p.toppager:""){if(j=$.jgrid.getRegional(d,"formatter.integer"),c=y(d.p.page),e=y(d.p.lastpage),$(".selbox",p)[this.p.useProp?"prop":"attr"]("disabled",!1),d.p.pginput===!0&&($("#input"+r).html($.jgrid.template($.jgrid.getRegional(d,"defaults.pgtext",d.p.pgtext)||"","<input "+k(l,"pgInput",!1,"ui-pg-input")+" type='text' size='2' maxlength='7' value='0' role='textbox'/>","<span id='sp_1_"+$.jgrid.jqID(q)+"'></span>")),d.p.toppager&&$("#input_t"+s).html($.jgrid.template($.jgrid.getRegional(d,"defaults.pgtext",d.p.pgtext)||"","<input "+k(l,"pgInput",!1,"ui-pg-input")+" type='text' size='2' maxlength='7' value='0' role='textbox'/>","<span id='sp_1_"+$.jgrid.jqID(q)+"_toppager'></span>")),$(".ui-pg-input",p).val(d.p.page),n=d.p.toppager?"#sp_1"+r+",#sp_1"+r+"_toppager":"#sp_1"+r,$(n).html($.fmatter?$.fmatter.util.NumberFormat(d.p.lastpage,j):d.p.lastpage)),d.p.viewrecords)if(0===d.p.reccount)$(".ui-paging-info",p).html($.jgrid.getRegional(d,"defaults.emptyrecords",d.p.emptyrecords));else{g=f+1,i=d.p.records,$.fmatter&&(g=$.fmatter.util.NumberFormat(g,j),h=$.fmatter.util.NumberFormat(h,j),i=$.fmatter.util.NumberFormat(i,j));var x=$.jgrid.getRegional(d,"defaults.recordtext",d.p.recordtext);$(".ui-paging-info",p).html($.jgrid.template(x,g,h,i))}d.p.pgbuttons===!0&&(0>=c&&(c=e=0),1===c||0===c?($("#first"+r+", #prev"+r).addClass(m).removeClass(o),d.p.toppager&&$("#first_t"+s+", #prev_t"+s).addClass(m).removeClass(o)):($("#first"+r+", #prev"+r).removeClass(m),d.p.toppager&&$("#first_t"+s+", #prev_t"+s).removeClass(m)),c===e||0===c?($("#next"+r+", #last"+r).addClass(m).removeClass(o),d.p.toppager&&$("#next_t"+s+", #last_t"+s).addClass(m).removeClass(o)):($("#next"+r+", #last"+r).removeClass(m),d.p.toppager&&$("#next_t"+s+", #last_t"+s).removeClass(m)))}a===!0&&d.p.rownumbers===!0&&$(">td.jqgrid-rownum",d.rows).each(function(a){$(this).html(f+1+a)}),b&&d.p.jqgdnd&&$(d).jqGrid("gridDnD","updateDnD"),$(d).triggerHandler("jqGridGridComplete"),$.isFunction(d.p.gridComplete)&&d.p.gridComplete.call(d),$(d).triggerHandler("jqGridAfterGridComplete")},P=function(){d.grid.hDiv.loading=!0,d.p.hiddengrid||$(d).jqGrid("progressBar",{method:"show",loadtype:d.p.loadui,htmlcontent:$.jgrid.getRegional(d,"defaults.loadtext",d.p.loadtext)})},Q=function(){d.grid.hDiv.loading=!1,$(d).jqGrid("progressBar",{method:"hide",loadtype:d.p.loadui})},R=function(a){if(!d.grid.hDiv.loading){var b,c,e=d.p.scroll&&a===!1,f={},g=d.p.prmNames;d.p.page<=0&&(d.p.page=Math.min(1,d.p.lastpage)),null!==g.search&&(f[g.search]=d.p.search),null!==g.nd&&(f[g.nd]=(new Date).getTime()),null!==g.rows&&(f[g.rows]=d.p.rowNum),null!==g.page&&(f[g.page]=d.p.page),null!==g.sort&&(f[g.sort]=d.p.sortname),null!==g.order&&(f[g.order]=d.p.sortorder),null!==d.p.rowTotal&&null!==g.totalrows&&(f[g.totalrows]=d.p.rowTotal);var h=$.isFunction(d.p.loadComplete),i=h?d.p.loadComplete:null,j=0;if(a=a||1,a>1?null!==g.npage?(f[g.npage]=a,j=a-1,a=1):i=function(b){d.p.page++,d.grid.hDiv.loading=!1,h&&d.p.loadComplete.call(d,b),R(a-1)}:null!==g.npage&&delete d.p.postData[g.npage],d.p.grouping){$(d).jqGrid("groupingSetup");var k,l=d.p.groupingView,m="";for(k=0;k<l.groupField.length;k++){var n=l.groupField[k];$.each(d.p.colModel,function(a,b){b.name===n&&b.index&&(n=b.index)}),m+=n+" "+l.groupOrder[k]+", "}f[g.sort]=m+f[g.sort]}$.extend(d.p.postData,f);var o=d.p.scroll?d.rows.length-1:1,p=$(d).triggerHandler("jqGridBeforeRequest");if(p===!1||"stop"===p)return;if($.isFunction(d.p.datatype))return void d.p.datatype.call(d,d.p.postData,"load_"+d.p.id,o,a,j);if($.isFunction(d.p.beforeRequest)&&(p=d.p.beforeRequest.call(d),void 0===p&&(p=!0),p===!1))return;switch(b=d.p.datatype.toLowerCase()){case"json":case"jsonp":case"xml":case"script":$.ajax($.extend({url:d.p.url,type:d.p.mtype,dataType:b,data:$.isFunction(d.p.serializeGridData)?d.p.serializeGridData.call(d,d.p.postData):d.p.postData,success:function(c,f,g){return $.isFunction(d.p.beforeProcessing)&&d.p.beforeProcessing.call(d,c,f,g)===!1?void Q():("xml"===b?L(c,o,a>1,j):M(c,o,a>1,j),$(d).triggerHandler("jqGridLoadComplete",[c]),i&&i.call(d,c),$(d).triggerHandler("jqGridAfterLoadComplete",[c]),e&&d.grid.populateVisible(),(d.p.loadonce||d.p.treeGrid)&&(d.p.datatype="local"),c=null,void(1===a&&Q()))},error:function(b,c,e){$.isFunction(d.p.loadError)&&d.p.loadError.call(d,b,c,e),1===a&&Q(),b=null},beforeSend:function(a,b){var c=!0;return $.isFunction(d.p.loadBeforeSend)&&(c=d.p.loadBeforeSend.call(d,a,b)),void 0===c&&(c=!0),c===!1?!1:void P()}},$.jgrid.ajaxOptions,d.p.ajaxGridOptions));break;case"xmlstring":P(),c="string"!=typeof d.p.datastr?d.p.datastr:$.parseXML(d.p.datastr),L(c),$(d).triggerHandler("jqGridLoadComplete",[c]),h&&d.p.loadComplete.call(d,c),$(d).triggerHandler("jqGridAfterLoadComplete",[c]),d.p.datatype="local",d.p.datastr=null,Q();break;case"jsonstring":P(),c="string"==typeof d.p.datastr?$.jgrid.parse(d.p.datastr):d.p.datastr,M(c),$(d).triggerHandler("jqGridLoadComplete",[c]),h&&d.p.loadComplete.call(d,c),$(d).triggerHandler("jqGridAfterLoadComplete",[c]),d.p.datatype="local",d.p.datastr=null,Q();break;case"local":case"clientside":P(),d.p.datatype="local",d.p._ald=!0;var q=N();M(q,o,a>1,j),$(d).triggerHandler("jqGridLoadComplete",[q]),i&&i.call(d,q),$(d).triggerHandler("jqGridAfterLoadComplete",[q]),e&&d.grid.populateVisible(),Q(),d.p._ald=!1}d.p._sort=!1}},S=function(a){$("#cb_"+$.jgrid.jqID(d.p.id),d.grid.hDiv)[d.p.useProp?"prop":"attr"]("checked",a);var b=d.p.frozenColumns?d.p.id+"_frozen":"";b&&$("#cb_"+$.jgrid.jqID(d.p.id),d.grid.fhDiv)[d.p.useProp?"prop":"attr"]("checked",a)},T=function(a,b){var c,e,f,g,i,j,n,p="<td class='ui-pg-button "+m+"'><span class='ui-separator'></span></td>",r="",s="<table class='ui-pg-table ui-common-table ui-paging-pager'><tbody><tr>",t="",u=function(a,b){var c;return $.isFunction(d.p.onPaging)&&(c=d.p.onPaging.call(d,a,b)),"stop"===c?!1:(d.p.selrow=null,d.p.multiselect&&(d.p.selarrrow=[],S(!1)),d.p.savedRow=[],!0)};if(a=a.substr(1),b+="_"+a,c="pg_"+a,e=a+"_left",f=a+"_center",g=a+"_right",$("#"+$.jgrid.jqID(a)).append("<div id='"+c+"' class='ui-pager-control' role='group'><table class='ui-pg-table ui-common-table ui-pager-table'><tbody><tr><td id='"+e+"' align='left'></td><td id='"+f+"' align='center' style='white-space:pre;'></td><td id='"+g+"' align='right'></td></tr></tbody></table></div>").attr("dir","ltr"),d.p.rowList.length>0){t='<td dir="'+h+'">',t+="<select "+k(l,"pgSelectBox",!1,"ui-pg-selbox")+' role="listbox" title="'+($.jgrid.getRegional(d,"defaults.pgrecs",d.p.pgrecs)||"")+'">';var v;for(n=0;n<d.p.rowList.length;n++)v=d.p.rowList[n].toString().split(":"),1===v.length&&(v[1]=v[0]),t+='<option role="option" value="'+v[0]+'"'+(y(d.p.rowNum,0)===y(v[0],0)?' selected="selected"':"")+">"+v[1]+"</option>";t+="</select></td>"}if("rtl"===h&&(s+=t),d.p.pginput===!0&&(r="<td id='input"+b+"' dir='"+h+"'>"+$.jgrid.template($.jgrid.getRegional(d,"defaults.pgtext",d.p.pgtext)||"","<input class='ui-pg-input' type='text' size='2' maxlength='7' value='0' role='textbox'/>","<span id='sp_1_"+$.jgrid.jqID(a)+"'></span>")+"</td>"),d.p.pgbuttons===!0){var w=["first"+b,"prev"+b,"next"+b,"last"+b],x=k(l,"pgButtonBox",!0,"ui-pg-button"),z=[$.jgrid.getRegional(d,"defaults.pgfirst",d.p.pgfirst)||"",$.jgrid.getRegional(d,"defaults.pgprev",d.p.pgprev)||"",$.jgrid.getRegional(d,"defaults.pgnext",d.p.pgnext)||"",$.jgrid.getRegional(d,"defaults.pglast",d.p.pglast)||""];"rtl"===h&&(w.reverse(),z.reverse()),s+="<td id='"+w[0]+"' class='"+x+"' title='"+z[0]+"'><span "+k(l,"icon_first",!1,q)+"></span></td>",s+="<td id='"+w[1]+"' class='"+x+"'  title='"+z[1]+"'><span "+k(l,"icon_prev",!1,q)+"></span></td>",s+=""!==r?p+r+p:"",s+="<td id='"+w[2]+"' class='"+x+"' title='"+z[2]+"'><span "+k(l,"icon_next",!1,q)+"></span></td>",s+="<td id='"+w[3]+"' class='"+x+"' title='"+z[3]+"'><span "+k(l,"icon_end",!1,q)+"></span></td>"}else""!==r&&(s+=r);"ltr"===h&&(s+=t),s+="</tr></tbody></table>",d.p.viewrecords===!0&&$("td#"+a+"_"+d.p.recordpos,"#"+c).append("<div dir='"+h+"' style='text-align:"+d.p.recordpos+"' class='ui-paging-info'></div>"),$("td#"+a+"_"+d.p.pagerpos,"#"+c).append(s),j=$("#gbox_"+$.jgrid.jqID(d.p.id)).css("font-size")||"11px",$("#gbox_"+$.jgrid.jqID(d.p.id)).append("<div id='testpg' "+k(l,"entrieBox",!1,"ui-jqgrid")+" style='font-size:"+j+";visibility:hidden;' ></div>"),i=$(s).clone().appendTo("#testpg").width(),$("#testpg").remove(),i>0&&(""!==r&&(i+=50),$("td#"+a+"_"+d.p.pagerpos,"#"+c).width(i)),d.p._nvtd=[],d.p._nvtd[0]=Math.floor(i?(d.p.width-i)/2:d.p.width/3),d.p._nvtd[1]=0,s=null,$(".ui-pg-selbox","#"+c).bind("change",function(){return u("records",this)?(d.p.page=Math.round(d.p.rowNum*(d.p.page-1)/this.value-.5)+1,d.p.rowNum=this.value,d.p.pager&&$(".ui-pg-selbox",d.p.pager).val(this.value),d.p.toppager&&$(".ui-pg-selbox",d.p.toppager).val(this.value),R(),!1):!1}),d.p.pgbuttons===!0&&($(".ui-pg-button","#"+c).hover(function(){$(this).hasClass(m)?this.style.cursor="default":($(this).addClass(o),this.style.cursor="pointer")},function(){$(this).hasClass(m)||($(this).removeClass(o),this.style.cursor="default")}),$("#first"+$.jgrid.jqID(b)+", #prev"+$.jgrid.jqID(b)+", #next"+$.jgrid.jqID(b)+", #last"+$.jgrid.jqID(b)).click(function(){if($(this).hasClass(m))return!1;var a=y(d.p.page,1),c=y(d.p.lastpage,1),e=!1,f=!0,g=!0,h=!0,i=!0;return 0===c||1===c?(f=!1,g=!1,h=!1,i=!1):c>1&&a>=1?1===a?(f=!1,g=!1):a===c&&(h=!1,i=!1):c>1&&0===a&&(h=!1,i=!1,a=c-1),u(this.id.split("_")[0],this)?(this.id==="first"+b&&f&&(d.p.page=1,e=!0),this.id==="prev"+b&&g&&(d.p.page=a-1,e=!0),this.id==="next"+b&&h&&(d.p.page=a+1,e=!0),this.id==="last"+b&&i&&(d.p.page=c,e=!0),e&&R(),!1):!1})),d.p.pginput===!0&&$("#"+c).on("keypress","input.ui-pg-input",function(a){var b=a.charCode||a.keyCode||0;return 13===b?u("user",this)?($(this).val(y($(this).val(),1)),d.p.page=$(this).val()>0?$(this).val():d.p.page,R(),!1):!1:this})},U=function(a,b){var c,e=d.p.colModel,f=d.p.frozenColumns?b:d.grid.headers[a].el,g="";$("span.ui-grid-ico-sort",f).addClass(m),$(f).attr("aria-selected","false"),c="local"===d.p.datatype?e[a].name:e[a].index||e[a].name,e[a].lso?"asc"===e[a].lso?(e[a].lso+="-desc",g="desc"):"desc"===e[a].lso?(e[a].lso+="-asc",g="asc"):("asc-desc"===e[a].lso||"desc-asc"===e[a].lso)&&(e[a].lso=""):e[a].lso=g=e[a].firstsortorder||"asc",g?($("span.s-ico",f).show(),$("span.ui-icon-"+g,f).removeClass(m),$(f).attr("aria-selected","true")):d.p.viewsortcols[0]||$("span.s-ico",f).hide();var h=s.indexOf(c);-1===h?(s.push(c),t.push(g)):g?t[h]=g:(t.splice(h,1),s.splice(h,1)),d.p.sortorder="",d.p.sortname="";for(var i=0,j=s.length;j>i;i++)i>0&&(d.p.sortname+=", "),d.p.sortname+=s[i],i!==j-1&&(d.p.sortname+=" "+t[i]);d.p.sortorder=t[j-1]},V=function(a,b,c,e,f){if(d.p.colModel[b].sortable&&!(d.p.savedRow.length>0)){if(c||(d.p.lastsort===b&&""!==d.p.sortname?"asc"===d.p.sortorder?d.p.sortorder="desc":"desc"===d.p.sortorder&&(d.p.sortorder="asc"):d.p.sortorder=d.p.colModel[b].firstsortorder||"asc",d.p.page=1),d.p.multiSort)U(b,f);else{if(e){if(d.p.lastsort===b&&d.p.sortorder===e&&!c)return;d.p.sortorder=e}var g,h=d.grid.headers[d.p.lastsort]?d.grid.headers[d.p.lastsort].el:null,i=d.p.frozenColumns?f:d.grid.headers[b].el,j="single"===d.p.viewsortcols[1]?!0:!1;g=$(h).find("span.ui-grid-ico-sort"),g.addClass(m),j&&$(g).css("display","none"),$(h).attr("aria-selected","false"),d.p.frozenColumns&&(g=d.grid.fhDiv.find("span.ui-grid-ico-sort"),g.addClass(m),j&&g.css("display","none"),d.grid.fhDiv.find("th").attr("aria-selected","false")),g=$(i).find("span.ui-icon-"+d.p.sortorder),g.removeClass(m),j&&g.css("display",""),$(i).attr("aria-selected","true"),d.p.viewsortcols[0]||(d.p.lastsort!==b?(d.p.frozenColumns&&d.grid.fhDiv.find("span.s-ico").hide(),$("span.s-ico",h).hide(),$("span.s-ico",i).show()):""===d.p.sortname&&$("span.s-ico",i).show()),a=a.substring(5+d.p.id.length+1),d.p.sortname=d.p.colModel[b].index||a}if("stop"===$(d).triggerHandler("jqGridSortCol",[d.p.sortname,b,d.p.sortorder]))return void(d.p.lastsort=b);if($.isFunction(d.p.onSortCol)&&"stop"===d.p.onSortCol.call(d,d.p.sortname,b,d.p.sortorder))return void(d.p.lastsort=b);if("local"===d.p.datatype?d.p.deselectAfterSort&&$(d).jqGrid("resetSelection"):(d.p.selrow=null,d.p.multiselect&&S(!1),d.p.selarrrow=[],d.p.savedRow=[]),d.p.scroll){var k=d.grid.bDiv.scrollLeft;H.call(d,!0,!1),d.grid.hDiv.scrollLeft=k}d.p.subGrid&&"local"===d.p.datatype&&$("td.sgexpanded","#"+$.jgrid.jqID(d.p.id)).each(function(){$(this).trigger("click")}),d.p._sort=!0,R(),d.p.lastsort=b,d.p.sortname!==a&&b&&(d.p.lastsort=b)}},W=function(){var a,b,c,f,g=0,h=$.jgrid.cell_width?0:y(d.p.cellLayout,0),i=0,j=y(d.p.scrollOffset,0),k=!1,l=0;$.each(d.p.colModel,function(){if(void 0===this.hidden&&(this.hidden=!1),d.p.grouping&&d.p.autowidth){var a=$.inArray(this.name,d.p.groupingView.groupField);a>=0&&d.p.groupingView.groupColumnShow.length>a&&(this.hidden=!d.p.groupingView.groupColumnShow[a])}this.widthOrg=b=y(this.width,0),this.hidden===!1&&(g+=b+h,this.fixed?l+=b+h:i++)}),isNaN(d.p.width)&&(d.p.width=g+(d.p.shrinkToFit!==!1||isNaN(d.p.height)?0:j)),e.width=d.p.width,d.p.tblwidth=g,d.p.shrinkToFit===!1&&d.p.forceFit===!0&&(d.p.forceFit=!1),d.p.shrinkToFit===!0&&i>0&&(c=e.width-h*i-l,isNaN(d.p.height)||(c-=j,k=!0),g=0,$.each(d.p.colModel,function(e){this.hidden!==!1||this.fixed||(b=Math.round(c*this.width/(d.p.tblwidth-h*i-l)),this.width=b,g+=b,a=e)}),f=0,k?e.width-l-(g+h*i)!==j&&(f=e.width-l-(g+h*i)-j):k||1===Math.abs(e.width-l-(g+h*i))||(f=e.width-l-(g+h*i)),d.p.colModel[a].width+=f,d.p.tblwidth=g+f+h*i+l,d.p.tblwidth>d.p.width&&(d.p.colModel[a].width-=d.p.tblwidth-parseInt(d.p.width,10),d.p.tblwidth=d.p.width))},X=function(a){var b,c=a,e=a;for(b=a+1;b<d.p.colModel.length;b++)if(d.p.colModel[b].hidden!==!0){e=b;break}return e-c},Y=function(a){var b=$(d.grid.headers[a].el),c=[b.position().left+b.outerWidth()];return"rtl"===d.p.direction&&(c[0]=d.p.width-c[0]),c[0]-=d.grid.bDiv.scrollLeft,c.push($(d.grid.hDiv).position().top),c.push($(d.grid.bDiv).offset().top-$(d.grid.hDiv).offset().top+$(d.grid.bDiv).height()),c},Z=function(a){var b,c=d.grid.headers,e=$.jgrid.getCellIndex(a);for(b=0;b<c.length;b++)if(a===c[b].el){e=b;break}return e};for(this.p.id=this.id,-1===$.inArray(d.p.multikey,x)&&(d.p.multikey=!1),d.p.keyName=!1,i=0;i<d.p.colModel.length;i++)w="string"==typeof d.p.colModel[i].template?null!=$.jgrid.cmTemplate&&"object"==typeof $.jgrid.cmTemplate[d.p.colModel[i].template]?$.jgrid.cmTemplate[d.p.colModel[i].template]:{}:d.p.colModel[i].template,d.p.colModel[i]=$.extend(!0,{},d.p.cmTemplate,w||{},d.p.colModel[i]),d.p.keyName===!1&&d.p.colModel[i].key===!0&&(d.p.keyName=d.p.colModel[i].name);if(d.p.sortorder=d.p.sortorder.toLowerCase(),$.jgrid.cell_width=$.jgrid.cellWidth(),d.p.grouping===!0&&(d.p.scroll=!1,d.p.rownumbers=!1,d.p.treeGrid=!1,d.p.gridview=!0),this.p.treeGrid===!0){try{$(this).jqGrid("setTreeGrid")}catch(_){}"local"!==d.p.datatype&&(d.p.localReader={id:"_id_"})}if(this.p.subGrid)try{$(d).jqGrid("setSubGrid")}catch(ab){}this.p.multiselect&&(this.p.colNames.unshift("<input role='checkbox' id='cb_"+this.p.id+"' class='cbox' type='checkbox'/>"),this.p.colModel.unshift({name:"cb",width:$.jgrid.cell_width?d.p.multiselectWidth+d.p.cellLayout:d.p.multiselectWidth,sortable:!1,resizable:!1,hidedlg:!0,search:!1,align:"center",fixed:!0,frozen:!0})),this.p.rownumbers&&(this.p.colNames.unshift(""),this.p.colModel.unshift({name:"rn",width:d.p.rownumWidth,sortable:!1,resizable:!1,hidedlg:!0,search:!1,align:"center",fixed:!0,frozen:!0})),d.p.xmlReader=$.extend(!0,{root:"rows",row:"row",page:"rows>page",total:"rows>total",records:"rows>records",repeatitems:!0,cell:"cell",id:"[id]",userdata:"userdata",subgrid:{root:"rows",row:"row",repeatitems:!0,cell:"cell"}},d.p.xmlReader),d.p.jsonReader=$.extend(!0,{root:"rows",page:"page",total:"total",records:"records",repeatitems:!0,cell:"cell",id:"id",userdata:"userdata",subgrid:{root:"rows",repeatitems:!0,cell:"cell"}},d.p.jsonReader),d.p.localReader=$.extend(!0,{root:"rows",page:"page",total:"total",records:"records",repeatitems:!1,cell:"cell",id:"id",userdata:"userdata",subgrid:{root:"rows",repeatitems:!0,cell:"cell"}},d.p.localReader),d.p.scroll&&(d.p.pgbuttons=!1,d.p.pginput=!1,d.p.rowList=[]),d.p.data.length&&(I(),J());var bb,cb,db,eb,fb,gb,hb,ib,jb="<thead><tr class='ui-jqgrid-labels' role='row'>",kb="",lb="",mb="";if(d.p.shrinkToFit===!0&&d.p.forceFit===!0)for(i=d.p.colModel.length-1;i>=0;i--)if(!d.p.colModel[i].hidden){d.p.colModel[i].resizable=!1;break}if("horizontal"===d.p.viewsortcols[1]?(lb=" ui-i-asc",mb=" ui-i-desc"):"single"===d.p.viewsortcols[1]&&(lb=" ui-single-sort-asc",mb=" ui-single-sort-desc",kb=" style='display:none'",d.p.viewsortcols[0]=!1),bb=r?"class='ui-th-div-ie'":"",ib="<span class='s-ico' style='display:none'>",ib+="<span sort='asc'  class='ui-grid-ico-sort ui-icon-asc"+lb+" ui-sort-"+h+" "+m+" "+q+" "+k(l,"icon_asc",!0)+"'"+kb+"></span>",ib+="<span sort='desc' class='ui-grid-ico-sort ui-icon-desc"+mb+" ui-sort-"+h+" "+m+" "+q+" "+k(l,"icon_desc",!0)+"'"+kb+"></span></span>",d.p.multiSort&&d.p.sortname)for(s=d.p.sortname.split(","),i=0;i<s.length;i++)u=$.trim(s[i]).split(" "),s[i]=$.trim(u[0]),t[i]=u[1]?$.trim(u[1]):d.p.sortorder||"asc";
for(i=0;i<this.p.colNames.length;i++){var nb=d.p.headertitles?' title="'+$.jgrid.stripHtml(d.p.colNames[i])+'"':"";jb+="<th id='"+d.p.id+"_"+d.p.colModel[i].name+"' role='columnheader' "+k(l,"headerBox",!1,"ui-th-column ui-th-"+h)+" "+nb+">",cb=d.p.colModel[i].index||d.p.colModel[i].name,jb+="<div id='jqgh_"+d.p.id+"_"+d.p.colModel[i].name+"' "+bb+">"+d.p.colNames[i],d.p.colModel[i].width=d.p.colModel[i].width?parseInt(d.p.colModel[i].width,10):150,"boolean"!=typeof d.p.colModel[i].title&&(d.p.colModel[i].title=!0),d.p.colModel[i].lso="",cb===d.p.sortname&&(d.p.lastsort=i),d.p.multiSort&&(u=$.inArray(cb,s),-1!==u&&(d.p.colModel[i].lso=t[u])),jb+=ib+"</div></th>"}if(jb+="</tr></thead>",ib=null,$(this).append(jb),$("thead tr:first th",this).hover(function(){$(this).addClass(o)},function(){$(this).removeClass(o)}),this.p.multiselect){var ob,pb=[];$("#cb_"+$.jgrid.jqID(d.p.id),this).bind("click",function(){d.p.selarrrow=[];var a=d.p.frozenColumns===!0?d.p.id+"_frozen":"";this.checked?($(d.rows).each(function(b){b>0&&($(this).hasClass("ui-subgrid")||$(this).hasClass("jqgroup")||$(this).hasClass(m)||$(this).hasClass("jqfoot")||($("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(this.id))[d.p.useProp?"prop":"attr"]("checked",!0),$(this).addClass(n).attr("aria-selected","true"),d.p.selarrrow.push(this.id),d.p.selrow=this.id,a&&($("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(this.id),d.grid.fbDiv)[d.p.useProp?"prop":"attr"]("checked",!0),$("#"+$.jgrid.jqID(this.id),d.grid.fbDiv).addClass(n))))}),ob=!0,pb=[]):($(d.rows).each(function(b){b>0&&($(this).hasClass("ui-subgrid")||$(this).hasClass("jqgroup")||$(this).hasClass(m)||$(this).hasClass("jqfoot")||($("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(this.id))[d.p.useProp?"prop":"attr"]("checked",!1),$(this).removeClass(n).attr("aria-selected","false"),pb.push(this.id),a&&($("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(this.id),d.grid.fbDiv)[d.p.useProp?"prop":"attr"]("checked",!1),$("#"+$.jgrid.jqID(this.id),d.grid.fbDiv).removeClass(n))))}),d.p.selrow=null,ob=!1),$(d).triggerHandler("jqGridSelectAll",[ob?d.p.selarrrow:pb,ob]),$.isFunction(d.p.onSelectAll)&&d.p.onSelectAll.call(d,ob?d.p.selarrrow:pb,ob)})}if(d.p.autowidth===!0){var qb=$(v).innerWidth();d.p.width=qb>0?qb:"nw"}W(),$(v).css("width",e.width+"px").append("<div class='ui-jqgrid-resize-mark' id='rs_m"+d.p.id+"'>&#160;</div>"),d.p.scrollPopUp&&$(v).append("<div "+k(l,"scrollBox",!1,"loading ui-scroll-popup")+" id='scroll_g"+d.p.id+"'></div>"),$(j).css("width",e.width+"px"),jb=$("thead:first",d).get(0);var rb="";d.p.footerrow&&(rb+="<table role='presentation' style='width:"+d.p.tblwidth+"px' "+k(l,"footerTable",!1,"ui-jqgrid-ftable ui-common-table")+"><tbody><tr role='row' "+k(l,"footerBox",!1,"footrow footrow-"+h)+">");var sb=$("tr:first",jb),tb="<tr class='jqgfirstrow' role='row'>";if(d.p.disableClick=!1,$("th",sb).each(function(a){db=d.p.colModel[a].width,void 0===d.p.colModel[a].resizable&&(d.p.colModel[a].resizable=!0),d.p.colModel[a].resizable?(eb=document.createElement("span"),$(eb).html("&#160;").addClass("ui-jqgrid-resize ui-jqgrid-resize-"+h).css("cursor","col-resize"),$(this).addClass(d.p.resizeclass)):eb="",$(this).css("width",db+"px").prepend(eb),eb=null;var b="";d.p.colModel[a].hidden&&($(this).css("display","none"),b="display:none;"),tb+="<td role='gridcell' style='height:0px;width:"+db+"px;"+b+"'></td>",e.headers[a]={width:db,el:this},kb=d.p.colModel[a].sortable,"boolean"!=typeof kb&&(d.p.colModel[a].sortable=!0,kb=!0);var c=d.p.colModel[a].name;"cb"!==c&&"subgrid"!==c&&"rn"!==c&&d.p.viewsortcols[2]&&$(">div",this).addClass("ui-jqgrid-sortable"),kb&&(d.p.multiSort?d.p.viewsortcols[0]?($("div span.s-ico",this).show(),d.p.colModel[a].lso&&$("div span.ui-icon-"+d.p.colModel[a].lso,this).removeClass(m).css("display","")):d.p.colModel[a].lso&&($("div span.s-ico",this).show(),$("div span.ui-icon-"+d.p.colModel[a].lso,this).removeClass(m).css("display","")):d.p.viewsortcols[0]?($("div span.s-ico",this).show(),a===d.p.lastsort&&$("div span.ui-icon-"+d.p.sortorder,this).removeClass(m).css("display","")):a===d.p.lastsort&&""!==d.p.sortname&&($("div span.s-ico",this).show(),$("div span.ui-icon-"+d.p.sortorder,this).removeClass(m).css("display",""))),d.p.footerrow&&(rb+="<td role='gridcell' "+z(a,0,"",null,"",!1)+">&#160;</td>")}).mousedown(function(a){if(1===$(a.target).closest("th>span.ui-jqgrid-resize").length){var b=Z(this);return d.p.forceFit===!0&&(d.p.nv=X(b)),e.dragStart(b,a,Y(b)),!1}}).click(function(a){if(d.p.disableClick)return d.p.disableClick=!1,!1;var b,c,e="th>div.ui-jqgrid-sortable";d.p.viewsortcols[2]||(e="th>div>span>span.ui-grid-ico-sort");var f=$(a.target).closest(e);if(1===f.length){var g;if(d.p.frozenColumns){var h=$(this)[0].id.substring(d.p.id.length+1);$(d.p.colModel).each(function(a){return this.name===h?(g=a,!1):void 0})}else g=Z(this);return d.p.viewsortcols[2]||(b=!0,c=f.attr("sort")),null!=g&&V($("div",this)[0].id,g,b,c,this),!1}}),d.p.sortable&&$.fn.sortable)try{$(d).jqGrid("sortableColumns",sb)}catch(ub){}d.p.footerrow&&(rb+="</tr></tbody></table>"),tb+="</tr>",hb=document.createElement("tbody"),this.appendChild(hb),$(this).addClass(k(l,"rowTable",!0,"ui-jqgrid-btable ui-common-table")).append(tb),tb=null;var vb=$("<table "+k(l,"headerTable",!1,"ui-jqgrid-htable ui-common-table")+" style='width:"+d.p.tblwidth+"px' role='presentation' aria-labelledby='gbox_"+this.id+"'></table>").append(jb),wb=d.p.caption&&d.p.hiddengrid===!0?!0:!1,xb=$("<div class='ui-jqgrid-hbox"+("rtl"===h?"-rtl":"")+"'></div>");jb=null,e.hDiv=document.createElement("div"),e.hDiv.style.width=e.width+"px",e.hDiv.className=k(l,"headerDiv",!0,"ui-jqgrid-hdiv"),$(e.hDiv).append(xb),$(xb).append(vb),vb=null,wb&&$(e.hDiv).hide(),d.p.pager&&("string"==typeof d.p.pager?"#"!==d.p.pager.substr(0,1)&&(d.p.pager="#"+d.p.pager):d.p.pager="#"+$(d.p.pager).attr("id"),$(d.p.pager).css({width:e.width+"px"}).addClass(k(l,"pagerBox",!0,"ui-jqgrid-pager")).appendTo(v),wb&&$(d.p.pager).hide(),T(d.p.pager,"")),d.p.cellEdit===!1&&d.p.hoverrows===!0&&$(d).bind("mouseover",function(a){gb=$(a.target).closest("tr.jqgrow"),"ui-subgrid"!==$(gb).attr("class")&&$(gb).addClass(o)}).bind("mouseout",function(a){gb=$(a.target).closest("tr.jqgrow"),$(gb).removeClass(o)});var yb,zb,Ab;$(d).before(e.hDiv).click(function(a){if(fb=a.target,gb=$(fb,d.rows).closest("tr.jqgrow"),0===$(gb).length||gb[0].className.indexOf(m)>-1||($(fb,d).closest("table.ui-jqgrid-btable").attr("id")||"").replace("_frozen","")!==d.id)return this;var b=$(fb).hasClass("cbox"),c=$(d).triggerHandler("jqGridBeforeSelectRow",[gb[0].id,a]);if(c=c===!1||"stop"===c?!1:!0,$.isFunction(d.p.beforeSelectRow)){var e=d.p.beforeSelectRow.call(d,gb[0].id,a);(e===!1||"stop"===e)&&(c=!1)}if("A"!==fb.tagName&&("INPUT"!==fb.tagName&&"TEXTAREA"!==fb.tagName&&"OPTION"!==fb.tagName&&"SELECT"!==fb.tagName||b)){if(yb=gb[0].id,fb=$(fb).closest("tr.jqgrow>td"),fb.length>0&&(zb=$.jgrid.getCellIndex(fb),Ab=$(fb).closest("td,th").html(),$(d).triggerHandler("jqGridCellSelect",[yb,zb,Ab,a]),$.isFunction(d.p.onCellSelect)&&d.p.onCellSelect.call(d,yb,zb,Ab,a)),d.p.cellEdit===!0)if(d.p.multiselect&&b&&c)$(d).jqGrid("setSelection",yb,!0,a);else if(fb.length>0){yb=gb[0].rowIndex;try{$(d).jqGrid("editCell",yb,zb,!0)}catch(f){}}if(c)if(d.p.multikey)a[d.p.multikey]?$(d).jqGrid("setSelection",yb,!0,a):d.p.multiselect&&b&&(b=$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+yb).is(":checked"),$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+yb)[d.p.useProp?"prop":"attr"]("checked",!b));else if(d.p.multiselect&&d.p.multiboxonly)if(b)$(d).jqGrid("setSelection",yb,!0,a);else{var g=d.p.frozenColumns?d.p.id+"_frozen":"";$(d.p.selarrrow).each(function(a,b){var c=$(d).jqGrid("getGridRowById",b);c&&$(c).removeClass(n),$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(b))[d.p.useProp?"prop":"attr"]("checked",!1),g&&($("#"+$.jgrid.jqID(b),"#"+$.jgrid.jqID(g)).removeClass(n),$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(b),"#"+$.jgrid.jqID(g))[d.p.useProp?"prop":"attr"]("checked",!1))}),d.p.selarrrow=[],$(d).jqGrid("setSelection",yb,!0,a)}else $(d).jqGrid("setSelection",yb,!0,a)}}).bind("reloadGrid",function(a,b){if(d.p.treeGrid===!0&&(d.p.datatype=d.p.treedatatype),b=b||{},b.current&&d.grid.selectionPreserver(d),"local"===d.p.datatype?($(d).jqGrid("resetSelection"),d.p.data.length&&(I(),J())):d.p.treeGrid||(d.p.selrow=null,d.p.multiselect&&(d.p.selarrrow=[],S(!1)),d.p.savedRow=[]),d.p.scroll&&H.call(d,!0,!1),b.page){var c=b.page;c>d.p.lastpage&&(c=d.p.lastpage),1>c&&(c=1),d.p.page=c,d.grid.bDiv.scrollTop=d.grid.prevRowHeight?(c-1)*d.grid.prevRowHeight*d.p.rowNum:0}return d.grid.prevRowHeight&&d.p.scroll&&void 0===b.page?(delete d.p.lastpage,d.grid.populateVisible()):d.grid.populate(),d.p.inlineNav===!0&&$(d).jqGrid("showAddEditButtons"),!1}).dblclick(function(a){if(fb=a.target,gb=$(fb,d.rows).closest("tr.jqgrow"),0!==$(gb).length){yb=gb[0].rowIndex,zb=$.jgrid.getCellIndex(fb);var b=$(d).triggerHandler("jqGridDblClickRow",[$(gb).attr("id"),yb,zb,a]);return null!=b?b:$.isFunction(d.p.ondblClickRow)&&(b=d.p.ondblClickRow.call(d,$(gb).attr("id"),yb,zb,a),null!=b)?b:void 0}}).bind("contextmenu",function(a){if(fb=a.target,gb=$(fb,d.rows).closest("tr.jqgrow"),0!==$(gb).length){d.p.multiselect||$(d).jqGrid("setSelection",gb[0].id,!0,a),yb=gb[0].rowIndex,zb=$.jgrid.getCellIndex(fb);var b=$(d).triggerHandler("jqGridRightClickRow",[$(gb).attr("id"),yb,zb,a]);return null!=b?b:$.isFunction(d.p.onRightClickRow)&&(b=d.p.onRightClickRow.call(d,$(gb).attr("id"),yb,zb,a),null!=b)?b:void 0}}),e.bDiv=document.createElement("div"),r&&"auto"===String(d.p.height).toLowerCase()&&(d.p.height="100%"),$(e.bDiv).append($('<div style="position:relative;"></div>').append("<div></div>").append(this)).addClass("ui-jqgrid-bdiv").css({height:d.p.height+(isNaN(d.p.height)?"":"px"),width:e.width+"px"}).scroll(e.scrollGrid),$("table:first",e.bDiv).css({width:d.p.tblwidth+"px"}),$.support.tbody||2===$("tbody",this).length&&$("tbody:gt(0)",this).remove(),d.p.multikey&&($.jgrid.msie?$(e.bDiv).bind("selectstart",function(){return!1}):$(e.bDiv).bind("mousedown",function(){return!1})),wb&&$(e.bDiv).hide();var Bb=q+" "+k(l,"icon_caption_open",!0),Cb=q+" "+k(l,"icon_caption_close",!0);e.cDiv=document.createElement("div");var Db=d.p.hidegrid===!0?$("<a role='link' class='ui-jqgrid-titlebar-close HeaderButton "+p+"' title='"+($.jgrid.getRegional(d,"defaults.showhide",d.p.showhide)||"")+"' />").hover(function(){Db.addClass(o)},function(){Db.removeClass(o)}).append("<span class='ui-jqgrid-headlink "+Bb+"'></span>").css("rtl"===h?"left":"right","0px"):"";if($(e.cDiv).append(Db).append("<span class='ui-jqgrid-title'>"+d.p.caption+"</span>").addClass("ui-jqgrid-titlebar ui-jqgrid-caption"+("rtl"===h?"-rtl":"")+" "+k(l,"gridtitleBox",!0)),$(e.cDiv).insertBefore(e.hDiv),d.p.toolbar[0]){var Eb=k(l,"customtoolbarBox",!0,"ui-userdata");e.uDiv=document.createElement("div"),"top"===d.p.toolbar[1]?$(e.uDiv).insertBefore(e.hDiv):"bottom"===d.p.toolbar[1]&&$(e.uDiv).insertAfter(e.hDiv),"both"===d.p.toolbar[1]?(e.ubDiv=document.createElement("div"),$(e.uDiv).addClass(Eb+" ui-userdata-top").attr("id","t_"+this.id).insertBefore(e.hDiv).width(e.width),$(e.ubDiv).addClass(Eb+" ui-userdata-bottom").attr("id","tb_"+this.id).insertAfter(e.hDiv).width(e.width),wb&&$(e.ubDiv).hide()):$(e.uDiv).width(e.width).addClass(Eb+" ui-userdata-top").attr("id","t_"+this.id),wb&&$(e.uDiv).hide()}if(d.p.toppager&&(d.p.toppager=$.jgrid.jqID(d.p.id)+"_toppager",e.topDiv=$("<div id='"+d.p.toppager+"'></div>")[0],d.p.toppager="#"+d.p.toppager,$(e.topDiv).addClass(k(l,"toppagerBox",!0,"ui-jqgrid-toppager")).width(e.width).insertBefore(e.hDiv),T(d.p.toppager,"_t")),d.p.footerrow&&(e.sDiv=$("<div class='ui-jqgrid-sdiv'></div>")[0],xb=$("<div class='ui-jqgrid-hbox"+("rtl"===h?"-rtl":"")+"'></div>"),$(e.sDiv).append(xb).width(e.width).insertAfter(e.hDiv),$(xb).append(rb),e.footers=$(".ui-jqgrid-ftable",e.sDiv)[0].rows[0].cells,d.p.rownumbers&&(e.footers[0].className=k(l,"rownumBox",!0,"jqgrid-rownum")),wb&&$(e.sDiv).hide()),xb=null,d.p.caption){var Fb=d.p.datatype;d.p.hidegrid===!0&&($(".ui-jqgrid-titlebar-close",e.cDiv).click(function(a){var b,c=$.isFunction(d.p.onHeaderClick),f=".ui-jqgrid-bdiv, .ui-jqgrid-hdiv, .ui-jqgrid-toppager, .ui-jqgrid-pager, .ui-jqgrid-sdiv",g=this;return d.p.toolbar[0]===!0&&("both"===d.p.toolbar[1]&&(f+=", #"+$(e.ubDiv).attr("id")),f+=", #"+$(e.uDiv).attr("id")),b=$(f,"#gview_"+$.jgrid.jqID(d.p.id)).length,"visible"===d.p.gridstate?$(f,"#gbox_"+$.jgrid.jqID(d.p.id)).slideUp("fast",function(){b--,0===b&&($("span",g).removeClass(Bb).addClass(Cb),d.p.gridstate="hidden",$("#gbox_"+$.jgrid.jqID(d.p.id)).hasClass("ui-resizable")&&$(".ui-resizable-handle","#gbox_"+$.jgrid.jqID(d.p.id)).hide(),$(d).triggerHandler("jqGridHeaderClick",[d.p.gridstate,a]),c&&(wb||d.p.onHeaderClick.call(d,d.p.gridstate,a)))}):"hidden"===d.p.gridstate&&$(f,"#gbox_"+$.jgrid.jqID(d.p.id)).slideDown("fast",function(){b--,0===b&&($("span",g).removeClass(Cb).addClass(Bb),wb&&(d.p.datatype=Fb,R(),wb=!1),d.p.gridstate="visible",$("#gbox_"+$.jgrid.jqID(d.p.id)).hasClass("ui-resizable")&&$(".ui-resizable-handle","#gbox_"+$.jgrid.jqID(d.p.id)).show(),$(d).triggerHandler("jqGridHeaderClick",[d.p.gridstate,a]),c&&(wb||d.p.onHeaderClick.call(d,d.p.gridstate,a)))}),!1}),wb&&(d.p.datatype="local",$(".ui-jqgrid-titlebar-close",e.cDiv).trigger("click")))}else $(e.cDiv).hide(),d.p.toppager||$(e.hDiv).addClass(k(d.p.styleUI+".common","cornertop",!0));if($(e.hDiv).after(e.bDiv).mousemove(function(a){return e.resizing?(e.dragMove(a),!1):void 0}),$(".ui-jqgrid-labels",e.hDiv).bind("selectstart",function(){return!1}),$(document).bind("mouseup.jqGrid"+d.p.id,function(){return e.resizing?(e.dragEnd(!0),!1):!0}),d.formatCol=z,d.sortData=V,d.updatepager=O,d.refreshIndex=J,d.setHeadCheckBox=S,d.constructTr=K,d.formatter=function(a,b,c,d,e){return B(a,b,c,d,e)},$.extend(e,{populate:R,emptyRows:H,beginReq:P,endReq:Q}),this.grid=e,d.addXmlData=function(a){L(a)},d.addJSONData=function(a){M(a)},this.grid.cols=this.rows[0].cells,$(d).triggerHandler("jqGridInitGrid"),$.isFunction(d.p.onInitGrid)&&d.p.onInitGrid.call(d),R(),d.p.hiddengrid=!1,d.p.responsive){var Gb="onorientationchange"in window,Hb=Gb?"orientationchange":"resize";$(window).on(Hb,function(){$(d).jqGrid("resizeGrid")})}}})},$.jgrid.extend({getGridParam:function(a,b){var c,d=this[0];if(d&&d.grid){if(void 0===b&&"string"!=typeof b&&(b="jqGrid"),c=d.p,"jqGrid"!==b)try{c=$(d).data(b)}catch(e){c=d.p}return a?void 0!==c[a]?c[a]:null:c}},setGridParam:function(a,b){return this.each(function(){if(null==b&&(b=!1),this.grid&&"object"==typeof a)if(b===!0){var c=$.extend({},this.p,a);this.p=c}else $.extend(!0,this.p,a)})},getGridRowById:function(a){var b;return this.each(function(){try{for(var c=this.rows.length;c--;)if(a.toString()===this.rows[c].id){b=this.rows[c];break}}catch(d){b=$(this.grid.bDiv).find("#"+$.jgrid.jqID(a))}}),b},getDataIDs:function(){var a,b=[],c=0,d=0;return this.each(function(){if(a=this.rows.length,a&&a>0)for(;a>c;)$(this.rows[c]).hasClass("jqgrow")&&(b[d]=this.rows[c].id,d++),c++}),b},setSelection:function(a,b,c){return this.each(function(){function d(a){var b=$(l.grid.bDiv)[0].clientHeight,c=$(l.grid.bDiv)[0].scrollTop,d=$(l.rows[a]).position().top,e=l.rows[a].clientHeight;d+e>=b+c?$(l.grid.bDiv)[0].scrollTop=d-(b+c)+e+c:b+c>d&&c>d&&($(l.grid.bDiv)[0].scrollTop=d)}var e,f,g,h,i,j,k,l=this,m=$.jgrid.getMethod("getStyleUI"),n=m(l.p.styleUI+".common","highlight",!0),o=m(l.p.styleUI+".common","disabled",!0);void 0!==a&&(b=b===!1?!1:!0,f=$(l).jqGrid("getGridRowById",a),!f||!f.className||f.className.indexOf(o)>-1||(l.p.scrollrows===!0&&(g=$(l).jqGrid("getGridRowById",a).rowIndex,g>=0&&d(g)),l.p.frozenColumns===!0&&(j=l.p.id+"_frozen"),l.p.multiselect?(l.setHeadCheckBox(!1),l.p.selrow=f.id,h=$.inArray(l.p.selrow,l.p.selarrrow),-1===h?("ui-subgrid"!==f.className&&$(f).addClass(n).attr("aria-selected","true"),e=!0,l.p.selarrrow.push(l.p.selrow)):("ui-subgrid"!==f.className&&$(f).removeClass(n).attr("aria-selected","false"),e=!1,l.p.selarrrow.splice(h,1),i=l.p.selarrrow[0],l.p.selrow=void 0===i?null:i),$("#jqg_"+$.jgrid.jqID(l.p.id)+"_"+$.jgrid.jqID(f.id))[l.p.useProp?"prop":"attr"]("checked",e),j&&(-1===h?$("#"+$.jgrid.jqID(a),"#"+$.jgrid.jqID(j)).addClass(n):$("#"+$.jgrid.jqID(a),"#"+$.jgrid.jqID(j)).removeClass(n),$("#jqg_"+$.jgrid.jqID(l.p.id)+"_"+$.jgrid.jqID(a),"#"+$.jgrid.jqID(j))[l.p.useProp?"prop":"attr"]("checked",e)),b&&($(l).triggerHandler("jqGridSelectRow",[f.id,e,c]),l.p.onSelectRow&&l.p.onSelectRow.call(l,f.id,e,c))):"ui-subgrid"!==f.className&&(l.p.selrow!==f.id?(k=$(l).jqGrid("getGridRowById",l.p.selrow),k&&$(k).removeClass(n).attr({"aria-selected":"false",tabindex:"-1"}),$(f).addClass(n).attr({"aria-selected":"true",tabindex:"0"}),j&&($("#"+$.jgrid.jqID(l.p.selrow),"#"+$.jgrid.jqID(j)).removeClass(n),$("#"+$.jgrid.jqID(a),"#"+$.jgrid.jqID(j)).addClass(n)),e=!0):e=!1,l.p.selrow=f.id,b&&($(l).triggerHandler("jqGridSelectRow",[f.id,e,c]),l.p.onSelectRow&&l.p.onSelectRow.call(l,f.id,e,c)))))})},resetSelection:function(a){return this.each(function(){var b,c,d=this,e=$.jgrid.getMethod("getStyleUI"),f=e(d.p.styleUI+".common","highlight",!0),g=e(d.p.styleUI+".common","hover",!0);if(d.p.frozenColumns===!0&&(c=d.p.id+"_frozen"),void 0!==a){if(b=a===d.p.selrow?d.p.selrow:a,$("#"+$.jgrid.jqID(d.p.id)+" tbody:first tr#"+$.jgrid.jqID(b)).removeClass(f).attr("aria-selected","false"),c&&$("#"+$.jgrid.jqID(b),"#"+$.jgrid.jqID(c)).removeClass(f),d.p.multiselect){$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(b),"#"+$.jgrid.jqID(d.p.id))[d.p.useProp?"prop":"attr"]("checked",!1),c&&$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(b),"#"+$.jgrid.jqID(c))[d.p.useProp?"prop":"attr"]("checked",!1),d.setHeadCheckBox(!1);var h=$.inArray($.jgrid.jqID(b),d.p.selarrrow);-1!==h&&d.p.selarrrow.splice(h,1)}d.p.onUnSelectRow&&d.p.onUnSelectRow.call(d,b),b=null}else d.p.multiselect?($(d.p.selarrrow).each(function(a,b){$($(d).jqGrid("getGridRowById",b)).removeClass(f).attr("aria-selected","false"),$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(b))[d.p.useProp?"prop":"attr"]("checked",!1),c&&($("#"+$.jgrid.jqID(b),"#"+$.jgrid.jqID(c)).removeClass(f),$("#jqg_"+$.jgrid.jqID(d.p.id)+"_"+$.jgrid.jqID(b),"#"+$.jgrid.jqID(c))[d.p.useProp?"prop":"attr"]("checked",!1)),d.p.onUnSelectRow&&d.p.onUnSelectRow.call(d,b)}),d.setHeadCheckBox(!1),d.p.selarrrow=[],d.p.selrow=null):d.p.selrow&&($("#"+$.jgrid.jqID(d.p.id)+" tbody:first tr#"+$.jgrid.jqID(d.p.selrow)).removeClass(f).attr("aria-selected","false"),c&&$("#"+$.jgrid.jqID(d.p.selrow),"#"+$.jgrid.jqID(c)).removeClass(f),d.p.onUnSelectRow&&d.p.onUnSelectRow.call(d,d.p.selrow),d.p.selrow=null);d.p.cellEdit===!0&&parseInt(d.p.iCol,10)>=0&&parseInt(d.p.iRow,10)>=0&&($("td:eq("+d.p.iCol+")",d.rows[d.p.iRow]).removeClass("edit-cell "+f),$(d.rows[d.p.iRow]).removeClass("selected-row "+g)),d.p.savedRow=[]})},getRowData:function(a,b){var c,d,e={},f=!1,g=0;return this.each(function(){var h,i,j=this;if(null==a)f=!0,c=[],d=j.rows.length;else{if(i=$(j).jqGrid("getGridRowById",a),!i)return e;d=2}for(b&&b===!0&&j.p.data.length>0||(b=!1);d>g;)f&&(i=j.rows[g]),$(i).hasClass("jqgrow")&&(b?e=j.p.data[j.p._index[i.id]]:$('td[role="gridcell"]',i).each(function(a){if(h=j.p.colModel[a].name,"cb"!==h&&"subgrid"!==h&&"rn"!==h)if(j.p.treeGrid===!0&&h===j.p.ExpandColumn)e[h]=$.jgrid.htmlDecode($("span:first",this).html());else try{e[h]=$.unformat.call(j,this,{rowId:i.id,colModel:j.p.colModel[a]},a)}catch(b){e[h]=$.jgrid.htmlDecode($(this).html())}}),f&&(c.push(e),e={})),g++}),c||e},delRowData:function(a){var b,c,d,e=!1;return this.each(function(){var f=this;if(b=$(f).jqGrid("getGridRowById",a),!b)return!1;if(f.p.subGrid&&(d=$(b).next(),d.hasClass("ui-subgrid")&&d.remove()),$(b).remove(),f.p.records--,f.p.reccount--,f.updatepager(!0,!1),e=!0,f.p.multiselect&&(c=$.inArray(a,f.p.selarrrow),-1!==c&&f.p.selarrrow.splice(c,1)),f.p.selrow=f.p.multiselect&&f.p.selarrrow.length>0?f.p.selarrrow[f.p.selarrrow.length-1]:null,"local"===f.p.datatype){var g=$.jgrid.stripPref(f.p.idPrefix,a),h=f.p._index[g];void 0!==h&&(f.p.data.splice(h,1),f.refreshIndex())}if(f.p.altRows===!0&&e){var i=f.p.altclass;$(f.rows).each(function(a){a%2===1?$(this).addClass(i):$(this).removeClass(i)})}}),e},setRowData:function(a,b,c){var d,e,f=!0;return this.each(function(){if(!this.grid)return!1;var g,h,i=this,j=typeof c,k={};if(h=$(this).jqGrid("getGridRowById",a),!h)return!1;if(b)try{if($(this.p.colModel).each(function(c){d=this.name;var f=$.jgrid.getAccessor(b,d);void 0!==f&&(k[d]=this.formatter&&"string"==typeof this.formatter&&"date"===this.formatter?$.unformat.date.call(i,f,this):f,g=i.formatter(a,k[d],c,b,"edit"),e=this.title?{title:$.jgrid.stripHtml(g)}:{},i.p.treeGrid===!0&&d===i.p.ExpandColumn?$("td[role='gridcell']:eq("+c+") > span:first",h).html(g).attr(e):$("td[role='gridcell']:eq("+c+")",h).html(g).attr(e))}),"local"===i.p.datatype){var l,m=$.jgrid.stripPref(i.p.idPrefix,a),n=i.p._index[m];if(i.p.treeGrid)for(l in i.p.treeReader)i.p.treeReader.hasOwnProperty(l)&&delete k[i.p.treeReader[l]];void 0!==n&&(i.p.data[n]=$.extend(!0,i.p.data[n],k)),k=null}}catch(o){f=!1}f&&("string"===j?$(h).addClass(c):null!==c&&"object"===j&&$(h).css(c),$(i).triggerHandler("jqGridAfterGridComplete"))}),f},addRowData:function(a,b,c,d){-1==["first","last","before","after"].indexOf(c)&&(c="last");var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s=!1,t="",u="",v="";return b&&($.isArray(b)?(m=!0,n=a):(b=[b],m=!1),this.each(function(){var w=this,x=b.length;i=w.p.rownumbers===!0?1:0,g=w.p.multiselect===!0?1:0,h=w.p.subGrid===!0?1:0,m||(void 0!==a?a=String(a):(a=$.jgrid.randId(),w.p.keyName!==!1&&(n=w.p.keyName,void 0!==b[0][n]&&(a=b[0][n])))),o=w.p.altclass;var y,z=0,A=$(w).jqGrid("getStyleUI",w.p.styleUI+".base","rowBox",!0,"jqgrow ui-row-"+w.p.direction),B={},C=$.isFunction(w.p.afterInsertRow)?!0:!1;for(i&&(t=$(w).jqGrid("getStyleUI",w.p.styleUI+".base","rownumBox",!1,"jqgrid-rownum")),g&&(u=$(w).jqGrid("getStyleUI",w.p.styleUI+".base","multiBox",!1,"cbox"));x>z;){if(p=b[z],f=[],y=A,m){try{a=p[n],void 0===a&&(a=$.jgrid.randId())}catch(D){a=$.jgrid.randId()}y+=w.p.altRows===!0&&(w.rows.length-1)%2===0?" "+o:""}for(r=a,a=w.p.idPrefix+a,i&&(v=w.formatCol(0,1,"",null,a,!0),f[f.length]='<td role="gridcell" '+t+" "+v+">0</td>"),g&&(l='<input role="checkbox" type="checkbox" id="jqg_'+w.p.id+"_"+a+'" '+u+"/>",v=w.formatCol(i,1,"",null,a,!0),f[f.length]='<td role="gridcell" '+v+">"+l+"</td>"),h&&(f[f.length]=$(w).jqGrid("addSubGridCell",g+i,1)),k=g+h+i;k<w.p.colModel.length;k++)q=w.p.colModel[k],e=q.name,B[e]=p[e],l=w.formatter(a,$.jgrid.getAccessor(p,e),k,p),v=w.formatCol(k,1,l,p,a,B),f[f.length]='<td role="gridcell" '+v+">"+l+"</td>";if(f.unshift(w.constructTr(a,!1,y,B,p)),f[f.length]="</tr>",0===w.rows.length)$("table:first",w.grid.bDiv).append(f.join(""));else switch(c){case"last":$(w.rows[w.rows.length-1]).after(f.join("")),j=w.rows.length-1;break;case"first":$(w.rows[0]).after(f.join("")),j=1;break;case"after":j=$(w).jqGrid("getGridRowById",d),j&&($(w.rows[j.rowIndex+1]).hasClass("ui-subgrid")?$(w.rows[j.rowIndex+1]).after(f):$(j).after(f.join("")),j=j.rowIndex+1);break;case"before":j=$(w).jqGrid("getGridRowById",d),j&&($(j).before(f.join("")),j=j.rowIndex-1)}w.p.subGrid===!0&&$(w).jqGrid("addSubGrid",g+i,j),w.p.records++,w.p.reccount++,$(w).triggerHandler("jqGridAfterInsertRow",[a,p,p]),C&&w.p.afterInsertRow.call(w,a,p,p),z++,"local"===w.p.datatype&&(B[w.p.localReader.id]=r,w.p._index[r]=w.p.data.length,w.p.data.push(B),B={})}w.p.altRows!==!0||m||("last"===c?(w.rows.length-1)%2===0&&$(w.rows[w.rows.length-1]).addClass(o):$(w.rows).each(function(a){a%2===0?$(this).addClass(o):$(this).removeClass(o)})),w.updatepager(!0,!0),s=!0})),s},footerData:function(a,b,c){function d(a){var b;for(b in a)if(a.hasOwnProperty(b))return!1;return!0}var e,f,g=!1,h={};return void 0===a&&(a="get"),"boolean"!=typeof c&&(c=!0),a=a.toLowerCase(),this.each(function(){var i,j=this;return j.grid&&j.p.footerrow?"set"===a&&d(b)?!1:(g=!0,void $(this.p.colModel).each(function(d){e=this.name,"set"===a?void 0!==b[e]&&(i=c?j.formatter("",b[e],d,b,"edit"):b[e],f=this.title?{title:$.jgrid.stripHtml(i)}:{},$("tr.footrow td:eq("+d+")",j.grid.sDiv).html(i).attr(f),g=!0):"get"===a&&(h[e]=$("tr.footrow td:eq("+d+")",j.grid.sDiv).html())})):!1}),"get"===a?h:g},showHideCol:function(a,b){return this.each(function(){var c,d=this,e=!1,f=$.jgrid.cell_width?0:d.p.cellLayout;if(d.grid){"string"==typeof a&&(a=[a]),b="none"!==b?"":"none";var g=""===b?!0:!1,h=d.p.groupHeader&&($.isArray(d.p.groupHeader)||$.isFunction(d.p.groupHeader));if(h&&$(d).jqGrid("destroyGroupHeader",!1),$(this.p.colModel).each(function(h){if(-1!==$.inArray(this.name,a)&&this.hidden===g){if(d.p.frozenColumns===!0&&this.frozen===!0)return!0;$("tr[role=row]",d.grid.hDiv).each(function(){$(this.cells[h]).css("display",b)}),$(d.rows).each(function(){$(this).hasClass("jqgroup")||$(this.cells[h]).css("display",b)}),d.p.footerrow&&$("tr.footrow td:eq("+h+")",d.grid.sDiv).css("display",b),c=parseInt(this.width,10),"none"===b?d.p.tblwidth-=c+f:d.p.tblwidth+=c+f,this.hidden=!g,e=!0,$(d).triggerHandler("jqGridShowHideCol",[g,this.name,h])}}),e===!0&&(d.p.shrinkToFit!==!0||isNaN(d.p.height)||(d.p.tblwidth+=parseInt(d.p.scrollOffset,10)),$(d).jqGrid("setGridWidth",d.p.shrinkToFit===!0?d.p.tblwidth:d.p.width)),h){var i=$.extend([],d.p.groupHeader);d.p.groupHeader=null;for(var j=0;j<i.length;j++)$(d).jqGrid("setGroupHeaders",i[j])}}})},hideCol:function(a){return this.each(function(){$(this).jqGrid("showHideCol",a,"none")})},showCol:function(a){return this.each(function(){$(this).jqGrid("showHideCol",a,"")})},remapColumns:function(a,b,c){function d(b){var c;c=b.length?$.makeArray(b):$.extend({},b),$.each(a,function(a){b[a]=c[this]})}function e(b,c){$(">tr"+(c||""),b).each(function(){var b=this,c=$.makeArray(b.cells);$.each(a,function(){var a=c[this];a&&b.appendChild(a)})})}var f=this.get(0);d(f.p.colModel),d(f.p.colNames),d(f.grid.headers),e($("thead:first",f.grid.hDiv),c&&":not(.ui-jqgrid-labels)"),b&&e($("#"+$.jgrid.jqID(f.p.id)+" tbody:first"),".jqgfirstrow, tr.jqgrow, tr.jqfoot"),f.p.footerrow&&e($("tbody:first",f.grid.sDiv)),f.p.remapColumns&&(f.p.remapColumns.length?d(f.p.remapColumns):f.p.remapColumns=$.makeArray(a)),f.p.lastsort=$.inArray(f.p.lastsort,a),f.p.treeGrid&&(f.p.expColInd=$.inArray(f.p.expColInd,a)),$(f).triggerHandler("jqGridRemapColumns",[a,b,c])},setGridWidth:function(a,b){return this.each(function(){if(this.grid){var c,d,e,f,g=this,h=0,i=$.jgrid.cell_width?0:g.p.cellLayout,j=0,k=!1,l=g.p.scrollOffset,m=0;if("boolean"!=typeof b&&(b=g.p.shrinkToFit),!isNaN(a)){if(a=parseInt(a,10),g.grid.width=g.p.width=a,$("#gbox_"+$.jgrid.jqID(g.p.id)).css("width",a+"px"),$("#gview_"+$.jgrid.jqID(g.p.id)).css("width",a+"px"),$(g.grid.bDiv).css("width",a+"px"),$(g.grid.hDiv).css("width",a+"px"),g.p.pager&&$(g.p.pager).css("width",a+"px"),g.p.toppager&&$(g.p.toppager).css("width",a+"px"),g.p.toolbar[0]===!0&&($(g.grid.uDiv).css("width",a+"px"),"both"===g.p.toolbar[1]&&$(g.grid.ubDiv).css("width",a+"px")),g.p.footerrow&&$(g.grid.sDiv).css("width",a+"px"),b===!1&&g.p.forceFit===!0&&(g.p.forceFit=!1),b===!0){if($.each(g.p.colModel,function(){this.hidden===!1&&(c=this.widthOrg,h+=c+i,this.fixed?m+=c+i:j++)}),0===j)return;g.p.tblwidth=h,e=a-i*j-m,isNaN(g.p.height)||($(g.grid.bDiv)[0].clientHeight<$(g.grid.bDiv)[0].scrollHeight||1===g.rows.length)&&(k=!0,e-=l),h=0;var n=g.grid.cols.length>0;if($.each(g.p.colModel,function(a){if(this.hidden===!1&&!this.fixed){if(c=this.widthOrg,c=Math.round(e*c/(g.p.tblwidth-i*j-m)),0>c)return;this.width=c,h+=c,g.grid.headers[a].width=c,g.grid.headers[a].el.style.width=c+"px",g.p.footerrow&&(g.grid.footers[a].style.width=c+"px"),n&&(g.grid.cols[a].style.width=c+"px"),d=a}}),!d)return;if(f=0,k?a-m-(h+i*j)!==l&&(f=a-m-(h+i*j)-l):1!==Math.abs(a-m-(h+i*j))&&(f=a-m-(h+i*j)),g.p.colModel[d].width+=f,g.p.tblwidth=h+f+i*j+m,g.p.tblwidth>a){var o=g.p.tblwidth-parseInt(a,10);g.p.tblwidth=a,c=g.p.colModel[d].width=g.p.colModel[d].width-o}else c=g.p.colModel[d].width;g.grid.headers[d].width=c,g.grid.headers[d].el.style.width=c+"px",n&&(g.grid.cols[d].style.width=c+"px"),g.p.footerrow&&(g.grid.footers[d].style.width=c+"px")}g.p.tblwidth&&($("table:first",g.grid.bDiv).css("width",g.p.tblwidth+"px"),$("table:first",g.grid.hDiv).css("width",g.p.tblwidth+"px"),g.grid.hDiv.scrollLeft=g.grid.bDiv.scrollLeft,g.p.footerrow&&$("table:first",g.grid.sDiv).css("width",g.p.tblwidth+"px"))}}})},setGridHeight:function(a){return this.each(function(){var b=this;if(b.grid){var c=$(b.grid.bDiv);c.css({height:a+(isNaN(a)?"":"px")}),b.p.frozenColumns===!0&&$("#"+$.jgrid.jqID(b.p.id)+"_frozen").parent().height(c.height()-16),b.p.height=a,b.p.scroll&&b.grid.populateVisible()}})},setCaption:function(a){return this.each(function(){var b=$(this).jqGrid("getStyleUI",this.p.styleUI+".common","cornertop",!0);this.p.caption=a,$(".ui-jqgrid-title, .ui-jqgrid-title-rtl",this.grid.cDiv).html(a),$(this.grid.cDiv).show(),$(this.grid.hDiv).removeClass(b)})},setLabel:function(a,b,c,d){return this.each(function(){var e=this,f=-1;if(e.grid&&void 0!==a&&($(e.p.colModel).each(function(b){return this.name===a?(f=b,!1):void 0}),f>=0)){var g=$("tr.ui-jqgrid-labels th:eq("+f+")",e.grid.hDiv);if(b){var h=$(".s-ico",g);$("[id^=jqgh_]",g).empty().html(b).append(h),e.p.colNames[f]=b}c&&("string"==typeof c?$(g).addClass(c):$(g).css(c)),"object"==typeof d&&$(g).attr(d)}})},setCell:function(a,b,c,d,e,f){return this.each(function(){var g,h,i=this,j=-1;if(i.grid&&(isNaN(b)?$(i.p.colModel).each(function(a){return this.name===b?(j=a,!1):void 0}):j=parseInt(b,10),j>=0)){var k=$(i).jqGrid("getGridRowById",a);if(k){var l=$("td:eq("+j+")",k),m=0,n=[];if(""!==c||f===!0){if(void 0!==k.cells)for(;m<k.cells.length;)n.push(k.cells[m].innerHTML),m++;if(g=i.formatter(a,c,j,n,"edit"),h=i.p.colModel[j].title?{title:$.jgrid.stripHtml(g)}:{},i.p.treeGrid&&$(".tree-wrap",$(l)).length>0?$("span",$(l)).html(g).attr(h):$(l).html(g).attr(h),"local"===i.p.datatype){var o,p=i.p.colModel[j];c=p.formatter&&"string"==typeof p.formatter&&"date"===p.formatter?$.unformat.date.call(i,c,p):c,o=i.p._index[$.jgrid.stripPref(i.p.idPrefix,a)],void 0!==o&&(i.p.data[o][p.name]=c)}}"string"==typeof d?$(l).addClass(d):d&&$(l).css(d),"object"==typeof e&&$(l).attr(e)}}})},getCell:function(a,b){var c=!1;return this.each(function(){var d=this,e=-1;if(d.grid&&(isNaN(b)?$(d.p.colModel).each(function(a){return this.name===b?(e=a,!1):void 0}):e=parseInt(b,10),e>=0)){var f=$(d).jqGrid("getGridRowById",a);if(f)try{c=$.unformat.call(d,$("td:eq("+e+")",f),{rowId:f.id,colModel:d.p.colModel[e]},e)}catch(g){c=$.jgrid.htmlDecode($("td:eq("+e+")",f).html())}}}),c},getCol:function(a,b,c){var d,e,f,g,h=[],i=0;return b="boolean"!=typeof b?!1:b,void 0===c&&(c=!1),this.each(function(){var j=this,k=-1;if(j.grid&&(isNaN(a)?$(j.p.colModel).each(function(b){return this.name===a?(k=b,!1):void 0}):k=parseInt(a,10),k>=0)){var l=j.rows.length,m=0,n=0;if(l&&l>0){for(;l>m;){if($(j.rows[m]).hasClass("jqgrow")){try{d=$.unformat.call(j,$(j.rows[m].cells[k]),{rowId:j.rows[m].id,colModel:j.p.colModel[k]},k)}catch(o){d=$.jgrid.htmlDecode(j.rows[m].cells[k].innerHTML)}c?(g=parseFloat(d),isNaN(g)||(i+=g,void 0===f&&(f=e=g),e=Math.min(e,g),f=Math.max(f,g),n++)):h.push(b?{id:j.rows[m].id,value:d}:d)}m++}if(c)switch(c.toLowerCase()){case"sum":h=i;break;case"avg":h=i/n;break;case"count":h=l-1;break;case"min":h=e;break;case"max":h=f}}}}),h},clearGridData:function(a){return this.each(function(){var b=this;if(b.grid){if("boolean"!=typeof a&&(a=!1),b.p.deepempty)$("#"+$.jgrid.jqID(b.p.id)+" tbody:first tr:gt(0)").remove();else{var c=$("#"+$.jgrid.jqID(b.p.id)+" tbody:first tr:first")[0];$("#"+$.jgrid.jqID(b.p.id)+" tbody:first").empty().append(c)}b.p.footerrow&&a&&$(".ui-jqgrid-ftable td",b.grid.sDiv).html("&#160;"),b.p.selrow=null,b.p.selarrrow=[],b.p.savedRow=[],b.p.records=0,b.p.page=1,b.p.lastpage=0,b.p.reccount=0,b.p.data=[],b.p._index={},b.updatepager(!0,!1)}})},getInd:function(a,b){var c,d=!1;
return this.each(function(){c=$(this).jqGrid("getGridRowById",a),c&&(d=b===!0?c:c.rowIndex)}),d},bindKeys:function(a){var b=$.extend({onEnter:null,onSpace:null,onLeftKey:null,onRightKey:null,scrollingRows:!0},a||{});return this.each(function(){var a=this;$("body").is("[role]")||$("body").attr("role","application"),a.p.scrollrows=b.scrollingRows,$(a).keydown(function(c){var d,e,f,g=$(a).find("tr[tabindex=0]")[0],h=a.p.treeReader.expanded_field;if(g)if(f=a.p._index[$.jgrid.stripPref(a.p.idPrefix,g.id)],37===c.keyCode||38===c.keyCode||39===c.keyCode||40===c.keyCode){if(38===c.keyCode){if(e=g.previousSibling,d="",e)if($(e).is(":hidden")){for(;e;)if(e=e.previousSibling,!$(e).is(":hidden")&&$(e).hasClass("jqgrow")){d=e.id;break}}else d=e.id;$(a).jqGrid("setSelection",d,!0,c),c.preventDefault()}if(40===c.keyCode){if(e=g.nextSibling,d="",e)if($(e).is(":hidden")){for(;e;)if(e=e.nextSibling,!$(e).is(":hidden")&&$(e).hasClass("jqgrow")){d=e.id;break}}else d=e.id;$(a).jqGrid("setSelection",d,!0,c),c.preventDefault()}37===c.keyCode&&(a.p.treeGrid&&a.p.data[f][h]&&$(g).find("div.treeclick").trigger("click"),$(a).triggerHandler("jqGridKeyLeft",[a.p.selrow]),$.isFunction(b.onLeftKey)&&b.onLeftKey.call(a,a.p.selrow)),39===c.keyCode&&(a.p.treeGrid&&!a.p.data[f][h]&&$(g).find("div.treeclick").trigger("click"),$(a).triggerHandler("jqGridKeyRight",[a.p.selrow]),$.isFunction(b.onRightKey)&&b.onRightKey.call(a,a.p.selrow))}else 13===c.keyCode?($(a).triggerHandler("jqGridKeyEnter",[a.p.selrow]),$.isFunction(b.onEnter)&&b.onEnter.call(a,a.p.selrow)):32===c.keyCode&&($(a).triggerHandler("jqGridKeySpace",[a.p.selrow]),$.isFunction(b.onSpace)&&b.onSpace.call(a,a.p.selrow))})})},unbindKeys:function(){return this.each(function(){$(this).unbind("keydown")})},getLocalRow:function(a){var b,c=!1;return this.each(function(){void 0!==a&&(b=this.p._index[$.jgrid.stripPref(this.p.idPrefix,a)],b>=0&&(c=this.p.data[b]))}),c},progressBar:function(a){return a=$.extend({htmlcontent:"",method:"hide",loadtype:"disable"},a||{}),this.each(function(){var b,c,d="show"===a.method?!0:!1,e=$("#load_"+$.jgrid.jqID(this.p.id)),f=$(window).scrollTop();switch(""!==a.htmlcontent&&e.html(a.htmlcontent),a.loadtype){case"disable":break;case"enable":e.toggle(d);break;case"block":$("#lui_"+$.jgrid.jqID(this.p.id)).toggle(d),e.toggle(d)}e.is(":visible")&&(b=e.offsetParent(),e.css("top",""),e.offset().top<f&&(c=Math.min(10+f-b.offset().top,b.height()-e.height()),e.css("top",c+"px")))})},getColProp:function(a){var b={},c=this[0];if(!c.grid)return!1;var d,e=c.p.colModel;for(d=0;d<e.length;d++)if(e[d].name===a){b=e[d];break}return b},setColProp:function(a,b){return this.each(function(){if(this.grid&&b){var c,d=this.p.colModel;for(c=0;c<d.length;c++)if(d[c].name===a){$.extend(!0,this.p.colModel[c],b);break}}})},sortGrid:function(a,b,c){return this.each(function(){var d,e=this,f=-1,g=!1;if(e.grid){for(a||(a=e.p.sortname),d=0;d<e.p.colModel.length;d++)if(e.p.colModel[d].index===a||e.p.colModel[d].name===a){f=d,e.p.frozenColumns===!0&&e.p.colModel[d].frozen===!0&&(g=e.grid.fhDiv.find("#"+e.p.id+"_"+a));break}if(-1!==f){var h=e.p.colModel[f].sortable;g||(g=e.grid.headers[f].el),"boolean"!=typeof h&&(h=!0),"boolean"!=typeof b&&(b=!1),h&&e.sortData("jqgh_"+e.p.id+"_"+a,f,b,c,g)}}})},setGridState:function(a){return this.each(function(){if(this.grid){var b=this,c=$(this).jqGrid("getStyleUI",this.p.styleUI+".base","icon_caption_open",!0),d=$(this).jqGrid("getStyleUI",this.p.styleUI+".base","icon_caption_close",!0);"hidden"===a?($(".ui-jqgrid-bdiv, .ui-jqgrid-hdiv","#gview_"+$.jgrid.jqID(b.p.id)).slideUp("fast"),b.p.pager&&$(b.p.pager).slideUp("fast"),b.p.toppager&&$(b.p.toppager).slideUp("fast"),b.p.toolbar[0]===!0&&("both"===b.p.toolbar[1]&&$(b.grid.ubDiv).slideUp("fast"),$(b.grid.uDiv).slideUp("fast")),b.p.footerrow&&$(".ui-jqgrid-sdiv","#gbox_"+$.jgrid.jqID(b.p.id)).slideUp("fast"),$(".ui-jqgrid-headlink",b.grid.cDiv).removeClass(c).addClass(d),b.p.gridstate="hidden"):"visible"===a&&($(".ui-jqgrid-hdiv, .ui-jqgrid-bdiv","#gview_"+$.jgrid.jqID(b.p.id)).slideDown("fast"),b.p.pager&&$(b.p.pager).slideDown("fast"),b.p.toppager&&$(b.p.toppager).slideDown("fast"),b.p.toolbar[0]===!0&&("both"===b.p.toolbar[1]&&$(b.grid.ubDiv).slideDown("fast"),$(b.grid.uDiv).slideDown("fast")),b.p.footerrow&&$(".ui-jqgrid-sdiv","#gbox_"+$.jgrid.jqID(b.p.id)).slideDown("fast"),$(".ui-jqgrid-headlink",b.grid.cDiv).removeClass(d).addClass(c),b.p.gridstate="visible")}})},setFrozenColumns:function(){return this.each(function(){if(this.grid){var a=this,b=a.p.colModel,c=0,d=b.length,e=-1,f=!1,g=$(a).jqGrid("getStyleUI",a.p.styleUI+".base","headerDiv",!0,"ui-jqgrid-hdiv"),h=$(a).jqGrid("getStyleUI",a.p.styleUI+".common","hover",!0);if(a.p.subGrid!==!0&&a.p.treeGrid!==!0&&a.p.cellEdit!==!0&&!a.p.sortable&&!a.p.scroll){for(a.p.rownumbers&&c++,a.p.multiselect&&c++;d>c&&b[c].frozen===!0;)f=!0,e=c,c++;if(e>=0&&f){var i=a.p.caption?$(a.grid.cDiv).outerHeight():0,j=$(".ui-jqgrid-htable","#gview_"+$.jgrid.jqID(a.p.id)).height();a.p.toppager&&(i+=$(a.grid.topDiv).outerHeight()),a.p.toolbar[0]===!0&&"bottom"!==a.p.toolbar[1]&&(i+=$(a.grid.uDiv).outerHeight()),a.grid.fhDiv=$('<div style="position:absolute;'+("rtl"===a.p.direction?"right:0;":"left:0;")+"top:"+i+"px;height:"+j+'px;" class="frozen-div '+g+'"></div>'),a.grid.fbDiv=$('<div style="position:absolute;'+("rtl"===a.p.direction?"right:0;":"left:0;")+"top:"+(parseInt(i,10)+parseInt(j,10)+1)+'px;overflow-y:hidden" class="frozen-bdiv ui-jqgrid-bdiv"></div>'),$("#gview_"+$.jgrid.jqID(a.p.id)).append(a.grid.fhDiv);var k=$(".ui-jqgrid-htable","#gview_"+$.jgrid.jqID(a.p.id)).clone(!0);if(a.p.groupHeader){$("tr.jqg-first-row-header, tr.jqg-third-row-header",k).each(function(){$("th:gt("+e+")",this).remove()});var l,m,n=-1,o=-1;$("tr.jqg-second-row-header th",k).each(function(){return l=parseInt($(this).attr("colspan"),10),m=parseInt($(this).attr("rowspan"),10),m&&(n++,o++),l&&(n+=l,o++),n===e?(o=e,!1):void 0}),n!==e&&(o=e),$("tr.jqg-second-row-header",k).each(function(){$("th:gt("+o+")",this).remove()})}else $("tr",k).each(function(){$("th:gt("+e+")",this).remove()});if($(k).width(1),$(a.grid.fhDiv).append(k).mousemove(function(b){return a.grid.resizing?(a.grid.dragMove(b),!1):void 0}),a.p.footerrow){var p=$(".ui-jqgrid-bdiv","#gview_"+$.jgrid.jqID(a.p.id)).height();a.grid.fsDiv=$('<div style="position:absolute;left:0px;top:'+(parseInt(i,10)+parseInt(j,10)+parseInt(p,10)+1)+'px;" class="frozen-sdiv ui-jqgrid-sdiv"></div>'),$("#gview_"+$.jgrid.jqID(a.p.id)).append(a.grid.fsDiv);var q=$(".ui-jqgrid-ftable","#gview_"+$.jgrid.jqID(a.p.id)).clone(!0);$("tr",q).each(function(){$("td:gt("+e+")",this).remove()}),$(q).width(1),$(a.grid.fsDiv).append(q)}$(a).bind("jqGridResizeStop.setFrozenColumns",function(b,c,d){var e=$(".ui-jqgrid-htable",a.grid.fhDiv);$("th:eq("+d+")",e).width(c);var f=$(".ui-jqgrid-btable",a.grid.fbDiv);if($("tr:first td:eq("+d+")",f).width(c),a.p.footerrow){var g=$(".ui-jqgrid-ftable",a.grid.fsDiv);$("tr:first td:eq("+d+")",g).width(c)}}),$("#gview_"+$.jgrid.jqID(a.p.id)).append(a.grid.fbDiv),$(a.grid.fbDiv).bind("mousewheel DOMMouseScroll",function(b){var c=$(a.grid.bDiv).scrollTop();$(a.grid.bDiv).scrollTop(b.originalEvent.wheelDelta>0||b.originalEvent.detail<0?c-25:c+25),b.preventDefault()}),a.p.hoverrows===!0&&$("#"+$.jgrid.jqID(a.p.id)).unbind("mouseover").unbind("mouseout"),$(a).bind("jqGridAfterGridComplete.setFrozenColumns",function(){$("#"+$.jgrid.jqID(a.p.id)+"_frozen").remove(),$(a.grid.fbDiv).height($(a.grid.bDiv).height()-16);var b=$("#"+$.jgrid.jqID(a.p.id)).clone(!0);$("tr[role=row]",b).each(function(){$("td[role=gridcell]:gt("+e+")",this).remove()}),$(b).width(1).attr("id",a.p.id+"_frozen"),$(a.grid.fbDiv).append(b),a.p.hoverrows===!0&&($("tr.jqgrow",b).hover(function(){$(this).addClass(h),$("#"+$.jgrid.jqID(this.id),"#"+$.jgrid.jqID(a.p.id)).addClass(h)},function(){$(this).removeClass(h),$("#"+$.jgrid.jqID(this.id),"#"+$.jgrid.jqID(a.p.id)).removeClass(h)}),$("tr.jqgrow","#"+$.jgrid.jqID(a.p.id)).hover(function(){$(this).addClass(h),$("#"+$.jgrid.jqID(this.id),"#"+$.jgrid.jqID(a.p.id)+"_frozen").addClass(h)},function(){$(this).removeClass(h),$("#"+$.jgrid.jqID(this.id),"#"+$.jgrid.jqID(a.p.id)+"_frozen").removeClass(h)})),b=null}),a.grid.hDiv.loading||$(a).triggerHandler("jqGridAfterGridComplete"),a.p.frozenColumns=!0}}}})},destroyFrozenColumns:function(){return this.each(function(){if(this.grid&&this.p.frozenColumns===!0){var a=this,b=$(a).jqGrid("getStyleUI",a.p.styleUI+".common","hover",!0);if($(a.grid.fhDiv).remove(),$(a.grid.fbDiv).remove(),a.grid.fhDiv=null,a.grid.fbDiv=null,a.p.footerrow&&($(a.grid.fsDiv).remove(),a.grid.fsDiv=null),$(this).unbind(".setFrozenColumns"),a.p.hoverrows===!0){var c;$("#"+$.jgrid.jqID(a.p.id)).bind("mouseover",function(a){c=$(a.target).closest("tr.jqgrow"),"ui-subgrid"!==$(c).attr("class")&&$(c).addClass(b)}).bind("mouseout",function(a){c=$(a.target).closest("tr.jqgrow"),$(c).removeClass(b)})}this.p.frozenColumns=!1}})},resizeColumn:function(a,b){return this.each(function(){var c,d,e,f=this.grid,g=this.p,h=g.colModel,i=h.length;if("string"==typeof a){for(c=0;i>c;c++)if(h[c].name===a){a=c;break}}else a=parseInt(a,10);if(b=parseInt(b,10),!("number"!=typeof a||0>a||a>h.length-1||"number"!=typeof b||b<g.minColWidth)){if(g.forceFit)for(g.nv=0,c=a+1;i>c;c++)if(h[c].hidden!==!0){g.nv=c-a;break}if(f.resizing={idx:a},d=b-f.headers[a].width,g.forceFit){if(e=f.headers[a+g.nv].width-d,e<g.minColWidth)return;f.headers[a+g.nv].newWidth=f.headers[a+g.nv].width-d}f.newWidth=g.tblwidth+d,f.headers[a].newWidth=b,f.dragEnd(!1)}})},getStyleUI:function(a,b,c,d){try{var e="",f=a.split("."),g="";switch(c||(e="class=",g='"'),null==d&&(d=""),f.length){case 1:e+=g+d+" "+$.jgrid.styleUI[f[0]][b]+g;break;case 2:e+=g+d+" "+$.jgrid.styleUI[f[0]][f[1]][b]+g}}catch(h){e=""}return $.trim(e)},resizeGrid:function(a){return this.each(function(){var b=this;void 0===a&&(a=500),setTimeout(function(){var a=$(window).width(),c=$("#gbox_"+$.jgrid.jqID(b.p.id)).parent().width(),d=b.p.width;d=a-c>3?c:a,$("#"+$.jgrid.jqID(b.p.id)).jqGrid("setGridWidth",d)},a)})}}),$.jgrid.extend({editCell:function(a,b,c){return this.each(function(){var d,e,f,g,h=this,i=$(this).jqGrid("getStyleUI",h.p.styleUI+".common","highlight",!0),j=$(this).jqGrid("getStyleUI",h.p.styleUI+".common","hover",!0),k=$(this).jqGrid("getStyleUI",h.p.styleUI+".celledit","inputClass",!0);if(h.grid&&h.p.cellEdit===!0){if(b=parseInt(b,10),h.p.selrow=h.rows[a].id,h.p.knv||$(h).jqGrid("GridNav"),h.p.savedRow.length>0){if(c===!0&&a==h.p.iRow&&b==h.p.iCol)return;$(h).jqGrid("saveCell",h.p.savedRow[0].id,h.p.savedRow[0].ic)}else window.setTimeout(function(){$("#"+$.jgrid.jqID(h.p.knv)).attr("tabindex","-1").focus()},1);if(g=h.p.colModel[b],d=g.name,"subgrid"!==d&&"cb"!==d&&"rn"!==d){if(f=$("td:eq("+b+")",h.rows[a]),g.editable!==!0||c!==!0||f.hasClass("not-editable-cell")||$.isFunction(h.p.isCellEditable)&&!h.p.isCellEditable.call(h,d,a,b))parseInt(h.p.iCol,10)>=0&&parseInt(h.p.iRow,10)>=0&&$(h.rows[h.p.iRow]).removeClass("selected-row "+j).find("td:eq("+h.p.iCol+")").removeClass("edit-cell "+i),f.addClass("edit-cell "+i),$(h.rows[a]).addClass("selected-row "+j),e=f.html().replace(/\&#160\;/gi,""),$(h).triggerHandler("jqGridSelectCell",[h.rows[a].id,d,e,a,b]),$.isFunction(h.p.onSelectCell)&&h.p.onSelectCell.call(h,h.rows[a].id,d,e,a,b);else{parseInt(h.p.iCol,10)>=0&&parseInt(h.p.iRow,10)>=0&&$(h.rows[h.p.iRow]).removeClass("selected-row "+j).find("td:eq("+h.p.iCol+")").removeClass("edit-cell "+i),$(f).addClass("edit-cell "+i),$(h.rows[a]).addClass("selected-row "+j);try{e=$.unformat.call(h,f,{rowId:h.rows[a].id,colModel:g},b)}catch(l){e=g.edittype&&"textarea"===g.edittype?$(f).text():$(f).html()}if(h.p.autoencode&&(e=$.jgrid.htmlDecode(e)),g.edittype||(g.edittype="text"),h.p.savedRow.push({id:a,ic:b,name:d,v:e}),("&nbsp;"===e||"&#160;"===e||1===e.length&&160===e.charCodeAt(0))&&(e=""),$.isFunction(h.p.formatCell)){var m=h.p.formatCell.call(h,h.rows[a].id,d,e,a,b);void 0!==m&&(e=m)}$(h).triggerHandler("jqGridBeforeEditCell",[h.rows[a].id,d,e,a,b]),$.isFunction(h.p.beforeEditCell)&&h.p.beforeEditCell.call(h,h.rows[a].id,d,e,a,b);var n=$.extend({},g.editoptions||{},{id:a+"_"+d,name:d,rowId:h.rows[a].id,oper:"edit"}),o=$.jgrid.createEl.call(h,g.edittype,n,e,!0,$.extend({},$.jgrid.ajaxOptions,h.p.ajaxSelectOptions||{}));$.inArray(g.edittype,["text","textarea","password","select"])>-1&&$(o).addClass(k),$(f).html("").append(o).attr("tabindex","0"),$.jgrid.bindEv.call(h,o,n),window.setTimeout(function(){$(o).focus()},1),$("input, select, textarea",f).bind("keydown",function(c){if(27===c.keyCode&&($("input.hasDatepicker",f).length>0?$(".ui-datepicker").is(":hidden")?$(h).jqGrid("restoreCell",a,b):$("input.hasDatepicker",f).datepicker("hide"):$(h).jqGrid("restoreCell",a,b)),13===c.keyCode&&!c.shiftKey)return $(h).jqGrid("saveCell",a,b),!1;if(9===c.keyCode){if(h.grid.hDiv.loading)return!1;c.shiftKey?$(h).jqGrid("prevCell",a,b):$(h).jqGrid("nextCell",a,b)}c.stopPropagation()}),$(h).triggerHandler("jqGridAfterEditCell",[h.rows[a].id,d,e,a,b]),$.isFunction(h.p.afterEditCell)&&h.p.afterEditCell.call(h,h.rows[a].id,d,e,a,b)}h.p.iCol=b,h.p.iRow=a}}})},saveCell:function(a,b){return this.each(function(){var c,d=this,e=$.jgrid.getRegional(this,"errors"),f=$.jgrid.getRegional(this,"edit");if(d.grid&&d.p.cellEdit===!0){if(c=d.p.savedRow.length>=1?0:null,null!==c){var g,h,i=$("td:eq("+b+")",d.rows[a]),j=d.p.colModel[b],k=j.name,l=$.jgrid.jqID(k);switch(j.edittype){case"select":if(j.editoptions.multiple){var m=$("#"+a+"_"+l,d.rows[a]),n=[];g=$(m).val(),g?g.join(","):g="",$("option:selected",m).each(function(a,b){n[a]=$(b).text()}),h=n.join(",")}else g=$("#"+a+"_"+l+" option:selected",d.rows[a]).val(),h=$("#"+a+"_"+l+" option:selected",d.rows[a]).text();j.formatter&&(h=g);break;case"checkbox":var o=["Yes","No"];j.editoptions&&(o=j.editoptions.value.split(":")),g=$("#"+a+"_"+l,d.rows[a]).is(":checked")?o[0]:o[1],h=g;break;case"password":case"text":case"textarea":case"button":g=$("#"+a+"_"+l,d.rows[a]).val(),h=g;break;case"custom":try{if(!j.editoptions||!$.isFunction(j.editoptions.custom_value))throw"e1";if(g=j.editoptions.custom_value.call(d,$(".customelement",i),"get"),void 0===g)throw"e2";h=g}catch(p){"e1"===p?$.jgrid.info_dialog(e.errcap,"function 'custom_value' "+f.msg.nodefined,f.bClose,{styleUI:d.p.styleUI}):"e2"===p?$.jgrid.info_dialog(e.errcap,"function 'custom_value' "+f.msg.novalue,f.bClose,{styleUI:d.p.styleUI}):$.jgrid.info_dialog(e.errcap,p.message,f.bClose,{styleUI:d.p.styleUI})}}if(h!==d.p.savedRow[c].v){var q=$(d).triggerHandler("jqGridBeforeSaveCell",[d.rows[a].id,k,g,a,b]);if(q&&(g=q,h=q),$.isFunction(d.p.beforeSaveCell)){var r=d.p.beforeSaveCell.call(d,d.rows[a].id,k,g,a,b);r&&(g=r,h=r)}var s=$.jgrid.checkValues.call(d,g,b);if(s[0]===!0){var t=$(d).triggerHandler("jqGridBeforeSubmitCell",[d.rows[a].id,k,g,a,b])||{};if($.isFunction(d.p.beforeSubmitCell)&&(t=d.p.beforeSubmitCell.call(d,d.rows[a].id,k,g,a,b),t||(t={})),$("input.hasDatepicker",i).length>0&&$("input.hasDatepicker",i).datepicker("hide"),"remote"===d.p.cellsubmit)if(d.p.cellurl){var u={};d.p.autoencode&&(g=$.jgrid.htmlEncode(g)),u[k]=g;var v,w,x;x=d.p.prmNames,v=x.id,w=x.oper,u[v]=$.jgrid.stripPref(d.p.idPrefix,d.rows[a].id),u[w]=x.editoper,u=$.extend(t,u),$(d).jqGrid("progressBar",{method:"show",loadtype:d.p.loadui,htmlcontent:$.jgrid.getRegional(d,"defaults.savetext")}),d.grid.hDiv.loading=!0,$.ajax($.extend({url:d.p.cellurl,data:$.isFunction(d.p.serializeCellData)?d.p.serializeCellData.call(d,u):u,type:"POST",complete:function(c,j){if($(d).jqGrid("progressBar",{method:"hide",loadtype:d.p.loadui}),d.grid.hDiv.loading=!1,"success"===j){var l=$(d).triggerHandler("jqGridAfterSubmitCell",[d,c,u.id,k,g,a,b])||[!0,""];l[0]===!0&&$.isFunction(d.p.afterSubmitCell)&&(l=d.p.afterSubmitCell.call(d,c,u.id,k,g,a,b)),l[0]===!0?($(i).empty(),$(d).jqGrid("setCell",d.rows[a].id,b,h,!1,!1,!0),$(i).addClass("dirty-cell"),$(d.rows[a]).addClass("edited"),$(d).triggerHandler("jqGridAfterSaveCell",[d.rows[a].id,k,g,a,b]),$.isFunction(d.p.afterSaveCell)&&d.p.afterSaveCell.call(d,d.rows[a].id,k,g,a,b),d.p.savedRow.splice(0,1)):($.jgrid.info_dialog(e.errcap,l[1],f.bClose,{styleUI:d.p.styleUI}),$(d).jqGrid("restoreCell",a,b))}},error:function(c,g,h){$("#lui_"+$.jgrid.jqID(d.p.id)).hide(),d.grid.hDiv.loading=!1,$(d).triggerHandler("jqGridErrorCell",[c,g,h]),$.isFunction(d.p.errorCell)?(d.p.errorCell.call(d,c,g,h),$(d).jqGrid("restoreCell",a,b)):($.jgrid.info_dialog(e.errcap,c.status+" : "+c.statusText+"<br/>"+g,f.bClose,{styleUI:d.p.styleUI}),$(d).jqGrid("restoreCell",a,b))}},$.jgrid.ajaxOptions,d.p.ajaxCellOptions||{}))}else try{$.jgrid.info_dialog(e.errcap,e.nourl,f.bClose,{styleUI:d.p.styleUI}),$(d).jqGrid("restoreCell",a,b)}catch(p){}"clientArray"===d.p.cellsubmit&&($(i).empty(),$(d).jqGrid("setCell",d.rows[a].id,b,h,!1,!1,!0),$(i).addClass("dirty-cell"),$(d.rows[a]).addClass("edited"),$(d).triggerHandler("jqGridAfterSaveCell",[d.rows[a].id,k,g,a,b]),$.isFunction(d.p.afterSaveCell)&&d.p.afterSaveCell.call(d,d.rows[a].id,k,g,a,b),d.p.savedRow.splice(0,1))}else try{window.setTimeout(function(){$.jgrid.info_dialog(e.errcap,g+" "+s[1],f.bClose,{styleUI:d.p.styleUI})},100),$(d).jqGrid("restoreCell",a,b)}catch(p){}}else $(d).jqGrid("restoreCell",a,b)}window.setTimeout(function(){$("#"+$.jgrid.jqID(d.p.knv)).attr("tabindex","-1").focus()},0)}})},restoreCell:function(a,b){return this.each(function(){var c,d=this;if(d.grid&&d.p.cellEdit===!0){if(c=d.p.savedRow.length>=1?0:null,null!==c){var e=$("td:eq("+b+")",d.rows[a]);if($.isFunction($.fn.datepicker))try{$("input.hasDatepicker",e).datepicker("hide")}catch(f){}$(e).empty().attr("tabindex","-1"),$(d).jqGrid("setCell",d.rows[a].id,b,d.p.savedRow[c].v,!1,!1,!0),$(d).triggerHandler("jqGridAfterRestoreCell",[d.rows[a].id,d.p.savedRow[c].v,a,b]),$.isFunction(d.p.afterRestoreCell)&&d.p.afterRestoreCell.call(d,d.rows[a].id,d.p.savedRow[c].v,a,b),d.p.savedRow.splice(0,1)}window.setTimeout(function(){$("#"+d.p.knv).attr("tabindex","-1").focus()},0)}})},nextCell:function(a,b){return this.each(function(){var c,d=this,e=!1;if(d.grid&&d.p.cellEdit===!0){for(c=b+1;c<d.p.colModel.length;c++)if(d.p.colModel[c].editable===!0&&(!$.isFunction(d.p.isCellEditable)||d.p.isCellEditable.call(d,d.p.colModel[c].name,a,c))){e=c;break}e!==!1?$(d).jqGrid("editCell",a,e,!0):d.p.savedRow.length>0&&$(d).jqGrid("saveCell",a,b)}})},prevCell:function(a,b){return this.each(function(){var c,d=this,e=!1;if(d.grid&&d.p.cellEdit===!0){for(c=b-1;c>=0;c--)if(d.p.colModel[c].editable===!0&&(!$.isFunction(d.p.isCellEditable)||d.p.isCellEditable.call(d,d.p.colModel[c].name,a,c))){e=c;break}e!==!1?$(d).jqGrid("editCell",a,e,!0):d.p.savedRow.length>0&&$(d).jqGrid("saveCell",a,b)}})},GridNav:function(){return this.each(function(){function a(a,b,d){if("v"===d.substr(0,1)){var e=$(c.grid.bDiv)[0].clientHeight,f=$(c.grid.bDiv)[0].scrollTop,g=c.rows[a].offsetTop+c.rows[a].clientHeight,h=c.rows[a].offsetTop;"vd"===d&&g>=e&&($(c.grid.bDiv)[0].scrollTop=$(c.grid.bDiv)[0].scrollTop+c.rows[a].clientHeight),"vu"===d&&f>h&&($(c.grid.bDiv)[0].scrollTop=$(c.grid.bDiv)[0].scrollTop-c.rows[a].clientHeight)}if("h"===d){var i=$(c.grid.bDiv)[0].clientWidth,j=$(c.grid.bDiv)[0].scrollLeft,k=c.rows[a].cells[b].offsetLeft+c.rows[a].cells[b].clientWidth,l=c.rows[a].cells[b].offsetLeft;k>=i+parseInt(j,10)?$(c.grid.bDiv)[0].scrollLeft=$(c.grid.bDiv)[0].scrollLeft+c.rows[a].cells[b].clientWidth:j>l&&($(c.grid.bDiv)[0].scrollLeft=$(c.grid.bDiv)[0].scrollLeft-c.rows[a].cells[b].clientWidth)}}function b(a,b){var d,e;if("lft"===b)for(d=a+1,e=a;e>=0;e--)if(c.p.colModel[e].hidden!==!0){d=e;break}if("rgt"===b)for(d=a-1,e=a;e<c.p.colModel.length;e++)if(c.p.colModel[e].hidden!==!0){d=e;break}return d}var c=this;if(c.grid&&c.p.cellEdit===!0){c.p.knv=c.p.id+"_kn";var d,e,f=$("<div style='position:fixed;top:0px;width:1px;height:1px;' tabindex='0'><div tabindex='-1' style='width:1px;height:1px;' id='"+c.p.knv+"'></div></div>");$(f).insertBefore(c.grid.cDiv),$("#"+c.p.knv).focus().keydown(function(f){switch(e=f.keyCode,"rtl"===c.p.direction&&(37===e?e=39:39===e&&(e=37)),e){case 38:c.p.iRow-1>0&&(a(c.p.iRow-1,c.p.iCol,"vu"),$(c).jqGrid("editCell",c.p.iRow-1,c.p.iCol,!1));break;case 40:c.p.iRow+1<=c.rows.length-1&&(a(c.p.iRow+1,c.p.iCol,"vd"),$(c).jqGrid("editCell",c.p.iRow+1,c.p.iCol,!1));break;case 37:c.p.iCol-1>=0&&(d=b(c.p.iCol-1,"lft"),a(c.p.iRow,d,"h"),$(c).jqGrid("editCell",c.p.iRow,d,!1));break;case 39:c.p.iCol+1<=c.p.colModel.length-1&&(d=b(c.p.iCol+1,"rgt"),a(c.p.iRow,d,"h"),$(c).jqGrid("editCell",c.p.iRow,d,!1));break;case 13:parseInt(c.p.iCol,10)>=0&&parseInt(c.p.iRow,10)>=0&&$(c).jqGrid("editCell",c.p.iRow,c.p.iCol,!0);break;default:return!0}return!1})}})},getChangedCells:function(a){var b=[];return a||(a="all"),this.each(function(){var c,d=this;d.grid&&d.p.cellEdit===!0&&$(d.rows).each(function(e){var f={};$(this).hasClass("edited")&&($("td",this).each(function(b){if(c=d.p.colModel[b].name,"cb"!==c&&"subgrid"!==c)if("dirty"===a){if($(this).hasClass("dirty-cell"))try{f[c]=$.unformat.call(d,this,{rowId:d.rows[e].id,colModel:d.p.colModel[b]},b)}catch(g){f[c]=$.jgrid.htmlDecode($(this).html())}}else try{f[c]=$.unformat.call(d,this,{rowId:d.rows[e].id,colModel:d.p.colModel[b]},b)}catch(g){f[c]=$.jgrid.htmlDecode($(this).html())}}),f.id=this.id,b.push(f))})}),b}}),$.extend($.jgrid,{showModal:function(a){a.w.show()},closeModal:function(a){a.w.hide().attr("aria-hidden","true"),a.o&&a.o.remove()},hideModal:function(a,b){b=$.extend({jqm:!0,gb:"",removemodal:!1,formprop:!1,form:""},b||{});var c=b.gb&&"string"==typeof b.gb&&"#gbox_"===b.gb.substr(0,6)?$("#"+b.gb.substr(6))[0]:!1;if(b.onClose){var d=c?b.onClose.call(c,a):b.onClose(a);if("boolean"==typeof d&&!d)return}if(b.formprop&&c&&b.form){var e=$(a)[0].style.height,f=$(a)[0].style.width;e.indexOf("px")>-1&&(e=parseFloat(e)),f.indexOf("px")>-1&&(f=parseFloat(f));var g,h;"edit"===b.form?(g="#"+$.jgrid.jqID("FrmGrid_"+b.gb.substr(6)),h="formProp"):"view"===b.form&&(g="#"+$.jgrid.jqID("ViewGrid_"+b.gb.substr(6)),h="viewProp"),$(c).data(h,{top:parseFloat($(a).css("top")),left:parseFloat($(a).css("left")),width:f,height:e,dataheight:$(g).height(),datawidth:$(g).width()})}if($.fn.jqm&&b.jqm===!0)$(a).attr("aria-hidden","true").jqmHide();else{if(""!==b.gb)try{$(".jqgrid-overlay:first",b.gb).hide()}catch(i){}$(a).hide().attr("aria-hidden","true")}b.removemodal&&$(a).remove()},findPos:function(a){var b=0,c=0;if(a.offsetParent)do b+=a.offsetLeft,c+=a.offsetTop;while(a=a.offsetParent);return[b,c]},createModal:function(a,b,c,d,e,f,g){c=$.extend(!0,{},$.jgrid.jqModal||{},c);var h=this,i="rtl"===$(c.gbox).attr("dir")?!0:!1,j=$.jgrid.styleUI[c.styleUI||"jQueryUI"].modal,k=$.jgrid.styleUI[c.styleUI||"jQueryUI"].common,l=document.createElement("div");g=$.extend({},g||{}),l.className="ui-jqdialog "+j.modal,l.id=a.themodal;var m=document.createElement("div");m.className="ui-jqdialog-titlebar "+j.header,m.id=a.modalhead,$(m).append("<span class='ui-jqdialog-title'>"+c.caption+"</span>");var n=$("<a class='ui-jqdialog-titlebar-close "+k.cornerall+"'></a>").hover(function(){n.addClass(k.hover)},function(){n.removeClass(k.hover)}).append("<span class='"+k.icon_base+" "+j.icon_close+"'></span>");$(m).append(n),i?(l.dir="rtl",$(".ui-jqdialog-title",m).css("float","right"),$(".ui-jqdialog-titlebar-close",m).css("left","0.3em")):(l.dir="ltr",$(".ui-jqdialog-title",m).css("float","left"),$(".ui-jqdialog-titlebar-close",m).css("right","0.3em"));var o=document.createElement("div");$(o).addClass("ui-jqdialog-content "+j.content).attr("id",a.modalcontent),$(o).append(b),l.appendChild(o),$(l).prepend(m),f===!0?$("body").append(l):"string"==typeof f?$(f).append(l):$(l).insertBefore(d),$(l).css(g),void 0===c.jqModal&&(c.jqModal=!0);var p={};if($.fn.jqm&&c.jqModal===!0){if(0===c.left&&0===c.top&&c.overlay){var q=[];q=$.jgrid.findPos(e),c.left=q[0]+4,c.top=q[1]+4}p.top=c.top+"px",p.left=c.left}else(0!==c.left||0!==c.top)&&(p.left=c.left,p.top=c.top+"px");if($("a.ui-jqdialog-titlebar-close",m).click(function(){var b=$("#"+$.jgrid.jqID(a.themodal)).data("onClose")||c.onClose,d=$("#"+$.jgrid.jqID(a.themodal)).data("gbox")||c.gbox;return h.hideModal("#"+$.jgrid.jqID(a.themodal),{gb:d,jqm:c.jqModal,onClose:b,removemodal:c.removemodal||!1,formprop:!c.recreateForm||!1,form:c.form||""}),!1}),0!==c.width&&c.width||(c.width=300),0!==c.height&&c.height||(c.height=200),!c.zIndex){var r=$(d).parents("*[role=dialog]").filter(":first").css("z-index");c.zIndex=r?parseInt(r,10)+2:950}var s=0;if(i&&p.left&&!f&&(s=$(c.gbox).width()-(isNaN(c.width)?0:parseInt(c.width,10))-8,p.left=parseInt(p.left,10)+parseInt(s,10)),p.left&&(p.left+="px"),$(l).css($.extend({width:isNaN(c.width)?"auto":c.width+"px",height:isNaN(c.height)?"auto":c.height+"px",zIndex:c.zIndex,overflow:"hidden"},p)).attr({tabIndex:"-1",role:"dialog","aria-labelledby":a.modalhead,"aria-hidden":"true"}),void 0===c.drag&&(c.drag=!0),void 0===c.resize&&(c.resize=!0),c.drag)if($(m).css("cursor","move"),$.fn.jqDrag)$(l).jqDrag(m);else try{$(l).draggable({handle:$("#"+$.jgrid.jqID(m.id))})}catch(t){}if(c.resize)if($.fn.jqResize)$(l).append("<div class='jqResize "+j.resizable+" "+k.icon_base+" "+j.icon_resizable+"'></div>"),$("#"+$.jgrid.jqID(a.themodal)).jqResize(".jqResize",a.scrollelm?"#"+$.jgrid.jqID(a.scrollelm):!1);else try{$(l).resizable({handles:"se, sw",alsoResize:a.scrollelm?"#"+$.jgrid.jqID(a.scrollelm):!1})}catch(u){}c.closeOnEscape===!0&&$(l).keydown(function(b){if(27===b.which){var d=$("#"+$.jgrid.jqID(a.themodal)).data("onClose")||c.onClose;h.hideModal("#"+$.jgrid.jqID(a.themodal),{gb:c.gbox,jqm:c.jqModal,onClose:d,removemodal:c.removemodal||!1,formprop:!c.recreateForm||!1,form:c.form||""})}})},viewModal:function(a,b){if(b=$.extend({toTop:!0,overlay:10,modal:!1,overlayClass:"ui-widget-overlay",onShow:$.jgrid.showModal,onHide:$.jgrid.closeModal,gbox:"",jqm:!0,jqM:!0},b||{}),void 0===b.focusField&&(b.focusField=0),b.focusField="number"==typeof b.focusField&&b.focusField>=0?parseInt(b.focusField,10):"boolean"!=typeof b.focusField||b.focusField?0:!1,$.fn.jqm&&b.jqm===!0)b.jqM?$(a).attr("aria-hidden","false").jqm(b).jqmShow():$(a).attr("aria-hidden","false").jqmShow();else if(""!==b.gbox&&($(".jqgrid-overlay:first",b.gbox).show(),$(a).data("gbox",b.gbox)),$(a).show().attr("aria-hidden","false"),b.focusField>=0)try{$(":input:visible",a)[parseInt(b.focusField,10)].focus()}catch(c){}},info_dialog:function(a,b,c,d){var e={width:290,height:"auto",dataheight:"auto",drag:!0,resize:!1,left:250,top:170,zIndex:1e3,jqModal:!0,modal:!1,closeOnEscape:!0,align:"center",buttonalign:"center",buttons:[]};$.extend(!0,e,$.jgrid.jqModal||{},{caption:"<b>"+a+"</b>"},d||{});var f=e.jqModal,g=this,h=$.jgrid.styleUI[e.styleUI||"jQueryUI"].modal,i=$.jgrid.styleUI[e.styleUI||"jQueryUI"].common;$.fn.jqm&&!f&&(f=!1);var j,k="";if(e.buttons.length>0)for(j=0;j<e.buttons.length;j++)void 0===e.buttons[j].id&&(e.buttons[j].id="info_button_"+j),k+="<a id='"+e.buttons[j].id+"' class='fm-button "+i.button+"'>"+e.buttons[j].text+"</a>";var l=isNaN(e.dataheight)?e.dataheight:e.dataheight+"px",m="text-align:"+e.align+";",n="<div id='info_id'>";n+="<div id='infocnt' style='margin:0px;padding-bottom:1em;width:100%;overflow:auto;position:relative;height:"+l+";"+m+"'>"+b+"</div>",n+=c?"<div class='"+h.header+"' style='text-align:"+e.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'><a id='closedialog' class='fm-button "+i.button+"'>"+c+"</a>"+k+"</div>":""!==k?"<div class='"+h.header+"' style='text-align:"+e.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'>"+k+"</div>":"",n+="</div>";try{"false"===$("#info_dialog").attr("aria-hidden")&&$.jgrid.hideModal("#info_dialog",{jqm:f}),$("#info_dialog").remove()}catch(o){}$.jgrid.createModal({themodal:"info_dialog",modalhead:"info_head",modalcontent:"info_content",scrollelm:"infocnt"},n,e,"","",!0),k&&$.each(e.buttons,function(a){$("#"+$.jgrid.jqID(this.id),"#info_id").bind("click",function(){return e.buttons[a].onClick.call($("#info_dialog")),!1})}),$("#closedialog","#info_id").click(function(){return g.hideModal("#info_dialog",{jqm:f,onClose:$("#info_dialog").data("onClose")||e.onClose,gb:$("#info_dialog").data("gbox")||e.gbox}),!1}),$(".fm-button","#info_dialog").hover(function(){$(this).addClass(i.hover)},function(){$(this).removeClass(i.hover)}),$.isFunction(e.beforeOpen)&&e.beforeOpen(),$.jgrid.viewModal("#info_dialog",{onHide:function(a){a.w.hide().remove(),a.o&&a.o.remove()},modal:e.modal,jqm:f}),$.isFunction(e.afterOpen)&&e.afterOpen();try{$("#info_dialog").focus()}catch(p){}},bindEv:function(a,b){var c=this;$.isFunction(b.dataInit)&&b.dataInit.call(c,a,b),b.dataEvents&&$.each(b.dataEvents,function(){void 0!==this.data?$(a).bind(this.type,this.data,this.fn):$(a).bind(this.type,this.fn)})},createEl:function(a,b,c,d,e){function f(a,b,c){var d=["dataInit","dataEvents","dataUrl","buildSelect","sopt","searchhidden","defaultValue","attr","custom_element","custom_value","oper"];void 0!==c&&$.isArray(c)&&$.merge(d,c),$.each(b,function(b,c){-1===$.inArray(b,d)&&$(a).attr(b,c)}),b.hasOwnProperty("id")||$(a).attr("id",$.jgrid.randId())}var g="",h=this;switch(a){case"textarea":g=document.createElement("textarea"),d?b.cols||$(g).css({width:"98%"}):b.cols||(b.cols=20),b.rows||(b.rows=2),("&nbsp;"===c||"&#160;"===c||1===c.length&&160===c.charCodeAt(0))&&(c=""),g.value=c,f(g,b),$(g).attr({role:"textbox",multiline:"true"});break;case"checkbox":if(g=document.createElement("input"),g.type="checkbox",b.value){var i=b.value.split(":");c===i[0]&&(g.checked=!0,g.defaultChecked=!0),g.value=i[0],$(g).attr("offval",i[1])}else{var j=(c+"").toLowerCase();j.search(/(false|f|0|no|n|off|undefined)/i)<0&&""!==j?(g.checked=!0,g.defaultChecked=!0,g.value=c):g.value="on",$(g).attr("offval","off")}f(g,b,["value"]),$(g).attr("role","checkbox");break;case"select":g=document.createElement("select"),g.setAttribute("role","select");var k,l=[];if(b.multiple===!0?(k=!0,g.multiple="multiple",$(g).attr("aria-multiselectable","true")):k=!1,null!=b.dataUrl){var m=null,n=b.postData||e.postData;try{m=b.rowId}catch(o){}h.p&&h.p.idPrefix&&(m=$.jgrid.stripPref(h.p.idPrefix,m)),$.ajax($.extend({url:$.isFunction(b.dataUrl)?b.dataUrl.call(h,m,c,String(b.name)):b.dataUrl,type:"GET",dataType:"html",data:$.isFunction(n)?n.call(h,m,c,String(b.name)):n,context:{elem:g,options:b,vl:c},success:function(a){var b,c=[],d=this.elem,e=this.vl,g=$.extend({},this.options),i=g.multiple===!0,j=g.cacheUrlData===!0,k="",l=$.isFunction(g.buildSelect)?g.buildSelect.call(h,a):a;"string"==typeof l&&(l=$($.trim(l)).html()),l&&($(d).append(l),f(d,g,n?["postData"]:void 0),void 0===g.size&&(g.size=i?3:1),i?(c=e.split(","),c=$.map(c,function(a){return $.trim(a)})):c[0]=$.trim(e),setTimeout(function(){if($("option",d).each(function(a){b=$(this).text(),e=$(this).val()||b,j&&(k+=(0!==a?";":"")+e+":"+b),0===a&&d.multiple&&(this.selected=!1),$(this).attr("role","option"),($.inArray($.trim(b),c)>-1||$.inArray($.trim(e),c)>-1)&&(this.selected="selected")}),j)if("edit"===g.oper)$(h).jqGrid("setColProp",g.name,{editoptions:{buildSelect:null,dataUrl:null,value:k}});else if("search"===g.oper)$(h).jqGrid("setColProp",g.name,{searchoptions:{dataUrl:null,value:k}});else if("filter"===g.oper&&$("#fbox_"+h.p.id)[0].p){var a,f=$("#fbox_"+h.p.id)[0].p.columns;$.each(f,function(){return a=this.index||this.name,g.name===a?(this.searchoptions.dataUrl=null,this.searchoptions.value=k,!1):void 0})}$(h).triggerHandler("jqGridAddEditAfterSelectUrlComplete",[d])},0))}},e||{}))}else if(b.value){var p;void 0===b.size&&(b.size=k?3:1),k&&(l=c.split(","),l=$.map(l,function(a){return $.trim(a)})),"function"==typeof b.value&&(b.value=b.value());var q,r,s,t,u,v,w=void 0===b.separator?":":b.separator,x=void 0===b.delimiter?";":b.delimiter;if("string"==typeof b.value)for(q=b.value.split(x),p=0;p<q.length;p++)r=q[p].split(w),r.length>2&&(r[1]=$.map(r,function(a,b){return b>0?a:void 0
}).join(w)),s=document.createElement("option"),s.setAttribute("role","option"),s.value=r[0],s.innerHTML=r[1],g.appendChild(s),k||$.trim(r[0])!==$.trim(c)&&$.trim(r[1])!==$.trim(c)||(s.selected="selected"),k&&($.inArray($.trim(r[1]),l)>-1||$.inArray($.trim(r[0]),l)>-1)&&(s.selected="selected");else if("[object Array]"===Object.prototype.toString.call(b.value))for(t=b.value,p=0;p<t.length;p++)2===t[p].length&&(u=t[p][0],v=t[p][1],s=document.createElement("option"),s.setAttribute("role","option"),s.value=u,s.innerHTML=v,g.appendChild(s),k||$.trim(u)!==$.trim(c)&&$.trim(v)!==$.trim(c)||(s.selected="selected"),k&&($.inArray($.trim(v),l)>-1||$.inArray($.trim(u),l)>-1)&&(s.selected="selected"));else if("object"==typeof b.value){t=b.value;for(u in t)t.hasOwnProperty(u)&&(s=document.createElement("option"),s.setAttribute("role","option"),s.value=u,s.innerHTML=t[u],g.appendChild(s),k||$.trim(u)!==$.trim(c)&&$.trim(t[u])!==$.trim(c)||(s.selected="selected"),k&&($.inArray($.trim(t[u]),l)>-1||$.inArray($.trim(u),l)>-1)&&(s.selected="selected"))}f(g,b,["value"])}break;case"image":case"file":g=document.createElement("input"),g.type=a,f(g,b);break;case"custom":g=document.createElement("span");try{if(!$.isFunction(b.custom_element))throw"e1";var y=b.custom_element.call(h,c,b);if(!y)throw"e2";y=$(y).addClass("customelement").attr({id:b.id,name:b.name}),$(g).empty().append(y)}catch(o){var z=$.jgrid.getRegional(h,"errors"),A=$.jgrid.getRegional(h,"edit");"e1"===o?$.jgrid.info_dialog(z.errcap,"function 'custom_element' "+A.msg.nodefined,A.bClose,{styleUI:h.p.styleUI}):"e2"===o?$.jgrid.info_dialog(z.errcap,"function 'custom_element' "+A.msg.novalue,A.bClose,{styleUI:h.p.styleUI}):$.jgrid.info_dialog(z.errcap,"string"==typeof o?o:o.message,A.bClose,{styleUI:h.p.styleUI})}break;default:var B;B="button"===a?"button":"textbox",g=document.createElement("input"),g.type=a,g.value=c,f(g,b),"button"!==a&&(d?b.size||$(g).css({width:"96%"}):b.size||(b.size=20)),$(g).attr("role",B)}return g},checkDate:function(a,b){var c,d=function(a){return a%4!==0||a%100===0&&a%400!==0?28:29},e={};if(a=a.toLowerCase(),c=-1!==a.indexOf("/")?"/":-1!==a.indexOf("-")?"-":-1!==a.indexOf(".")?".":"/",a=a.split(c),b=b.split(c),3!==b.length)return!1;var f,g,h=-1,i=-1,j=-1;for(g=0;g<a.length;g++){var k=isNaN(b[g])?0:parseInt(b[g],10);e[a[g]]=k,f=a[g],-1!==f.indexOf("y")&&(h=g),-1!==f.indexOf("m")&&(j=g),-1!==f.indexOf("d")&&(i=g)}f="y"===a[h]||"yyyy"===a[h]?4:"yy"===a[h]?2:-1;var l,m=[0,31,29,31,30,31,30,31,31,30,31,30,31];return-1===h?!1:(l=e[a[h]].toString(),2===f&&1===l.length&&(f=1),l.length!==f||0===e[a[h]]&&"00"!==b[h]?!1:-1===j?!1:(l=e[a[j]].toString(),l.length<1||e[a[j]]<1||e[a[j]]>12?!1:-1===i?!1:(l=e[a[i]].toString(),l.length<1||e[a[i]]<1||e[a[i]]>31||2===e[a[j]]&&e[a[i]]>d(e[a[h]])||e[a[i]]>m[e[a[j]]]?!1:!0)))},isEmpty:function(a){return a.match(/^\s+$/)||""===a?!0:!1},checkTime:function(a){var b,c=/^(\d{1,2}):(\d{2})([apAP][Mm])?$/;if(!$.jgrid.isEmpty(a)){if(b=a.match(c),!b)return!1;if(b[3]){if(b[1]<1||b[1]>12)return!1}else if(b[1]>23)return!1;if(b[2]>59)return!1}return!0},checkValues:function(a,b,c,d){var e,f,g,h,i,j,k=this,l=k.p.colModel,m=$.jgrid.getRegional(this,"edit.msg");if(void 0===c)if("string"==typeof b){for(f=0,i=l.length;i>f;f++)if(l[f].name===b){e=l[f].editrules,b=f,null!=l[f].formoptions&&(g=l[f].formoptions.label);break}}else b>=0&&(e=l[b].editrules);else e=c,g=void 0===d?"_":d;if(e){if(g||(g=null!=k.p.colNames?k.p.colNames[b]:l[b].label),e.required===!0&&$.jgrid.isEmpty(a))return[!1,g+": "+m.required,""];var n=e.required===!1?!1:!0;if(e.number===!0&&(n!==!1||!$.jgrid.isEmpty(a))&&isNaN(a))return[!1,g+": "+m.number,""];if(void 0!==e.minValue&&!isNaN(e.minValue)&&parseFloat(a)<parseFloat(e.minValue))return[!1,g+": "+m.minValue+" "+e.minValue,""];if(void 0!==e.maxValue&&!isNaN(e.maxValue)&&parseFloat(a)>parseFloat(e.maxValue))return[!1,g+": "+m.maxValue+" "+e.maxValue,""];var o;if(e.email===!0&&!(n===!1&&$.jgrid.isEmpty(a)||(o=/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,o.test(a))))return[!1,g+": "+m.email,""];if(e.integer===!0&&(n!==!1||!$.jgrid.isEmpty(a))){if(isNaN(a))return[!1,g+": "+m.integer,""];if(a%1!==0||-1!==a.indexOf("."))return[!1,g+": "+m.integer,""]}if(e.date===!0&&!(n===!1&&$.jgrid.isEmpty(a)||(l[b].formatoptions&&l[b].formatoptions.newformat?(h=l[b].formatoptions.newformat,j=$.jgrid.getRegional(k,"formatter.date.masks"),j&&j.hasOwnProperty(h)&&(h=j[h])):h=l[b].datefmt||"Y-m-d",$.jgrid.checkDate(h,a))))return[!1,g+": "+m.date+" - "+h,""];if(e.time===!0&&!(n===!1&&$.jgrid.isEmpty(a)||$.jgrid.checkTime(a)))return[!1,g+": "+m.date+" - hh:mm (am/pm)",""];if(e.url===!0&&!(n===!1&&$.jgrid.isEmpty(a)||(o=/^(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i,o.test(a))))return[!1,g+": "+m.url,""];if(e.custom===!0&&(n!==!1||!$.jgrid.isEmpty(a))){if($.isFunction(e.custom_func)){var p=e.custom_func.call(k,a,g,b);return $.isArray(p)?p:[!1,m.customarray,""]}return[!1,m.customfcheck,""]}}return[!0,"",""]}}),$.fn.jqFilter=function(a){if("string"==typeof a){var b=$.fn.jqFilter[a];if(!b)throw"jqFilter - No such method: "+a;var c=$.makeArray(arguments).slice(1);return b.apply(this,c)}var d=$.extend(!0,{filter:null,columns:[],sortStrategy:null,onChange:null,afterRedraw:null,checkValues:null,error:!1,errmsg:"",errorcheck:!0,showQuery:!0,sopt:null,ops:[],operands:null,numopts:["eq","ne","lt","le","gt","ge","nu","nn","in","ni"],stropts:["eq","ne","bw","bn","ew","en","cn","nc","nu","nn","in","ni"],strarr:["text","string","blob"],groupOps:[{op:"AND",text:"AND"},{op:"OR",text:"OR"}],groupButton:!0,ruleButtons:!0,direction:"ltr"},$.jgrid.filter,a||{});return this.each(function(){if(!this.filter){this.p=d,(null===this.p.filter||void 0===this.p.filter)&&(this.p.filter={groupOp:this.p.groupOps[0].op,rules:[],groups:[]}),null!=this.p.sortStrategy&&$.isFunction(this.p.sortStrategy)&&this.p.columns.sort(this.p.sortStrategy);var a,b,c=this.p.columns.length,e=/msie/i.test(navigator.userAgent)&&!window.opera;if(this.p.initFilter=$.extend(!0,{},this.p.filter),c){for(a=0;c>a;a++)b=this.p.columns[a],b.stype?b.inputtype=b.stype:b.inputtype||(b.inputtype="text"),b.sorttype?b.searchtype=b.sorttype:b.searchtype||(b.searchtype="string"),void 0===b.hidden&&(b.hidden=!1),b.label||(b.label=b.name),b.index&&(b.name=b.index),b.hasOwnProperty("searchoptions")||(b.searchoptions={}),b.hasOwnProperty("searchrules")||(b.searchrules={});var f=function(){return $("#"+$.jgrid.jqID(d.id))[0]||null},g=f(),h=$.jgrid.styleUI[g.p.styleUI||"jQueryUI"].filter,i=$.jgrid.styleUI[g.p.styleUI||"jQueryUI"].common;this.p.showQuery&&$(this).append("<table class='queryresult "+h.table_widget+"' style='display:block;max-width:440px;border:0px none;' dir='"+this.p.direction+"'><tbody><tr><td class='query'></td></tr></tbody></table>");var j=function(a,b){var c=[!0,""],e=f();if($.isFunction(b.searchrules))c=b.searchrules.call(e,a,b);else if($.jgrid&&$.jgrid.checkValues)try{c=$.jgrid.checkValues.call(e,a,-1,b.searchrules,b.label)}catch(g){}c&&c.length&&c[0]===!1&&(d.error=!c[0],d.errmsg=c[1])};this.onchange=function(){return this.p.error=!1,this.p.errmsg="",$.isFunction(this.p.onChange)?this.p.onChange.call(this,this.p):!1},this.reDraw=function(){$("table.group:first",this).remove();var a=this.createTableForGroup(d.filter,null);$(this).append(a),$.isFunction(this.p.afterRedraw)&&this.p.afterRedraw.call(this,this.p)},this.createTableForGroup=function(a,b){var c,e=this,f=$("<table class='group "+h.table_widget+" ui-search-table' style='border:0px none;'><tbody></tbody></table>"),g="left";"rtl"===this.p.direction&&(g="right",f.attr("dir","rtl")),null===b&&f.append("<tr class='error' style='display:none;'><th colspan='5' class='"+i.error+"' align='"+g+"'></th></tr>");var j=$("<tr></tr>");f.append(j);var k=$("<th colspan='5' align='"+g+"'></th>");if(j.append(k),this.p.ruleButtons===!0){var l=$("<select class='opsel "+h.srSelect+"'></select>");k.append(l);var m,n="";for(c=0;c<d.groupOps.length;c++)m=a.groupOp===e.p.groupOps[c].op?" selected='selected'":"",n+="<option value='"+e.p.groupOps[c].op+"'"+m+">"+e.p.groupOps[c].text+"</option>";l.append(n).bind("change",function(){a.groupOp=$(l).val(),e.onchange()})}var o="<span></span>";if(this.p.groupButton&&(o=$("<input type='button' value='+ {}' title='Add subgroup' class='add-group "+i.button+"'/>"),o.bind("click",function(){return void 0===a.groups&&(a.groups=[]),a.groups.push({groupOp:d.groupOps[0].op,rules:[],groups:[]}),e.reDraw(),e.onchange(),!1})),k.append(o),this.p.ruleButtons===!0){var p,q=$("<input type='button' value='+' title='Add rule' class='add-rule ui-add "+i.button+"'/>");q.bind("click",function(){for(void 0===a.rules&&(a.rules=[]),c=0;c<e.p.columns.length;c++){var b=void 0===e.p.columns[c].search?!0:e.p.columns[c].search,d=e.p.columns[c].hidden===!0,f=e.p.columns[c].searchoptions.searchhidden===!0;if(f&&b||b&&!d){p=e.p.columns[c];break}}var g;return g=p.searchoptions.sopt?p.searchoptions.sopt:e.p.sopt?e.p.sopt:-1!==$.inArray(p.searchtype,e.p.strarr)?e.p.stropts:e.p.numopts,a.rules.push({field:p.name,op:g[0],data:""}),e.reDraw(),!1}),k.append(q)}if(null!==b){var r=$("<input type='button' value='-' title='Delete group' class='delete-group "+i.button+"'/>");k.append(r),r.bind("click",function(){for(c=0;c<b.groups.length;c++)if(b.groups[c]===a){b.groups.splice(c,1);break}return e.reDraw(),e.onchange(),!1})}if(void 0!==a.groups)for(c=0;c<a.groups.length;c++){var s=$("<tr></tr>");f.append(s);var t=$("<td class='first'></td>");s.append(t);var u=$("<td colspan='4'></td>");u.append(this.createTableForGroup(a.groups[c],a)),s.append(u)}if(void 0===a.groupOp&&(a.groupOp=e.p.groupOps[0].op),void 0!==a.rules)for(c=0;c<a.rules.length;c++)f.append(this.createTableRowForRule(a.rules[c],a));return f},this.createTableRowForRule=function(a,b){var c,g,j,k,l,m=this,n=f(),o=$("<tr></tr>"),p="";o.append("<td class='first'></td>");var q=$("<td class='columns'></td>");o.append(q);var r,s=$("<select class='"+h.srSelect+"'></select>"),t=[];q.append(s),s.bind("change",function(){for(a.field=$(s).val(),j=$(this).parents("tr:first"),$(".data",j).empty(),c=0;c<m.p.columns.length;c++)if(m.p.columns[c].name===a.field){k=m.p.columns[c];break}if(k){k.searchoptions.id=$.jgrid.randId(),k.searchoptions.name=a.field,k.searchoptions.oper="filter",e&&"text"===k.inputtype&&(k.searchoptions.size||(k.searchoptions.size=10));var b=$.jgrid.createEl.call(n,k.inputtype,k.searchoptions,"",!0,m.p.ajaxSelectOptions||{},!0);$(b).addClass("input-elm "+h.srInput),g=k.searchoptions.sopt?k.searchoptions.sopt:m.p.sopt?m.p.sopt:-1!==$.inArray(k.searchtype,m.p.strarr)?m.p.stropts:m.p.numopts;var d="",f=0;for(t=[],$.each(m.p.ops,function(){t.push(this.oper)}),c=0;c<g.length;c++)r=$.inArray(g[c],t),-1!==r&&(0===f&&(a.op=m.p.ops[r].oper),d+="<option value='"+m.p.ops[r].oper+"'>"+m.p.ops[r].text+"</option>",f++);if($(".selectopts",j).empty().append(d),$(".selectopts",j)[0].selectedIndex=0,$.jgrid.msie&&$.jgrid.msiever()<9){var i=parseInt($("select.selectopts",j)[0].offsetWidth,10)+1;$(".selectopts",j).width(i),$(".selectopts",j).css("width","auto")}$(".data",j).append(b),$.jgrid.bindEv.call(n,b,k.searchoptions),$(".input-elm",j).bind("change",function(b){var c=b.target;a.data="SPAN"===c.nodeName.toUpperCase()&&k.searchoptions&&$.isFunction(k.searchoptions.custom_value)?k.searchoptions.custom_value.call(n,$(c).children(".customelement:first"),"get"):c.value,m.onchange()}),setTimeout(function(){a.data=$(b).val(),m.onchange()},0)}});var u=0;for(c=0;c<m.p.columns.length;c++){var v=void 0===m.p.columns[c].search?!0:m.p.columns[c].search,w=m.p.columns[c].hidden===!0,x=m.p.columns[c].searchoptions.searchhidden===!0;(x&&v||v&&!w)&&(l="",a.field===m.p.columns[c].name&&(l=" selected='selected'",u=c),p+="<option value='"+m.p.columns[c].name+"'"+l+">"+m.p.columns[c].label+"</option>")}s.append(p);var y=$("<td class='operators'></td>");o.append(y),k=d.columns[u],k.searchoptions.id=$.jgrid.randId(),e&&"text"===k.inputtype&&(k.searchoptions.size||(k.searchoptions.size=10)),k.searchoptions.name=a.field,k.searchoptions.oper="filter";var z=$.jgrid.createEl.call(n,k.inputtype,k.searchoptions,a.data,!0,m.p.ajaxSelectOptions||{},!0);("nu"===a.op||"nn"===a.op)&&($(z).attr("readonly","true"),$(z).attr("disabled","true"));var A=$("<select class='selectopts "+h.srSelect+"'></select>");for(y.append(A),A.bind("change",function(){a.op=$(A).val(),j=$(this).parents("tr:first");var b=$(".input-elm",j)[0];"nu"===a.op||"nn"===a.op?(a.data="","SELECT"!==b.tagName.toUpperCase()&&(b.value=""),b.setAttribute("readonly","true"),b.setAttribute("disabled","true")):("SELECT"===b.tagName.toUpperCase()&&(a.data=b.value),b.removeAttribute("readonly"),b.removeAttribute("disabled")),m.onchange()}),g=k.searchoptions.sopt?k.searchoptions.sopt:m.p.sopt?m.p.sopt:-1!==$.inArray(k.searchtype,m.p.strarr)?m.p.stropts:m.p.numopts,p="",$.each(m.p.ops,function(){t.push(this.oper)}),c=0;c<g.length;c++)r=$.inArray(g[c],t),-1!==r&&(l=a.op===m.p.ops[r].oper?" selected='selected'":"",p+="<option value='"+m.p.ops[r].oper+"'"+l+">"+m.p.ops[r].text+"</option>");A.append(p);var B=$("<td class='data'></td>");o.append(B),B.append(z),$.jgrid.bindEv.call(n,z,k.searchoptions),$(z).addClass("input-elm "+h.srInput).bind("change",function(){a.data="custom"===k.inputtype?k.searchoptions.custom_value.call(n,$(this).children(".customelement:first"),"get"):$(this).val(),m.onchange()});var C=$("<td></td>");if(o.append(C),this.p.ruleButtons===!0){var D=$("<input type='button' value='-' title='Delete rule' class='delete-rule ui-del "+i.button+"'/>");C.append(D),D.bind("click",function(){for(c=0;c<b.rules.length;c++)if(b.rules[c]===a){b.rules.splice(c,1);break}return m.reDraw(),m.onchange(),!1})}return o},this.getStringForGroup=function(a){var b,c="(";if(void 0!==a.groups)for(b=0;b<a.groups.length;b++){c.length>1&&(c+=" "+a.groupOp+" ");try{c+=this.getStringForGroup(a.groups[b])}catch(d){alert(d)}}if(void 0!==a.rules)try{for(b=0;b<a.rules.length;b++)c.length>1&&(c+=" "+a.groupOp+" "),c+=this.getStringForRule(a.rules[b])}catch(e){alert(e)}return c+=")","()"===c?"":c},this.getStringForRule=function(a){var b,c,e,f,g="",h="",i=["int","integer","float","number","currency"];for(b=0;b<this.p.ops.length;b++)if(this.p.ops[b].oper===a.op){g=this.p.operands.hasOwnProperty(a.op)?this.p.operands[a.op]:"",h=this.p.ops[b].oper;break}for(b=0;b<this.p.columns.length;b++)if(this.p.columns[b].name===a.field){c=this.p.columns[b];break}return void 0===c?"":(f=a.data,("bw"===h||"bn"===h)&&(f+="%"),("ew"===h||"en"===h)&&(f="%"+f),("cn"===h||"nc"===h)&&(f="%"+f+"%"),("in"===h||"ni"===h)&&(f=" ("+f+")"),d.errorcheck&&j(a.data,c),e=-1!==$.inArray(c.searchtype,i)||"nn"===h||"nu"===h?a.field+" "+g+" "+f:a.field+" "+g+' "'+f+'"')},this.resetFilter=function(){this.p.filter=$.extend(!0,{},this.p.initFilter),this.reDraw(),this.onchange()},this.hideError=function(){$("th."+i.error,this).html(""),$("tr.error",this).hide()},this.showError=function(){$("th."+i.error,this).html(this.p.errmsg),$("tr.error",this).show()},this.toUserFriendlyString=function(){return this.getStringForGroup(d.filter)},this.toString=function(){function a(a){if(c.p.errorcheck){var b,d;for(b=0;b<c.p.columns.length;b++)if(c.p.columns[b].name===a.field){d=c.p.columns[b];break}d&&j(a.data,d)}return a.op+"(item."+a.field+",'"+a.data+"')"}function b(c){var d,e="(";if(void 0!==c.groups)for(d=0;d<c.groups.length;d++)e.length>1&&(e+="OR"===c.groupOp?" || ":" && "),e+=b(c.groups[d]);if(void 0!==c.rules)for(d=0;d<c.rules.length;d++)e.length>1&&(e+="OR"===c.groupOp?" || ":" && "),e+=a(c.rules[d]);return e+=")","()"===e?"":e}var c=this;return b(this.p.filter)},this.reDraw(),this.p.showQuery&&this.onchange(),this.filter=!0}}})},$.extend($.fn.jqFilter,{toSQLString:function(){var a="";return this.each(function(){a=this.toUserFriendlyString()}),a},filterData:function(){var a;return this.each(function(){a=this.p.filter}),a},getParameter:function(a){return void 0!==a&&this.p.hasOwnProperty(a)?this.p[a]:this.p},resetFilter:function(){return this.each(function(){this.resetFilter()})},addFilter:function(a){"string"==typeof a&&(a=$.jgrid.parse(a)),this.each(function(){this.p.filter=a,this.reDraw(),this.onchange()})}}),$.jgrid.extend({filterToolbar:function(a){var b=$.jgrid.getRegional(this[0],"search");return a=$.extend({autosearch:!0,autosearchDelay:500,searchOnEnter:!0,beforeSearch:null,afterSearch:null,beforeClear:null,afterClear:null,searchurl:"",stringResult:!1,groupOp:"AND",defaultSearch:"bw",searchOperators:!1,resetIcon:"x",operands:{eq:"==",ne:"!",lt:"<",le:"<=",gt:">",ge:">=",bw:"^",bn:"!^","in":"=",ni:"!=",ew:"|",en:"!@",cn:"~",nc:"!~",nu:"#",nn:"!#"}},b,a||{}),this.each(function(){var c=this;if(!c.p.filterToolbar){$(c).data("filterToolbar")||$(c).data("filterToolbar",a),c.p.force_regional&&(a=$.extend(a,b));var d,e=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].filter,f=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].common,g=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].base,h=function(){var b,d,e,f={},g=0,h={};$.each(c.p.colModel,function(){var i=$("#gs_"+c.p.idPrefix+$.jgrid.jqID(this.name),this.frozen===!0&&c.p.frozenColumns===!0?c.grid.fhDiv:c.grid.hDiv);if(d=this.index||this.name,e=a.searchOperators?i.parent().prev().children("a").attr("soper")||a.defaultSearch:this.searchoptions&&this.searchoptions.sopt?this.searchoptions.sopt[0]:"select"===this.stype?"eq":a.defaultSearch,b="custom"===this.stype&&$.isFunction(this.searchoptions.custom_value)&&i.length>0&&"SPAN"===i[0].nodeName.toUpperCase()?this.searchoptions.custom_value.call(c,i.children(".customelement:first"),"get"):i.val(),b||"nu"===e||"nn"===e)f[d]=b,h[d]=e,g++;else try{delete c.p.postData[d]}catch(j){}});var i=g>0?!0:!1;if(a.stringResult===!0||"local"===c.p.datatype||a.searchOperators===!0){var j='{"groupOp":"'+a.groupOp+'","rules":[',k=0;$.each(f,function(a,b){k>0&&(j+=","),j+='{"field":"'+a+'",',j+='"op":"'+h[a]+'",',b+="",j+='"data":"'+b.replace(/\\/g,"\\\\").replace(/\"/g,'\\"')+'"}',k++}),j+="]}",$.extend(c.p.postData,{filters:j}),$.each(["searchField","searchString","searchOper"],function(a,b){c.p.postData.hasOwnProperty(b)&&delete c.p.postData[b]})}else $.extend(c.p.postData,f);var l;c.p.searchurl&&(l=c.p.url,$(c).jqGrid("setGridParam",{url:c.p.searchurl}));var m="stop"===$(c).triggerHandler("jqGridToolbarBeforeSearch")?!0:!1;!m&&$.isFunction(a.beforeSearch)&&(m=a.beforeSearch.call(c)),m||$(c).jqGrid("setGridParam",{search:i}).trigger("reloadGrid",[{page:1}]),l&&$(c).jqGrid("setGridParam",{url:l}),$(c).triggerHandler("jqGridToolbarAfterSearch"),$.isFunction(a.afterSearch)&&a.afterSearch.call(c)},i=function(b){var d,e={},f=0;b="boolean"!=typeof b?!0:b,$.each(c.p.colModel,function(){var a,b=$("#gs_"+c.p.idPrefix+$.jgrid.jqID(this.name),this.frozen===!0&&c.p.frozenColumns===!0?c.grid.fhDiv:c.grid.hDiv);switch(this.searchoptions&&void 0!==this.searchoptions.defaultValue&&(a=this.searchoptions.defaultValue),d=this.index||this.name,this.stype){case"select":if(b.find("option").each(function(b){return 0===b&&(this.selected=!0),$(this).val()===a?(this.selected=!0,!1):void 0}),void 0!==a)e[d]=a,f++;else try{delete c.p.postData[d]}catch(g){}break;case"text":if(b.val(a||""),void 0!==a)e[d]=a,f++;else try{delete c.p.postData[d]}catch(h){}break;case"custom":$.isFunction(this.searchoptions.custom_value)&&b.length>0&&"SPAN"===b[0].nodeName.toUpperCase()&&this.searchoptions.custom_value.call(c,b.children(".customelement:first"),"set",a||"")}});var g=f>0?!0:!1;if(c.p.resetsearch=!0,a.stringResult===!0||"local"===c.p.datatype){var h='{"groupOp":"'+a.groupOp+'","rules":[',i=0;$.each(e,function(a,b){i>0&&(h+=","),h+='{"field":"'+a+'",',h+='"op":"eq",',b+="",h+='"data":"'+b.replace(/\\/g,"\\\\").replace(/\"/g,'\\"')+'"}',i++}),h+="]}",$.extend(c.p.postData,{filters:h}),$.each(["searchField","searchString","searchOper"],function(a,b){c.p.postData.hasOwnProperty(b)&&delete c.p.postData[b]})}else $.extend(c.p.postData,e);var j;c.p.searchurl&&(j=c.p.url,$(c).jqGrid("setGridParam",{url:c.p.searchurl}));var k="stop"===$(c).triggerHandler("jqGridToolbarBeforeClear")?!0:!1;!k&&$.isFunction(a.beforeClear)&&(k=a.beforeClear.call(c)),k||b&&$(c).jqGrid("setGridParam",{search:g}).trigger("reloadGrid",[{page:1}]),j&&$(c).jqGrid("setGridParam",{url:j}),$(c).triggerHandler("jqGridToolbarAfterClear"),$.isFunction(a.afterClear)&&a.afterClear()},j=function(){var a=$("tr.ui-search-toolbar",c.grid.hDiv),b=c.p.frozenColumns===!0?$("tr.ui-search-toolbar",c.grid.fhDiv):!1;"none"===a.css("display")?(a.show(),b&&b.show()):(a.hide(),b&&b.hide())},k=function(b,d,g){$("#sopt_menu").remove(),d=parseInt(d,10),g=parseInt(g,10)+18;for(var i,j,k=$(".ui-jqgrid-view").css("font-size")||"11px",l='<ul id="sopt_menu" class="ui-search-menu modal-content" role="menu" tabindex="0" style="font-size:'+k+";left:"+d+"px;top:"+g+'px;">',m=$(b).attr("soper"),n=[],o=0,p=$(b).attr("colname"),q=c.p.colModel.length;q>o&&c.p.colModel[o].name!==p;)o++;var r=c.p.colModel[o],s=$.extend({},r.searchoptions);for(s.sopt||(s.sopt=[],s.sopt[0]="select"===r.stype?"eq":a.defaultSearch),$.each(a.odata,function(){n.push(this.oper)}),o=0;o<s.sopt.length;o++)j=$.inArray(s.sopt[o],n),-1!==j&&(i=m===a.odata[j].oper?f.highlight:"",l+='<li class="ui-menu-item '+i+'" role="presentation"><a class="'+f.cornerall+' g-menu-item" tabindex="0" role="menuitem" value="'+a.odata[j].oper+'" oper="'+a.operands[a.odata[j].oper]+'"><table class="ui-common-table"><tr><td width="25px">'+a.operands[a.odata[j].oper]+"</td><td>"+a.odata[j].text+"</td></tr></table></a></li>");l+="</ul>",$("body").append(l),$("#sopt_menu").addClass("ui-menu "+e.menu_widget),$("#sopt_menu > li > a").hover(function(){$(this).addClass(f.hover)},function(){$(this).removeClass(f.hover)}).click(function(){var d=$(this).attr("value"),e=$(this).attr("oper");if($(c).triggerHandler("jqGridToolbarSelectOper",[d,e,b]),$("#sopt_menu").hide(),$(b).text(e).attr("soper",d),a.autosearch===!0){var f=$(b).parent().next().children()[0];($(f).val()||"nu"===d||"nn"===d)&&h()}})},l=$("<tr class='ui-search-toolbar' role='row'></tr>");$.each(c.p.colModel,function(b){var f,i,j,k,m,n,o,p=this,q="",r="=",s=$("<th role='columnheader' class='"+g.headerBox+" ui-th-"+c.p.direction+"' id='gsh_"+c.p.id+"_"+p.name+"' ></th>"),t=$("<div></div>"),u=$("<table class='ui-search-table' cellspacing='0'><tr><td class='ui-search-oper' headers=''></td><td class='ui-search-input' headers=''></td><td class='ui-search-clear' headers=''></td></tr></table>");if(this.hidden===!0&&$(s).css("display","none"),this.search=this.search===!1?!1:!0,void 0===this.stype&&(this.stype="text"),f=$.extend({},this.searchoptions||{},{name:p.index||p.name,id:"gs_"+c.p.idPrefix+p.name,oper:"search"}),this.search){if(a.searchOperators){for(i=f.sopt?f.sopt[0]:"select"===p.stype?"eq":a.defaultSearch,j=0;j<a.odata.length;j++)if(a.odata[j].oper===i){r=a.operands[i]||"";break}k=null!=f.searchtitle?f.searchtitle:a.operandTitle,q="<a title='"+k+"' style='padding-right: 0.5em;' soper='"+i+"' class='soptclass' colname='"+this.name+"'>"+r+"</a>"}switch($("td:eq(0)",u).attr("colindex",b).append(q),void 0===f.clearSearch&&(f.clearSearch=!0),f.clearSearch?(m=a.resetTitle||"Clear Search Value",$("td:eq(2)",u).append("<a title='"+m+"' style='padding-right: 0.3em;padding-left: 0.3em;' class='clearsearchclass'>"+a.resetIcon+"</a>")):$("td:eq(2)",u).hide(),this.surl&&(f.dataUrl=this.surl),n="",f.defaultValue&&(n=$.isFunction(f.defaultValue)?f.defaultValue.call(c):f.defaultValue),o=$.jgrid.createEl.call(c,this.stype,f,n,!1,$.extend({},$.jgrid.ajaxOptions,c.p.ajaxSelectOptions||{})),$(o).css({width:"100%"}).addClass(e.srInput),$("td:eq(1)",u).append(o),$(t).append(u),this.stype){case"select":a.autosearch===!0&&(f.dataEvents=[{type:"change",fn:function(){return h(),!1}}]);break;case"text":a.autosearch===!0&&(f.dataEvents=a.searchOnEnter?[{type:"keypress",fn:function(a){var b=a.charCode||a.keyCode||0;return 13===b?(h(),!1):this}}]:[{type:"keydown",fn:function(b){var c=b.which;switch(c){case 13:return!1;case 9:case 16:case 37:case 38:case 39:case 40:case 27:break;default:d&&clearTimeout(d),d=setTimeout(function(){h()},a.autosearchDelay)}}}])}$.jgrid.bindEv.call(c,o,f)}$(s).append(t),$(l).append(s),a.searchOperators||$("td:eq(0)",u).hide()}),$("table thead",c.grid.hDiv).append(l),a.searchOperators&&($(".soptclass",l).click(function(a){var b=$(this).offset(),c=b.left,d=b.top;k(this,c,d),a.stopPropagation()}),$("body").on("click",function(a){"soptclass"!==a.target.className&&$("#sopt_menu").hide()})),$(".clearsearchclass",l).click(function(){var b=$(this).parents("tr:first"),d=parseInt($("td.ui-search-oper",b).attr("colindex"),10),e=$.extend({},c.p.colModel[d].searchoptions||{}),f=e.defaultValue?e.defaultValue:"";"select"===c.p.colModel[d].stype?f?$("td.ui-search-input select",b).val(f):$("td.ui-search-input select",b)[0].selectedIndex=0:$("td.ui-search-input input",b).val(f),a.autosearch===!0&&h()}),this.p.filterToolbar=!0,this.triggerToolbar=h,this.clearToolbar=i,this.toggleToolbar=j}})},destroyFilterToolbar:function(){return this.each(function(){this.p.filterToolbar&&(this.triggerToolbar=null,this.clearToolbar=null,this.toggleToolbar=null,this.p.filterToolbar=!1,$(this.grid.hDiv).find("table thead tr.ui-search-toolbar").remove())})},searchGrid:function(a){var b=$.jgrid.getRegional(this[0],"search");return a=$.extend(!0,{recreateFilter:!1,drag:!0,sField:"searchField",sValue:"searchString",sOper:"searchOper",sFilter:"filters",loadDefaults:!0,beforeShowSearch:null,afterShowSearch:null,onInitializeSearch:null,afterRedraw:null,afterChange:null,sortStrategy:null,closeAfterSearch:!1,closeAfterReset:!1,closeOnEscape:!1,searchOnEnter:!1,multipleSearch:!1,multipleGroup:!1,top:0,left:0,jqModal:!0,modal:!1,resize:!0,width:450,height:"auto",dataheight:"auto",showQuery:!1,errorcheck:!0,sopt:null,stringResult:void 0,onClose:null,onSearch:null,onReset:null,toTop:!0,overlay:30,columns:[],tmplNames:null,tmplFilters:null,tmplLabel:" Template: ",showOnLoad:!1,layer:null,operands:{eq:"=",ne:"<>",lt:"<",le:"<=",gt:">",ge:">=",bw:"LIKE",bn:"NOT LIKE","in":"IN",ni:"NOT IN",ew:"LIKE",en:"NOT LIKE",cn:"LIKE",nc:"NOT LIKE",nu:"IS NULL",nn:"ISNOT NULL"}},b,a||{}),this.each(function(){function b(b){f=$(c).triggerHandler("jqGridFilterBeforeShow",[b]),void 0===f&&(f=!0),f&&$.isFunction(a.beforeShowSearch)&&(f=a.beforeShowSearch.call(c,b)),f&&($.jgrid.viewModal("#"+$.jgrid.jqID(h.themodal),{gbox:"#gbox_"+$.jgrid.jqID(e),jqm:a.jqModal,modal:a.modal,overlay:a.overlay,toTop:a.toTop}),$(c).triggerHandler("jqGridFilterAfterShow",[b]),$.isFunction(a.afterShowSearch)&&a.afterShowSearch.call(c,b))}var c=this;if(c.grid){var d,e="fbox_"+c.p.id,f=!0,g=!0,h={themodal:"searchmod"+e,modalhead:"searchhd"+e,modalcontent:"searchcnt"+e,scrollelm:e},i=c.p.postData[a.sFilter],j=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].filter,k=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].common;if(a.styleUI=c.p.styleUI,"string"==typeof i&&(i=$.jgrid.parse(i)),a.recreateFilter===!0&&$("#"+$.jgrid.jqID(h.themodal)).remove(),void 0!==$("#"+$.jgrid.jqID(h.themodal))[0])b($("#fbox_"+$.jgrid.jqID(c.p.id)));else{var l=$("<div><div id='"+e+"' class='searchFilter' style='overflow:auto'></div></div>").insertBefore("#gview_"+$.jgrid.jqID(c.p.id)),m="left",n="";"rtl"===c.p.direction&&(m="right",n=" style='text-align:left'",l.attr("dir","rtl"));var o,p,q=$.extend([],c.p.colModel),r="<a id='"+e+"_search' class='fm-button "+k.button+" fm-button-icon-right ui-search'><span class='"+k.icon_base+" "+j.icon_search+"'></span>"+a.Find+"</a>",s="<a id='"+e+"_reset' class='fm-button "+k.button+" fm-button-icon-left ui-reset'><span class='"+k.icon_base+" "+j.icon_reset+"'></span>"+a.Reset+"</a>",t="",u="",v=!1,w=-1;if(a.showQuery&&(t="<a id='"+e+"_query' class='fm-button "+k.button+" fm-button-icon-left'><span class='"+k.icon_base+" "+j.icon_query+"'></span>Query</a>"),a.columns.length?(q=a.columns,w=0,o=q[0].index||q[0].name):$.each(q,function(a,b){if(b.label||(b.label=c.p.colNames[a]),!v){var d=void 0===b.search?!0:b.search,e=b.hidden===!0,f=b.searchoptions&&b.searchoptions.searchhidden===!0;(f&&d||d&&!e)&&(v=!0,o=b.index||b.name,w=a)}}),!i&&o||a.multipleSearch===!1){var x="eq";w>=0&&q[w].searchoptions&&q[w].searchoptions.sopt?x=q[w].searchoptions.sopt[0]:a.sopt&&a.sopt.length&&(x=a.sopt[0]),i={groupOp:"AND",rules:[{field:o,op:x,data:""}]}}v=!1,a.tmplNames&&a.tmplNames.length&&(v=!0,u="<tr><td class='ui-search-label'>"+a.tmplLabel+"</td>",u+="<td><select class='ui-template "+j.srSelect+"'>",u+="<option value='default'>Default</option>",$.each(a.tmplNames,function(a,b){u+="<option value='"+a+"'>"+b+"</option>"}),u+="</select></td></tr>"),p="<table class='EditTable' style='border:0px none;margin-top:5px' id='"+e+"_2'><tbody><tr><td colspan='2'><hr class='"+k.content+"' style='margin:1px'/></td></tr>"+u+"<tr><td class='EditButton' style='text-align:"+m+"'>"+s+"</td><td class='EditButton' "+n+">"+t+r+"</td></tr></tbody></table>",e=$.jgrid.jqID(e),$("#"+e).jqFilter({columns:q,sortStrategy:a.sortStrategy,filter:a.loadDefaults?i:null,showQuery:a.showQuery,errorcheck:a.errorcheck,sopt:a.sopt,groupButton:a.multipleGroup,ruleButtons:a.multipleSearch,afterRedraw:a.afterRedraw,ops:a.odata,operands:a.operands,ajaxSelectOptions:c.p.ajaxSelectOptions,groupOps:a.groupOps,onChange:function(){this.p.showQuery&&$(".query",this).html(this.toUserFriendlyString()),$.isFunction(a.afterChange)&&a.afterChange.call(c,$("#"+e),a)},direction:c.p.direction,id:c.p.id}),l.append(p),v&&a.tmplFilters&&a.tmplFilters.length&&$(".ui-template",l).bind("change",function(){var b=$(this).val();return"default"===b?$("#"+e).jqFilter("addFilter",i):$("#"+e).jqFilter("addFilter",a.tmplFilters[parseInt(b,10)]),!1}),a.multipleGroup===!0&&(a.multipleSearch=!0),$(c).triggerHandler("jqGridFilterInitialize",[$("#"+e)]),$.isFunction(a.onInitializeSearch)&&a.onInitializeSearch.call(c,$("#"+e)),a.gbox="#gbox_"+e,a.layer?$.jgrid.createModal(h,l,a,"#gview_"+$.jgrid.jqID(c.p.id),$("#gbox_"+$.jgrid.jqID(c.p.id))[0],"#"+$.jgrid.jqID(a.layer),{position:"relative"}):$.jgrid.createModal(h,l,a,"#gview_"+$.jgrid.jqID(c.p.id),$("#gbox_"+$.jgrid.jqID(c.p.id))[0]),(a.searchOnEnter||a.closeOnEscape)&&$("#"+$.jgrid.jqID(h.themodal)).keydown(function(b){var c=$(b.target);return!a.searchOnEnter||13!==b.which||c.hasClass("add-group")||c.hasClass("add-rule")||c.hasClass("delete-group")||c.hasClass("delete-rule")||c.hasClass("fm-button")&&c.is("[id$=_query]")?a.closeOnEscape&&27===b.which?($("#"+$.jgrid.jqID(h.modalhead)).find(".ui-jqdialog-titlebar-close").click(),!1):void 0:($("#"+e+"_search").click(),!1)}),t&&$("#"+e+"_query").bind("click",function(){return $(".queryresult",l).toggle(),!1}),void 0===a.stringResult&&(a.stringResult=a.multipleSearch),$("#"+e+"_search").bind("click",function(){var b,f,i={};if(d=$("#"+e),d.find(".input-elm:focus").change(),f=d.jqFilter("filterData"),a.errorcheck&&(d[0].hideError(),a.showQuery||d.jqFilter("toSQLString"),d[0].p.error))return d[0].showError(),!1;if(a.stringResult){try{b=JSON.stringify(f)}catch(j){}"string"==typeof b&&(i[a.sFilter]=b,$.each([a.sField,a.sValue,a.sOper],function(){i[this]=""}))}else a.multipleSearch?(i[a.sFilter]=f,$.each([a.sField,a.sValue,a.sOper],function(){i[this]=""
})):(i[a.sField]=f.rules[0].field,i[a.sValue]=f.rules[0].data,i[a.sOper]=f.rules[0].op,i[a.sFilter]="");return c.p.search=!0,$.extend(c.p.postData,i),g=$(c).triggerHandler("jqGridFilterSearch"),void 0===g&&(g=!0),g&&$.isFunction(a.onSearch)&&(g=a.onSearch.call(c,c.p.filters)),g!==!1&&$(c).trigger("reloadGrid",[{page:1}]),a.closeAfterSearch&&$.jgrid.hideModal("#"+$.jgrid.jqID(h.themodal),{gb:"#gbox_"+$.jgrid.jqID(c.p.id),jqm:a.jqModal,onClose:a.onClose}),!1}),$("#"+e+"_reset").bind("click",function(){var b={},d=$("#"+e);return c.p.search=!1,c.p.resetsearch=!0,a.multipleSearch===!1?b[a.sField]=b[a.sValue]=b[a.sOper]="":b[a.sFilter]="",d[0].resetFilter(),v&&$(".ui-template",l).val("default"),$.extend(c.p.postData,b),g=$(c).triggerHandler("jqGridFilterReset"),void 0===g&&(g=!0),g&&$.isFunction(a.onReset)&&(g=a.onReset.call(c)),g!==!1&&$(c).trigger("reloadGrid",[{page:1}]),a.closeAfterReset&&$.jgrid.hideModal("#"+$.jgrid.jqID(h.themodal),{gb:"#gbox_"+$.jgrid.jqID(c.p.id),jqm:a.jqModal,onClose:a.onClose}),!1}),b($("#"+e)),$(".fm-button:not(."+k.disabled+")",l).hover(function(){$(this).addClass(k.hover)},function(){$(this).removeClass(k.hover)})}}})}});var rp_ge={};if($.jgrid.extend({editGridRow:function(a,b){var c=$.jgrid.getRegional(this[0],"edit"),d=this[0].p.styleUI,e=$.jgrid.styleUI[d].formedit,f=$.jgrid.styleUI[d].common;return b=$.extend(!0,{top:0,left:0,width:"500",datawidth:"auto",height:"auto",dataheight:"auto",modal:!1,overlay:30,drag:!0,resize:!0,url:null,mtype:"POST",clearAfterAdd:!0,closeAfterEdit:!1,reloadAfterSubmit:!0,onInitializeForm:null,beforeInitData:null,beforeShowForm:null,afterShowForm:null,beforeSubmit:null,afterSubmit:null,onclickSubmit:null,afterComplete:null,onclickPgButtons:null,afterclickPgButtons:null,editData:{},recreateForm:!1,jqModal:!0,closeOnEscape:!1,addedrow:"first",topinfo:"",bottominfo:"",saveicon:[],closeicon:[],savekey:[!1,13],navkeys:[!1,38,40],checkOnSubmit:!1,checkOnUpdate:!1,_savedData:{},processing:!1,onClose:null,ajaxEditOptions:{},serializeEditData:null,viewPagerButtons:!0,overlayClass:f.overlay,removemodal:!0,form:"edit",template:null,focusField:!0},c,b||{}),rp_ge[$(this)[0].p.id]=b,this.each(function(){function c(){return $(x).find(".FormElement").each(function(){var a=$(".customelement",this);if(a.length){var b=a[0],c=$(b).attr("name");$.each(p.p.colModel,function(){if(this.name===c&&this.editoptions&&$.isFunction(this.editoptions.custom_value)){try{if(r[c]=this.editoptions.custom_value.call(p,$("#"+$.jgrid.jqID(c),x),"get"),void 0===r[c])throw"e1"}catch(a){"e1"===a?$.jgrid.info_dialog(D.errcap,"function 'custom_value' "+rp_ge[$(this)[0]].p.msg.novalue,rp_ge[$(this)[0]].p.bClose,{styleUI:rp_ge[$(this)[0]].p.styleUI}):$.jgrid.info_dialog(D.errcap,a.message,rp_ge[$(this)[0]].p.bClose,{styleUI:rp_ge[$(this)[0]].p.styleUI})}return!0}})}else{switch($(this).get(0).type){case"checkbox":if($(this).is(":checked"))r[this.name]=$(this).val();else{var d=$(this).attr("offval");r[this.name]=d}break;case"select-one":r[this.name]=$("option:selected",this).val();break;case"select-multiple":r[this.name]=$(this).val(),r[this.name]=r[this.name]?r[this.name].join(","):"";var e=[];$("option:selected",this).each(function(a,b){e[a]=$(b).text()});break;case"password":case"text":case"textarea":case"button":r[this.name]=$(this).val()}p.p.autoencode&&(r[this.name]=$.jgrid.htmlEncode(r[this.name]))}}),!0}function d(a,b,c,d){var f,g,h,i,j,k,l,m=0,n=[],o=!1,q="<td class='CaptionTD'>&#160;</td><td class='DataTD'>&#160;</td>",r="";for(l=1;d>=l;l++)r+=q;if("_empty"!==a&&(o=$(b).jqGrid("getInd",a)),$(b.p.colModel).each(function(l){if(f=this.name,g=this.editrules&&this.editrules.edithidden===!0?!1:this.hidden===!0?!0:!1,j=g?"style='display:none'":"","cb"!==f&&"subgrid"!==f&&this.editable===!0&&"rn"!==f){if(o===!1)i="";else if(f===b.p.ExpandColumn&&b.p.treeGrid===!0)i=$("td[role='gridcell']:eq("+l+")",b.rows[o]).text();else{try{i=$.unformat.call(b,$("td[role='gridcell']:eq("+l+")",b.rows[o]),{rowId:a,colModel:this},l)}catch(q){i=this.edittype&&"textarea"===this.edittype?$("td[role='gridcell']:eq("+l+")",b.rows[o]).text():$("td[role='gridcell']:eq("+l+")",b.rows[o]).html()}(!i||"&nbsp;"===i||"&#160;"===i||1===i.length&&160===i.charCodeAt(0))&&(i="")}var s=$.extend({},this.editoptions||{},{id:f,name:f,rowId:a,oper:"edit"}),t=$.extend({},{elmprefix:"",elmsuffix:"",rowabove:!1,rowcontent:""},this.formoptions||{}),u=parseInt(t.rowpos,10)||m+1,w=parseInt(2*(parseInt(t.colpos,10)||1),10);if("_empty"===a&&s.defaultValue&&(i=$.isFunction(s.defaultValue)?s.defaultValue.call(p):s.defaultValue),this.edittype||(this.edittype="text"),p.p.autoencode&&(i=$.jgrid.htmlDecode(i)),k=$.jgrid.createEl.call(p,this.edittype,s,i,!1,$.extend({},$.jgrid.ajaxOptions,b.p.ajaxSelectOptions||{})),"select"===this.edittype&&(i=$(k).val(),"select-multiple"===$(k).get(0).type&&i&&(i=i.join(","))),"checkbox"===this.edittype&&(i=$(k).is(":checked")?$(k).val():$(k).attr("offval")),(rp_ge[p.p.id].checkOnSubmit||rp_ge[p.p.id].checkOnUpdate)&&(rp_ge[p.p.id]._savedData[f]=i),$(k).addClass("FormElement"),$.inArray(this.edittype,["text","textarea","password","select"])>-1&&$(k).addClass(e.inputClass),C)$(I).find("#"+f).replaceWith(k);else{if(h=$(c).find("tr[rowpos="+u+"]"),t.rowabove){var x=$("<tr><td class='contentinfo' colspan='"+2*d+"'>"+t.rowcontent+"</td></tr>");$(c).append(x),x[0].rp=u}0===h.length&&(h=$("<tr "+j+" rowpos='"+u+"'></tr>").addClass("FormData").attr("id","tr_"+f),$(h).append(r),$(c).append(h),h[0].rp=u),$("td:eq("+(w-2)+")",h[0]).html("<label for='"+f+"'>"+(void 0===t.label?b.p.colNames[l]:t.label)+"</label>"),$("td:eq("+(w-1)+")",h[0]).append(t.elmprefix).append(k).append(t.elmsuffix)}"custom"===this.edittype&&$.isFunction(s.custom_value)&&s.custom_value.call(p,$("#"+f,v),"set",i),$.jgrid.bindEv.call(p,k,s),n[m]=l,m++}}),m>0){var s;C?(s="<div class='FormData' style='display:none'><input class='FormElement' id='id_g' type='text' name='"+b.p.id+"_id' value='"+a+"'/>",$(I).append(s)):(s=$("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"+(2*d-1)+"' class='DataTD'><input class='FormElement' id='id_g' type='text' name='"+b.p.id+"_id' value='"+a+"'/></td></tr>"),s[0].rp=m+999,$(c).append(s)),(rp_ge[p.p.id].checkOnSubmit||rp_ge[p.p.id].checkOnUpdate)&&(rp_ge[p.p.id]._savedData[b.p.id+"_id"]=a)}return n}function g(a,b,c){var d,e,f,g,h,i,j=0;(rp_ge[p.p.id].checkOnSubmit||rp_ge[p.p.id].checkOnUpdate)&&(rp_ge[p.p.id]._savedData={},rp_ge[p.p.id]._savedData[b.p.id+"_id"]=a);var k=b.p.colModel;if("_empty"===a)return $(k).each(function(){d=this.name,g=$.extend({},this.editoptions||{}),f=$("#"+$.jgrid.jqID(d),c),f&&f.length&&null!==f[0]&&(h="","custom"===this.edittype&&$.isFunction(g.custom_value)?g.custom_value.call(p,$("#"+d,c),"set",h):g.defaultValue?(h=$.isFunction(g.defaultValue)?g.defaultValue.call(p):g.defaultValue,"checkbox"===f[0].type?(i=h.toLowerCase(),i.search(/(false|f|0|no|n|off|undefined)/i)<0&&""!==i?(f[0].checked=!0,f[0].defaultChecked=!0,f[0].value=h):(f[0].checked=!1,f[0].defaultChecked=!1)):f.val(h)):"checkbox"===f[0].type?(f[0].checked=!1,f[0].defaultChecked=!1,h=$(f).attr("offval")):f[0].type&&"select"===f[0].type.substr(0,6)?f[0].selectedIndex=0:f.val(h),(rp_ge[p.p.id].checkOnSubmit===!0||rp_ge[p.p.id].checkOnUpdate)&&(rp_ge[p.p.id]._savedData[d]=h))}),void $("#id_g",c).val(a);var l=$(b).jqGrid("getInd",a,!0);l&&($('td[role="gridcell"]',l).each(function(f){if(d=k[f].name,"cb"!==d&&"subgrid"!==d&&"rn"!==d&&k[f].editable===!0){if(d===b.p.ExpandColumn&&b.p.treeGrid===!0)e=$(this).text();else try{e=$.unformat.call(b,$(this),{rowId:a,colModel:k[f]},f)}catch(g){e="textarea"===k[f].edittype?$(this).text():$(this).html()}switch(p.p.autoencode&&(e=$.jgrid.htmlDecode(e)),(rp_ge[p.p.id].checkOnSubmit===!0||rp_ge[p.p.id].checkOnUpdate)&&(rp_ge[p.p.id]._savedData[d]=e),d=$.jgrid.jqID(d),k[f].edittype){case"password":case"text":case"button":case"image":case"textarea":("&nbsp;"===e||"&#160;"===e||1===e.length&&160===e.charCodeAt(0))&&(e=""),$("#"+d,c).val(e);break;case"select":var h=e.split(",");h=$.map(h,function(a){return $.trim(a)}),$("#"+d+" option",c).each(function(){this.selected=k[f].editoptions.multiple||$.trim(e)!==$.trim($(this).text())&&h[0]!==$.trim($(this).text())&&h[0]!==$.trim($(this).val())?k[f].editoptions.multiple&&($.inArray($.trim($(this).text()),h)>-1||$.inArray($.trim($(this).val()),h)>-1)?!0:!1:!0}),(rp_ge[p.p.id].checkOnSubmit===!0||rp_ge[p.p.id].checkOnUpdate)&&(e=$("#"+d,c).val(),k[f].editoptions.multiple&&(e=e.join(",")),rp_ge[p.p.id]._savedData[d]=e);break;case"checkbox":if(e=String(e),k[f].editoptions&&k[f].editoptions.value){var i=k[f].editoptions.value.split(":");$("#"+d,c)[p.p.useProp?"prop":"attr"](i[0]===e?{checked:!0,defaultChecked:!0}:{checked:!1,defaultChecked:!1})}else e=e.toLowerCase(),e.search(/(false|f|0|no|n|off|undefined)/i)<0&&""!==e?($("#"+d,c)[p.p.useProp?"prop":"attr"]("checked",!0),$("#"+d,c)[p.p.useProp?"prop":"attr"]("defaultChecked",!0)):($("#"+d,c)[p.p.useProp?"prop":"attr"]("checked",!1),$("#"+d,c)[p.p.useProp?"prop":"attr"]("defaultChecked",!1));(rp_ge[p.p.id].checkOnSubmit===!0||rp_ge[p.p.id].checkOnUpdate)&&(e=$("#"+d,c).is(":checked")?$("#"+d,c).val():$("#"+d,c).attr("offval"));break;case"custom":try{if(!k[f].editoptions||!$.isFunction(k[f].editoptions.custom_value))throw"e1";k[f].editoptions.custom_value.call(p,$("#"+d,c),"set",e)}catch(l){"e1"===l?$.jgrid.info_dialog(D.errcap,"function 'custom_value' "+rp_ge[$(this)[0]].p.msg.nodefined,$.rp_ge[$(this)[0]].p.bClose,{styleUI:rp_ge[$(this)[0]].p.styleUI}):$.jgrid.info_dialog(D.errcap,l.message,$.rp_ge[$(this)[0]].p.bClose,{styleUI:rp_ge[$(this)[0]].p.styleUI})}}j++}}),j>0&&$("#id_g",x).val(a))}function h(){$.each(p.p.colModel,function(a,b){b.editoptions&&b.editoptions.NullIfEmpty===!0&&r.hasOwnProperty(b.name)&&""===r[b.name]&&(r[b.name]="null")})}function i(){var a,c,d,e,i,j,k,l=[!0,"",""],m={},n=p.p.prmNames,o=$(p).triggerHandler("jqGridAddEditBeforeCheckValues",[$(v),t]);o&&"object"==typeof o&&(r=o),$.isFunction(rp_ge[p.p.id].beforeCheckValues)&&(o=rp_ge[p.p.id].beforeCheckValues.call(p,r,$(v),t),o&&"object"==typeof o&&(r=o));for(e in r)if(r.hasOwnProperty(e)&&(l=$.jgrid.checkValues.call(p,r[e],e),l[0]===!1))break;if(h(),l[0]&&(m=$(p).triggerHandler("jqGridAddEditClickSubmit",[rp_ge[p.p.id],r,t]),void 0===m&&$.isFunction(rp_ge[p.p.id].onclickSubmit)&&(m=rp_ge[p.p.id].onclickSubmit.call(p,rp_ge[p.p.id],r,t)||{}),l=$(p).triggerHandler("jqGridAddEditBeforeSubmit",[r,$(v),t]),void 0===l&&(l=[!0,"",""]),l[0]&&$.isFunction(rp_ge[p.p.id].beforeSubmit)&&(l=rp_ge[p.p.id].beforeSubmit.call(p,r,$(v),t))),l[0]&&!rp_ge[p.p.id].processing){if(rp_ge[p.p.id].processing=!0,$("#sData",x+"_2").addClass(f.active),k=rp_ge[p.p.id].url||$(p).jqGrid("getGridParam","editurl"),d=n.oper,c="clientArray"===k?p.p.keyName:n.id,r[d]="_empty"===$.trim(r[p.p.id+"_id"])?n.addoper:n.editoper,r[d]!==n.addoper?r[c]=r[p.p.id+"_id"]:void 0===r[c]&&(r[c]=r[p.p.id+"_id"]),delete r[p.p.id+"_id"],r=$.extend(r,rp_ge[p.p.id].editData,m),p.p.treeGrid===!0){if(r[d]===n.addoper){i=$(p).jqGrid("getGridParam","selrow");var q="adjacency"===p.p.treeGridModel?p.p.treeReader.parent_id_field:"parent_id";r[q]=i}for(j in p.p.treeReader)if(p.p.treeReader.hasOwnProperty(j)){var s=p.p.treeReader[j];if(r.hasOwnProperty(s)){if(r[d]===n.addoper&&"parent_id_field"===j)continue;delete r[s]}}}r[c]=$.jgrid.stripPref(p.p.idPrefix,r[c]);var w=$.extend({url:k,type:rp_ge[p.p.id].mtype,data:$.isFunction(rp_ge[p.p.id].serializeEditData)?rp_ge[p.p.id].serializeEditData.call(p,r):r,complete:function(e,h){var j;if($("#sData",x+"_2").removeClass(f.active),r[c]=p.p.idPrefix+r[c],e.status>=300&&304!==e.status?(l[0]=!1,l[1]=$(p).triggerHandler("jqGridAddEditErrorTextFormat",[e,t]),l[1]=$.isFunction(rp_ge[p.p.id].errorTextFormat)?rp_ge[p.p.id].errorTextFormat.call(p,e,t):h+" Status: '"+e.statusText+"'. Error code: "+e.status):(l=$(p).triggerHandler("jqGridAddEditAfterSubmit",[e,r,t]),void 0===l&&(l=[!0,"",""]),l[0]&&$.isFunction(rp_ge[p.p.id].afterSubmit)&&(l=rp_ge[p.p.id].afterSubmit.call(p,e,r,t))),l[0]===!1)$(".FormError",v).html(l[1]),$(".FormError",v).show();else if(p.p.autoencode&&$.each(r,function(a,b){r[a]=$.jgrid.htmlDecode(b)}),r[d]===n.addoper?(l[2]||(l[2]=$.jgrid.randId()),null==r[c]||"_empty"===r[c]?r[c]=l[2]:l[2]=r[c],rp_ge[p.p.id].reloadAfterSubmit?$(p).trigger("reloadGrid"):p.p.treeGrid===!0?$(p).jqGrid("addChildNode",l[2],i,r):$(p).jqGrid("addRowData",l[2],r,b.addedrow),rp_ge[p.p.id].closeAfterAdd?(p.p.treeGrid!==!0&&$(p).jqGrid("setSelection",l[2]),$.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form})):rp_ge[p.p.id].clearAfterAdd&&g("_empty",p,v)):(rp_ge[p.p.id].reloadAfterSubmit?($(p).trigger("reloadGrid"),rp_ge[p.p.id].closeAfterEdit||setTimeout(function(){$(p).jqGrid("setSelection",r[c])},1e3)):p.p.treeGrid===!0?$(p).jqGrid("setTreeRow",r[c],r):$(p).jqGrid("setRowData",r[c],r),rp_ge[p.p.id].closeAfterEdit&&$.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form})),$.isFunction(rp_ge[p.p.id].afterComplete)&&(a=e,setTimeout(function(){$(p).triggerHandler("jqGridAddEditAfterComplete",[a,r,$(v),t]),rp_ge[p.p.id].afterComplete.call(p,a,r,$(v),t),a=null},500)),(rp_ge[p.p.id].checkOnSubmit||rp_ge[p.p.id].checkOnUpdate)&&($(v).data("disabled",!1),"_empty"!==rp_ge[p.p.id]._savedData[p.p.id+"_id"]))for(j in rp_ge[p.p.id]._savedData)rp_ge[p.p.id]._savedData.hasOwnProperty(j)&&r[j]&&(rp_ge[p.p.id]._savedData[j]=r[j]);rp_ge[p.p.id].processing=!1;try{$(":input:visible",v)[0].focus()}catch(k){}}},$.jgrid.ajaxOptions,rp_ge[p.p.id].ajaxEditOptions);if(w.url||rp_ge[p.p.id].useDataProxy||($.isFunction(p.p.dataProxy)?rp_ge[p.p.id].useDataProxy=!0:(l[0]=!1,l[1]+=" "+D.nourl)),l[0])if(rp_ge[p.p.id].useDataProxy){var z=p.p.dataProxy.call(p,w,"set_"+p.p.id);void 0===z&&(z=[!0,""]),z[0]===!1?(l[0]=!1,l[1]=z[1]||"Error deleting the selected row!"):(w.data.oper===n.addoper&&rp_ge[p.p.id].closeAfterAdd&&$.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form}),w.data.oper===n.editoper&&rp_ge[p.p.id].closeAfterEdit&&$.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form}))}else"clientArray"===w.url?(rp_ge[p.p.id].reloadAfterSubmit=!1,r=w.data,w.complete({status:200,statusText:""},"")):$.ajax(w)}l[0]===!1&&($(".FormError",v).html(l[1]),$(".FormError",v).show())}function j(a,b){var c,d=!1;for(c in a)if(a.hasOwnProperty(c)&&a[c]!=b[c]){d=!0;break}return d}function k(){var a=!0;return $(".FormError",v).hide(),rp_ge[p.p.id].checkOnUpdate&&(r={},c(),s=j(r,rp_ge[p.p.id]._savedData),s&&($(v).data("disabled",!0),$(".confirm","#"+y.themodal).show(),a=!1)),a}function l(){var b;if("_empty"!==a&&void 0!==p.p.savedRow&&p.p.savedRow.length>0&&$.isFunction($.fn.jqGrid.restoreRow))for(b=0;b<p.p.savedRow.length;b++)if(p.p.savedRow[b].id===a){$(p).jqGrid("restoreRow",a);break}}function m(a,b){var c=b[1].length-1;0===a?$("#pData",q).addClass(f.disabled):void 0!==b[1][a-1]&&$("#"+$.jgrid.jqID(b[1][a-1])).hasClass(f.disabled)?$("#pData",q).addClass(f.disabled):$("#pData",q).removeClass(f.disabled),a===c?$("#nData",q).addClass(f.disabled):void 0!==b[1][a+1]&&$("#"+$.jgrid.jqID(b[1][a+1])).hasClass(f.disabled)?$("#nData",q).addClass(f.disabled):$("#nData",q).removeClass(f.disabled)}function n(){var a=$(p).jqGrid("getDataIDs"),b=$("#id_g",x).val(),c=$.inArray(b,a);return[c,a]}function o(a){var b="";return"string"==typeof a&&(b=a.replace(/\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,function(a,b){return'<span id="'+b+'" ></span>'})),b}var p=this;if(p.grid&&a){var q,r,s,t,u=p.p.id,v="FrmGrid_"+u,w="TblGrid_"+u,x="#"+$.jgrid.jqID(w),y={themodal:"editmod"+u,modalhead:"edithd"+u,modalcontent:"editcnt"+u,scrollelm:v},z=!0,A=1,B=0,C="string"==typeof rp_ge[p.p.id].template&&rp_ge[p.p.id].template.length>0,D=$.jgrid.getRegional(this,"errors");rp_ge[p.p.id].styleUI=p.p.styleUI||"jQueryUI",$.jgrid.isMobile()&&(rp_ge[p.p.id].resize=!1),"new"===a?(a="_empty",t="add",b.caption=rp_ge[p.p.id].addCaption):(b.caption=rp_ge[p.p.id].editCaption,t="edit"),b.recreateForm||$(p).data("formProp")&&$.extend(rp_ge[$(this)[0].p.id],$(p).data("formProp"));var E=!0;b.checkOnUpdate&&b.jqModal&&!b.modal&&(E=!1);var F,G=isNaN(rp_ge[$(this)[0].p.id].dataheight)?rp_ge[$(this)[0].p.id].dataheight:rp_ge[$(this)[0].p.id].dataheight+"px",H=isNaN(rp_ge[$(this)[0].p.id].datawidth)?rp_ge[$(this)[0].p.id].datawidth:rp_ge[$(this)[0].p.id].datawidth+"px",I=$("<form name='FormPost' id='"+v+"' class='FormGrid' onSubmit='return false;' style='width:"+H+";height:"+G+";'></form>").data("disabled",!1);if(C?(F=o(rp_ge[$(this)[0].p.id].template),q=x):(F=$("<table id='"+w+"' class='EditTable ui-common-table'><tbody></tbody></table>"),q=x+"_2"),v="#"+$.jgrid.jqID(v),$(I).append("<div class='FormError "+f.error+"' style='display:none;'></div>"),$(I).append("<div class='tinfo topinfo'>"+rp_ge[p.p.id].topinfo+"</div>"),$(p.p.colModel).each(function(){var a=this.formoptions;A=Math.max(A,a?a.colpos||0:0),B=Math.max(B,a?a.rowpos||0:0)}),$(I).append(F),z=$(p).triggerHandler("jqGridAddEditBeforeInitData",[I,t]),void 0===z&&(z=!0),z&&$.isFunction(rp_ge[p.p.id].beforeInitData)&&(z=rp_ge[p.p.id].beforeInitData.call(p,I,t)),z!==!1){l(),d(a,p,F,A);var J="rtl"===p.p.direction?!0:!1,K=J?"nData":"pData",L=J?"pData":"nData",M="<a id='"+K+"' class='fm-button "+f.button+"'><span class='"+f.icon_base+" "+e.icon_prev+"'></span></a>",N="<a id='"+L+"' class='fm-button "+f.button+"'><span class='"+f.icon_base+" "+e.icon_next+"'></span></a>",O="<a id='sData' class='fm-button "+f.button+"'>"+b.bSubmit+"</a>",P="<a id='cData' class='fm-button "+f.button+"'>"+b.bCancel+"</a>",Q="<table style='height:auto' class='EditTable ui-common-table' id='"+w+"_2'><tbody><tr><td colspan='2'><hr class='"+f.content+"' style='margin:1px'/></td></tr><tr id='Act_Buttons'><td class='navButton'>"+(J?N+M:M+N)+"</td><td class='EditButton'>"+O+P+"</td></tr>";if(Q+="</tbody></table>",B>0){var R=[];$.each($(F)[0].rows,function(a,b){R[a]=b}),R.sort(function(a,b){return a.rp>b.rp?1:a.rp<b.rp?-1:0}),$.each(R,function(a,b){$("tbody",F).append(b)})}b.gbox="#gbox_"+$.jgrid.jqID(u);var S=!1;b.closeOnEscape===!0&&(b.closeOnEscape=!1,S=!0);var T;if(C?($(I).find("#pData").replaceWith(M),$(I).find("#nData").replaceWith(N),$(I).find("#sData").replaceWith(O),$(I).find("#cData").replaceWith(P),T=$("<div id="+w+"></div>").append(I)):T=$("<div></div>").append(I).append(Q),$(I).append("<div class='binfo topinfo bottominfo'>"+rp_ge[p.p.id].bottominfo+"</div>"),$.jgrid.createModal(y,T,rp_ge[$(this)[0].p.id],"#gview_"+$.jgrid.jqID(p.p.id),$("#gbox_"+$.jgrid.jqID(p.p.id))[0]),J&&($("#pData, #nData",x+"_2").css("float","right"),$(".EditButton",x+"_2").css("text-align","left")),rp_ge[p.p.id].topinfo&&$(".tinfo",v).show(),rp_ge[p.p.id].bottominfo&&$(".binfo",v).show(),T=null,Q=null,$("#"+$.jgrid.jqID(y.themodal)).keydown(function(a){var c=a.target;if($(v).data("disabled")===!0)return!1;if(rp_ge[p.p.id].savekey[0]===!0&&a.which===rp_ge[p.p.id].savekey[1]&&"TEXTAREA"!==c.tagName)return $("#sData",x+"_2").trigger("click"),!1;if(27===a.which)return k()?(S&&$.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:b.gbox,jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form}),!1):!1;if(rp_ge[p.p.id].navkeys[0]===!0){if("_empty"===$("#id_g",x).val())return!0;if(a.which===rp_ge[p.p.id].navkeys[1])return $("#pData",q).trigger("click"),!1;if(a.which===rp_ge[p.p.id].navkeys[2])return $("#nData",q).trigger("click"),!1}}),b.checkOnUpdate&&($("a.ui-jqdialog-titlebar-close span","#"+$.jgrid.jqID(y.themodal)).removeClass("jqmClose"),$("a.ui-jqdialog-titlebar-close","#"+$.jgrid.jqID(y.themodal)).unbind("click").click(function(){return k()?($.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form}),!1):!1})),b.saveicon=$.extend([!0,"left",e.icon_save],b.saveicon),b.closeicon=$.extend([!0,"left",e.icon_close],b.closeicon),b.saveicon[0]===!0&&$("#sData",q).addClass("right"===b.saveicon[1]?"fm-button-icon-right":"fm-button-icon-left").append("<span class='"+f.icon_base+" "+b.saveicon[2]+"'></span>"),b.closeicon[0]===!0&&$("#cData",q).addClass("right"===b.closeicon[1]?"fm-button-icon-right":"fm-button-icon-left").append("<span class='"+f.icon_base+" "+b.closeicon[2]+"'></span>"),rp_ge[p.p.id].checkOnSubmit||rp_ge[p.p.id].checkOnUpdate){O="<a id='sNew' class='fm-button "+f.button+"' style='z-index:1002'>"+b.bYes+"</a>",N="<a id='nNew' class='fm-button "+f.button+"' style='z-index:1002;margin-left:5px'>"+b.bNo+"</a>",P="<a id='cNew' class='fm-button "+f.button+"' style='z-index:1002;margin-left:5px;'>"+b.bExit+"</a>";var U=b.zIndex||999;U++,$("<div class='"+b.overlayClass+" jqgrid-overlay confirm' style='z-index:"+U+";display:none;'>&#160;</div><div class='confirm ui-jqconfirm "+f.content+"' style='z-index:"+(U+1)+"'>"+b.saveData+"<br/><br/>"+O+N+P+"</div>").insertAfter(v),$("#sNew","#"+$.jgrid.jqID(y.themodal)).click(function(){return i(),$(v).data("disabled",!1),$(".confirm","#"+$.jgrid.jqID(y.themodal)).hide(),!1}),$("#nNew","#"+$.jgrid.jqID(y.themodal)).click(function(){return $(".confirm","#"+$.jgrid.jqID(y.themodal)).hide(),$(v).data("disabled",!1),setTimeout(function(){$(":input:visible",v)[0].focus()},0),!1}),$("#cNew","#"+$.jgrid.jqID(y.themodal)).click(function(){return $(".confirm","#"+$.jgrid.jqID(y.themodal)).hide(),$(v).data("disabled",!1),$.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form}),!1})}$(p).triggerHandler("jqGridAddEditInitializeForm",[$(v),t]),$.isFunction(rp_ge[p.p.id].onInitializeForm)&&rp_ge[p.p.id].onInitializeForm.call(p,$(v),t),"_empty"!==a&&rp_ge[p.p.id].viewPagerButtons?$("#pData,#nData",q).show():$("#pData,#nData",q).hide(),$(p).triggerHandler("jqGridAddEditBeforeShowForm",[$(v),t]),$.isFunction(rp_ge[p.p.id].beforeShowForm)&&rp_ge[p.p.id].beforeShowForm.call(p,$(v),t),$("#"+$.jgrid.jqID(y.themodal)).data("onClose",rp_ge[p.p.id].onClose),$.jgrid.viewModal("#"+$.jgrid.jqID(y.themodal),{gbox:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,overlay:b.overlay,modal:b.modal,overlayClass:b.overlayClass,focusField:b.focusField,onHide:function(a){var b=$("#editmod"+u)[0].style.height,c=$("#editmod"+u)[0].style.width;b.indexOf("px")>-1&&(b=parseFloat(b)),c.indexOf("px")>-1&&(c=parseFloat(c)),$(p).data("formProp",{top:parseFloat($(a.w).css("top")),left:parseFloat($(a.w).css("left")),width:c,height:b,dataheight:$(v).height(),datawidth:$(v).width()}),a.w.remove(),a.o&&a.o.remove()}}),E||$("."+$.jgrid.jqID(b.overlayClass)).click(function(){return k()?($.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form}),!1):!1}),$(".fm-button","#"+$.jgrid.jqID(y.themodal)).hover(function(){$(this).addClass(f.hover)},function(){$(this).removeClass(f.hover)}),$("#sData",q).click(function(){return r={},$(".FormError",v).hide(),c(),"_empty"===r[p.p.id+"_id"]?i():b.checkOnSubmit===!0?(s=j(r,rp_ge[p.p.id]._savedData),s?($(v).data("disabled",!0),$(".confirm","#"+$.jgrid.jqID(y.themodal)).show()):i()):i(),!1}),$("#cData",q).click(function(){return k()?($.jgrid.hideModal("#"+$.jgrid.jqID(y.themodal),{gb:"#gbox_"+$.jgrid.jqID(u),jqm:b.jqModal,onClose:rp_ge[p.p.id].onClose,removemodal:rp_ge[p.p.id].removemodal,formprop:!rp_ge[p.p.id].recreateForm,form:rp_ge[p.p.id].form}),!1):!1}),$("#nData",q).click(function(){if(!k())return!1;$(".FormError",v).hide();var a=n();if(a[0]=parseInt(a[0],10),-1!==a[0]&&a[1][a[0]+1]){$(p).triggerHandler("jqGridAddEditClickPgButtons",["next",$(v),a[1][a[0]]]);var c;if($.isFunction(b.onclickPgButtons)&&(c=b.onclickPgButtons.call(p,"next",$(v),a[1][a[0]]),void 0!==c&&c===!1))return!1;if($("#"+$.jgrid.jqID(a[1][a[0]+1])).hasClass(f.disabled))return!1;g(a[1][a[0]+1],p,v),$(p).jqGrid("setSelection",a[1][a[0]+1]),$(p).triggerHandler("jqGridAddEditAfterClickPgButtons",["next",$(v),a[1][a[0]]]),$.isFunction(b.afterclickPgButtons)&&b.afterclickPgButtons.call(p,"next",$(v),a[1][a[0]+1]),m(a[0]+1,a)}return!1}),$("#pData",q).click(function(){if(!k())return!1;$(".FormError",v).hide();var a=n();if(-1!==a[0]&&a[1][a[0]-1]){$(p).triggerHandler("jqGridAddEditClickPgButtons",["prev",$(v),a[1][a[0]]]);var c;if($.isFunction(b.onclickPgButtons)&&(c=b.onclickPgButtons.call(p,"prev",$(v),a[1][a[0]]),void 0!==c&&c===!1))return!1;if($("#"+$.jgrid.jqID(a[1][a[0]-1])).hasClass(f.disabled))return!1;g(a[1][a[0]-1],p,v),$(p).jqGrid("setSelection",a[1][a[0]-1]),$(p).triggerHandler("jqGridAddEditAfterClickPgButtons",["prev",$(v),a[1][a[0]]]),$.isFunction(b.afterclickPgButtons)&&b.afterclickPgButtons.call(p,"prev",$(v),a[1][a[0]-1]),m(a[0]-1,a)}return!1}),$(p).triggerHandler("jqGridAddEditAfterShowForm",[$(v),t]),$.isFunction(rp_ge[p.p.id].afterShowForm)&&rp_ge[p.p.id].afterShowForm.call(p,$(v),t);var V=n();m(V[0],V)}}})},viewGridRow:function(a,b){var c=$.jgrid.getRegional(this[0],"view"),d=this[0].p.styleUI,e=$.jgrid.styleUI[d].formedit,f=$.jgrid.styleUI[d].common;return b=$.extend(!0,{top:0,left:0,width:500,datawidth:"auto",height:"auto",dataheight:"auto",modal:!1,overlay:30,drag:!0,resize:!0,jqModal:!0,closeOnEscape:!1,labelswidth:"30%",closeicon:[],navkeys:[!1,38,40],onClose:null,beforeShowForm:null,beforeInitData:null,viewPagerButtons:!0,recreateForm:!1,removemodal:!0,form:"view"},c,b||{}),rp_ge[$(this)[0].p.id]=b,this.each(function(){function c(){(rp_ge[j.p.id].closeOnEscape===!0||rp_ge[j.p.id].navkeys[0]===!0)&&setTimeout(function(){$(".ui-jqdialog-titlebar-close","#"+$.jgrid.jqID(p.modalhead)).attr("tabindex","-1").focus()},0)}function d(a,c,d,e){var g,h,i,j,k,l,m,n,o,p=0,q=[],r=!1,s="<td class='CaptionTD form-view-label "+f.content+"' width='"+b.labelswidth+"'>&#160;</td><td class='DataTD form-view-data ui-helper-reset "+f.content+"'>&#160;</td>",t="",u="<td class='CaptionTD form-view-label "+f.content+"'>&#160;</td><td class='DataTD form-view-data "+f.content+"'>&#160;</td>",v=["integer","number","currency"],w=0,x=0;for(l=1;e>=l;l++)t+=1===l?s:u;if($(c.p.colModel).each(function(){h=this.editrules&&this.editrules.edithidden===!0?!1:this.hidden===!0?!0:!1,h||"right"!==this.align||(this.formatter&&-1!==$.inArray(this.formatter,v)?w=Math.max(w,parseInt(this.width,10)):x=Math.max(x,parseInt(this.width,10)))}),m=0!==w?w:0!==x?x:0,r=$(c).jqGrid("getInd",a),$(c.p.colModel).each(function(a){if(g=this.name,n=!1,h=this.editrules&&this.editrules.edithidden===!0?!1:this.hidden===!0?!0:!1,k=h?"style='display:none'":"",o="boolean"!=typeof this.viewable?!0:this.viewable,"cb"!==g&&"subgrid"!==g&&"rn"!==g&&o){j=r===!1?"":g===c.p.ExpandColumn&&c.p.treeGrid===!0?$("td:eq("+a+")",c.rows[r]).text():$("td:eq("+a+")",c.rows[r]).html(),n="right"===this.align&&0!==m?!0:!1;var b=$.extend({},{rowabove:!1,rowcontent:""},this.formoptions||{}),f=parseInt(b.rowpos,10)||p+1,l=parseInt(2*(parseInt(b.colpos,10)||1),10);if(b.rowabove){var s=$("<tr><td class='contentinfo' colspan='"+2*e+"'>"+b.rowcontent+"</td></tr>");$(d).append(s),s[0].rp=f}i=$(d).find("tr[rowpos="+f+"]"),0===i.length&&(i=$("<tr "+k+" rowpos='"+f+"'></tr>").addClass("FormData").attr("id","trv_"+g),$(i).append(t),$(d).append(i),i[0].rp=f),$("td:eq("+(l-2)+")",i[0]).html("<b>"+(void 0===b.label?c.p.colNames[a]:b.label)+"</b>"),$("td:eq("+(l-1)+")",i[0]).append("<span>"+j+"</span>").attr("id","v_"+g),n&&$("td:eq("+(l-1)+") span",i[0]).css({"text-align":"right",width:m+"px"}),q[p]=a,p++}}),p>0){var y=$("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"+(2*e-1)+"' class='DataTD'><input class='FormElement' id='id_g' type='text' name='id' value='"+a+"'/></td></tr>");y[0].rp=p+99,$(d).append(y)}return q}function g(a,b){var c,d,e,f,g=0;f=$(b).jqGrid("getInd",a,!0),f&&($("td",f).each(function(a){c=b.p.colModel[a].name,d=b.p.colModel[a].editrules&&b.p.colModel[a].editrules.edithidden===!0?!1:b.p.colModel[a].hidden===!0?!0:!1,"cb"!==c&&"subgrid"!==c&&"rn"!==c&&(e=c===b.p.ExpandColumn&&b.p.treeGrid===!0?$(this).text():$(this).html(),c=$.jgrid.jqID("v_"+c),$("#"+c+" span","#"+m).html(e),d&&$("#"+c,"#"+m).parents("tr:first").hide(),g++)}),g>0&&$("#id_g","#"+m).val(a))}function h(a,b){var c=b[1].length-1;0===a?$("#pData","#"+m+"_2").addClass(f.disabled):void 0!==b[1][a-1]&&$("#"+$.jgrid.jqID(b[1][a-1])).hasClass(f.disabled)?$("#pData",m+"_2").addClass(f.disabled):$("#pData","#"+m+"_2").removeClass(f.disabled),a===c?$("#nData","#"+m+"_2").addClass(f.disabled):void 0!==b[1][a+1]&&$("#"+$.jgrid.jqID(b[1][a+1])).hasClass(f.disabled)?$("#nData",m+"_2").addClass(f.disabled):$("#nData","#"+m+"_2").removeClass(f.disabled)}function i(){var a=$(j).jqGrid("getDataIDs"),b=$("#id_g","#"+m).val(),c=$.inArray(b,a);return[c,a]}var j=this;if(j.grid&&a){var k=j.p.id,l="ViewGrid_"+$.jgrid.jqID(k),m="ViewTbl_"+$.jgrid.jqID(k),n="ViewGrid_"+k,o="ViewTbl_"+k,p={themodal:"viewmod"+k,modalhead:"viewhd"+k,modalcontent:"viewcnt"+k,scrollelm:l},q=$.isFunction(rp_ge[j.p.id].beforeInitData)?rp_ge[j.p.id].beforeInitData:!1,r=!0,s=1,t=0;rp_ge[j.p.id].styleUI=j.p.styleUI||"jQueryUI",b.recreateForm||$(j).data("viewProp")&&$.extend(rp_ge[$(this)[0].p.id],$(j).data("viewProp"));var u=isNaN(rp_ge[$(this)[0].p.id].dataheight)?rp_ge[$(this)[0].p.id].dataheight:rp_ge[$(this)[0].p.id].dataheight+"px",v=isNaN(rp_ge[$(this)[0].p.id].datawidth)?rp_ge[$(this)[0].p.id].datawidth:rp_ge[$(this)[0].p.id].datawidth+"px",w=$("<form name='FormPost' id='"+n+"' class='FormGrid' style='width:"+v+";height:"+u+";'></form>"),x=$("<table id='"+o+"' class='EditTable ViewTable'><tbody></tbody></table>");if($(j.p.colModel).each(function(){var a=this.formoptions;s=Math.max(s,a?a.colpos||0:0),t=Math.max(t,a?a.rowpos||0:0)}),$(w).append(x),q&&(r=q.call(j,w),void 0===r&&(r=!0)),r!==!1){d(a,j,x,s);var y="rtl"===j.p.direction?!0:!1,z=y?"nData":"pData",A=y?"pData":"nData",B="<a id='"+z+"' class='fm-button "+f.button+"'><span class='"+f.icon_base+" "+e.icon_prev+"'></span></a>",C="<a id='"+A+"' class='fm-button "+f.button+"'><span class='"+f.icon_base+" "+e.icon_next+"'></span></a>",D="<a id='cData' class='fm-button "+f.button+"'>"+b.bClose+"</a>";if(t>0){var E=[];$.each($(x)[0].rows,function(a,b){E[a]=b}),E.sort(function(a,b){return a.rp>b.rp?1:a.rp<b.rp?-1:0}),$.each(E,function(a,b){$("tbody",x).append(b)})}b.gbox="#gbox_"+$.jgrid.jqID(k);var F=$("<div></div>").append(w).append("<table border='0' class='EditTable' id='"+m+"_2'><tbody><tr id='Act_Buttons'><td class='navButton' width='"+b.labelswidth+"'>"+(y?C+B:B+C)+"</td><td class='EditButton'>"+D+"</td></tr></tbody></table>");$.jgrid.createModal(p,F,rp_ge[$(this)[0].p.id],"#gview_"+$.jgrid.jqID(j.p.id),$("#gview_"+$.jgrid.jqID(j.p.id))[0]),y&&($("#pData, #nData","#"+m+"_2").css("float","right"),$(".EditButton","#"+m+"_2").css("text-align","left")),b.viewPagerButtons||$("#pData, #nData","#"+m+"_2").hide(),F=null,$("#"+p.themodal).keydown(function(a){if(27===a.which)return rp_ge[j.p.id].closeOnEscape&&$.jgrid.hideModal("#"+$.jgrid.jqID(p.themodal),{gb:b.gbox,jqm:b.jqModal,onClose:b.onClose,removemodal:rp_ge[j.p.id].removemodal,formprop:!rp_ge[j.p.id].recreateForm,form:rp_ge[j.p.id].form}),!1;
if(b.navkeys[0]===!0){if(a.which===b.navkeys[1])return $("#pData","#"+m+"_2").trigger("click"),!1;if(a.which===b.navkeys[2])return $("#nData","#"+m+"_2").trigger("click"),!1}}),b.closeicon=$.extend([!0,"left",e.icon_close],b.closeicon),b.closeicon[0]===!0&&$("#cData","#"+m+"_2").addClass("right"===b.closeicon[1]?"fm-button-icon-right":"fm-button-icon-left").append("<span class='"+f.icon_base+" "+b.closeicon[2]+"'></span>"),$.isFunction(b.beforeShowForm)&&b.beforeShowForm.call(j,$("#"+l)),$.jgrid.viewModal("#"+$.jgrid.jqID(p.themodal),{gbox:"#gbox_"+$.jgrid.jqID(k),jqm:b.jqModal,overlay:b.overlay,modal:b.modal,onHide:function(a){$(j).data("viewProp",{top:parseFloat($(a.w).css("top")),left:parseFloat($(a.w).css("left")),width:$(a.w).width(),height:$(a.w).height(),dataheight:$("#"+l).height(),datawidth:$("#"+l).width()}),a.w.remove(),a.o&&a.o.remove()}}),$(".fm-button:not(."+f.disabled+")","#"+m+"_2").hover(function(){$(this).addClass(f.hover)},function(){$(this).removeClass(f.hover)}),c(),$("#cData","#"+m+"_2").click(function(){return $.jgrid.hideModal("#"+$.jgrid.jqID(p.themodal),{gb:"#gbox_"+$.jgrid.jqID(k),jqm:b.jqModal,onClose:b.onClose,removemodal:rp_ge[j.p.id].removemodal,formprop:!rp_ge[j.p.id].recreateForm,form:rp_ge[j.p.id].form}),!1}),$("#nData","#"+m+"_2").click(function(){$("#FormError","#"+m).hide();var a=i();return a[0]=parseInt(a[0],10),-1!==a[0]&&a[1][a[0]+1]&&($.isFunction(b.onclickPgButtons)&&b.onclickPgButtons.call(j,"next",$("#"+l),a[1][a[0]]),g(a[1][a[0]+1],j),$(j).jqGrid("setSelection",a[1][a[0]+1]),$.isFunction(b.afterclickPgButtons)&&b.afterclickPgButtons.call(j,"next",$("#"+l),a[1][a[0]+1]),h(a[0]+1,a)),c(),!1}),$("#pData","#"+m+"_2").click(function(){$("#FormError","#"+m).hide();var a=i();return-1!==a[0]&&a[1][a[0]-1]&&($.isFunction(b.onclickPgButtons)&&b.onclickPgButtons.call(j,"prev",$("#"+l),a[1][a[0]]),g(a[1][a[0]-1],j),$(j).jqGrid("setSelection",a[1][a[0]-1]),$.isFunction(b.afterclickPgButtons)&&b.afterclickPgButtons.call(j,"prev",$("#"+l),a[1][a[0]-1]),h(a[0]-1,a)),c(),!1});var G=i();h(G[0],G)}}})},delGridRow:function(a,b){var c=$.jgrid.getRegional(this[0],"del"),d=this[0].p.styleUI,e=$.jgrid.styleUI[d].formedit,f=$.jgrid.styleUI[d].common;return b=$.extend(!0,{top:0,left:0,width:240,height:"auto",dataheight:"auto",modal:!1,overlay:30,drag:!0,resize:!0,url:"",mtype:"POST",reloadAfterSubmit:!0,beforeShowForm:null,beforeInitData:null,afterShowForm:null,beforeSubmit:null,onclickSubmit:null,afterSubmit:null,jqModal:!0,closeOnEscape:!1,delData:{},delicon:[],cancelicon:[],onClose:null,ajaxDelOptions:{},processing:!1,serializeDelData:null,useDataProxy:!1},c,b||{}),rp_ge[$(this)[0].p.id]=b,this.each(function(){var c=this;if(c.grid&&a){var d,g,h,i,j=$.isFunction(rp_ge[c.p.id].beforeShowForm),k=$.isFunction(rp_ge[c.p.id].afterShowForm),l=$.isFunction(rp_ge[c.p.id].beforeInitData)?rp_ge[c.p.id].beforeInitData:!1,m=c.p.id,n={},o=!0,p="DelTbl_"+$.jgrid.jqID(m),q="DelTbl_"+m,r={themodal:"delmod"+m,modalhead:"delhd"+m,modalcontent:"delcnt"+m,scrollelm:p};if(rp_ge[c.p.id].styleUI=c.p.styleUI||"jQueryUI",$.isArray(a)&&(a=a.join()),void 0!==$("#"+$.jgrid.jqID(r.themodal))[0]){if(l&&(o=l.call(c,$("#"+p)),void 0===o&&(o=!0)),o===!1)return;$("#DelData>td","#"+p).text(a),$("#DelError","#"+p).hide(),rp_ge[c.p.id].processing===!0&&(rp_ge[c.p.id].processing=!1,$("#dData","#"+p).removeClass(f.active)),j&&rp_ge[c.p.id].beforeShowForm.call(c,$("#"+p)),$.jgrid.viewModal("#"+$.jgrid.jqID(r.themodal),{gbox:"#gbox_"+$.jgrid.jqID(m),jqm:rp_ge[c.p.id].jqModal,jqM:!1,overlay:rp_ge[c.p.id].overlay,modal:rp_ge[c.p.id].modal}),k&&rp_ge[c.p.id].afterShowForm.call(c,$("#"+p))}else{var s=isNaN(rp_ge[c.p.id].dataheight)?rp_ge[c.p.id].dataheight:rp_ge[c.p.id].dataheight+"px",t=isNaN(b.datawidth)?b.datawidth:b.datawidth+"px",u="<div id='"+q+"' class='formdata' style='width:"+t+";overflow:auto;position:relative;height:"+s+";'>";u+="<table class='DelTable'><tbody>",u+="<tr id='DelError' style='display:none'><td class='"+f.error+"'></td></tr>",u+="<tr id='DelData' style='display:none'><td >"+a+"</td></tr>",u+='<tr><td class="delmsg" style="white-space:pre;">'+rp_ge[c.p.id].msg+"</td></tr><tr><td >&#160;</td></tr>",u+="</tbody></table></div>";var v="<a id='dData' class='fm-button "+f.button+"'>"+b.bSubmit+"</a>",w="<a id='eData' class='fm-button "+f.button+"'>"+b.bCancel+"</a>";if(u+="<table class='EditTable ui-common-table' id='"+p+"_2'><tbody><tr><td><hr class='"+f.content+"' style='margin:1px'/></td></tr><tr><td class='DelButton EditButton'>"+v+"&#160;"+w+"</td></tr></tbody></table>",b.gbox="#gbox_"+$.jgrid.jqID(m),$.jgrid.createModal(r,u,rp_ge[c.p.id],"#gview_"+$.jgrid.jqID(c.p.id),$("#gview_"+$.jgrid.jqID(c.p.id))[0]),l&&(o=l.call(c,$(u)),void 0===o&&(o=!0)),o===!1)return;$(".fm-button","#"+p+"_2").hover(function(){$(this).addClass(f.hover)},function(){$(this).removeClass(f.hover)}),b.delicon=$.extend([!0,"left",e.icon_del],rp_ge[c.p.id].delicon),b.cancelicon=$.extend([!0,"left",e.icon_cancel],rp_ge[c.p.id].cancelicon),b.delicon[0]===!0&&$("#dData","#"+p+"_2").addClass("right"===b.delicon[1]?"fm-button-icon-right":"fm-button-icon-left").append("<span class='"+f.icon_base+" "+b.delicon[2]+"'></span>"),b.cancelicon[0]===!0&&$("#eData","#"+p+"_2").addClass("right"===b.cancelicon[1]?"fm-button-icon-right":"fm-button-icon-left").append("<span class='"+f.icon_base+" "+b.cancelicon[2]+"'></span>"),$("#dData","#"+p+"_2").click(function(){var a,e=[!0,""],j=$("#DelData>td","#"+p).text();if(n={},$.isFunction(rp_ge[c.p.id].onclickSubmit)&&(n=rp_ge[c.p.id].onclickSubmit.call(c,rp_ge[c.p.id],j)||{}),$.isFunction(rp_ge[c.p.id].beforeSubmit)&&(e=rp_ge[c.p.id].beforeSubmit.call(c,j)),e[0]&&!rp_ge[c.p.id].processing){if(rp_ge[c.p.id].processing=!0,h=c.p.prmNames,d=$.extend({},rp_ge[c.p.id].delData,n),i=h.oper,d[i]=h.deloper,g=h.id,j=String(j).split(","),!j.length)return!1;for(a in j)j.hasOwnProperty(a)&&(j[a]=$.jgrid.stripPref(c.p.idPrefix,j[a]));d[g]=j.join(),$(this).addClass(f.active);var k=$.extend({url:rp_ge[c.p.id].url||$(c).jqGrid("getGridParam","editurl"),type:rp_ge[c.p.id].mtype,data:$.isFunction(rp_ge[c.p.id].serializeDelData)?rp_ge[c.p.id].serializeDelData.call(c,d):d,complete:function(a,g){var h;if($("#dData","#"+p+"_2").removeClass(f.active),a.status>=300&&304!==a.status?(e[0]=!1,e[1]=$.isFunction(rp_ge[c.p.id].errorTextFormat)?rp_ge[c.p.id].errorTextFormat.call(c,a):g+" Status: '"+a.statusText+"'. Error code: "+a.status):$.isFunction(rp_ge[c.p.id].afterSubmit)&&(e=rp_ge[c.p.id].afterSubmit.call(c,a,d)),e[0]===!1)$("#DelError>td","#"+p).html(e[1]),$("#DelError","#"+p).show();else{if(rp_ge[c.p.id].reloadAfterSubmit&&"local"!==c.p.datatype)$(c).trigger("reloadGrid");else{if(c.p.treeGrid===!0)try{$(c).jqGrid("delTreeNode",c.p.idPrefix+j[0])}catch(i){}else for(h=0;h<j.length;h++)$(c).jqGrid("delRowData",c.p.idPrefix+j[h]);c.p.selrow=null,c.p.selarrrow=[]}$.isFunction(rp_ge[c.p.id].afterComplete)&&setTimeout(function(){rp_ge[c.p.id].afterComplete.call(c,a,j)},500)}rp_ge[c.p.id].processing=!1,e[0]&&$.jgrid.hideModal("#"+$.jgrid.jqID(r.themodal),{gb:"#gbox_"+$.jgrid.jqID(m),jqm:b.jqModal,onClose:rp_ge[c.p.id].onClose})}},$.jgrid.ajaxOptions,rp_ge[c.p.id].ajaxDelOptions);if(k.url||rp_ge[c.p.id].useDataProxy||($.isFunction(c.p.dataProxy)?rp_ge[c.p.id].useDataProxy=!0:(e[0]=!1,e[1]+=" "+$.jgrid.getRegional(c,"errors.nourl"))),e[0])if(rp_ge[c.p.id].useDataProxy){var l=c.p.dataProxy.call(c,k,"del_"+c.p.id);void 0===l&&(l=[!0,""]),l[0]===!1?(e[0]=!1,e[1]=l[1]||"Error deleting the selected row!"):$.jgrid.hideModal("#"+$.jgrid.jqID(r.themodal),{gb:"#gbox_"+$.jgrid.jqID(m),jqm:b.jqModal,onClose:rp_ge[c.p.id].onClose})}else"clientArray"===k.url?(d=k.data,k.complete({status:200,statusText:""},"")):$.ajax(k)}return e[0]===!1&&($("#DelError>td","#"+p).html(e[1]),$("#DelError","#"+p).show()),!1}),$("#eData","#"+p+"_2").click(function(){return $.jgrid.hideModal("#"+$.jgrid.jqID(r.themodal),{gb:"#gbox_"+$.jgrid.jqID(m),jqm:rp_ge[c.p.id].jqModal,onClose:rp_ge[c.p.id].onClose}),!1}),j&&rp_ge[c.p.id].beforeShowForm.call(c,$("#"+p)),$.jgrid.viewModal("#"+$.jgrid.jqID(r.themodal),{gbox:"#gbox_"+$.jgrid.jqID(m),jqm:rp_ge[c.p.id].jqModal,overlay:rp_ge[c.p.id].overlay,modal:rp_ge[c.p.id].modal}),k&&rp_ge[c.p.id].afterShowForm.call(c,$("#"+p))}rp_ge[c.p.id].closeOnEscape===!0&&setTimeout(function(){$(".ui-jqdialog-titlebar-close","#"+$.jgrid.jqID(r.modalhead)).attr("tabindex","-1").focus()},0)}})},navGrid:function(a,b,c,d,e,f,g){var h=$.jgrid.getRegional(this[0],"nav"),i=this[0].p.styleUI,j=$.jgrid.styleUI[i].navigator,k=$.jgrid.styleUI[i].common;return b=$.extend({edit:!0,editicon:j.icon_edit_nav,add:!0,addicon:j.icon_add_nav,del:!0,delicon:j.icon_del_nav,search:!0,searchicon:j.icon_search_nav,refresh:!0,refreshicon:j.icon_refresh_nav,refreshstate:"firstpage",view:!1,viewicon:j.icon_view_nav,position:"left",closeOnEscape:!0,beforeRefresh:null,afterRefresh:null,cloneToTop:!1,alertwidth:200,alertheight:"auto",alerttop:null,alertleft:null,alertzIndex:null,dropmenu:!1},h,b||{}),this.each(function(){if(!this.p.navGrid){var j,l,m,n={themodal:"alertmod_"+this.p.id,modalhead:"alerthd_"+this.p.id,modalcontent:"alertcnt_"+this.p.id},o=this;if(o.grid&&"string"==typeof a){$(o).data("navGrid")||$(o).data("navGrid",b),m=$(o).data("navGrid"),o.p.force_regional&&(m=$.extend(m,h)),void 0===$("#"+n.themodal)[0]&&(m.alerttop||m.alertleft||(void 0!==window.innerWidth?(m.alertleft=window.innerWidth,m.alerttop=window.innerHeight):void 0!==document.documentElement&&void 0!==document.documentElement.clientWidth&&0!==document.documentElement.clientWidth?(m.alertleft=document.documentElement.clientWidth,m.alerttop=document.documentElement.clientHeight):(m.alertleft=1024,m.alerttop=768),m.alertleft=m.alertleft/2-parseInt(m.alertwidth,10)/2,m.alerttop=m.alerttop/2-25),$.jgrid.createModal(n,"<div>"+m.alerttext+"</div><span tabindex='0'><span tabindex='-1' id='jqg_alrt'></span></span>",{gbox:"#gbox_"+$.jgrid.jqID(o.p.id),jqModal:!0,drag:!0,resize:!0,caption:m.alertcap,top:m.alerttop,left:m.alertleft,width:m.alertwidth,height:m.alertheight,closeOnEscape:m.closeOnEscape,zIndex:m.alertzIndex,styleUI:o.p.styleUI},"#gview_"+$.jgrid.jqID(o.p.id),$("#gbox_"+$.jgrid.jqID(o.p.id))[0],!0));var p,q=1,r=function(){$(this).hasClass(k.disabled)||$(this).addClass(k.hover)},s=function(){$(this).removeClass(k.hover)};for(m.cloneToTop&&o.p.toppager&&(q=2),p=0;q>p;p++){var t,u,v,w=$("<table class='ui-pg-table navtable ui-common-table'><tbody><tr></tr></tbody></table>"),x="<td class='ui-pg-button "+k.disabled+"' style='width:4px;'><span class='ui-separator'></span></td>";0===p?(u=a,v=o.p.id,u===o.p.toppager&&(v+="_top",q=1)):(u=o.p.toppager,v=o.p.id+"_top"),"rtl"===o.p.direction&&$(w).attr("dir","rtl").css("float","right"),d=d||{},m.add&&(t=$("<td class='ui-pg-button "+k.cornerall+"'></td>"),$(t).append("<div class='ui-pg-div'><span class='"+k.icon_base+" "+m.addicon+"'></span>"+m.addtext+"</div>"),$("tr",w).append(t),$(t,w).attr({title:m.addtitle||"",id:d.id||"add_"+v}).click(function(){return $(this).hasClass(k.disabled)||($.isFunction(m.addfunc)?m.addfunc.call(o):$(o).jqGrid("editGridRow","new",d)),!1}).hover(r,s),t=null),c=c||{},m.edit&&(t=$("<td class='ui-pg-button "+k.cornerall+"'></td>"),$(t).append("<div class='ui-pg-div'><span class='"+k.icon_base+" "+m.editicon+"'></span>"+m.edittext+"</div>"),$("tr",w).append(t),$(t,w).attr({title:m.edittitle||"",id:c.id||"edit_"+v}).click(function(){if(!$(this).hasClass(k.disabled)){var a=o.p.selrow;a?$.isFunction(m.editfunc)?m.editfunc.call(o,a):$(o).jqGrid("editGridRow",a,c):($.jgrid.viewModal("#"+n.themodal,{gbox:"#gbox_"+$.jgrid.jqID(o.p.id),jqm:!0}),$("#jqg_alrt").focus())}return!1}).hover(r,s),t=null),g=g||{},m.view&&(t=$("<td class='ui-pg-button "+k.cornerall+"'></td>"),$(t).append("<div class='ui-pg-div'><span class='"+k.icon_base+" "+m.viewicon+"'></span>"+m.viewtext+"</div>"),$("tr",w).append(t),$(t,w).attr({title:m.viewtitle||"",id:g.id||"view_"+v}).click(function(){if(!$(this).hasClass(k.disabled)){var a=o.p.selrow;a?$.isFunction(m.viewfunc)?m.viewfunc.call(o,a):$(o).jqGrid("viewGridRow",a,g):($.jgrid.viewModal("#"+n.themodal,{gbox:"#gbox_"+$.jgrid.jqID(o.p.id),jqm:!0}),$("#jqg_alrt").focus())}return!1}).hover(r,s),t=null),e=e||{},m.del&&(t=$("<td class='ui-pg-button "+k.cornerall+"'></td>"),$(t).append("<div class='ui-pg-div'><span class='"+k.icon_base+" "+m.delicon+"'></span>"+m.deltext+"</div>"),$("tr",w).append(t),$(t,w).attr({title:m.deltitle||"",id:e.id||"del_"+v}).click(function(){if(!$(this).hasClass(k.disabled)){var a;o.p.multiselect?(a=o.p.selarrrow,0===a.length&&(a=null)):a=o.p.selrow,a?$.isFunction(m.delfunc)?m.delfunc.call(o,a):$(o).jqGrid("delGridRow",a,e):($.jgrid.viewModal("#"+n.themodal,{gbox:"#gbox_"+$.jgrid.jqID(o.p.id),jqm:!0}),$("#jqg_alrt").focus())}return!1}).hover(r,s),t=null),(m.add||m.edit||m.del||m.view)&&$("tr",w).append(x),f=f||{},m.search&&(t=$("<td class='ui-pg-button "+k.cornerall+"'></td>"),$(t).append("<div class='ui-pg-div'><span class='"+k.icon_base+" "+m.searchicon+"'></span>"+m.searchtext+"</div>"),$("tr",w).append(t),$(t,w).attr({title:m.searchtitle||"",id:f.id||"search_"+v}).click(function(){return $(this).hasClass(k.disabled)||($.isFunction(m.searchfunc)?m.searchfunc.call(o,f):$(o).jqGrid("searchGrid",f)),!1}).hover(r,s),f.showOnLoad&&f.showOnLoad===!0&&$(t,w).click(),t=null),m.refresh&&(t=$("<td class='ui-pg-button "+k.cornerall+"'></td>"),$(t).append("<div class='ui-pg-div'><span class='"+k.icon_base+" "+m.refreshicon+"'></span>"+m.refreshtext+"</div>"),$("tr",w).append(t),$(t,w).attr({title:m.refreshtitle||"",id:"refresh_"+v}).click(function(){if(!$(this).hasClass(k.disabled)){$.isFunction(m.beforeRefresh)&&m.beforeRefresh.call(o),o.p.search=!1,o.p.resetsearch=!0;try{if("currentfilter"!==m.refreshstate){var a=o.p.id;o.p.postData.filters="";try{$("#fbox_"+$.jgrid.jqID(a)).jqFilter("resetFilter")}catch(b){}$.isFunction(o.clearToolbar)&&o.clearToolbar.call(o,!1)}}catch(c){}switch(m.refreshstate){case"firstpage":$(o).trigger("reloadGrid",[{page:1}]);break;case"current":case"currentfilter":$(o).trigger("reloadGrid",[{current:!0}])}$.isFunction(m.afterRefresh)&&m.afterRefresh.call(o)}return!1}).hover(r,s),t=null),l=$(".ui-jqgrid").css("font-size")||"11px",$("body").append("<div id='testpg2' class='ui-jqgrid "+$.jgrid.styleUI[i].base.entrieBox+"' style='font-size:"+l+";visibility:hidden;' ></div>"),j=$(w).clone().appendTo("#testpg2").width(),$("#testpg2").remove(),o.p._nvtd&&(m.dropmenu?(w=null,$(o).jqGrid("_buildNavMenu",u,v,b,c,d,e,f,g)):j>o.p._nvtd[0]?(o.p.responsive?(w=null,$(o).jqGrid("_buildNavMenu",u,v,b,c,d,e,f,g)):$(u+"_"+m.position,u).width(j),o.p._nvtd[0]=j):$(u+"_"+m.position,u).append(w),o.p._nvtd[1]=j),o.p.navGrid=!0}o.p.storeNavOptions&&(o.p.navOptions=m,o.p.editOptions=c,o.p.addOptions=d,o.p.delOptions=e,o.p.searchOptions=f,o.p.viewOptions=g)}}})},navButtonAdd:function(a,b){var c=this[0].p.styleUI,d=$.jgrid.styleUI[c].navigator;return b=$.extend({caption:"newButton",title:"",buttonicon:d.icon_newbutton_nav,onClickButton:null,position:"last",cursor:"pointer"},b||{}),this.each(function(){if(this.grid){"string"==typeof a&&0!==a.indexOf("#")&&(a="#"+$.jgrid.jqID(a));var d=$(".navtable",a)[0],e=this,f=$.jgrid.styleUI[c].common.disabled,g=$.jgrid.styleUI[c].common.hover,h=$.jgrid.styleUI[c].common.cornerall,i=$.jgrid.styleUI[c].common.icon_base;if(d){if(b.id&&void 0!==$("#"+$.jgrid.jqID(b.id),d)[0])return;var j=$("<td></td>");$(j).addClass("ui-pg-button "+h).append("NONE"===b.buttonicon.toString().toUpperCase()?"<div class='ui-pg-div'>"+b.caption+"</div>":"<div class='ui-pg-div'><span class='"+i+" "+b.buttonicon+"'></span>"+b.caption+"</div>"),b.id&&$(j).attr("id",b.id),"first"===b.position?0===d.rows[0].cells.length?$("tr",d).append(j):$("tr td:eq(0)",d).before(j):$("tr",d).append(j),$(j,d).attr("title",b.title||"").click(function(a){return $(this).hasClass(f)||$.isFunction(b.onClickButton)&&b.onClickButton.call(e,a),!1}).hover(function(){$(this).hasClass(f)||$(this).addClass(g)},function(){$(this).removeClass(g)})}else if(d=$(".dropdownmenu",a)[0]){var k=$(d).val(),l=b.id||$.jgrid.randId(),m=$('<li class="ui-menu-item" role="presentation"><a class="'+h+' g-menu-item" tabindex="0" role="menuitem" id="'+l+'">'+(b.caption||b.title)+"</a></li>");k&&("first"===b.position?$("#"+k).prepend(m):$("#"+k).append(m),$(m).on("click",function(a){return $(this).hasClass(f)||($("#"+k).hide(),$.isFunction(b.onClickButton)&&b.onClickButton.call(e,a)),!1}).find("a").hover(function(){$(this).hasClass(f)||$(this).addClass(g)},function(){$(this).removeClass(g)}))}}})},navSeparatorAdd:function(a,b){var c=this[0].p.styleUI,d=$.jgrid.styleUI[c].common;return b=$.extend({sepclass:"ui-separator",sepcontent:"",position:"last"},b||{}),this.each(function(){if(this.grid){"string"==typeof a&&0!==a.indexOf("#")&&(a="#"+$.jgrid.jqID(a));var c,e,f=$(".navtable",a)[0];f?(c="<td class='ui-pg-button "+d.disabled+"' style='width:4px;'><span class='"+b.sepclass+"'></span>"+b.sepcontent+"</td>","first"===b.position?0===f.rows[0].cells.length?$("tr",f).append(c):$("tr td:eq(0)",f).before(c):$("tr",f).append(c)):(f=$(".dropdownmenu",a)[0],c="<li class='ui-menu-item "+d.disabled+"' style='width:100%' role='presentation'><hr class='ui-separator-li'></li>",f&&(e=$(f).val(),e&&("first"===b.position?$("#"+e).prepend(c):$("#"+e).append(c))))}})},_buildNavMenu:function(a,b,c,d,e,f,g,h){return this.each(function(){var i=this,j=i.p.styleUI,k=($.jgrid.styleUI[j].navigator,$.jgrid.styleUI[j].filter),l=$.jgrid.styleUI[j].common,m="form_menu_"+$.jgrid.randId(),n="<button class='dropdownmenu "+l.button+"' value='"+m+"'>Actions</button>";$(a+"_"+c.position,a).append(n);var o={themodal:"alertmod_"+this.p.id,modalhead:"alerthd_"+this.p.id,modalcontent:"alertcnt_"+this.p.id},p=function(){var a,j,n=$(".ui-jqgrid-view").css("font-size")||"11px",p=$('<ul id="'+m+'" class="ui-nav-menu modal-content" role="menu" tabindex="0" style="display:none;font-size:'+n+'"></ul>');c.add&&(e=e||{},a=e.id||"add_"+b,j=$('<li class="ui-menu-item" role="presentation"><a class="'+l.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+a+'">'+(c.addtext||c.addtitle)+"</a></li>").click(function(){return $(this).hasClass(l.disabled)||($.isFunction(c.addfunc)?c.addfunc.call(i):$(i).jqGrid("editGridRow","new",e),$(p).hide()),!1}),$(p).append(j)),c.edit&&(d=d||{},a=d.id||"edit_"+b,j=$('<li class="ui-menu-item" role="presentation"><a class="'+l.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+a+'">'+(c.edittext||c.edittitle)+"</a></li>").click(function(){if(!$(this).hasClass(l.disabled)){var a=i.p.selrow;a?$.isFunction(c.editfunc)?c.editfunc.call(i,a):$(i).jqGrid("editGridRow",a,d):($.jgrid.viewModal("#"+o.themodal,{gbox:"#gbox_"+$.jgrid.jqID(i.p.id),jqm:!0}),$("#jqg_alrt").focus()),$(p).hide()}return!1}),$(p).append(j)),c.view&&(h=h||{},a=h.id||"view_"+b,j=$('<li class="ui-menu-item" role="presentation"><a class="'+l.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+a+'">'+(c.viewtext||c.viewtitle)+"</a></li>").click(function(){if(!$(this).hasClass(l.disabled)){var a=i.p.selrow;a?$.isFunction(c.editfunc)?c.viewfunc.call(i,a):$(i).jqGrid("viewGridRow",a,h):($.jgrid.viewModal("#"+o.themodal,{gbox:"#gbox_"+$.jgrid.jqID(i.p.id),jqm:!0}),$("#jqg_alrt").focus()),$(p).hide()}return!1}),$(p).append(j)),c.del&&(f=f||{},a=f.id||"del_"+b,j=$('<li class="ui-menu-item" role="presentation"><a class="'+l.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+a+'">'+(c.deltext||c.deltitle)+"</a></li>").click(function(){if(!$(this).hasClass(l.disabled)){var a;i.p.multiselect?(a=i.p.selarrrow,0===a.length&&(a=null)):a=i.p.selrow,a?$.isFunction(c.delfunc)?c.delfunc.call(i,a):$(i).jqGrid("delGridRow",a,f):($.jgrid.viewModal("#"+o.themodal,{gbox:"#gbox_"+$.jgrid.jqID(i.p.id),jqm:!0}),$("#jqg_alrt").focus()),$(p).hide()}return!1}),$(p).append(j)),(c.add||c.edit||c.del||c.view)&&$(p).append("<li class='ui-menu-item "+l.disabled+"' style='width:100%' role='presentation'><hr class='ui-separator-li'></li>"),c.search&&(g=g||{},a=g.id||"search_"+b,j=$('<li class="ui-menu-item" role="presentation"><a class="'+l.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+a+'">'+(c.searchtext||c.searchtitle)+"</a></li>").click(function(){return $(this).hasClass(l.disabled)||($.isFunction(c.searchfunc)?c.searchfunc.call(i,g):$(i).jqGrid("searchGrid",g),$(p).hide()),!1}),$(p).append(j),g.showOnLoad&&g.showOnLoad===!0&&$(j).click()),c.refresh&&(a=g.id||"search_"+b,j=$('<li class="ui-menu-item" role="presentation"><a class="'+l.cornerall+' g-menu-item" tabindex="0" role="menuitem" id="'+a+'">'+(c.refreshtext||c.refreshtitle)+"</a></li>").click(function(){if(!$(this).hasClass(l.disabled)){$.isFunction(c.beforeRefresh)&&c.beforeRefresh.call(i),i.p.search=!1,i.p.resetsearch=!0;try{if("currentfilter"!==c.refreshstate){var a=i.p.id;i.p.postData.filters="";try{$("#fbox_"+$.jgrid.jqID(a)).jqFilter("resetFilter")}catch(b){}$.isFunction(i.clearToolbar)&&i.clearToolbar.call(i,!1)}}catch(d){}switch(c.refreshstate){case"firstpage":$(i).trigger("reloadGrid",[{page:1}]);break;case"current":case"currentfilter":$(i).trigger("reloadGrid",[{current:!0}])}$.isFunction(c.afterRefresh)&&c.afterRefresh.call(i),$(p).hide()}return!1}),$(p).append(j)),$(p).hide(),$("body").append(p),$("#"+m).addClass("ui-menu "+k.menu_widget),$("#"+m+" > li > a").hover(function(){$(this).addClass(l.hover)},function(){$(this).removeClass(l.hover)})};p(),$(".dropdownmenu").on("click",function(){var a=$(this).offset(),b=a.left,c=parseInt(a.top),d=$(this).val();$("#"+d).show().css({top:c-($("#"+d).height()+10)+"px",left:b+"px"})}),$("body").on("click",function(a){$(a.target).hasClass("dropdownmenu")||$("#"+m).hide()})})},GridToForm:function(a,b){return this.each(function(){var c,d=this;if(d.grid){var e=$(d).jqGrid("getRowData",a);if(e)for(c in e)e.hasOwnProperty(c)&&($("[name="+$.jgrid.jqID(c)+"]",b).is("input:radio")||$("[name="+$.jgrid.jqID(c)+"]",b).is("input:checkbox")?$("[name="+$.jgrid.jqID(c)+"]",b).each(function(){$(this).val()==e[c]?$(this)[d.p.useProp?"prop":"attr"]("checked",!0):$(this)[d.p.useProp?"prop":"attr"]("checked",!1)}):$("[name="+$.jgrid.jqID(c)+"]",b).val(e[c]))}})},FormToGrid:function(a,b,c,d){return this.each(function(){var e=this;if(e.grid){c||(c="set"),d||(d="first");var f=$(b).serializeArray(),g={};$.each(f,function(a,b){g[b.name]=b.value}),"add"===c?$(e).jqGrid("addRowData",a,g,d):"set"===c&&$(e).jqGrid("setRowData",a,g)}})}}),$.jgrid.extend({groupingSetup:function(){return this.each(function(){var a,b,c,d=this,e=d.p.colModel,f=d.p.groupingView,g=$.jgrid.styleUI[d.p.styleUI||"jQueryUI"].grouping;if(null===f||"object"!=typeof f&&!$.isFunction(f))d.p.grouping=!1;else if(f.plusicon||(f.plusicon=g.icon_plus),f.minusicon||(f.minusicon=g.icon_minus),f.groupField.length){for(void 0===f.visibiltyOnNextGrouping&&(f.visibiltyOnNextGrouping=[]),f.lastvalues=[],f._locgr||(f.groups=[]),f.counters=[],a=0;a<f.groupField.length;a++)f.groupOrder[a]||(f.groupOrder[a]="asc"),f.groupText[a]||(f.groupText[a]="{0}"),"boolean"!=typeof f.groupColumnShow[a]&&(f.groupColumnShow[a]=!0),"boolean"!=typeof f.groupSummary[a]&&(f.groupSummary[a]=!1),f.groupSummaryPos[a]||(f.groupSummaryPos[a]="footer"),f.groupColumnShow[a]===!0?(f.visibiltyOnNextGrouping[a]=!0,$(d).jqGrid("showCol",f.groupField[a])):(f.visibiltyOnNextGrouping[a]=$("#"+$.jgrid.jqID(d.p.id+"_"+f.groupField[a])).is(":visible"),$(d).jqGrid("hideCol",f.groupField[a]));for(f.summary=[],f.hideFirstGroupCol&&(f.formatDisplayField[0]=function(a){return a}),b=0,c=e.length;c>b;b++)f.hideFirstGroupCol&&(e[b].hidden||f.groupField[0]!==e[b].name||(e[b].formatter=function(){return""})),e[b].summaryType&&f.summary.push(e[b].summaryDivider?{nm:e[b].name,st:e[b].summaryType,v:"",sd:e[b].summaryDivider,vd:"",sr:e[b].summaryRound,srt:e[b].summaryRoundType||"round"}:{nm:e[b].name,st:e[b].summaryType,v:"",sr:e[b].summaryRound,srt:e[b].summaryRoundType||"round"})}else d.p.grouping=!1})},groupingPrepare:function(a,b){return this.each(function(){var c,d,e,f,g,h=this.p.groupingView,i=this,j=function(){$.isFunction(this.st)?this.v=this.st.call(i,this.v,this.nm,a):(this.v=$(i).jqGrid("groupingCalculations.handler",this.st,this.v,this.nm,this.sr,this.srt,a),"avg"===this.st.toLowerCase()&&this.sd&&(this.vd=$(i).jqGrid("groupingCalculations.handler",this.st,this.vd,this.sd,this.sr,this.srt,a)))},k=h.groupField.length,l=0;for(c=0;k>c;c++)d=h.groupField[c],f=h.displayField[c],e=a[d],g=null==f?null:a[f],null==g&&(g=e),void 0!==e&&(0===b?(h.groups.push({idx:c,dataIndex:d,value:e,displayValue:g,startRow:b,cnt:1,summary:[]}),h.lastvalues[c]=e,h.counters[c]={cnt:1,pos:h.groups.length-1,summary:$.extend(!0,[],h.summary)},$.each(h.counters[c].summary,j),h.groups[h.counters[c].pos].summary=h.counters[c].summary):"object"==typeof e||($.isArray(h.isInTheSameGroup)&&$.isFunction(h.isInTheSameGroup[c])?h.isInTheSameGroup[c].call(i,h.lastvalues[c],e,c,h):h.lastvalues[c]===e)?1===l?(h.groups.push({idx:c,dataIndex:d,value:e,displayValue:g,startRow:b,cnt:1,summary:[]}),h.lastvalues[c]=e,h.counters[c]={cnt:1,pos:h.groups.length-1,summary:$.extend(!0,[],h.summary)},$.each(h.counters[c].summary,j),h.groups[h.counters[c].pos].summary=h.counters[c].summary):(h.counters[c].cnt+=1,h.groups[h.counters[c].pos].cnt=h.counters[c].cnt,$.each(h.counters[c].summary,j),h.groups[h.counters[c].pos].summary=h.counters[c].summary):(h.groups.push({idx:c,dataIndex:d,value:e,displayValue:g,startRow:b,cnt:1,summary:[]}),h.lastvalues[c]=e,l=1,h.counters[c]={cnt:1,pos:h.groups.length-1,summary:$.extend(!0,[],h.summary)},$.each(h.counters[c].summary,j),h.groups[h.counters[c].pos].summary=h.counters[c].summary))}),this},groupingToggle:function(a){return this.each(function(){var b=this,c=b.p.groupingView,d=a.split("_"),e=parseInt(d[d.length-2],10);d.splice(d.length-2,2);var f,g,h=d.join("_"),i=c.minusicon,j=c.plusicon,k=$("#"+$.jgrid.jqID(a)),l=k.length?k[0].nextSibling:null,m=$("#"+$.jgrid.jqID(a)+" span.tree-wrap-"+b.p.direction),n=function(a){var b=$.map(a.split(" "),function(a){return a.substring(0,h.length+1)===h+"_"?parseInt(a.substring(h.length+1),10):void 0});return b.length>0?b[0]:void 0},o=!1,p=!1,q=b.p.frozenColumns?b.p.id+"_frozen":!1,r=q?$("#"+$.jgrid.jqID(a),"#"+$.jgrid.jqID(q)):!1,s=r&&r.length?r[0].nextSibling:null;if(m.hasClass(i)){if(c.showSummaryOnHide){if(l)for(;l&&(f=n(l.className),!(void 0!==f&&e>=f));)$(l).hide(),l=l.nextSibling,q&&($(s).hide(),s=s.nextSibling)}else if(l)for(;l&&(f=n(l.className),!(void 0!==f&&e>=f));)$(l).hide(),l=l.nextSibling,q&&($(s).hide(),s=s.nextSibling);m.removeClass(i).addClass(j),o=!0}else{if(l)for(g=void 0;l;){if(f=n(l.className),void 0===g&&(g=void 0===f),p=$(l).hasClass("ui-subgrid")&&$(l).hasClass("ui-sg-collapsed"),void 0!==f){if(e>=f)break;f===e+1&&(p||($(l).show().find(">td>span.tree-wrap-"+b.p.direction).removeClass(i).addClass(j),q&&$(s).show().find(">td>span.tree-wrap-"+b.p.direction).removeClass(i).addClass(j)))}else g&&(p||($(l).show(),q&&$(s).show()));l=l.nextSibling,q&&(s=s.nextSibling)}m.removeClass(j).addClass(i)}$(b).triggerHandler("jqGridGroupingClickGroup",[a,o]),$.isFunction(b.p.onClickGroup)&&b.p.onClickGroup.call(b,a,o)}),!1},groupingRender:function(a,b,c,d){return this.each(function(){function e(a,b,c){var d,e=!1;if(0===b)e=c[a];else{var f=c[a].idx;if(0===f)e=c[a];else for(d=a;d>=0;d--)if(c[d].idx===f-b){e=c[d];break}}return e}function f(a,c,d,f){var g,h,i=e(a,c,d),k=j.p.colModel,l=i.cnt,m="";for(h=f;b>h;h++){var n="<td "+j.formatCol(h,1,"")+">&#160;</td>",o="{0}";$.each(i.summary,function(){if(this.nm===k[h].name){k[h].summaryTpl&&(o=k[h].summaryTpl),"string"==typeof this.st&&"avg"===this.st.toLowerCase()&&(this.sd&&this.vd?this.v=this.v/this.vd:this.v&&l>0&&(this.v=this.v/l));try{this.groupCount=i.cnt,this.groupIndex=i.dataIndex,this.groupValue=i.value,g=j.formatter("",this.v,h,this)}catch(a){g=this.v}return n="<td "+j.formatCol(h,1,"")+">"+$.jgrid.template(o,g)+"</td>",!1}}),m+=n}return m}var g,h,i,j=this,k=j.p.groupingView,l="",m="",n=k.groupCollapse?k.plusicon:k.minusicon,o=[],p=k.groupField.length,q=$.jgrid.styleUI[j.p.styleUI||"jQueryUI"].common;n=n+" tree-wrap-"+j.p.direction,$.each(j.p.colModel,function(a,b){var c;for(c=0;p>c;c++)if(k.groupField[c]===b.name){o[c]=a;break}});var r,s=0,t=$.makeArray(k.groupSummary);t.reverse(),r=j.p.multiselect?' colspan="2"':"",$.each(k.groups,function(e,u){if(k._locgr&&!(u.startRow+u.cnt>(c-1)*d&&u.startRow<c*d))return!0;s++,h=j.p.id+"ghead_"+u.idx,g=h+"_"+e,m="<span style='cursor:pointer;margin-right:8px;margin-left:5px;' class='"+q.icon_base+" "+n+"' onclick=\"jQuery('#"+$.jgrid.jqID(j.p.id)+"').jqGrid('groupingToggle','"+g+"');return false;\"></span>";try{$.isArray(k.formatDisplayField)&&$.isFunction(k.formatDisplayField[u.idx])?(u.displayValue=k.formatDisplayField[u.idx].call(j,u.displayValue,u.value,j.p.colModel[o[u.idx]],u.idx,k),i=u.displayValue):i=j.formatter(g,u.displayValue,o[u.idx],u.value)}catch(v){i=u.displayValue}var w="";w=$.isFunction(k.groupText[u.idx])?k.groupText[u.idx].call(j,i,u.cnt,u.summary):$.jgrid.template(k.groupText[u.idx],i,u.cnt,u.summary),"string"!=typeof w&&"number"!=typeof w&&(w=i),"header"===k.groupSummaryPos[u.idx]?(l+='<tr id="'+g+'"'+(k.groupCollapse&&u.idx>0?' style="display:none;" ':" ")+'role="row" class= "'+q.content+" jqgroup ui-row-"+j.p.direction+" "+h+'"><td style="padding-left:'+12*u.idx+'px;"'+r+">"+m+w+"</td>",l+=f(e,0,k.groups,k.groupColumnShow[u.idx]===!1?""===r?2:3:""===r?1:2),l+="</tr>"):l+='<tr id="'+g+'"'+(k.groupCollapse&&u.idx>0?' style="display:none;" ':" ")+'role="row" class= "'+q.content+" jqgroup ui-row-"+j.p.direction+" "+h+'"><td style="padding-left:'+12*u.idx+'px;" colspan="'+(k.groupColumnShow[u.idx]===!1?b-1:b)+'">'+m+w+"</td></tr>";var x=p-1===u.idx;if(x){var y,z,A=k.groups[e+1],B=0,C=u.startRow,D=void 0!==A?A.startRow:k.groups[e].startRow+k.groups[e].cnt;for(k._locgr&&(B=(c-1)*d,B>u.startRow&&(C=B)),y=C;D>y&&a[y-B];y++)l+=a[y-B].join("");if("header"!==k.groupSummaryPos[u.idx]){var E;if(void 0!==A){for(E=0;E<k.groupField.length&&A.dataIndex!==k.groupField[E];E++);s=k.groupField.length-E}for(z=0;s>z;z++)if(t[z]){var F="";k.groupCollapse&&!k.showSummaryOnHide&&(F=' style="display:none;"'),l+="<tr"+F+' jqfootlevel="'+(u.idx-z)+'" role="row" class="'+q.content+" jqfoot ui-row-"+j.p.direction+'">',l+=f(e,z,k.groups,0),l+="</tr>"}s=E}}}),$("#"+$.jgrid.jqID(j.p.id)+" tbody:first").append(l),l=null})},groupingGroupBy:function(a,b){return this.each(function(){var c=this;"string"==typeof a&&(a=[a]);var d=c.p.groupingView;c.p.grouping=!0,d._locgr=!1,void 0===d.visibiltyOnNextGrouping&&(d.visibiltyOnNextGrouping=[]);var e;for(e=0;e<d.groupField.length;e++)!d.groupColumnShow[e]&&d.visibiltyOnNextGrouping[e]&&$(c).jqGrid("showCol",d.groupField[e]);for(e=0;e<a.length;e++)d.visibiltyOnNextGrouping[e]=$("#"+$.jgrid.jqID(c.p.id)+"_"+$.jgrid.jqID(a[e])).is(":visible");c.p.groupingView=$.extend(c.p.groupingView,b||{}),d.groupField=a,$(c).trigger("reloadGrid")})},groupingRemove:function(a){return this.each(function(){var b=this;if(void 0===a&&(a=!0),b.p.grouping=!1,a===!0){var c,d=b.p.groupingView;for(c=0;c<d.groupField.length;c++)!d.groupColumnShow[c]&&d.visibiltyOnNextGrouping[c]&&$(b).jqGrid("showCol",d.groupField);$("tr.jqgroup, tr.jqfoot","#"+$.jgrid.jqID(b.p.id)+" tbody:first").remove(),$("tr.jqgrow:hidden","#"+$.jgrid.jqID(b.p.id)+" tbody:first").show()}else $(b).trigger("reloadGrid")})},groupingCalculations:{handler:function(a,b,c,d,e,f){var g={sum:function(){return parseFloat(b||0)+parseFloat(f[c]||0)},min:function(){return""===b?parseFloat(f[c]||0):Math.min(parseFloat(b),parseFloat(f[c]||0))},max:function(){return""===b?parseFloat(f[c]||0):Math.max(parseFloat(b),parseFloat(f[c]||0))},count:function(){return""===b&&(b=0),f.hasOwnProperty(c)?b+1:0},avg:function(){return g.sum()}};if(!g[a])throw"jqGrid Grouping No such method: "+a;var h=g[a]();if(null!=d)if("fixed"===e)h=h.toFixed(d);else{var i=Math.pow(10,d);h=Math.round(h*i)/i}return h}},setGroupHeaders:function(a){return a=$.extend({useColSpanStyle:!1,groupHeaders:[]},a||{}),this.each(function(){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p=this,q=0,r=p.p.colModel,s=r.length,t=p.grid.headers,u=$("table.ui-jqgrid-htable",p.grid.hDiv),v=u.children("thead").children("tr.ui-jqgrid-labels:last").addClass("jqg-second-row-header"),w=u.children("thead"),x=u.find(".jqg-first-row-header"),y=$.jgrid.styleUI[p.p.styleUI||"jQueryUI"].base;
p.p.groupHeader||(p.p.groupHeader=[]),p.p.groupHeader.push(a),void 0===x[0]?x=$("<tr>",{role:"row","aria-hidden":"true"}).addClass("jqg-first-row-header").css("height","auto"):x.empty();var z,A=function(a,b){var c,d=b.length;for(c=0;d>c;c++)if(b[c].startColumnName===a)return c;return-1};for($(p).prepend(w),d=$("<tr>",{role:"row"}).addClass("ui-jqgrid-labels jqg-third-row-header"),b=0;s>b;b++)if(f=t[b].el,g=$(f),c=r[b],h={height:"0px",width:t[b].width+"px",display:c.hidden?"none":""},$("<th>",{role:"gridcell"}).css(h).addClass("ui-first-th-"+p.p.direction).appendTo(x),f.style.width="",i=A(c.name,a.groupHeaders),i>=0){for(j=a.groupHeaders[i],k=j.numberOfColumns,l=j.titleText,n=j.className||"",m=0,i=0;k>i&&s>b+i;i++)r[b+i].hidden||m++;e=$("<th>").attr({role:"columnheader"}).addClass(y.headerBox+" ui-th-column-header ui-th-"+p.p.direction+" "+n).html(l),m>0&&e.attr("colspan",String(m)),p.p.headertitles&&e.attr("title",e.text()),0===m&&e.hide(),g.before(e),d.append(f),q=k-1}else 0===q?a.useColSpanStyle?g.attr("rowspan","2"):($("<th>",{role:"columnheader"}).addClass(y.headerBox+" ui-th-column-header ui-th-"+p.p.direction).css({display:c.hidden?"none":""}).insertBefore(g),d.append(f)):(d.append(f),q--);o=$(p).children("thead"),o.prepend(x),d.insertAfter(v),u.append(o),a.useColSpanStyle&&(u.find("span.ui-jqgrid-resize").each(function(){var a=$(this).parent();a.is(":visible")&&(this.style.cssText="height: "+a.height()+"px !important; cursor: col-resize;")}),u.find("div.ui-jqgrid-sortable").each(function(){var a=$(this),b=a.parent();b.is(":visible")&&b.is(":has(span.ui-jqgrid-resize)")&&a.css("top",(b.height()-a.outerHeight())/2-4+"px")})),z=o.find("tr.jqg-first-row-header"),$(p).bind("jqGridResizeStop.setGroupHeaders",function(a,b,c){z.find("th").eq(c).width(b)})})},destroyGroupHeader:function(a){return void 0===a&&(a=!0),this.each(function(){var b,c,d,e,f,g,h,i=this,j=i.grid,k=$("table.ui-jqgrid-htable thead",j.hDiv),l=i.p.colModel;if(j){for($(this).unbind(".setGroupHeaders"),b=$("<tr>",{role:"row"}).addClass("ui-jqgrid-labels"),e=j.headers,c=0,d=e.length;d>c;c++){h=l[c].hidden?"none":"",f=$(e[c].el).width(e[c].width).css("display",h);try{f.removeAttr("rowSpan")}catch(m){f.attr("rowSpan",1)}b.append(f),g=f.children("span.ui-jqgrid-resize"),g.length>0&&(g[0].style.height=""),f.children("div")[0].style.top=""}$(k).children("tr.ui-jqgrid-labels").remove(),$(k).prepend(b),a===!0&&$(i).jqGrid("setGridParam",{groupHeader:null})}})}}),$.jgrid=$.jgrid||{},$.extend($.jgrid,{saveState:function(a,b){if(b=$.extend({useStorage:!0,storageType:"localStorage",beforeSetItem:null,compression:!1,compressionModule:"LZString",compressionMethod:"compressToUTF16"},b||{}),a){var c,d,e="",f="",g=$("#"+a)[0];if(g.grid){if(d=$(g).data("inlineNav"),d&&g.p.inlineNav&&$(g).jqGrid("setGridParam",{_iN:d}),d=$(g).data("filterToolbar"),d&&g.p.filterToolbar&&$(g).jqGrid("setGridParam",{_fT:d}),e=$(g).jqGrid("jqGridExport",{exptype:"jsonstring",ident:"",root:""}),$(g.grid.bDiv).find(".ui-jqgrid-btable tr:gt(0)").each(function(a,b){f+=b.outerHTML}),$.isFunction(b.beforeSetItem)&&(c=b.beforeSetItem.call(g,e),null!=c&&(e=c)),b.compression&&b.compressionModule)try{c=window[b.compressionModule][b.compressionMethod](e),null!=c&&(e=c,f=window[b.compressionModule][b.compressionMethod](f))}catch(h){}if(b.useStorage&&$.jgrid.isLocalStorage())try{window[b.storageType].setItem("jqGrid"+g.p.id,e),window[b.storageType].setItem("jqGrid"+g.p.id+"_data",f)}catch(h){22===h.code&&alert("Local storage limit is over!")}return e}}},loadState:function(a,b,c){if(c=$.extend({useStorage:!0,storageType:"localStorage",clearAfterLoad:!1,beforeSetGrid:null,decompression:!1,decompressionModule:"LZString",decompressionMethod:"decompressFromUTF16"},c||{}),a){var d,e,f,g,h,i=$("#"+a)[0];if(i.grid&&$.jgrid.gridUnload(a),c.useStorage)try{b=window[c.storageType].getItem("jqGrid"+i.id),f=window[c.storageType].getItem("jqGrid"+i.id+"_data")}catch(j){}if(b){if(c.decompression&&c.decompressionModule)try{d=window[c.decompressionModule][c.decompressionMethod](b),null!=d&&(b=d,f=window[c.decompressionModule][c.decompressionMethod](f))}catch(j){}if(d=jqGridUtils.parse(b),d&&"object"===$.type(d)){$.isFunction(c.beforeSetGrid)&&(e=c.beforeSetGrid(d),e&&"object"===$.type(e)&&(d=e));var k=function(a){var b;return b=a},l={reccount:d.reccount,records:d.records,lastpage:d.lastpage,shrinkToFit:k(d.shrinkToFit),data:k(d.data),datatype:k(d.datatype),grouping:k(d.grouping)};d.shrinkToFit=!1,d.data=[],d.datatype="local",d.grouping=!1,d.navGrid=!1,d.inlineNav&&(g=k(d._iN),d._iN=null,delete d._iN),d.filterToolbar&&(h=k(d._fT),d._fT=null,delete d._fT);var m=$("#"+a).jqGrid(d);m.append(f),m.jqGrid("setGridParam",l),d.storeNavOptions&&m.jqGrid("navGrid",d.pager,d.navOptions,d.editOptions,d.addOptions,d.delOptions,d.searchOptions,d.viewOptions),d.inlineNav&&g&&(m.jqGrid("setGridParam",{inlineNav:!1}),m.jqGrid("inlineNav",d.pager,g)),d.filterToolbar&&h&&(m.jqGrid("setGridParam",{filterToolbar:!1}),m.jqGrid("filterToolbar",h)),m[0].updatepager(!0,!0),c.clearAfterLoad&&(window[c.storageType].removeItem("jqGrid"+i.id),window[c.storageType].removeItem("jqGrid"+i.id+"_data"))}else alert("can not convert to object")}}},setRegional:function(a,b){$.jgrid.saveState(a,{storageType:"sessionStorage"}),$.jgrid.loadState(a,null,{storageType:"sessionStorage",beforeSetGrid:function(a){return a.regional=b.regional,a.force_regional=!0,a}});var c=$("#"+a)[0],d=$(c).jqGrid("getGridParam","colModel"),e=-1,f=$.jgrid.getRegional(c,"nav");$.each(d,function(a){return this.formatter&&"actions"===this.formatter?(e=a,!1):void 0}),-1!==e&&f&&$("#"+a+" tbody tr").each(function(){var a=this.cells[e];$(a).find(".ui-inline-edit").attr("title",f.edittitle),$(a).find(".ui-inline-del").attr("title",f.deltitle),$(a).find(".ui-inline-save").attr("title",f.savetitle),$(a).find(".ui-inline-cancel").attr("title",f.canceltitle)});try{window.sessionStorage.removeItem("jqGrid"+c.id),window.sessionStorage.removeItem("jqGrid"+c.id+"_data")}catch(g){}},jqGridImport:function(a,b){b=$.extend({imptype:"xml",impstring:"",impurl:"",mtype:"GET",impData:{},xmlGrid:{config:"root>grid",data:"root>rows"},jsonGrid:{config:"grid",data:"data"},ajaxOptions:{}},b||{});var c=(0===a.indexOf("#")?"":"#")+$.jgrid.jqID(a),d=function(a,b){var d,e,f,g=$(b.xmlGrid.config,a)[0],h=$(b.xmlGrid.data,a)[0];if(jqGridUtils.xmlToJSON){d=jqGridUtils.xmlToJSON(g);for(f in d)d.hasOwnProperty(f)&&(e=d[f]);if(h){var i=d.grid.datatype;d.grid.datatype="xmlstring",d.grid.datastr=a,$(c).jqGrid(e).jqGrid("setGridParam",{datatype:i})}else setTimeout(function(){$(c).jqGrid(e)},0)}else alert("xml2json or parse are not present")},e=function(a,b){if(a&&"string"==typeof a){var d=jqGridUtils.parse(a),e=d[b.jsonGrid.config],f=d[b.jsonGrid.data];if(f){var g=e.datatype;e.datatype="jsonstring",e.datastr=f,$(c).jqGrid(e).jqGrid("setGridParam",{datatype:g})}else $(c).jqGrid(e)}};switch(b.imptype){case"xml":$.ajax($.extend({url:b.impurl,type:b.mtype,data:b.impData,dataType:"xml",complete:function(a,e){"success"===e&&(d(a.responseXML,b),$(c).triggerHandler("jqGridImportComplete",[a,b]),$.isFunction(b.importComplete)&&b.importComplete(a)),a=null}},b.ajaxOptions));break;case"xmlstring":if(b.impstring&&"string"==typeof b.impstring){var f=$.parseXML(b.impstring);f&&(d(f,b),$(c).triggerHandler("jqGridImportComplete",[f,b]),$.isFunction(b.importComplete)&&b.importComplete(f))}break;case"json":$.ajax($.extend({url:b.impurl,type:b.mtype,data:b.impData,dataType:"json",complete:function(a){try{e(a.responseText,b),$(c).triggerHandler("jqGridImportComplete",[a,b]),$.isFunction(b.importComplete)&&b.importComplete(a)}catch(d){}a=null}},b.ajaxOptions));break;case"jsonstring":b.impstring&&"string"==typeof b.impstring&&(e(b.impstring,b),$(c).triggerHandler("jqGridImportComplete",[b.impstring,b]),$.isFunction(b.importComplete)&&b.importComplete(b.impstring))}}}),$.jgrid.extend({jqGridExport:function(a){a=$.extend({exptype:"xmlstring",root:"grid",ident:"	",addOptions:{}},a||{});var b=null;return this.each(function(){if(this.grid){var c,d=$.extend(!0,{},$(this).jqGrid("getGridParam"),a.addOptions);if(d.rownumbers&&(d.colNames.splice(0,1),d.colModel.splice(0,1)),d.multiselect&&(d.colNames.splice(0,1),d.colModel.splice(0,1)),d.subGrid&&(d.colNames.splice(0,1),d.colModel.splice(0,1)),d.knv=null,d.treeGrid)for(c in d.treeReader)d.treeReader.hasOwnProperty(c)&&(d.colNames.splice(d.colNames.length-1),d.colModel.splice(d.colModel.length-1));switch(a.exptype){case"xmlstring":b="<"+a.root+">"+jqGridUtils.jsonToXML(d,{xmlDecl:""})+"</"+a.root+">";break;case"jsonstring":b=jqGridUtils.stringify(d),a.root&&(b="{"+a.root+":"+b+"}")}}}),b},excelExport:function(a){return a=$.extend({exptype:"remote",url:null,oper:"oper",tag:"excel",exportOptions:{}},a||{}),this.each(function(){if(this.grid){var b;if("remote"===a.exptype){var c=$.extend({},this.p.postData);c[a.oper]=a.tag;var d=jQuery.param(c);b=-1!==a.url.indexOf("?")?a.url+"&"+d:a.url+"?"+d,window.location=b}}})}}),$.jgrid.inlineEdit=$.jgrid.inlineEdit||{},$.jgrid.extend({editRow:function(a,b,c,d,e,f,g,h,i){var j={},k=$.makeArray(arguments).slice(1);return"object"===$.type(k[0])?j=k[0]:(void 0!==b&&(j.keys=b),$.isFunction(c)&&(j.oneditfunc=c),$.isFunction(d)&&(j.successfunc=d),void 0!==e&&(j.url=e),void 0!==f&&(j.extraparam=f),$.isFunction(g)&&(j.aftersavefunc=g),$.isFunction(h)&&(j.errorfunc=h),$.isFunction(i)&&(j.afterrestorefunc=i)),j=$.extend(!0,{keys:!1,oneditfunc:null,successfunc:null,url:null,extraparam:{},aftersavefunc:null,errorfunc:null,afterrestorefunc:null,restoreAfterError:!0,mtype:"POST",focusField:!0},$.jgrid.inlineEdit,j),this.each(function(){var b,c,d,e,f,g,h=this,i=0,k=null,l={},m=$(this).jqGrid("getStyleUI",h.p.styleUI+".inlinedit","inputClass",!0);h.grid&&(e=$(h).jqGrid("getInd",a,!0),e!==!1&&(g=$.isFunction(j.beforeEditRow)?j.beforeEditRow.call(h,j,a):void 0,void 0===g&&(g=!0),g&&(d=$(e).attr("editable")||"0","0"!==d||$(e).hasClass("not-editable-row")||(f=h.p.colModel,$('td[role="gridcell"]',e).each(function(d){b=f[d].name;var e=h.p.treeGrid===!0&&b===h.p.ExpandColumn;if(e)c=$("span:first",this).html();else try{c=$.unformat.call(h,this,{rowId:a,colModel:f[d]},d)}catch(g){c=f[d].edittype&&"textarea"===f[d].edittype?$(this).text():$(this).html()}if("cb"!==b&&"subgrid"!==b&&"rn"!==b&&(h.p.autoencode&&(c=$.jgrid.htmlDecode(c)),l[b]=c,f[d].editable===!0)){null===k&&(k=d),e?$("span:first",this).html(""):$(this).html("");var j=$.extend({},f[d].editoptions||{},{id:a+"_"+b,name:b,rowId:a,oper:"edit"});f[d].edittype||(f[d].edittype="text"),("&nbsp;"===c||"&#160;"===c||1===c.length&&160===c.charCodeAt(0))&&(c="");var n=$.jgrid.createEl.call(h,f[d].edittype,j,c,!0,$.extend({},$.jgrid.ajaxOptions,h.p.ajaxSelectOptions||{}));$(n).addClass("editable inline-edit-cell"),$.inArray(f[d].edittype,["text","textarea","password","select"])>-1&&$(n).addClass(m),e?$("span:first",this).append(n):$(this).append(n),$.jgrid.bindEv.call(h,n,j),"select"===f[d].edittype&&void 0!==f[d].editoptions&&f[d].editoptions.multiple===!0&&void 0===f[d].editoptions.dataUrl&&$.jgrid.msie&&$(n).width($(n).width()),i++}}),i>0&&(l.id=a,h.p.savedRow.push(l),$(e).attr("editable","1"),j.focusField&&("number"==typeof j.focusField&&parseInt(j.focusField,10)<=f.length&&(k=j.focusField),setTimeout(function(){var a=$("td:eq("+k+") :input:visible",e).not(":disabled");a.length>0&&a.focus()},0)),j.keys===!0&&$(e).bind("keyup",function(b){if(27===b.keyCode){if($(h).jqGrid("restoreRow",a,j.afterrestorefunc),h.p.inlineNav)try{$(h).jqGrid("showAddEditButtons")}catch(c){}return!1}if(13===b.keyCode){var d=b.target;if("TEXTAREA"===d.tagName)return!0;if($(h).jqGrid("saveRow",a,j)&&h.p.inlineNav)try{$(h).jqGrid("showAddEditButtons")}catch(e){}return!1}}),$(h).triggerHandler("jqGridInlineEditRow",[a,j]),$.isFunction(j.oneditfunc)&&j.oneditfunc.call(h,a))))))})},saveRow:function(a,b,c,d,e,f,g){var h=$.makeArray(arguments).slice(1),i={},j=this[0];"object"===$.type(h[0])?i=h[0]:($.isFunction(b)&&(i.successfunc=b),void 0!==c&&(i.url=c),void 0!==d&&(i.extraparam=d),$.isFunction(e)&&(i.aftersavefunc=e),$.isFunction(f)&&(i.errorfunc=f),$.isFunction(g)&&(i.afterrestorefunc=g)),i=$.extend(!0,{successfunc:null,url:null,extraparam:{},aftersavefunc:null,errorfunc:null,afterrestorefunc:null,restoreAfterError:!0,mtype:"POST",saveui:"enable",savetext:$.jgrid.getRegional(j,"defaults.savetext")},$.jgrid.inlineEdit,i);var k,l,m,n,o,p=!1,q={},r={},s={},t=!1,u=$.trim($(j).jqGrid("getStyleUI",j.p.styleUI+".common","error",!0));if(!j.grid)return p;if(o=$(j).jqGrid("getInd",a,!0),o===!1)return p;var v=$.jgrid.getRegional(this,"errors"),w=$.jgrid.getRegional(this,"edit"),x=$.isFunction(i.beforeSaveRow)?i.beforeSaveRow.call(j,i,a):void 0;if(void 0===x&&(x=!0),x){if(l=$(o).attr("editable"),i.url=i.url||j.p.editurl,"1"===l){var y;if($('td[role="gridcell"]',o).each(function(a){if(y=j.p.colModel[a],k=y.name,"cb"!==k&&"subgrid"!==k&&y.editable===!0&&"rn"!==k&&!$(this).hasClass("not-editable-cell")){switch(y.edittype){case"checkbox":var b=["Yes","No"];y.editoptions&&(b=y.editoptions.value.split(":")),q[k]=$("input",this).is(":checked")?b[0]:b[1];break;case"text":case"password":case"textarea":case"button":q[k]=$("input, textarea",this).val();break;case"select":if(y.editoptions.multiple){var c=$("select",this),d=[];q[k]=$(c).val(),q[k]=q[k]?q[k].join(","):"",$("select option:selected",this).each(function(a,b){d[a]=$(b).text()}),r[k]=d.join(",")}else q[k]=$("select option:selected",this).val(),r[k]=$("select option:selected",this).text();y.formatter&&"select"===y.formatter&&(r={});break;case"custom":try{if(!y.editoptions||!$.isFunction(y.editoptions.custom_value))throw"e1";if(q[k]=y.editoptions.custom_value.call(j,$(".customelement",this),"get"),void 0===q[k])throw"e2"}catch(e){"e1"===e?$.jgrid.info_dialog(v.errcap,"function 'custom_value' "+w.msg.nodefined,w.bClose,{styleUI:j.p.styleUI}):$.jgrid.info_dialog(v.errcap,e.message,w.bClose,{styleUI:j.p.styleUI})}}if(n=$.jgrid.checkValues.call(j,q[k],a),n[0]===!1)return!1;j.p.autoencode&&(q[k]=$.jgrid.htmlEncode(q[k])),"clientArray"!==i.url&&y.editoptions&&y.editoptions.NullIfEmpty===!0&&""===q[k]&&(s[k]="null",t=!0)}}),n[0]===!1){try{var z=$(j).jqGrid("getGridRowById",a),A=$.jgrid.findPos(z);$.jgrid.info_dialog(v.errcap,n[1],w.bClose,{left:A[0],top:A[1]+$(z).outerHeight(),styleUI:j.p.styleUI})}catch(B){alert(n[1])}return p}var C,D=j.p.prmNames,E=a;if(C=j.p.keyName===!1?D.id:j.p.keyName,q){if(q[D.oper]=D.editoper,void 0===q[C]||""===q[C])q[C]=a;else if(o.id!==j.p.idPrefix+q[C]){var F=$.jgrid.stripPref(j.p.idPrefix,a);if(void 0!==j.p._index[F]&&(j.p._index[q[C]]=j.p._index[F],delete j.p._index[F]),a=j.p.idPrefix+q[C],$(o).attr("id",a),j.p.selrow===E&&(j.p.selrow=a),$.isArray(j.p.selarrrow)){var G=$.inArray(E,j.p.selarrrow);G>=0&&(j.p.selarrrow[G]=a)}if(j.p.multiselect){var H="jqg_"+j.p.id+"_"+a;$("input.cbox",o).attr("id",H).attr("name",H)}}void 0===j.p.inlineData&&(j.p.inlineData={}),q=$.extend({},q,j.p.inlineData,i.extraparam)}if("clientArray"===i.url){q=$.extend({},q,r),j.p.autoencode&&$.each(q,function(a,b){q[a]=$.jgrid.htmlDecode(b)});var I,J=$(j).jqGrid("setRowData",a,q);for($(o).attr("editable","0"),I=0;I<j.p.savedRow.length;I++)if(String(j.p.savedRow[I].id)===String(E)){m=I;break}m>=0&&j.p.savedRow.splice(m,1),$(j).triggerHandler("jqGridInlineAfterSaveRow",[a,J,q,i]),$.isFunction(i.aftersavefunc)&&i.aftersavefunc.call(j,a,J,q,i),p=!0,$(o).removeClass("jqgrid-new-row").unbind("keydown")}else $(j).jqGrid("progressBar",{method:"show",loadtype:i.saveui,htmlcontent:i.savetext}),s=$.extend({},q,s),s[C]=$.jgrid.stripPref(j.p.idPrefix,s[C]),$.ajax($.extend({url:i.url,data:$.isFunction(j.p.serializeRowData)?j.p.serializeRowData.call(j,s):s,type:i.mtype,async:!1,complete:function(b,c){if($(j).jqGrid("progressBar",{method:"hide",loadtype:i.saveui,htmlcontent:i.savetext}),"success"===c){var d,e,f=!0;if(d=$(j).triggerHandler("jqGridInlineSuccessSaveRow",[b,a,i]),$.isArray(d)||(d=[!0,s]),d[0]&&$.isFunction(i.successfunc)&&(d=i.successfunc.call(j,b)),$.isArray(d)?(f=d[0],q=d[1]||q):f=d,f===!0){for(j.p.autoencode&&$.each(q,function(a,b){q[a]=$.jgrid.htmlDecode(b)}),t&&$.each(q,function(a){"null"===q[a]&&(q[a]="")}),q=$.extend({},q,r),$(j).jqGrid("setRowData",a,q),$(o).attr("editable","0"),e=0;e<j.p.savedRow.length;e++)if(String(j.p.savedRow[e].id)===String(a)){m=e;break}m>=0&&j.p.savedRow.splice(m,1),$(j).triggerHandler("jqGridInlineAfterSaveRow",[a,b,q,i]),$.isFunction(i.aftersavefunc)&&i.aftersavefunc.call(j,a,b,q,i),p=!0,$(o).removeClass("jqgrid-new-row").unbind("keydown")}else $(j).triggerHandler("jqGridInlineErrorSaveRow",[a,b,c,null,i]),$.isFunction(i.errorfunc)&&i.errorfunc.call(j,a,b,c,null),i.restoreAfterError===!0&&$(j).jqGrid("restoreRow",a,i.afterrestorefunc)}},error:function(b,c,d){if($("#lui_"+$.jgrid.jqID(j.p.id)).hide(),$(j).triggerHandler("jqGridInlineErrorSaveRow",[a,b,c,d,i]),$.isFunction(i.errorfunc))i.errorfunc.call(j,a,b,c,d);else{var e=b.responseText||b.statusText;try{$.jgrid.info_dialog(v.errcap,'<div class="'+u+'">'+e+"</div>",w.bClose,{buttonalign:"right",styleUI:j.p.styleUI})}catch(f){alert(e)}}i.restoreAfterError===!0&&$(j).jqGrid("restoreRow",a,i.afterrestorefunc)}},$.jgrid.ajaxOptions,j.p.ajaxRowOptions||{}))}return p}},restoreRow:function(a,b){var c=$.makeArray(arguments).slice(1),d={};return"object"===$.type(c[0])?d=c[0]:$.isFunction(b)&&(d.afterrestorefunc=b),d=$.extend(!0,{},$.jgrid.inlineEdit,d),this.each(function(){var b,c,e=this,f=-1,g={};if(e.grid&&(b=$(e).jqGrid("getInd",a,!0),b!==!1)){var h=$.isFunction(d.beforeCancelRow)?d.beforeCancelRow.call(e,d,a):void 0;if(void 0===h&&(h=!0),h){for(c=0;c<e.p.savedRow.length;c++)if(String(e.p.savedRow[c].id)===String(a)){f=c;break}if(f>=0){if($.isFunction($.fn.datepicker))try{$("input.hasDatepicker","#"+$.jgrid.jqID(b.id)).datepicker("hide")}catch(i){}$.each(e.p.colModel,function(){this.editable===!0&&e.p.savedRow[f].hasOwnProperty(this.name)&&(g[this.name]=e.p.savedRow[f][this.name])}),$(e).jqGrid("setRowData",a,g),$(b).attr("editable","0").unbind("keydown"),e.p.savedRow.splice(f,1),$("#"+$.jgrid.jqID(a),"#"+$.jgrid.jqID(e.p.id)).hasClass("jqgrid-new-row")&&setTimeout(function(){$(e).jqGrid("delRowData",a),$(e).jqGrid("showAddEditButtons")},0)}$(e).triggerHandler("jqGridInlineAfterRestoreRow",[a]),$.isFunction(d.afterrestorefunc)&&d.afterrestorefunc.call(e,a)}}})},addRow:function(a){return a=$.extend(!0,{rowID:null,initdata:{},position:"first",useDefValues:!0,useFormatter:!1,addRowParams:{extraparam:{}}},a||{}),this.each(function(){if(this.grid){var b=this,c=$.isFunction(a.beforeAddRow)?a.beforeAddRow.call(b,a.addRowParams):void 0;if(void 0===c&&(c=!0),c)if(a.rowID=$.isFunction(a.rowID)?a.rowID.call(b,a):null!=a.rowID?a.rowID:$.jgrid.randId(),a.useDefValues===!0&&$(b.p.colModel).each(function(){if(this.editoptions&&this.editoptions.defaultValue){var c=this.editoptions.defaultValue,d=$.isFunction(c)?c.call(b):c;a.initdata[this.name]=d}}),$(b).jqGrid("addRowData",a.rowID,a.initdata,a.position),a.rowID=b.p.idPrefix+a.rowID,$("#"+$.jgrid.jqID(a.rowID),"#"+$.jgrid.jqID(b.p.id)).addClass("jqgrid-new-row"),a.useFormatter)$("#"+$.jgrid.jqID(a.rowID)+" .ui-inline-edit","#"+$.jgrid.jqID(b.p.id)).click();else{var d=b.p.prmNames,e=d.oper;a.addRowParams.extraparam[e]=d.addoper,$(b).jqGrid("editRow",a.rowID,a.addRowParams),$(b).jqGrid("setSelection",a.rowID)}}})},inlineNav:function(a,b){var c=this[0],d=$.jgrid.getRegional(c,"nav"),e=$.jgrid.styleUI[c.p.styleUI].inlinedit;return b=$.extend(!0,{edit:!0,editicon:e.icon_edit_nav,add:!0,addicon:e.icon_add_nav,save:!0,saveicon:e.icon_save_nav,cancel:!0,cancelicon:e.icon_cancel_nav,addParams:{addRowParams:{extraparam:{}}},editParams:{},restoreAfterSelect:!0},d,b||{}),this.each(function(){if(this.grid&&!this.p.inlineNav){var e=$.jgrid.jqID(c.p.id),f=$.trim($(c).jqGrid("getStyleUI",c.p.styleUI+".common","disabled",!0));if(c.p.navGrid||$(c).jqGrid("navGrid",a,{refresh:!1,edit:!1,add:!1,del:!1,search:!1,view:!1}),$(c).data("inlineNav")||$(c).data("inlineNav",b),c.p.force_regional&&(b=$.extend(b,d)),c.p.inlineNav=!0,b.addParams.useFormatter===!0){var g,h=c.p.colModel;for(g=0;g<h.length;g++)if(h[g].formatter&&"actions"===h[g].formatter){if(h[g].formatoptions){var i={keys:!1,onEdit:null,onSuccess:null,afterSave:null,onError:null,afterRestore:null,extraparam:{},url:null},j=$.extend(i,h[g].formatoptions);b.addParams.addRowParams={keys:j.keys,oneditfunc:j.onEdit,successfunc:j.onSuccess,url:j.url,extraparam:j.extraparam,aftersavefunc:j.afterSave,errorfunc:j.onError,afterrestorefunc:j.afterRestore}}break}}b.add&&$(c).jqGrid("navButtonAdd",a,{caption:b.addtext,title:b.addtitle,buttonicon:b.addicon,id:c.p.id+"_iladd",onClickButton:function(){$(c).jqGrid("addRow",b.addParams),b.addParams.useFormatter||($("#"+e+"_ilsave").removeClass(f),$("#"+e+"_ilcancel").removeClass(f),$("#"+e+"_iladd").addClass(f),$("#"+e+"_iledit").addClass(f))}}),b.edit&&$(c).jqGrid("navButtonAdd",a,{caption:b.edittext,title:b.edittitle,buttonicon:b.editicon,id:c.p.id+"_iledit",onClickButton:function(){var a=$(c).jqGrid("getGridParam","selrow");a?($(c).jqGrid("editRow",a,b.editParams),$("#"+e+"_ilsave").removeClass(f),$("#"+e+"_ilcancel").removeClass(f),$("#"+e+"_iladd").addClass(f),$("#"+e+"_iledit").addClass(f)):($.jgrid.viewModal("#alertmod_"+e,{gbox:"#gbox_"+e,jqm:!0}),$("#jqg_alrt").focus())}}),b.save&&($(c).jqGrid("navButtonAdd",a,{caption:b.savetext||"",title:b.savetitle||"Save row",buttonicon:b.saveicon,id:c.p.id+"_ilsave",onClickButton:function(){var a=c.p.savedRow[0].id;if(a){var d=c.p.prmNames,f=d.oper,g=b.editParams;$("#"+$.jgrid.jqID(a),"#"+e).hasClass("jqgrid-new-row")?(b.addParams.addRowParams.extraparam[f]=d.addoper,g=b.addParams.addRowParams):(b.editParams.extraparam||(b.editParams.extraparam={}),b.editParams.extraparam[f]=d.editoper),$(c).jqGrid("saveRow",a,g)&&$(c).jqGrid("showAddEditButtons")}else $.jgrid.viewModal("#alertmod_"+e,{gbox:"#gbox_"+e,jqm:!0}),$("#jqg_alrt").focus()}}),$("#"+e+"_ilsave").addClass(f)),b.cancel&&($(c).jqGrid("navButtonAdd",a,{caption:b.canceltext||"",title:b.canceltitle||"Cancel row editing",buttonicon:b.cancelicon,id:c.p.id+"_ilcancel",onClickButton:function(){var a=c.p.savedRow[0].id,d=b.editParams;a?($("#"+$.jgrid.jqID(a),"#"+e).hasClass("jqgrid-new-row")&&(d=b.addParams.addRowParams),$(c).jqGrid("restoreRow",a,d),$(c).jqGrid("showAddEditButtons")):($.jgrid.viewModal("#alertmod",{gbox:"#gbox_"+e,jqm:!0}),$("#jqg_alrt").focus())}}),$("#"+e+"_ilcancel").addClass(f)),b.restoreAfterSelect===!0&&$(c).bind("jqGridBeforeSelectRow.inlineNav",function(a,d){c.p.savedRow.length>0&&c.p.inlineNav===!0&&d!==c.p.selrow&&null!==c.p.selrow&&(c.p.selrow===b.addParams.rowID?$(c).jqGrid("delRowData",c.p.selrow):$(c).jqGrid("restoreRow",c.p.selrow,b.editParams),$(c).jqGrid("showAddEditButtons"))})}})},showAddEditButtons:function(){return this.each(function(){if(this.grid){var a=$.jgrid.jqID(this.p.id),b=$.trim($(this).jqGrid("getStyleUI",this.p.styleUI+".common","disabled",!0));$("#"+a+"_ilsave").addClass(b),$("#"+a+"_ilcancel").addClass(b),$("#"+a+"_iladd").removeClass(b),$("#"+a+"_iledit").removeClass(b)}})}}),$.jgrid.msie&&8===$.jgrid.msiever()&&($.expr[":"].hidden=function(a){return 0===a.offsetWidth||0===a.offsetHeight||"none"===a.style.display}),$.jgrid._multiselect=!1,$.ui&&$.ui.multiselect){if($.ui.multiselect.prototype._setSelected){var setSelected=$.ui.multiselect.prototype._setSelected;$.ui.multiselect.prototype._setSelected=function(a,b){var c=setSelected.call(this,a,b);if(b&&this.selectedList){var d=this.element;this.selectedList.find("li").each(function(){$(this).data("optionLink")&&$(this).data("optionLink").remove().appendTo(d)})}return c}}$.ui.multiselect.prototype.destroy&&($.ui.multiselect.prototype.destroy=function(){this.element.show(),this.container.remove(),void 0===$.Widget?$.widget.prototype.destroy.apply(this,arguments):$.Widget.prototype.destroy.apply(this,arguments)}),$.jgrid._multiselect=!0}$.jgrid.extend({sortableColumns:function(a){return this.each(function(){function b(){c.p.disableClick=!0}var c=this,d=$.jgrid.jqID(c.p.id),e={tolerance:"pointer",axis:"x",scrollSensitivity:"1",items:">th:not(:has(#jqgh_"+d+"_cb,#jqgh_"+d+"_rn,#jqgh_"+d+"_subgrid),:hidden)",placeholder:{element:function(a){var b=$(document.createElement(a[0].nodeName)).addClass(a[0].className+" ui-sortable-placeholder ui-state-highlight").removeClass("ui-sortable-helper")[0];return b},update:function(a,b){b.height(a.currentItem.innerHeight()-parseInt(a.currentItem.css("paddingTop")||0,10)-parseInt(a.currentItem.css("paddingBottom")||0,10)),b.width(a.currentItem.innerWidth()-parseInt(a.currentItem.css("paddingLeft")||0,10)-parseInt(a.currentItem.css("paddingRight")||0,10))}},update:function(a,b){var d=$(b.item).parent(),e=$(">th",d),f=c.p.colModel,g={},h=c.p.id+"_";$.each(f,function(a){g[this.name]=a});var i=[];e.each(function(){var a=$(">div",this).get(0).id.replace(/^jqgh_/,"").replace(h,"");g.hasOwnProperty(a)&&i.push(g[a])}),$(c).jqGrid("remapColumns",i,!0,!0),$.isFunction(c.p.sortable.update)&&c.p.sortable.update(i),setTimeout(function(){c.p.disableClick=!1},50)}};if(c.p.sortable.options?$.extend(e,c.p.sortable.options):$.isFunction(c.p.sortable)&&(c.p.sortable={update:c.p.sortable}),e.start){var f=e.start;e.start=function(a,c){b(),f.call(this,a,c)}}else e.start=b;c.p.sortable.exclude&&(e.items+=":not("+c.p.sortable.exclude+")");var g=a.sortable(e),h=g.data("sortable")||g.data("uiSortable");null!=h&&(h.data("sortable").floating=!0)})},columnChooser:function(a){function b(a,b,c){var d,e;return b>=0?(d=a.slice(),e=d.splice(b,Math.max(a.length-b,b)),b>a.length&&(b=a.length),d[b]=c,d.concat(e)):a}function c(a,b){a&&("string"==typeof a?$.fn[a]&&$.fn[a].apply(b,$.makeArray(arguments).slice(2)):$.isFunction(a)&&a.apply(b,$.makeArray(arguments).slice(2)))}var d,e,f,g,h,i,j,k=this,l={},m=[],n=k.jqGrid("getGridParam","colModel"),o=k.jqGrid("getGridParam","colNames"),p=function(a){return $.ui.multiselect.prototype&&a.data($.ui.multiselect.prototype.widgetFullName||$.ui.multiselect.prototype.widgetName)||a.data("ui-multiselect")||a.data("multiselect")},q=$.jgrid.getRegional(this[0],"col");if(!$("#colchooser_"+$.jgrid.jqID(k[0].p.id)).length){if(d=$('<div id="colchooser_'+k[0].p.id+'" style="position:relative;overflow:hidden"><div><select multiple="multiple"></select></div></div>'),e=$("select",d),a=$.extend({width:400,height:240,classname:null,done:function(a){a&&k.jqGrid("remapColumns",a,!0)},msel:"multiselect",dlog:"dialog",dialog_opts:{minWidth:470,dialogClass:"ui-jqdialog"},dlog_opts:function(a){var b={};return b[a.bSubmit]=function(){a.apply_perm(),a.cleanup(!1)},b[a.bCancel]=function(){a.cleanup(!0)},$.extend(!0,{buttons:b,close:function(){a.cleanup(!0)},modal:a.modal||!1,resizable:a.resizable||!0,width:a.width+70,resize:function(){var a=p(e),b=a.container.closest(".ui-dialog-content");b.length>0&&"object"==typeof b[0].style?b[0].style.width="":b.css("width",""),a.selectedList.height(Math.max(a.selectedContainer.height()-a.selectedActions.outerHeight()-1,1)),a.availableList.height(Math.max(a.availableContainer.height()-a.availableActions.outerHeight()-1,1))}},a.dialog_opts||{})},apply_perm:function(){var c=[];$("option",e).each(function(){$(this).is("[selected]")?k.jqGrid("showCol",n[this.value].name):k.jqGrid("hideCol",n[this.value].name)}),$("option[selected]",e).each(function(){c.push(parseInt(this.value,10))}),$.each(c,function(){delete l[n[parseInt(this,10)].name]}),$.each(l,function(){var a=parseInt(this,10);c=b(c,a,a)}),a.done&&a.done.call(k,c),k.jqGrid("setGridWidth",k[0].p.width,k[0].p.shrinkToFit)},cleanup:function(b){c(a.dlog,d,"destroy"),c(a.msel,e,"destroy"),d.remove(),b&&a.done&&a.done.call(k)},msel_opts:{}},q,a||{}),$.ui&&$.ui.multiselect&&$.ui.multiselect.defaults){if(!$.jgrid._multiselect)return void alert("Multiselect plugin loaded after jqGrid. Please load the plugin before the jqGrid!");a.msel_opts=$.extend($.ui.multiselect.defaults,a.msel_opts)}a.caption&&d.attr("title",a.caption),a.classname&&(d.addClass(a.classname),e.addClass(a.classname)),a.width&&($(">div",d).css({width:a.width,margin:"0 auto"}),e.css("width",a.width)),a.height&&($(">div",d).css("height",a.height),e.css("height",a.height-10)),e.empty(),$.each(n,function(a){return l[this.name]=a,this.hidedlg?void(this.hidden||m.push(a)):void e.append("<option value='"+a+"' "+(this.hidden?"":"selected='selected'")+">"+$.jgrid.stripHtml(o[a])+"</option>")}),f=$.isFunction(a.dlog_opts)?a.dlog_opts.call(k,a):a.dlog_opts,c(a.dlog,d,f),g=$.isFunction(a.msel_opts)?a.msel_opts.call(k,a):a.msel_opts,c(a.msel,e,g),h=$("#colchooser_"+$.jgrid.jqID(k[0].p.id)),h.css({margin:"auto"}),h.find(">div").css({width:"100%",height:"100%",margin:"auto"}),i=p(e),i.container.css({width:"100%",height:"100%",margin:"auto"}),i.selectedContainer.css({width:100*i.options.dividerLocation+"%",height:"100%",margin:"auto",boxSizing:"border-box"}),i.availableContainer.css({width:100-100*i.options.dividerLocation+"%",height:"100%",margin:"auto",boxSizing:"border-box"}),i.selectedList.css("height","auto"),i.availableList.css("height","auto"),j=Math.max(i.selectedList.height(),i.availableList.height()),j=Math.min(j,$(window).height()),i.selectedList.css("height",j),i.availableList.css("height",j)}},sortableRows:function(a){return this.each(function(){var b=this;b.grid&&(b.p.treeGrid||$.fn.sortable&&(a=$.extend({cursor:"move",axis:"y",items:" > .jqgrow"},a||{}),a.start&&$.isFunction(a.start)?(a._start_=a.start,delete a.start):a._start_=!1,a.update&&$.isFunction(a.update)?(a._update_=a.update,delete a.update):a._update_=!1,a.start=function(c,d){if($(d.item).css("border-width","0"),$("td",d.item).each(function(a){this.style.width=b.grid.cols[a].style.width}),b.p.subGrid){var e=$(d.item).attr("id");try{$(b).jqGrid("collapseSubGridRow",e)}catch(f){}}a._start_&&a._start_.apply(this,[c,d])},a.update=function(c,d){$(d.item).css("border-width",""),b.p.rownumbers===!0&&$("td.jqgrid-rownum",b.rows).each(function(a){$(this).html(a+1+(parseInt(b.p.page,10)-1)*parseInt(b.p.rowNum,10))}),a._update_&&a._update_.apply(this,[c,d])},$("tbody:first",b).sortable(a),$("tbody:first > .jqgrow",b).disableSelection()))})},gridDnD:function(a){return this.each(function(){function b(){var a=$.data(e,"dnd");$("tr.jqgrow:not(.ui-draggable)",e).draggable($.isFunction(a.drag)?a.drag.call($(e),a):a.drag)}var c,d,e=this;if(e.grid&&!e.p.treeGrid&&$.fn.draggable&&$.fn.droppable){var f="<table id='jqgrid_dnd' class='ui-jqgrid-dnd'></table>";if(void 0===$("#jqgrid_dnd")[0]&&$("body").append(f),"string"==typeof a&&"updateDnD"===a&&e.p.jqgdnd===!0)return void b();if(a=$.extend({drag:function(a){return $.extend({start:function(b,c){var d,f;if(e.p.subGrid){f=$(c.helper).attr("id");try{$(e).jqGrid("collapseSubGridRow",f)}catch(g){}}for(d=0;d<$.data(e,"dnd").connectWith.length;d++)0===$($.data(e,"dnd").connectWith[d]).jqGrid("getGridParam","reccount")&&$($.data(e,"dnd").connectWith[d]).jqGrid("addRowData","jqg_empty_row",{});c.helper.addClass("ui-state-highlight"),$("td",c.helper).each(function(a){this.style.width=e.grid.headers[a].width+"px"}),a.onstart&&$.isFunction(a.onstart)&&a.onstart.call($(e),b,c)},stop:function(b,c){var d,f;for(c.helper.dropped&&!a.dragcopy&&(f=$(c.helper).attr("id"),void 0===f&&(f=$(this).attr("id")),$(e).jqGrid("delRowData",f)),d=0;d<$.data(e,"dnd").connectWith.length;d++)$($.data(e,"dnd").connectWith[d]).jqGrid("delRowData","jqg_empty_row");a.onstop&&$.isFunction(a.onstop)&&a.onstop.call($(e),b,c)}},a.drag_opts||{})},drop:function(a){return $.extend({accept:function(a){if(!$(a).hasClass("jqgrow"))return a;var b=$(a).closest("table.ui-jqgrid-btable");if(b.length>0&&void 0!==$.data(b[0],"dnd")){var c=$.data(b[0],"dnd").connectWith;return-1!==$.inArray("#"+$.jgrid.jqID(this.id),c)?!0:!1}return!1},drop:function(b,c){if($(c.draggable).hasClass("jqgrow")){var d=$(c.draggable).attr("id"),f=c.draggable.parent().parent().jqGrid("getRowData",d);if(!a.dropbyname){var g,h,i=0,j={},k=$("#"+$.jgrid.jqID(this.id)).jqGrid("getGridParam","colModel");
try{for(h in f)f.hasOwnProperty(h)&&(g=k[i].name,"cb"!==g&&"rn"!==g&&"subgrid"!==g&&f.hasOwnProperty(h)&&k[i]&&(j[g]=f[h]),i++);f=j}catch(l){}}if(c.helper.dropped=!0,a.beforedrop&&$.isFunction(a.beforedrop)){var m=a.beforedrop.call(this,b,c,f,$("#"+$.jgrid.jqID(e.p.id)),$(this));void 0!==m&&null!==m&&"object"==typeof m&&(f=m)}if(c.helper.dropped){var n;a.autoid&&($.isFunction(a.autoid)?n=a.autoid.call(this,f):(n=Math.ceil(1e3*Math.random()),n=a.autoidprefix+n)),$("#"+$.jgrid.jqID(this.id)).jqGrid("addRowData",n,f,a.droppos)}a.ondrop&&$.isFunction(a.ondrop)&&a.ondrop.call(this,b,c,f)}}},a.drop_opts||{})},onstart:null,onstop:null,beforedrop:null,ondrop:null,drop_opts:{activeClass:"ui-state-active",hoverClass:"ui-state-hover"},drag_opts:{revert:"invalid",helper:"clone",cursor:"move",appendTo:"#jqgrid_dnd",zIndex:5e3},dragcopy:!1,dropbyname:!1,droppos:"first",autoid:!0,autoidprefix:"dnd_"},a||{}),a.connectWith)for(a.connectWith=a.connectWith.split(","),a.connectWith=$.map(a.connectWith,function(a){return $.trim(a)}),$.data(e,"dnd",a),0===e.p.reccount||e.p.jqgdnd||b(),e.p.jqgdnd=!0,c=0;c<a.connectWith.length;c++)d=a.connectWith[c],$(d).droppable($.isFunction(a.drop)?a.drop.call($(e),a):a.drop)}})},gridResize:function(opts){return this.each(function(){var $t=this,gID=$.jgrid.jqID($t.p.id),req;if($t.grid&&$.fn.resizable){if(opts=$.extend({},opts||{}),opts.alsoResize?(opts._alsoResize_=opts.alsoResize,delete opts.alsoResize):opts._alsoResize_=!1,opts.stop&&$.isFunction(opts.stop)?(opts._stop_=opts.stop,delete opts.stop):opts._stop_=!1,opts.stop=function(a,b){$($t).jqGrid("setGridParam",{height:$("#gview_"+gID+" .ui-jqgrid-bdiv").height()}),$($t).jqGrid("setGridWidth",b.size.width,opts.shrinkToFit),opts._stop_&&opts._stop_.call($t,a,b),$t.p.caption&&$("#gbox_"+gID).css({height:"auto"}),$t.p.frozenColumns&&(req&&clearTimeout(req),req=setTimeout(function(){req&&clearTimeout(req),$("#"+gID).jqGrid("destroyFrozenColumns"),$("#"+gID).jqGrid("setFrozenColumns")}))},opts._alsoResize_){var optstest="{'#gview_"+gID+" .ui-jqgrid-bdiv':true,'"+opts._alsoResize_+"':true}";opts.alsoResize=eval("("+optstest+")")}else opts.alsoResize=$(".ui-jqgrid-bdiv","#gview_"+gID);delete opts._alsoResize_,$("#gbox_"+gID).resizable(opts)}})}}),$.assocArraySize=function(a){var b,c=0;for(b in a)a.hasOwnProperty(b)&&c++;return c},$.jgrid.extend({pivotSetup:function(a,b){var c=[],d=[],e=[],f=[],g=[],h={grouping:!0,groupingView:{groupField:[],groupSummary:[],groupSummaryPos:[]}},i=[],j=$.extend({rowTotals:!1,rowTotalsText:"Total",colTotals:!1,groupSummary:!0,groupSummaryPos:"header",frozenStaticCols:!1},b||{});return this.each(function(){function b(a,b,c){var d;return d=_pivotfilter.call(a,b,c),d.length>0?d[0]:null}function k(a,b){var c,d=0,e=!0;for(c in a)if(a.hasOwnProperty(c)){if(a[c]!=this[d]){e=!1;break}if(d++,d>=this.length)break}return e&&(p=b),e}function l(a,b,c,d){var e;switch(a){case"sum":e=parseFloat(b||0)+parseFloat(d[c]||0);break;case"count":(""===b||null==b)&&(b=0),e=d.hasOwnProperty(c)?b+1:0;break;case"min":e=""===b||null==b?parseFloat(d[c]||0):Math.min(parseFloat(b),parseFloat(d[c]||0));break;case"max":e=""===b||null==b?parseFloat(d[c]||0):Math.max(parseFloat(b),parseFloat(d[c]||0))}return e}function m(a,b,c,d){var e,h,i,j,k=b.length,m="",n=[];for($.isArray(c)?(j=c.length,n=c):(j=1,n[0]=c),f=[],g=[],f.root=0,i=0;j>i;i++){var o,p=[];for(e=0;k>e;e++){if(null==c)h=$.trim(b[e].member)+"_"+b[e].aggregator,o=h,n[0]=b[e].label||b[e].aggregator+" "+$.trim(b[e].member);else{o=c[i].replace(/\s+/g,"");try{h=1===k?m+o:m+o+"_"+b[e].aggregator+"_"+String(e)}catch(q){}n[i]=c[i]}h=isNaN(parseInt(h,10))?h:h+" ",d[h]=p[h]=l(b[e].aggregator,d[h],b[e].member,a),1>=i&&"_r_Totals"!==o&&""===m&&(m=o)}f[h]=p,g[h]=n[i]}return d}function n(a){var b,d,e,f,g;for(e in a)if(a.hasOwnProperty(e)){if("object"!=typeof a[e]){if("level"===e){if(void 0===J[a.level]&&(J[a.level]="",a.level>0&&"_r_Totals"!==a.text&&(i[a.level-1]={useColSpanStyle:!1,groupHeaders:[]})),J[a.level]!==a.text&&a.children.length&&"_r_Totals"!==a.text&&a.level>0){i[a.level-1].groupHeaders.push({titleText:a.label,numberOfColumns:0});var h=i[a.level-1].groupHeaders.length-1,k=0===h?L:K+t;if(a.level-1===(j.rowTotals?1:0)&&h>0){for(var l=0,m=0;h>m;m++)l+=i[a.level-1].groupHeaders[m].numberOfColumns;l&&(k=l+r)}c[k]&&(i[a.level-1].groupHeaders[h].startColumnName=c[k].name,i[a.level-1].groupHeaders[h].numberOfColumns=c.length-k),K=c.length}J[a.level]=a.text}if(a.level===s&&"level"===e&&s>0)if(t>1){var o=1;for(b in a.fields)a.fields.hasOwnProperty(b)&&(1===o&&i[s-1].groupHeaders.push({startColumnName:b,numberOfColumns:1,titleText:a.label||a.text}),o++);i[s-1].groupHeaders[i[s-1].groupHeaders.length-1].numberOfColumns=o-1}else i.splice(s-1,1)}if(null!=a[e]&&"object"==typeof a[e]&&n(a[e]),"level"===e&&a.level>0&&a.level===(0===s?a.level:s)){d=0;for(b in a.fields)if(a.fields.hasOwnProperty(b)){g={};for(f in j.aggregates[d])if(j.aggregates[d].hasOwnProperty(f))switch(f){case"member":case"label":case"aggregator":break;default:g[f]=j.aggregates[d][f]}t>1?(g.name=b,g.label=j.aggregates[d].label||a.label):(g.name=a.text,g.label="_r_Totals"===a.text?j.rowTotalsText:a.label),c.push(g),d++}}}}var o,p,q,r,s,t,u,v,w=a.length,x=0;if(j.rowTotals&&j.yDimension.length>0){var y=j.yDimension[0].dataName;j.yDimension.splice(0,0,{dataName:y}),j.yDimension[0].converter=function(){return"_r_Totals"}}if(r=$.isArray(j.xDimension)?j.xDimension.length:0,s=j.yDimension.length,t=$.isArray(j.aggregates)?j.aggregates.length:0,0===r||0===t)throw"xDimension or aggregates optiona are not set!";var z;for(q=0;r>q;q++)z={name:j.xDimension[q].dataName,frozen:j.frozenStaticCols},null==j.xDimension[q].isGroupField&&(j.xDimension[q].isGroupField=!0),z=$.extend(!0,z,j.xDimension[q]),c.push(z);for(var A=r-1,B={};w>x;){o=a[x];var C=[],D=[];u={},q=0;do C[q]=$.trim(o[j.xDimension[q].dataName]),u[j.xDimension[q].dataName]=C[q],q++;while(r>q);var E=0;if(p=-1,v=b(d,k,C)){if(p>=0){if(E=0,s>=1){for(E=0;s>E;E++)D[E]=$.trim(o[j.yDimension[E].dataName]),j.yDimension[E].converter&&$.isFunction(j.yDimension[E].converter)&&(D[E]=j.yDimension[E].converter.call(this,D[E],C,D));v=m(o,j.aggregates,D,v)}else 0===s&&(v=m(o,j.aggregates,null,v));d[p]=v}}else{if(E=0,s>=1){for(E=0;s>E;E++)D[E]=$.trim(o[j.yDimension[E].dataName]),j.yDimension[E].converter&&$.isFunction(j.yDimension[E].converter)&&(D[E]=j.yDimension[E].converter.call(this,D[E],C,D));u=m(o,j.aggregates,D,u)}else 0===s&&(u=m(o,j.aggregates,null,u));d.push(u)}var F,G=0,H=null,I=null;for(F in f)if(f.hasOwnProperty(F)){if(0===G)B.children&&void 0!==B.children||(B={text:F,level:0,children:[],label:F}),H=B.children;else{for(I=null,q=0;q<H.length;q++)if(H[q].text===F){I=H[q];break}I?H=I.children:(H.push({children:[],text:F,level:G,fields:f[F],label:g[F]}),H=H[H.length-1].children)}G++}x++}var J=[],K=c.length,L=K;s>0&&(i[s-1]={useColSpanStyle:!1,groupHeaders:[]}),n(B);var M;if(j.colTotals)for(var N=d.length;N--;)for(q=r;q<c.length;q++)M=c[q].name,e[M]?e[M]+=parseFloat(d[N][M]||0):e[M]=parseFloat(d[N][M]||0);if(A>0)for(q=0;A>q;q++)c[q].isGroupField&&(h.groupingView.groupField.push(c[q].name),h.groupingView.groupSummary.push(j.groupSummary),h.groupingView.groupSummaryPos.push(j.groupSummaryPos));else h.grouping=!1;h.sortname=c[A].name,h.groupingView.hideFirstGroupCol=!0}),{colModel:c,rows:d,groupOptions:h,groupHeaders:i,summary:e}},jqPivot:function(a,b,c,d){return this.each(function(){function e(a){var d,e=jQuery(f).jqGrid("pivotSetup",a,b),g=$.assocArraySize(e.summary)>0?!0:!1,h=$.jgrid.from.call(f,e.rows);for(d=0;d<e.groupOptions.groupingView.groupField.length;d++)h.orderBy(e.groupOptions.groupingView.groupField[d],"a","text","");jQuery(f).jqGrid($.extend(!0,{datastr:$.extend(h.select(),g?{userdata:e.summary}:{}),datatype:"jsonstring",footerrow:g,userDataOnFooter:g,colModel:e.colModel,viewrecords:!0,sortname:b.xDimension[0].dataName},e.groupOptions,c||{}));var i=e.groupHeaders;if(i.length)for(d=0;d<i.length;d++)i[d]&&i[d].groupHeaders.length&&jQuery(f).jqGrid("setGroupHeaders",i[d]);b.frozenStaticCols&&jQuery(f).jqGrid("setFrozenColumns")}var f=this;"string"==typeof a?$.ajax($.extend({url:a,dataType:"json",success:function(a){e($.jgrid.getAccessor(a,d&&d.reader?d.reader:"rows"))}},d||{})):e(a)})}}),$.jgrid.extend({setSubGrid:function(){return this.each(function(){var a,b,c=this,d=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].subgrid,e={plusicon:d.icon_plus,minusicon:d.icon_minus,openicon:d.icon_open,expandOnLoad:!1,delayOnLoad:50,selectOnExpand:!1,selectOnCollapse:!1,reloadOnExpand:!0};if(c.p.subGridOptions=$.extend(e,c.p.subGridOptions||{}),c.p.colNames.unshift(""),c.p.colModel.unshift({name:"subgrid",width:$.jgrid.cell_width?c.p.subGridWidth+c.p.cellLayout:c.p.subGridWidth,sortable:!1,resizable:!1,hidedlg:!0,search:!1,fixed:!0}),a=c.p.subGridModel,a[0])for(a[0].align=$.extend([],a[0].align||[]),b=0;b<a[0].name.length;b++)a[0].align[b]=a[0].align[b]||"left"})},addSubGridCell:function(a,b){var c,d,e,f="";return this.each(function(){f=this.formatCol(a,b),d=this.p.id,c=this.p.subGridOptions.plusicon,e=$.jgrid.styleUI[this.p.styleUI||"jQueryUI"].common}),'<td role="gridcell" aria-describedby="'+d+'_subgrid" class="ui-sgcollapsed sgcollapsed" '+f+"><a style='cursor:pointer;' class='ui-sghref'><span class='"+e.icon_base+" "+c+"'></span></a></td>"},addSubGrid:function(a,b){return this.each(function(){var c=this;if(c.grid){var d,e,f,g,h,i=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].base,j=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].common,k=function(a,b,d){var e=$("<td align='"+c.p.subGridModel[0].align[d]+"'></td>").html(b);$(a).append(e)},l=function(a,b){var d,e,f,g=$("<table class='"+i.rowTable+" ui-common-table'><tbody></tbody></table>"),h=$("<tr></tr>");for(e=0;e<c.p.subGridModel[0].name.length;e++)d=$("<th class='"+i.headerBox+" ui-th-subgrid ui-th-column ui-th-"+c.p.direction+"'></th>"),$(d).html(c.p.subGridModel[0].name[e]),$(d).width(c.p.subGridModel[0].width[e]),$(h).append(d);$(g).append(h),a&&(f=c.p.xmlReader.subgrid,$(f.root+" "+f.row,a).each(function(){if(h=$("<tr class='"+j.content+" ui-subtblcell'></tr>"),f.repeatitems===!0)$(f.cell,this).each(function(a){k(h,$(this).text()||"&#160;",a)});else{var a=c.p.subGridModel[0].mapping||c.p.subGridModel[0].name;if(a)for(e=0;e<a.length;e++)k(h,$(a[e],this).text()||"&#160;",e)}$(g).append(h)}));var l=$("table:first",c.grid.bDiv).attr("id")+"_";return $("#"+$.jgrid.jqID(l+b)).append(g),c.grid.hDiv.loading=!1,$("#load_"+$.jgrid.jqID(c.p.id)).hide(),!1},m=function(a,b){var d,e,f,g,h,l,m=$("<table class='"+i.rowTable+" ui-common-table'><tbody></tbody></table>"),n=$("<tr></tr>");for(f=0;f<c.p.subGridModel[0].name.length;f++)d=$("<th class='"+i.headerBox+" ui-th-subgrid ui-th-column ui-th-"+c.p.direction+"'></th>"),$(d).html(c.p.subGridModel[0].name[f]),$(d).width(c.p.subGridModel[0].width[f]),$(n).append(d);if($(m).append(n),a&&(h=c.p.jsonReader.subgrid,e=$.jgrid.getAccessor(a,h.root),void 0!==e))for(f=0;f<e.length;f++){if(g=e[f],n=$("<tr class='"+j.content+" ui-subtblcell'></tr>"),h.repeatitems===!0)for(h.cell&&(g=g[h.cell]),l=0;l<g.length;l++)k(n,g[l]||"&#160;",l);else{var o=c.p.subGridModel[0].mapping||c.p.subGridModel[0].name;if(o.length)for(l=0;l<o.length;l++)k(n,g[o[l]]||"&#160;",l)}$(m).append(n)}var p=$("table:first",c.grid.bDiv).attr("id")+"_";return $("#"+$.jgrid.jqID(p+b)).append(m),c.grid.hDiv.loading=!1,$("#load_"+$.jgrid.jqID(c.p.id)).hide(),!1},n=function(a){var b,d,e,f;if(b=$(a).attr("id"),d={nd_:(new Date).getTime()},d[c.p.prmNames.subgridid]=b,!c.p.subGridModel[0])return!1;if(c.p.subGridModel[0].params)for(f=0;f<c.p.subGridModel[0].params.length;f++)for(e=0;e<c.p.colModel.length;e++)c.p.colModel[e].name===c.p.subGridModel[0].params[f]&&(d[c.p.colModel[e].name]=$("td:eq("+e+")",a).text().replace(/\&#160\;/gi,""));if(!c.grid.hDiv.loading)switch(c.grid.hDiv.loading=!0,$("#load_"+$.jgrid.jqID(c.p.id)).show(),c.p.subgridtype||(c.p.subgridtype=c.p.datatype),$.isFunction(c.p.subgridtype)?c.p.subgridtype.call(c,d):c.p.subgridtype=c.p.subgridtype.toLowerCase(),c.p.subgridtype){case"xml":case"json":$.ajax($.extend({type:c.p.mtype,url:$.isFunction(c.p.subGridUrl)?c.p.subGridUrl.call(c,d):c.p.subGridUrl,dataType:c.p.subgridtype,data:$.isFunction(c.p.serializeSubGridData)?c.p.serializeSubGridData.call(c,d):d,complete:function(a){"xml"===c.p.subgridtype?l(a.responseXML,b):m($.jgrid.parse(a.responseText),b),a=null}},$.jgrid.ajaxOptions,c.p.ajaxSubgridOptions||{}))}return!1},o=0;$.each(c.p.colModel,function(){(this.hidden===!0||"rn"===this.name||"cb"===this.name)&&o++});var p=c.rows.length,q=1;for(void 0!==b&&b>0&&(q=b,p=b+1);p>q;)$(c.rows[q]).hasClass("jqgrow")&&(c.p.scroll&&$(c.rows[q].cells[a]).unbind("click"),$(c.rows[q].cells[a]).bind("click",function(){var b=$(this).parent("tr")[0];if(e=c.p.id,d=b.id,h=$("#"+e+"_"+d+"_expandedContent"),$(this).hasClass("sgcollapsed")){if(g=$(c).triggerHandler("jqGridSubGridBeforeExpand",[e+"_"+d,d]),g=g===!1||"stop"===g?!1:!0,g&&$.isFunction(c.p.subGridBeforeExpand)&&(g=c.p.subGridBeforeExpand.call(c,e+"_"+d,d)),g===!1)return!1;c.p.subGridOptions.reloadOnExpand===!0||c.p.subGridOptions.reloadOnExpand===!1&&!h.hasClass("ui-subgrid")?(f=a>=1?"<td colspan='"+a+"'>&#160;</td>":"",$(b).after("<tr role='row' id='"+e+"_"+d+"_expandedContent' class='ui-subgrid ui-sg-expanded'>"+f+"<td class='"+j.content+" subgrid-cell'><span class='"+j.icon_base+" "+c.p.subGridOptions.openicon+"'></span></td><td colspan='"+parseInt(c.p.colNames.length-1-o,10)+"' class='"+j.content+" subgrid-data'><div id="+e+"_"+d+" class='tablediv'></div></td></tr>"),$(c).triggerHandler("jqGridSubGridRowExpanded",[e+"_"+d,d]),$.isFunction(c.p.subGridRowExpanded)?c.p.subGridRowExpanded.call(c,e+"_"+d,d):n(b)):h.show().removeClass("ui-sg-collapsed").addClass("ui-sg-expanded"),$(this).html("<a style='cursor:pointer;' class='ui-sghref'><span class='"+j.icon_base+" "+c.p.subGridOptions.minusicon+"'></span></a>").removeClass("sgcollapsed").addClass("sgexpanded"),c.p.subGridOptions.selectOnExpand&&$(c).jqGrid("setSelection",d)}else if($(this).hasClass("sgexpanded")){if(g=$(c).triggerHandler("jqGridSubGridRowColapsed",[e+"_"+d,d]),g=g===!1||"stop"===g?!1:!0,g&&$.isFunction(c.p.subGridRowColapsed)&&(g=c.p.subGridRowColapsed.call(c,e+"_"+d,d)),g===!1)return!1;c.p.subGridOptions.reloadOnExpand===!0?h.remove(".ui-subgrid"):h.hasClass("ui-subgrid")&&h.hide().addClass("ui-sg-collapsed").removeClass("ui-sg-expanded"),$(this).html("<a style='cursor:pointer;' class='ui-sghref'><span class='"+j.icon_base+" "+c.p.subGridOptions.plusicon+"'></span></a>").removeClass("sgexpanded").addClass("sgcollapsed"),c.p.subGridOptions.selectOnCollapse&&$(c).jqGrid("setSelection",d)}return!1})),q++;c.p.subGridOptions.expandOnLoad===!0&&$(c.rows).filter(".jqgrow").each(function(a,b){$(b.cells[0]).click()}),c.subGridXml=function(a,b){l(a,b)},c.subGridJson=function(a,b){m(a,b)}}})},expandSubGridRow:function(a){return this.each(function(){var b=this;if((b.grid||a)&&b.p.subGrid===!0){var c=$(this).jqGrid("getInd",a,!0);if(c){var d=$("td.sgcollapsed",c)[0];d&&$(d).trigger("click")}}})},collapseSubGridRow:function(a){return this.each(function(){var b=this;if((b.grid||a)&&b.p.subGrid===!0){var c=$(this).jqGrid("getInd",a,!0);if(c){var d=$("td.sgexpanded",c)[0];d&&$(d).trigger("click")}}})},toggleSubGridRow:function(a){return this.each(function(){var b=this;if((b.grid||a)&&b.p.subGrid===!0){var c=$(this).jqGrid("getInd",a,!0);if(c){var d=$("td.sgcollapsed",c)[0];d?$(d).trigger("click"):(d=$("td.sgexpanded",c)[0],d&&$(d).trigger("click"))}}})}}),$.jgrid.extend({setTreeNode:function(a,b){return this.each(function(){var c=this;if(c.grid&&c.p.treeGrid)for(var d,e,f,g,h,i,j,k,l=c.p.expColInd,m=c.p.treeReader.expanded_field,n=c.p.treeReader.leaf_field,o=c.p.treeReader.level_field,p=c.p.treeReader.icon_field,q=c.p.treeReader.loaded,r=$.jgrid.styleUI[c.p.styleUI||"jQueryUI"].common;b>a;){var s,t=$.jgrid.stripPref(c.p.idPrefix,c.rows[a].id),u=c.p._index[t];j=c.p.data[u],"nested"===c.p.treeGridModel&&(j[n]||(d=parseInt(j[c.p.treeReader.left_field],10),e=parseInt(j[c.p.treeReader.right_field],10),j[n]=e===d+1?"true":"false",c.rows[a].cells[c.p._treeleafpos].innerHTML=j[n])),f=parseInt(j[o],10),0===c.p.tree_root_level?(g=f+1,h=f):(g=f,h=f-1),i="<div class='tree-wrap tree-wrap-"+c.p.direction+"' style='width:"+18*g+"px;'>",i+="<div style='"+("rtl"===c.p.direction?"right:":"left:")+18*h+"px;' class='"+r.icon_base+" ",void 0!==j[q]&&(j[q]="true"===j[q]||j[q]===!0?!0:!1),"true"===j[n]||j[n]===!0?(i+=(void 0!==j[p]&&""!==j[p]?j[p]:c.p.treeIcons.leaf)+" tree-leaf treeclick",j[n]=!0,k="leaf"):(j[n]=!1,k=""),j[m]=("true"===j[m]||j[m]===!0?!0:!1)&&(j[q]||void 0===j[q]),i+=j[m]===!1?j[n]===!0?"'":c.p.treeIcons.plus+" tree-plus treeclick'":j[n]===!0?"'":c.p.treeIcons.minus+" tree-minus treeclick'",i+="></div></div>",$(c.rows[a].cells[l]).wrapInner("<span class='cell-wrapper"+k+"'></span>").prepend(i),f!==parseInt(c.p.tree_root_level,10)&&(s=$(c).jqGrid("isVisibleNode",j),s||$(c.rows[a]).css("display","none")),$(c.rows[a].cells[l]).find("div.treeclick").bind("click",function(a){var b=a.target||a.srcElement,d=$.jgrid.stripPref(c.p.idPrefix,$(b,c.rows).closest("tr.jqgrow")[0].id),e=c.p._index[d];return c.p.data[e][n]||(c.p.data[e][m]?($(c).jqGrid("collapseRow",c.p.data[e]),$(c).jqGrid("collapseNode",c.p.data[e])):($(c).jqGrid("expandRow",c.p.data[e]),$(c).jqGrid("expandNode",c.p.data[e]))),!1}),c.p.ExpandColClick===!0&&$(c.rows[a].cells[l]).find("span.cell-wrapper").css("cursor","pointer").bind("click",function(a){var b=a.target||a.srcElement,d=$.jgrid.stripPref(c.p.idPrefix,$(b,c.rows).closest("tr.jqgrow")[0].id),e=c.p._index[d];return c.p.data[e][n]||(c.p.data[e][m]?($(c).jqGrid("collapseRow",c.p.data[e]),$(c).jqGrid("collapseNode",c.p.data[e])):($(c).jqGrid("expandRow",c.p.data[e]),$(c).jqGrid("expandNode",c.p.data[e]))),$(c).jqGrid("setSelection",d),!1}),a++}})},setTreeGrid:function(){return this.each(function(){var a,b,c,d,e=this,f=0,g=!1,h=[],i=$.jgrid.styleUI[e.p.styleUI||"jQueryUI"].treegrid;if(e.p.treeGrid){e.p.treedatatype||$.extend(e.p,{treedatatype:e.p.datatype}),e.p.loadonce&&(e.p.treedatatype="local"),e.p.subGrid=!1,e.p.altRows=!1,e.p.pgbuttons=!1,e.p.pginput=!1,e.p.gridview=!0,null===e.p.rowTotal&&(e.p.rowNum=1e4),e.p.multiselect=!1,e.p.rowList=[],e.p.expColInd=0,a=i.icon_plus,"jQueryUI"===e.p.styleUI&&(a+="rtl"===e.p.direction?"w":"e"),e.p.treeIcons=$.extend({plus:a,minus:i.icon_minus,leaf:i.icon_leaf},e.p.treeIcons||{}),"nested"===e.p.treeGridModel?e.p.treeReader=$.extend({level_field:"level",left_field:"lft",right_field:"rgt",leaf_field:"isLeaf",expanded_field:"expanded",loaded:"loaded",icon_field:"icon"},e.p.treeReader):"adjacency"===e.p.treeGridModel&&(e.p.treeReader=$.extend({level_field:"level",parent_id_field:"parent",leaf_field:"isLeaf",expanded_field:"expanded",loaded:"loaded",icon_field:"icon"},e.p.treeReader));for(c in e.p.colModel)if(e.p.colModel.hasOwnProperty(c)){b=e.p.colModel[c].name,b!==e.p.ExpandColumn||g||(g=!0,e.p.expColInd=f),f++;for(d in e.p.treeReader)e.p.treeReader.hasOwnProperty(d)&&e.p.treeReader[d]===b&&h.push(b)}$.each(e.p.treeReader,function(a,b){b&&-1===$.inArray(b,h)&&("leaf_field"===a&&(e.p._treeleafpos=f),f++,e.p.colNames.push(b),e.p.colModel.push({name:b,width:1,hidden:!0,sortable:!1,resizable:!1,hidedlg:!0,editable:!0,search:!1}))})}})},expandRow:function(a){this.each(function(){var b=this;if(b.grid&&b.p.treeGrid){var c=$(b).jqGrid("getNodeChildren",a),d=b.p.treeReader.expanded_field,e=a[b.p.localReader.id],f=$.isFunction(b.p.beforeExpandTreeGridRow)?b.p.beforeExpandTreeGridRow.call(b,e,a,c):!0;f!==!1&&($(c).each(function(){var a=b.p.idPrefix+$.jgrid.getAccessor(this,b.p.localReader.id);$($(b).jqGrid("getGridRowById",a)).css("display",""),this[d]&&$(b).jqGrid("expandRow",this)}),$.isFunction(b.p.afterExpandTreeGridRow)&&b.p.afterExpandTreeGridRow.call(b,e,a,c))}})},collapseRow:function(a){this.each(function(){var b=this;if(b.grid&&b.p.treeGrid){var c=$(b).jqGrid("getNodeChildren",a),d=b.p.treeReader.expanded_field,e=a[b.p.localReader.id],f=$.isFunction(b.p.beforeCollapseTreeGridRow)?b.p.beforeCollapseTreeGridRow.call(b,e,a,c):!0;f!==!1&&($(c).each(function(){var a=b.p.idPrefix+$.jgrid.getAccessor(this,b.p.localReader.id);$($(b).jqGrid("getGridRowById",a)).css("display","none"),this[d]&&$(b).jqGrid("collapseRow",this)}),$.isFunction(b.p.afterCollapseTreeGridRow)&&b.p.afterCollapseTreeGridRow.call(b,e,a,c))}})},getRootNodes:function(a){var b=[];return this.each(function(){var c,d,e,f=this;if(f.grid&&f.p.treeGrid)switch("boolean"!=typeof a&&(a=!1),e=a?$(f).jqGrid("getRowData",null,!0):f.p.data,f.p.treeGridModel){case"nested":c=f.p.treeReader.level_field,$(e).each(function(){parseInt(this[c],10)===parseInt(f.p.tree_root_level,10)&&b.push(a?f.p.data[f.p._index[this[f.p.keyName]]]:this)});break;case"adjacency":d=f.p.treeReader.parent_id_field,$(e).each(function(){(null===this[d]||"null"===String(this[d]).toLowerCase())&&b.push(a?f.p.data[f.p._index[this[f.p.keyName]]]:this)})}}),b},getNodeDepth:function(a){var b=null;return this.each(function(){if(this.grid&&this.p.treeGrid){var c=this;switch(c.p.treeGridModel){case"nested":var d=c.p.treeReader.level_field;b=parseInt(a[d],10)-parseInt(c.p.tree_root_level,10);break;case"adjacency":b=$(c).jqGrid("getNodeAncestors",a).length}}}),b},getNodeParent:function(a){var b=null;return this.each(function(){var c=this;if(c.grid&&c.p.treeGrid)switch(c.p.treeGridModel){case"nested":var d=c.p.treeReader.left_field,e=c.p.treeReader.right_field,f=c.p.treeReader.level_field,g=parseInt(a[d],10),h=parseInt(a[e],10),i=parseInt(a[f],10);$(this.p.data).each(function(){return parseInt(this[f],10)===i-1&&parseInt(this[d],10)<g&&parseInt(this[e],10)>h?(b=this,!1):void 0});break;case"adjacency":for(var j=c.p.treeReader.parent_id_field,k=c.p.localReader.id,l=a[k],m=c.p._index[l];m--;)if(c.p.data[m][k]===$.jgrid.stripPref(c.p.idPrefix,a[j])){b=c.p.data[m];break}}}),b},getNodeChildren:function(a){var b=[];return this.each(function(){var c=this;if(c.grid&&c.p.treeGrid)switch(c.p.treeGridModel){case"nested":var d=c.p.treeReader.left_field,e=c.p.treeReader.right_field,f=c.p.treeReader.level_field,g=parseInt(a[d],10),h=parseInt(a[e],10),i=parseInt(a[f],10);$(this.p.data).each(function(){parseInt(this[f],10)===i+1&&parseInt(this[d],10)>g&&parseInt(this[e],10)<h&&b.push(this)});break;case"adjacency":var j=c.p.treeReader.parent_id_field,k=c.p.localReader.id;$(this.p.data).each(function(){this[j]==$.jgrid.stripPref(c.p.idPrefix,a[k])&&b.push(this)})}}),b},getFullTreeNode:function(a,b){var c=[];return this.each(function(){var d,e=this,f=e.p.treeReader.expanded_field;if(e.grid&&e.p.treeGrid)switch((null==b||"boolean"!=typeof b)&&(b=!1),e.p.treeGridModel){case"nested":var g=e.p.treeReader.left_field,h=e.p.treeReader.right_field,i=e.p.treeReader.level_field,j=parseInt(a[g],10),k=parseInt(a[h],10),l=parseInt(a[i],10);$(this.p.data).each(function(){parseInt(this[i],10)>=l&&parseInt(this[g],10)>=j&&parseInt(this[g],10)<=k&&(b&&(this[f]=!0),c.push(this))});break;case"adjacency":if(a){c.push(a);var m=e.p.treeReader.parent_id_field,n=e.p.localReader.id;$(this.p.data).each(function(a){for(d=c.length,a=0;d>a;a++)if($.jgrid.stripPref(e.p.idPrefix,c[a][n])===this[m]){b&&(this[f]=!0),c.push(this);break}})}}}),c},getNodeAncestors:function(a){var b=[];return this.each(function(){if(this.grid&&this.p.treeGrid)for(var c=$(this).jqGrid("getNodeParent",a);c;)b.push(c),c=$(this).jqGrid("getNodeParent",c)}),b},isVisibleNode:function(a){var b=!0;return this.each(function(){var c=this;if(c.grid&&c.p.treeGrid){var d=$(c).jqGrid("getNodeAncestors",a),e=c.p.treeReader.expanded_field;$(d).each(function(){return b=b&&this[e],b?void 0:!1})}}),b},isNodeLoaded:function(a){var b;return this.each(function(){var c=this;if(c.grid&&c.p.treeGrid){var d=c.p.treeReader.leaf_field,e=c.p.treeReader.loaded;b=void 0!==a?void 0!==a[e]?a[e]:a[d]||$(c).jqGrid("getNodeChildren",a).length>0?!0:!1:!1}}),b},reloadNode:function(a){return this.each(function(){if(this.grid&&this.p.treeGrid){var b=this.p.localReader.id,c=this.p.selrow;$(this).jqGrid("delChildren",a[b]);var d=this.p.treeReader.expanded_field,e=this.p.treeReader.parent_id_field,f=this.p.treeReader.loaded,g=this.p.treeReader.level_field,h=this.p.treeReader.left_field,i=this.p.treeReader.right_field,j=$.jgrid.getAccessor(a,this.p.localReader.id),k=$("#"+j,this.grid.bDiv)[0];a[d]=!0,$("div.treeclick",k).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus"),this.p.treeANode=k.rowIndex,this.p.datatype=this.p.treedatatype,"nested"===this.p.treeGridModel?$(this).jqGrid("setGridParam",{postData:{nodeid:j,n_left:a[h],n_right:a[i],n_level:a[g]}}):$(this).jqGrid("setGridParam",{postData:{nodeid:j,parentid:a[e],n_level:a[g]}}),$(this).trigger("reloadGrid"),a[f]=!0,"nested"===this.p.treeGridModel?$(this).jqGrid("setGridParam",{selrow:c,postData:{nodeid:"",n_left:"",n_right:"",n_level:""}}):$(this).jqGrid("setGridParam",{selrow:c,postData:{nodeid:"",parentid:"",n_level:""}})}})},expandNode:function(a){return this.each(function(){if(this.grid&&this.p.treeGrid){var b=this.p.treeReader.expanded_field,c=this.p.treeReader.parent_id_field,d=this.p.treeReader.loaded,e=this.p.treeReader.level_field,f=this.p.treeReader.left_field,g=this.p.treeReader.right_field;if(!a[b]){var h=$.jgrid.getAccessor(a,this.p.localReader.id),i=$("#"+this.p.idPrefix+$.jgrid.jqID(h),this.grid.bDiv)[0],j=this.p._index[h],k=$.isFunction(this.p.beforeExpandTreeGridNode)?this.p.beforeExpandTreeGridNode.call(this,h,a):!0;if(k===!1)return;$(this).jqGrid("isNodeLoaded",this.p.data[j])?(a[b]=!0,$("div.treeclick",i).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus")):this.grid.hDiv.loading||(a[b]=!0,$("div.treeclick",i).removeClass(this.p.treeIcons.plus+" tree-plus").addClass(this.p.treeIcons.minus+" tree-minus"),this.p.treeANode=i.rowIndex,this.p.datatype=this.p.treedatatype,"nested"===this.p.treeGridModel?$(this).jqGrid("setGridParam",{postData:{nodeid:h,n_left:a[f],n_right:a[g],n_level:a[e]}}):$(this).jqGrid("setGridParam",{postData:{nodeid:h,parentid:a[c],n_level:a[e]}}),$(this).trigger("reloadGrid"),a[d]=!0,"nested"===this.p.treeGridModel?$(this).jqGrid("setGridParam",{postData:{nodeid:"",n_left:"",n_right:"",n_level:""}}):$(this).jqGrid("setGridParam",{postData:{nodeid:"",parentid:"",n_level:""}})),$.isFunction(this.p.afterExpandTreeGridNode)&&this.p.afterExpandTreeGridNode.call(this,h,a)}}})},collapseNode:function(a){return this.each(function(){if(this.grid&&this.p.treeGrid){var b=this.p.treeReader.expanded_field;if(a[b]){var c=$.jgrid.getAccessor(a,this.p.localReader.id),d=$.isFunction(this.p.beforeCollapseTreeGridNode)?this.p.beforeCollapseTreeGridNode.call(this,c,a):!0,e=$("#"+this.p.idPrefix+$.jgrid.jqID(c),this.grid.bDiv)[0];if(a[b]=!1,d===!1)return;$("div.treeclick",e).removeClass(this.p.treeIcons.minus+" tree-minus").addClass(this.p.treeIcons.plus+" tree-plus"),$.isFunction(this.p.afterCollapseTreeGridNode)&&this.p.afterCollapseTreeGridNode.call(this,c,a)}}})},SortTree:function(a,b,c,d){return this.each(function(){if(this.grid&&this.p.treeGrid){var e,f,g,h,i,j=[],k=this,l=$(this).jqGrid("getRootNodes",k.p.search);for(h=$.jgrid.from.call(this,l),h.orderBy(a,b,c,d),i=h.select(),e=0,f=i.length;f>e;e++)g=i[e],j.push(g),$(this).jqGrid("collectChildrenSortTree",j,g,a,b,c,d);$.each(j,function(a){var b=$.jgrid.getAccessor(this,k.p.localReader.id);$("#"+$.jgrid.jqID(k.p.id)+" tbody tr:eq("+a+")").after($("tr#"+$.jgrid.jqID(b),k.grid.bDiv))}),h=null,i=null,j=null}})},searchTree:function(a){var b,c,d,e=a.length||0,f=[],g=[],h=[];return this.each(function(){if(this.grid&&this.p.treeGrid&&e)for(c=this.p.localReader.id,b=0;e>b;b++)f=$(this).jqGrid("getNodeAncestors",a[b]),f.length||f.push(a[b]),d=f[f.length-1][c],-1===$.inArray(d,g)&&(g.push(d),f=$(this).jqGrid("getFullTreeNode",f[f.length-1],!0),h=h.concat(f))}),h},collectChildrenSortTree:function(a,b,c,d,e,f){return this.each(function(){if(this.grid&&this.p.treeGrid){var g,h,i,j,k,l;for(j=$(this).jqGrid("getNodeChildren",b),k=$.jgrid.from.call(this,j),k.orderBy(c,d,e,f),l=k.select(),g=0,h=l.length;h>g;g++)i=l[g],a.push(i),$(this).jqGrid("collectChildrenSortTree",a,i,c,d,e,f)}})},setTreeRow:function(a,b){var c=!1;return this.each(function(){var d=this;d.grid&&d.p.treeGrid&&(c=$(d).jqGrid("setRowData",a,b))}),c},delTreeNode:function(a){return this.each(function(){var b,c,d,e,f,g=this,h=g.p.localReader.id,i=g.p.treeReader.left_field,j=g.p.treeReader.right_field;if(g.grid&&g.p.treeGrid){var k=g.p._index[a];if(void 0!==k){c=parseInt(g.p.data[k][j],10),d=c-parseInt(g.p.data[k][i],10)+1;var l=$(g).jqGrid("getFullTreeNode",g.p.data[k]);if(l.length>0)for(b=0;b<l.length;b++)$(g).jqGrid("delRowData",l[b][h]);if("nested"===g.p.treeGridModel){if(e=$.jgrid.from.call(g,g.p.data).greater(i,c,{stype:"integer"}).select(),e.length)for(f in e)e.hasOwnProperty(f)&&(e[f][i]=parseInt(e[f][i],10)-d);if(e=$.jgrid.from.call(g,g.p.data).greater(j,c,{stype:"integer"}).select(),e.length)for(f in e)e.hasOwnProperty(f)&&(e[f][j]=parseInt(e[f][j],10)-d)}}}})},delChildren:function(a){return this.each(function(){var b,c,d,e,f=this,g=f.p.localReader.id,h=f.p.treeReader.left_field,i=f.p.treeReader.right_field;if(f.grid&&f.p.treeGrid){var j=f.p._index[a];if(void 0!==j){b=parseInt(f.p.data[j][i],10),c=b-parseInt(f.p.data[j][h],10)+1;var k=$(f).jqGrid("getFullTreeNode",f.p.data[j]);if(k.length>0)for(var l=0;l<k.length;l++)k[l][g]!==a&&$(f).jqGrid("delRowData",k[l][g]);if("nested"===f.p.treeGridModel){if(d=$.jgrid.from(f.p.data).greater(h,b,{stype:"integer"}).select(),d.length)for(e in d)d.hasOwnProperty(e)&&(d[e][h]=parseInt(d[e][h],10)-c);if(d=$.jgrid.from(f.p.data).greater(i,b,{stype:"integer"}).select(),d.length)for(e in d)d.hasOwnProperty(e)&&(d[e][i]=parseInt(d[e][i],10)-c)}}}})},addChildNode:function(a,b,c,d){var e=this[0];if(c){var f,g,h,i,j,k,l,m,n=e.p.treeReader.expanded_field,o=e.p.treeReader.leaf_field,p=e.p.treeReader.level_field,q=e.p.treeReader.parent_id_field,r=e.p.treeReader.left_field,s=e.p.treeReader.right_field,t=e.p.treeReader.loaded,u=0,v=b;if(void 0===d&&(d=!1),null==a){if(j=e.p.data.length-1,j>=0)for(;j>=0;)u=Math.max(u,parseInt(e.p.data[j][e.p.localReader.id],10)),j--;a=u+1}var w=$(e).jqGrid("getInd",b);if(l=!1,void 0===b||null===b||""===b)b=null,v=null,f="last",i=e.p.tree_root_level,j=e.p.data.length+1;else{f="after",g=e.p._index[b],h=e.p.data[g],b=h[e.p.localReader.id],i=parseInt(h[p],10)+1;var x=$(e).jqGrid("getFullTreeNode",h);x.length?(j=x[x.length-1][e.p.localReader.id],v=j,j=$(e).jqGrid("getInd",v)+1):j=$(e).jqGrid("getInd",b)+1,h[o]&&(l=!0,h[n]=!0,$(e.rows[w]).find("span.cell-wrapperleaf").removeClass("cell-wrapperleaf").addClass("cell-wrapper").end().find("div.tree-leaf").removeClass(e.p.treeIcons.leaf+" tree-leaf").addClass(e.p.treeIcons.minus+" tree-minus"),e.p.data[g][o]=!1,h[t]=!0)}if(k=j+1,void 0===c[n]&&(c[n]=!1),void 0===c[t]&&(c[t]=!1),c[p]=i,void 0===c[o]&&(c[o]=!0),"adjacency"===e.p.treeGridModel&&(c[q]=b),"nested"===e.p.treeGridModel){var y,z,A;if(null!==b){if(m=parseInt(h[s],10),y=$.jgrid.from.call(e,e.p.data),y=y.greaterOrEquals(s,m,{stype:"integer"}),z=y.select(),z.length)for(A in z)z.hasOwnProperty(A)&&(z[A][r]=z[A][r]>m?parseInt(z[A][r],10)+2:z[A][r],z[A][s]=z[A][s]>=m?parseInt(z[A][s],10)+2:z[A][s]);c[r]=m,c[s]=m+1}else{if(m=parseInt($(e).jqGrid("getCol",s,!1,"max"),10),z=$.jgrid.from.call(e,e.p.data).greater(r,m,{stype:"integer"}).select(),z.length)for(A in z)z.hasOwnProperty(A)&&(z[A][r]=parseInt(z[A][r],10)+2);if(z=$.jgrid.from.call(e,e.p.data).greater(s,m,{stype:"integer"}).select(),z.length)for(A in z)z.hasOwnProperty(A)&&(z[A][s]=parseInt(z[A][s],10)+2);c[r]=m+1,c[s]=m+2}}(null===b||$(e).jqGrid("isNodeLoaded",h)||l)&&($(e).jqGrid("addRowData",a,c,f,v),$(e).jqGrid("setTreeNode",j,k)),h&&!h[n]&&d&&$(e.rows[w]).find("div.treeclick").click()}}}),$.fn.jqDrag=function(a){return i(this,a,"d")},$.fn.jqResize=function(a,b){return i(this,a,"r",b)},$.jqDnR={dnr:{},e:0,drag:function(a){return"d"==M.k?E.css({left:M.X+a.pageX-M.pX,top:M.Y+a.pageY-M.pY}):(E.css({width:Math.max(a.pageX-M.pX+M.W,0),height:Math.max(a.pageY-M.pY+M.H,0)}),M1&&E1.css({width:Math.max(a.pageX-M1.pX+M1.W,0),height:Math.max(a.pageY-M1.pY+M1.H,0)})),!1
},stop:function(){$(document).unbind("mousemove",J.drag).unbind("mouseup",J.stop)}};var J=$.jqDnR,M=J.dnr,E=J.e,E1,M1,i=function(a,b,c,d){return a.each(function(){b=b?$(b,a):a,b.bind("mousedown",{e:a,k:c},function(a){var b=a.data,c={};if(E=b.e,E1=d?$(d):!1,"relative"!=E.css("position"))try{E.position(c)}catch(e){}if(M={X:c.left||f("left")||0,Y:c.top||f("top")||0,W:f("width")||E[0].scrollWidth||0,H:f("height")||E[0].scrollHeight||0,pX:a.pageX,pY:a.pageY,k:b.k},M1=E1&&"d"!=b.k?{X:c.left||f1("left")||0,Y:c.top||f1("top")||0,W:E1[0].offsetWidth||f1("width")||0,H:E1[0].offsetHeight||f1("height")||0,pX:a.pageX,pY:a.pageY,k:b.k}:!1,$("input.hasDatepicker",E[0])[0])try{$("input.hasDatepicker",E[0]).datepicker("hide")}catch(g){}return $(document).mousemove($.jqDnR.drag).mouseup($.jqDnR.stop),!1})})},f=function(a){return parseInt(E.css(a),10)||!1},f1=function(a){return parseInt(E1.css(a),10)||!1};$.fn.jqm=function(a){var b={overlay:50,closeoverlay:!0,overlayClass:"jqmOverlay",closeClass:"jqmClose",trigger:".jqModal",ajax:F,ajaxText:"",target:F,modal:F,toTop:F,onShow:F,onHide:F,onLoad:F};return this.each(function(){return this._jqm?H[this._jqm].c=$.extend({},H[this._jqm].c,a):(s++,this._jqm=s,H[s]={c:$.extend(b,$.jqm.params,a),a:F,w:$(this).addClass("jqmID"+s),s:s},void(b.trigger&&$(this).jqmAddTrigger(b.trigger)))})},$.fn.jqmAddClose=function(a){return hs(this,a,"jqmHide")},$.fn.jqmAddTrigger=function(a){return hs(this,a,"jqmShow")},$.fn.jqmShow=function(a){return this.each(function(){$.jqm.open(this._jqm,a)})},$.fn.jqmHide=function(a){return this.each(function(){$.jqm.close(this._jqm,a)})},$.jqm={hash:{},open:function(a,b){var c=H[a],d=c.c,f="."+d.closeClass,g=parseInt(c.w.css("z-index"));g=g>0?g:3e3;var h=$("<div></div>").css({height:"100%",width:"100%",position:"fixed",left:0,top:0,"z-index":g-1,opacity:d.overlay/100});if(c.a)return F;if(c.t=b,c.a=!0,c.w.css("z-index",g),d.modal?(A[0]||setTimeout(function(){new L("bind")},1),A.push(a)):d.overlay>0?d.closeoverlay&&c.w.jqmAddClose(h):h=F,c.o=h?h.addClass(d.overlayClass).prependTo("body"):F,d.ajax){var i=d.target||c.w,j=d.ajax;i="string"==typeof i?$(i,c.w):$(i),j="@"===j.substr(0,1)?$(b).attr(j.substring(1)):j,i.html(d.ajaxText).load(j,function(){d.onLoad&&d.onLoad.call(this,c),f&&c.w.jqmAddClose($(f,c.w)),e(c)})}else f&&c.w.jqmAddClose($(f,c.w));return d.toTop&&c.o&&c.w.before('<span id="jqmP'+c.w[0]._jqm+'"></span>').insertAfter(c.o),d.onShow?d.onShow(c):c.w.show(),e(c),F},close:function(a){var b=H[a];return b.a?(b.a=F,A[0]&&(A.pop(),A[0]||new L("unbind")),b.c.toTop&&b.o&&$("#jqmP"+b.w[0]._jqm).after(b.w).remove(),b.c.onHide?b.c.onHide(b):(b.w.hide(),b.o&&b.o.remove()),F):F},params:{}};var s=0,H=$.jqm.hash,A=[],F=!1,e=function(a){void 0===a.c.focusField&&(a.c.focusField=0),a.c.focusField>=0&&f(a)},f=function(a){try{$(":input:visible",a.w)[parseInt(a.c.focusField,10)].focus()}catch(b){}},L=function(a){$(document)[a]("keypress",m)[a]("keydown",m)[a]("mousedown",m)},m=function(a){var b=H[A[A.length-1]],c=!$(a.target).parents(".jqmID"+b.s)[0];return c&&($(".jqmID"+b.s).each(function(){var b=$(this),d=b.offset();return d.top<=a.pageY&&a.pageY<=d.top+b.height()&&d.left<=a.pageX&&a.pageX<=d.left+b.width()?(c=!1,!1):void 0}),f(b)),!c},hs=function(a,b,c){return a.each(function(){var a=this._jqm;$(b).each(function(){this[c]||(this[c]=[],$(this).click(function(){for(var a in{jqmShow:1,jqmHide:1})for(var b in this[a])H[this[a][b]]&&H[this[a][b]].w[a](this);return F})),this[c].push(a)})})};$.fmatter={},$.extend($.fmatter,{isBoolean:function(a){return"boolean"==typeof a},isObject:function(a){return a&&("object"==typeof a||$.isFunction(a))||!1},isString:function(a){return"string"==typeof a},isNumber:function(a){return"number"==typeof a&&isFinite(a)},isValue:function(a){return this.isObject(a)||this.isString(a)||this.isNumber(a)||this.isBoolean(a)},isEmpty:function(a){return!this.isString(a)&&this.isValue(a)?!1:this.isValue(a)?(a=$.trim(a).replace(/\&nbsp\;/gi,"").replace(/\&#160\;/gi,""),""===a):!0}}),$.fn.fmatter=function(a,b,c,d,e){var f=b;c=$.extend({},$.jgrid.getRegional(this,"formatter"),c);try{f=$.fn.fmatter[a].call(this,b,c,d,e)}catch(g){}return f},$.fmatter.util={NumberFormat:function(a,b){if($.fmatter.isNumber(a)||(a*=1),$.fmatter.isNumber(a)){var c,d=0>a,e=String(a),f=b.decimalSeparator||".";if($.fmatter.isNumber(b.decimalPlaces)){var g=b.decimalPlaces,h=Math.pow(10,g);if(e=String(Math.round(a*h)/h),c=e.lastIndexOf("."),g>0)for(0>c?(e+=f,c=e.length-1):"."!==f&&(e=e.replace(".",f));e.length-1-c<g;)e+="0"}if(b.thousandsSeparator){var i=b.thousandsSeparator;c=e.lastIndexOf(f),c=c>-1?c:e.length;var j,k=e.substring(c),l=-1;for(j=c;j>0;j--)l++,l%3===0&&j!==c&&(!d||j>1)&&(k=i+k),k=e.charAt(j-1)+k;e=k}return e=b.prefix?b.prefix+e:e,e=b.suffix?e+b.suffix:e}return a}},$.fn.fmatter.defaultFormat=function(a,b){return $.fmatter.isValue(a)&&""!==a?a:b.defaultValue||"&#160;"},$.fn.fmatter.email=function(a,b){return $.fmatter.isEmpty(a)?$.fn.fmatter.defaultFormat(a,b):'<a href="mailto:'+a+'">'+a+"</a>"},$.fn.fmatter.checkbox=function(a,b){var c,d=$.extend({},b.checkbox);void 0!==b.colModel&&void 0!==b.colModel.formatoptions&&(d=$.extend({},d,b.colModel.formatoptions)),c=d.disabled===!0?'disabled="disabled"':"",($.fmatter.isEmpty(a)||void 0===a)&&(a=$.fn.fmatter.defaultFormat(a,d)),a=String(a),a=(a+"").toLowerCase();var e=a.search(/(false|f|0|no|n|off|undefined)/i)<0?" checked='checked' ":"";return'<input type="checkbox" '+e+' value="'+a+'" offval="no" '+c+"/>"},$.fn.fmatter.link=function(a,b){var c={target:b.target},d="";return void 0!==b.colModel&&void 0!==b.colModel.formatoptions&&(c=$.extend({},c,b.colModel.formatoptions)),c.target&&(d="target="+c.target),$.fmatter.isEmpty(a)?$.fn.fmatter.defaultFormat(a,b):"<a "+d+' href="'+a+'">'+a+"</a>"},$.fn.fmatter.showlink=function(a,b){var c,d={baseLinkUrl:b.baseLinkUrl,showAction:b.showAction,addParam:b.addParam||"",target:b.target,idName:b.idName},e="";return void 0!==b.colModel&&void 0!==b.colModel.formatoptions&&(d=$.extend({},d,b.colModel.formatoptions)),d.target&&(e="target="+d.target),c=d.baseLinkUrl+d.showAction+"?"+d.idName+"="+b.rowId+d.addParam,$.fmatter.isString(a)||$.fmatter.isNumber(a)?"<a "+e+' href="'+c+'">'+a+"</a>":$.fn.fmatter.defaultFormat(a,b)},$.fn.fmatter.integer=function(a,b){var c=$.extend({},b.integer);return void 0!==b.colModel&&void 0!==b.colModel.formatoptions&&(c=$.extend({},c,b.colModel.formatoptions)),$.fmatter.isEmpty(a)?c.defaultValue:$.fmatter.util.NumberFormat(a,c)},$.fn.fmatter.number=function(a,b){var c=$.extend({},b.number);return void 0!==b.colModel&&void 0!==b.colModel.formatoptions&&(c=$.extend({},c,b.colModel.formatoptions)),$.fmatter.isEmpty(a)?c.defaultValue:$.fmatter.util.NumberFormat(a,c)},$.fn.fmatter.currency=function(a,b){var c=$.extend({},b.currency);return void 0!==b.colModel&&void 0!==b.colModel.formatoptions&&(c=$.extend({},c,b.colModel.formatoptions)),$.fmatter.isEmpty(a)?c.defaultValue:$.fmatter.util.NumberFormat(a,c)},$.fn.fmatter.date=function(a,b,c,d){var e=$.extend({},b.date);return void 0!==b.colModel&&void 0!==b.colModel.formatoptions&&(e=$.extend({},e,b.colModel.formatoptions)),e.reformatAfterEdit||"edit"!==d?$.fmatter.isEmpty(a)?$.fn.fmatter.defaultFormat(a,b):$.jgrid.parseDate.call(this,e.srcformat,a,e.newformat,e):$.fn.fmatter.defaultFormat(a,b)},$.fn.fmatter.select=function(a,b){a=String(a);var c,d,e=!1,f=[];if(void 0!==b.colModel.formatoptions?(e=b.colModel.formatoptions.value,c=void 0===b.colModel.formatoptions.separator?":":b.colModel.formatoptions.separator,d=void 0===b.colModel.formatoptions.delimiter?";":b.colModel.formatoptions.delimiter):void 0!==b.colModel.editoptions&&(e=b.colModel.editoptions.value,c=void 0===b.colModel.editoptions.separator?":":b.colModel.editoptions.separator,d=void 0===b.colModel.editoptions.delimiter?";":b.colModel.editoptions.delimiter),e){var g,h=(null!=b.colModel.editoptions&&b.colModel.editoptions.multiple===!0)==!0?!0:!1,i=[];if(h&&(i=a.split(","),i=$.map(i,function(a){return $.trim(a)})),$.fmatter.isString(e)){var j,k=e.split(d),l=0;for(j=0;j<k.length;j++)if(g=k[j].split(c),g.length>2&&(g[1]=$.map(g,function(a,b){return b>0?a:void 0}).join(c)),h)$.inArray(g[0],i)>-1&&(f[l]=g[1],l++);else if($.trim(g[0])===$.trim(a)){f[0]=g[1];break}}else $.fmatter.isObject(e)&&(h?f=$.map(i,function(a){return e[a]}):f[0]=e[a]||"")}return a=f.join(", "),""===a?$.fn.fmatter.defaultFormat(a,b):a},$.fn.fmatter.rowactions=function(a){var b=$(this).closest("tr.jqgrow"),c=b.attr("id"),d=$(this).closest("table.ui-jqgrid-btable").attr("id").replace(/_frozen([^_]*)$/,"$1"),e=$("#"+d),f=e[0],g=f.p,h=g.colModel[$.jgrid.getCellIndex(this)],i=h.frozen?$("tr#"+c+" td:eq("+$.jgrid.getCellIndex(this)+") > div",e):$(this).parent(),j={extraparam:{}},k=function(a,b){$.isFunction(j.afterSave)&&j.afterSave.call(f,a,b),i.find("div.ui-inline-edit,div.ui-inline-del").show(),i.find("div.ui-inline-save,div.ui-inline-cancel").hide()},l=function(a){$.isFunction(j.afterRestore)&&j.afterRestore.call(f,a),i.find("div.ui-inline-edit,div.ui-inline-del").show(),i.find("div.ui-inline-save,div.ui-inline-cancel").hide()};void 0!==h.formatoptions&&(j=$.extend(j,h.formatoptions)),void 0!==g.editOptions&&(j.editOptions=g.editOptions),void 0!==g.delOptions&&(j.delOptions=g.delOptions),b.hasClass("jqgrid-new-row")&&(j.extraparam[g.prmNames.oper]=g.prmNames.addoper);var m={keys:j.keys,oneditfunc:j.onEdit,successfunc:j.onSuccess,url:j.url,extraparam:j.extraparam,aftersavefunc:k,errorfunc:j.onError,afterrestorefunc:l,restoreAfterError:j.restoreAfterError,mtype:j.mtype};switch(a){case"edit":e.jqGrid("editRow",c,m),i.find("div.ui-inline-edit,div.ui-inline-del").hide(),i.find("div.ui-inline-save,div.ui-inline-cancel").show(),e.triggerHandler("jqGridAfterGridComplete");break;case"save":e.jqGrid("saveRow",c,m)&&(i.find("div.ui-inline-edit,div.ui-inline-del").show(),i.find("div.ui-inline-save,div.ui-inline-cancel").hide(),e.triggerHandler("jqGridAfterGridComplete"));break;case"cancel":e.jqGrid("restoreRow",c,l),i.find("div.ui-inline-edit,div.ui-inline-del").show(),i.find("div.ui-inline-save,div.ui-inline-cancel").hide(),e.triggerHandler("jqGridAfterGridComplete");break;case"del":e.jqGrid("delGridRow",c,j.delOptions);break;case"formedit":e.jqGrid("setSelection",c),e.jqGrid("editGridRow",c,j.editOptions)}},$.fn.fmatter.actions=function(a,b){var c,d={keys:!1,editbutton:!0,delbutton:!0,editformbutton:!1},e=b.rowId,f="",g=$.jgrid.getRegional(this,"nav"),h=$.jgrid.styleUI[b.styleUI||"jQueryUI"].fmatter,i=$.jgrid.styleUI[b.styleUI||"jQueryUI"].common;if(void 0!==b.colModel.formatoptions&&(d=$.extend(d,b.colModel.formatoptions)),void 0===e||$.fmatter.isEmpty(e))return"";var j="onmouseover=jQuery(this).addClass('"+i.hover+"'); onmouseout=jQuery(this).removeClass('"+i.hover+"');  ";return d.editformbutton?(c="id='jEditButton_"+e+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'formedit'); "+j,f+="<div title='"+g.edittitle+"' style='float:left;cursor:pointer;' class='ui-pg-div ui-inline-edit' "+c+"><span class='"+i.icon_base+" "+h.icon_edit+"'></span></div>"):d.editbutton&&(c="id='jEditButton_"+e+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'edit'); "+j,f+="<div title='"+g.edittitle+"' style='float:left;cursor:pointer;' class='ui-pg-div ui-inline-edit' "+c+"><span class='"+i.icon_base+" "+h.icon_edit+"'></span></div>"),d.delbutton&&(c="id='jDeleteButton_"+e+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'del'); "+j,f+="<div title='"+g.deltitle+"' style='float:left;' class='ui-pg-div ui-inline-del' "+c+"><span class='"+i.icon_base+" "+h.icon_del+"'></span></div>"),c="id='jSaveButton_"+e+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'save'); "+j,f+="<div title='"+g.savetitle+"' style='float:left;display:none' class='ui-pg-div ui-inline-save' "+c+"><span class='"+i.icon_base+" "+h.icon_save+"'></span></div>",c="id='jCancelButton_"+e+"' onclick=jQuery.fn.fmatter.rowactions.call(this,'cancel'); "+j,f+="<div title='"+g.canceltitle+"' style='float:left;display:none;' class='ui-pg-div ui-inline-cancel' "+c+"><span class='"+i.icon_base+" "+h.icon_cancel+"'></span></div>","<div style='margin-left:8px;'>"+f+"</div>"},$.unformat=function(a,b,c,d){var e,f,g=b.colModel.formatter,h=b.colModel.formatoptions||{},i=/([\.\*\_\'\(\)\{\}\+\?\\])/g,j=b.colModel.unformat||$.fn.fmatter[g]&&$.fn.fmatter[g].unformat;if(void 0!==j&&$.isFunction(j))e=j.call(this,$(a).text(),b,a);else if(void 0!==g&&$.fmatter.isString(g)){var k,l=$.jgrid.getRegional(this,"formatter")||{};switch(g){case"integer":h=$.extend({},l.integer,h),f=h.thousandsSeparator.replace(i,"\\$1"),k=new RegExp(f,"g"),e=$(a).text().replace(k,"");break;case"number":h=$.extend({},l.number,h),f=h.thousandsSeparator.replace(i,"\\$1"),k=new RegExp(f,"g"),e=$(a).text().replace(k,"").replace(h.decimalSeparator,".");break;case"currency":h=$.extend({},l.currency,h),f=h.thousandsSeparator.replace(i,"\\$1"),k=new RegExp(f,"g"),e=$(a).text(),h.prefix&&h.prefix.length&&(e=e.substr(h.prefix.length)),h.suffix&&h.suffix.length&&(e=e.substr(0,e.length-h.suffix.length)),e=e.replace(k,"").replace(h.decimalSeparator,".");break;case"checkbox":var m=b.colModel.editoptions?b.colModel.editoptions.value.split(":"):["Yes","No"];e=$("input",a).is(":checked")?m[0]:m[1];break;case"select":e=$.unformat.select(a,b,c,d);break;case"actions":return"";default:e=$(a).text()}}return void 0!==e?e:d===!0?$(a).text():$.jgrid.htmlDecode($(a).html())},$.unformat.select=function(a,b,c,d){var e=[],f=$(a).text();if(d===!0)return f;var g=$.extend({},void 0!==b.colModel.formatoptions?b.colModel.formatoptions:b.colModel.editoptions),h=void 0===g.separator?":":g.separator,i=void 0===g.delimiter?";":g.delimiter;if(g.value){var j,k=g.value,l=g.multiple===!0?!0:!1,m=[];if(l&&(m=f.split(","),m=$.map(m,function(a){return $.trim(a)})),$.fmatter.isString(k)){var n,o=k.split(i),p=0;for(n=0;n<o.length;n++)if(j=o[n].split(h),j.length>2&&(j[1]=$.map(j,function(a,b){return b>0?a:void 0}).join(h)),l)$.inArray($.trim(j[1]),m)>-1&&(e[p]=j[0],p++);else if($.trim(j[1])===$.trim(f)){e[0]=j[0];break}}else($.fmatter.isObject(k)||$.isArray(k))&&(l||(m[0]=f),e=$.map(m,function(a){var b;return $.each(k,function(c,d){return d===a?(b=c,!1):void 0}),void 0!==b?b:void 0}));return e.join(", ")}return f||""},$.unformat.date=function(a,b){var c=$.jgrid.getRegional(this,"formatter.date")||{};return void 0!==b.formatoptions&&(c=$.extend({},c,b.formatoptions)),$.fmatter.isEmpty(a)?$.fn.fmatter.defaultFormat(a,b):$.jgrid.parseDate.call(this,c.newformat,a,c.srcformat,c)},window.jqGridUtils={stringify:function(a){return JSON.stringify(a,function(a,b){return"function"==typeof b?b.toString():b})},parse:function(str){return JSON.parse(str,function(key,value){return"string"==typeof value&&-1!==value.indexOf("function")?eval("("+value+")"):value})},encode:function(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},jsonToXML:function(a,b){var c=$.extend({xmlDecl:'<?xml version="1.0" encoding="UTF-8" ?>\n',attr_prefix:"-",encode:!0},b||{}),d=this,e=function(a,b){return"#text"===a?c.encode?d.encode(b):b:"function"==typeof b?"<"+a+"><![CDATA["+b+"]]></"+a+">\n":""===b?"<"+a+">__EMPTY_STRING_</"+a+">\n":"<"+a+">"+(c.encode?d.encode(b):b)+"</"+a+">\n"},f=function(a,b){for(var c=[],d=0;d<b.length;d++){var h=b[d];c[c.length]="undefined"==typeof h||null==h?"<"+a+" />":"object"==typeof h&&h.constructor==Array?f(a,h):"object"==typeof h?g(a,h):e(a,h)}return c.length||(c[0]="<"+a+">__EMPTY_ARRAY_</"+a+">\n"),c.join("")},g=function(a,b){var h=[],i=[];for(var j in b)if(b.hasOwnProperty(j)){var k=b[j];j.charAt(0)!==c.attr_prefix?h[h.length]=null==k?"<"+j+" />":"object"==typeof k&&k.constructor===Array?f(j,k):"object"==typeof k?g(j,k):e(j,k):i[i.length]=" "+j.substring(1)+'="'+(c.encode?d.encode(k):k)+'"'}var l=i.join(""),m=h.join("");return null==a||(m=h.length>0?m.match(/\n/)?"<"+a+l+">\n"+m+"</"+a+">\n":"<"+a+l+">"+m+"</"+a+">\n":"<"+a+l+" />\n"),m},h=g(null,a);return c.xmlDecl+h},xmlToJSON:function(root,options){var o=$.extend({force_array:[],attr_prefix:"-"},options||{});if(root){var __force_array={};if(o.force_array)for(var i=0;i<o.force_array.length;i++)__force_array[o.force_array[i]]=1;"string"==typeof root&&(root=$.parseXML(root)),root.documentElement&&(root=root.documentElement);var addNode=function(hash,key,cnts,val){if("string"==typeof val)if(-1!==val.indexOf("function"))val=eval("("+val+")");else switch(val){case"__EMPTY_ARRAY_":val=[];break;case"__EMPTY_STRING_":val="";break;case"false":val=!1;break;case"true":val=!0}__force_array[key]?(1===cnts&&(hash[key]=[]),hash[key][hash[key].length]=val):1===cnts?hash[key]=val:2===cnts?hash[key]=[hash[key],val]:hash[key][hash[key].length]=val},parseElement=function(a){if(7!==a.nodeType){if(3===a.nodeType||4===a.nodeType){var b=a.nodeValue.match(/[^\x00-\x20]/);if(null==b)return;return a.nodeValue}var c,d,e,f,g={};if(a.attributes&&a.attributes.length)for(c={},d=0;d<a.attributes.length;d++)e=a.attributes[d].nodeName,"string"==typeof e&&(f=a.attributes[d].nodeValue,f&&(e=o.attr_prefix+e,"undefined"==typeof g[e]&&(g[e]=0),g[e]++,addNode(c,e,g[e],f)));if(a.childNodes&&a.childNodes.length){var h=!0;for(c&&(h=!1),d=0;d<a.childNodes.length&&h;d++){var i=a.childNodes[d].nodeType;3!==i&&4!==i&&(h=!1)}if(h)for(c||(c=""),d=0;d<a.childNodes.length;d++)c+=a.childNodes[d].nodeValue;else for(c||(c={}),d=0;d<a.childNodes.length;d++)e=a.childNodes[d].nodeName,"string"==typeof e&&(f=parseElement(a.childNodes[d]),f&&("undefined"==typeof g[e]&&(g[e]=0),g[e]++,addNode(c,e,g[e],f)))}return c}},json=parseElement(root);if(__force_array[root.nodeName]&&(json=[json]),11!==root.nodeType){var tmp={};tmp[root.nodeName]=json,json=tmp}return json}}}});
//# sourceMappingURL=jquery.jqGrid.min.js.map
/*!
 * jScrollPane - v2.0.22 - 2015-04-25
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2014 Kelvin Luck
 * Dual licensed under the MIT or GPL licenses.
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){a.fn.jScrollPane=function(b){function c(b,c){function d(c){var f,h,j,k,l,o,p=!1,q=!1;if(N=c,void 0===O)l=b.scrollTop(),o=b.scrollLeft(),b.css({overflow:"hidden",padding:0}),P=b.innerWidth()+ra,Q=b.innerHeight(),b.width(P),O=a('<div class="jspPane" />').css("padding",qa).append(b.children()),R=a('<div class="jspContainer" />').css({width:P+"px",height:Q+"px"}).append(O).appendTo(b);else{if(b.css("width",""),p=N.stickToBottom&&A(),q=N.stickToRight&&B(),k=b.innerWidth()+ra!=P||b.outerHeight()!=Q,k&&(P=b.innerWidth()+ra,Q=b.innerHeight(),R.css({width:P+"px",height:Q+"px"})),!k&&sa==S&&O.outerHeight()==T)return void b.width(P);sa=S,O.css("width",""),b.width(P),R.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()}O.css("overflow","auto"),S=c.contentWidth?c.contentWidth:O[0].scrollWidth,T=O[0].scrollHeight,O.css("overflow",""),U=S/P,V=T/Q,W=V>1,X=U>1,X||W?(b.addClass("jspScrollable"),f=N.maintainPosition&&($||ba),f&&(h=y(),j=z()),e(),g(),i(),f&&(w(q?S-P:h,!1),v(p?T-Q:j,!1)),F(),C(),L(),N.enableKeyboardNavigation&&H(),N.clickOnTrack&&m(),J(),N.hijackInternalLinks&&K()):(b.removeClass("jspScrollable"),O.css({top:0,left:0,width:R.width()-ra}),D(),G(),I(),n()),N.autoReinitialise&&!pa?pa=setInterval(function(){d(N)},N.autoReinitialiseDelay):!N.autoReinitialise&&pa&&clearInterval(pa),l&&b.scrollTop(0)&&v(l,!1),o&&b.scrollLeft(0)&&w(o,!1),b.trigger("jsp-initialised",[X||W])}function e(){W&&(R.append(a('<div class="jspVerticalBar" />').append(a('<div class="jspCap jspCapTop" />'),a('<div class="jspTrack" />').append(a('<div class="jspDrag" />').append(a('<div class="jspDragTop" />'),a('<div class="jspDragBottom" />'))),a('<div class="jspCap jspCapBottom" />'))),ca=R.find(">.jspVerticalBar"),da=ca.find(">.jspTrack"),Y=da.find(">.jspDrag"),N.showArrows&&(ha=a('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp",k(0,-1)).bind("click.jsp",E),ia=a('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp",k(0,1)).bind("click.jsp",E),N.arrowScrollOnHover&&(ha.bind("mouseover.jsp",k(0,-1,ha)),ia.bind("mouseover.jsp",k(0,1,ia))),j(da,N.verticalArrowPositions,ha,ia)),fa=Q,R.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function(){fa-=a(this).outerHeight()}),Y.hover(function(){Y.addClass("jspHover")},function(){Y.removeClass("jspHover")}).bind("mousedown.jsp",function(b){a("html").bind("dragstart.jsp selectstart.jsp",E),Y.addClass("jspActive");var c=b.pageY-Y.position().top;return a("html").bind("mousemove.jsp",function(a){p(a.pageY-c,!1)}).bind("mouseup.jsp mouseleave.jsp",o),!1}),f())}function f(){da.height(fa+"px"),$=0,ea=N.verticalGutter+da.outerWidth(),O.width(P-ea-ra);try{0===ca.position().left&&O.css("margin-left",ea+"px")}catch(a){}}function g(){X&&(R.append(a('<div class="jspHorizontalBar" />').append(a('<div class="jspCap jspCapLeft" />'),a('<div class="jspTrack" />').append(a('<div class="jspDrag" />').append(a('<div class="jspDragLeft" />'),a('<div class="jspDragRight" />'))),a('<div class="jspCap jspCapRight" />'))),ja=R.find(">.jspHorizontalBar"),ka=ja.find(">.jspTrack"),_=ka.find(">.jspDrag"),N.showArrows&&(na=a('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp",k(-1,0)).bind("click.jsp",E),oa=a('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp",k(1,0)).bind("click.jsp",E),N.arrowScrollOnHover&&(na.bind("mouseover.jsp",k(-1,0,na)),oa.bind("mouseover.jsp",k(1,0,oa))),j(ka,N.horizontalArrowPositions,na,oa)),_.hover(function(){_.addClass("jspHover")},function(){_.removeClass("jspHover")}).bind("mousedown.jsp",function(b){a("html").bind("dragstart.jsp selectstart.jsp",E),_.addClass("jspActive");var c=b.pageX-_.position().left;return a("html").bind("mousemove.jsp",function(a){r(a.pageX-c,!1)}).bind("mouseup.jsp mouseleave.jsp",o),!1}),la=R.innerWidth(),h())}function h(){R.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function(){la-=a(this).outerWidth()}),ka.width(la+"px"),ba=0}function i(){if(X&&W){var b=ka.outerHeight(),c=da.outerWidth();fa-=b,a(ja).find(">.jspCap:visible,>.jspArrow").each(function(){la+=a(this).outerWidth()}),la-=c,Q-=c,P-=b,ka.parent().append(a('<div class="jspCorner" />').css("width",b+"px")),f(),h()}X&&O.width(R.outerWidth()-ra+"px"),T=O.outerHeight(),V=T/Q,X&&(ma=Math.ceil(1/U*la),ma>N.horizontalDragMaxWidth?ma=N.horizontalDragMaxWidth:ma<N.horizontalDragMinWidth&&(ma=N.horizontalDragMinWidth),_.width(ma+"px"),aa=la-ma,s(ba)),W&&(ga=Math.ceil(1/V*fa),ga>N.verticalDragMaxHeight?ga=N.verticalDragMaxHeight:ga<N.verticalDragMinHeight&&(ga=N.verticalDragMinHeight),Y.height(ga+"px"),Z=fa-ga,q($))}function j(a,b,c,d){var e,f="before",g="after";"os"==b&&(b=/Mac/.test(navigator.platform)?"after":"split"),b==f?g=b:b==g&&(f=b,e=c,c=d,d=e),a[f](c)[g](d)}function k(a,b,c){return function(){return l(a,b,this,c),this.blur(),!1}}function l(b,c,d,e){d=a(d).addClass("jspActive");var f,g,h=!0,i=function(){0!==b&&ta.scrollByX(b*N.arrowButtonSpeed),0!==c&&ta.scrollByY(c*N.arrowButtonSpeed),g=setTimeout(i,h?N.initialDelay:N.arrowRepeatFreq),h=!1};i(),f=e?"mouseout.jsp":"mouseup.jsp",e=e||a("html"),e.bind(f,function(){d.removeClass("jspActive"),g&&clearTimeout(g),g=null,e.unbind(f)})}function m(){n(),W&&da.bind("mousedown.jsp",function(b){if(void 0===b.originalTarget||b.originalTarget==b.currentTarget){var c,d=a(this),e=d.offset(),f=b.pageY-e.top-$,g=!0,h=function(){var a=d.offset(),e=b.pageY-a.top-ga/2,j=Q*N.scrollPagePercent,k=Z*j/(T-Q);if(0>f)$-k>e?ta.scrollByY(-j):p(e);else{if(!(f>0))return void i();e>$+k?ta.scrollByY(j):p(e)}c=setTimeout(h,g?N.initialDelay:N.trackClickRepeatFreq),g=!1},i=function(){c&&clearTimeout(c),c=null,a(document).unbind("mouseup.jsp",i)};return h(),a(document).bind("mouseup.jsp",i),!1}}),X&&ka.bind("mousedown.jsp",function(b){if(void 0===b.originalTarget||b.originalTarget==b.currentTarget){var c,d=a(this),e=d.offset(),f=b.pageX-e.left-ba,g=!0,h=function(){var a=d.offset(),e=b.pageX-a.left-ma/2,j=P*N.scrollPagePercent,k=aa*j/(S-P);if(0>f)ba-k>e?ta.scrollByX(-j):r(e);else{if(!(f>0))return void i();e>ba+k?ta.scrollByX(j):r(e)}c=setTimeout(h,g?N.initialDelay:N.trackClickRepeatFreq),g=!1},i=function(){c&&clearTimeout(c),c=null,a(document).unbind("mouseup.jsp",i)};return h(),a(document).bind("mouseup.jsp",i),!1}})}function n(){ka&&ka.unbind("mousedown.jsp"),da&&da.unbind("mousedown.jsp")}function o(){a("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp"),Y&&Y.removeClass("jspActive"),_&&_.removeClass("jspActive")}function p(a,b){W&&(0>a?a=0:a>Z&&(a=Z),void 0===b&&(b=N.animateScroll),b?ta.animate(Y,"top",a,q):(Y.css("top",a),q(a)))}function q(a){void 0===a&&(a=Y.position().top),R.scrollTop(0),$=a||0;var c=0===$,d=$==Z,e=a/Z,f=-e*(T-Q);(ua!=c||wa!=d)&&(ua=c,wa=d,b.trigger("jsp-arrow-change",[ua,wa,va,xa])),t(c,d),O.css("top",f),b.trigger("jsp-scroll-y",[-f,c,d]).trigger("scroll")}function r(a,b){X&&(0>a?a=0:a>aa&&(a=aa),void 0===b&&(b=N.animateScroll),b?ta.animate(_,"left",a,s):(_.css("left",a),s(a)))}function s(a){void 0===a&&(a=_.position().left),R.scrollTop(0),ba=a||0;var c=0===ba,d=ba==aa,e=a/aa,f=-e*(S-P);(va!=c||xa!=d)&&(va=c,xa=d,b.trigger("jsp-arrow-change",[ua,wa,va,xa])),u(c,d),O.css("left",f),b.trigger("jsp-scroll-x",[-f,c,d]).trigger("scroll")}function t(a,b){N.showArrows&&(ha[a?"addClass":"removeClass"]("jspDisabled"),ia[b?"addClass":"removeClass"]("jspDisabled"))}function u(a,b){N.showArrows&&(na[a?"addClass":"removeClass"]("jspDisabled"),oa[b?"addClass":"removeClass"]("jspDisabled"))}function v(a,b){var c=a/(T-Q);p(c*Z,b)}function w(a,b){var c=a/(S-P);r(c*aa,b)}function x(b,c,d){var e,f,g,h,i,j,k,l,m,n=0,o=0;try{e=a(b)}catch(p){return}for(f=e.outerHeight(),g=e.outerWidth(),R.scrollTop(0),R.scrollLeft(0);!e.is(".jspPane");)if(n+=e.position().top,o+=e.position().left,e=e.offsetParent(),/^body|html$/i.test(e[0].nodeName))return;h=z(),j=h+Q,h>n||c?l=n-N.horizontalGutter:n+f>j&&(l=n-Q+f+N.horizontalGutter),isNaN(l)||v(l,d),i=y(),k=i+P,i>o||c?m=o-N.horizontalGutter:o+g>k&&(m=o-P+g+N.horizontalGutter),isNaN(m)||w(m,d)}function y(){return-O.position().left}function z(){return-O.position().top}function A(){var a=T-Q;return a>20&&a-z()<10}function B(){var a=S-P;return a>20&&a-y()<10}function C(){R.unbind(za).bind(za,function(a,b,c,d){ba||(ba=0),$||($=0);var e=ba,f=$,g=a.deltaFactor||N.mouseWheelSpeed;return ta.scrollBy(c*g,-d*g,!1),e==ba&&f==$})}function D(){R.unbind(za)}function E(){return!1}function F(){O.find(":input,a").unbind("focus.jsp").bind("focus.jsp",function(a){x(a.target,!1)})}function G(){O.find(":input,a").unbind("focus.jsp")}function H(){function c(){var a=ba,b=$;switch(d){case 40:ta.scrollByY(N.keyboardSpeed,!1);break;case 38:ta.scrollByY(-N.keyboardSpeed,!1);break;case 34:case 32:ta.scrollByY(Q*N.scrollPagePercent,!1);break;case 33:ta.scrollByY(-Q*N.scrollPagePercent,!1);break;case 39:ta.scrollByX(N.keyboardSpeed,!1);break;case 37:ta.scrollByX(-N.keyboardSpeed,!1)}return e=a!=ba||b!=$}var d,e,f=[];X&&f.push(ja[0]),W&&f.push(ca[0]),O.bind("focus.jsp",function(){b.focus()}),b.attr("tabindex",0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp",function(b){if(b.target===this||f.length&&a(b.target).closest(f).length){var g=ba,h=$;switch(b.keyCode){case 40:case 38:case 34:case 32:case 33:case 39:case 37:d=b.keyCode,c();break;case 35:v(T-Q),d=null;break;case 36:v(0),d=null}return e=b.keyCode==d&&g!=ba||h!=$,!e}}).bind("keypress.jsp",function(a){return a.keyCode==d&&c(),!e}),N.hideFocus?(b.css("outline","none"),"hideFocus"in R[0]&&b.attr("hideFocus",!0)):(b.css("outline",""),"hideFocus"in R[0]&&b.attr("hideFocus",!1))}function I(){b.attr("tabindex","-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp"),O.unbind(".jsp")}function J(){if(location.hash&&location.hash.length>1){var b,c,d=escape(location.hash.substr(1));try{b=a("#"+d+', a[name="'+d+'"]')}catch(e){return}b.length&&O.find(d)&&(0===R.scrollTop()?c=setInterval(function(){R.scrollTop()>0&&(x(b,!0),a(document).scrollTop(R.position().top),clearInterval(c))},50):(x(b,!0),a(document).scrollTop(R.position().top)))}}function K(){a(document.body).data("jspHijack")||(a(document.body).data("jspHijack",!0),a(document.body).delegate("a[href*=#]","click",function(b){var c,d,e,f,g,h,i=this.href.substr(0,this.href.indexOf("#")),j=location.href;if(-1!==location.href.indexOf("#")&&(j=location.href.substr(0,location.href.indexOf("#"))),i===j){c=escape(this.href.substr(this.href.indexOf("#")+1));try{d=a("#"+c+', a[name="'+c+'"]')}catch(k){return}d.length&&(e=d.closest(".jspScrollable"),f=e.data("jsp"),f.scrollToElement(d,!0),e[0].scrollIntoView&&(g=a(window).scrollTop(),h=d.offset().top,(g>h||h>g+a(window).height())&&e[0].scrollIntoView()),b.preventDefault())}}))}function L(){var a,b,c,d,e,f=!1;R.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp",function(g){var h=g.originalEvent.touches[0];a=y(),b=z(),c=h.pageX,d=h.pageY,e=!1,f=!0}).bind("touchmove.jsp",function(g){if(f){var h=g.originalEvent.touches[0],i=ba,j=$;return ta.scrollTo(a+c-h.pageX,b+d-h.pageY),e=e||Math.abs(c-h.pageX)>5||Math.abs(d-h.pageY)>5,i==ba&&j==$}}).bind("touchend.jsp",function(a){f=!1}).bind("click.jsp-touchclick",function(a){return e?(e=!1,!1):void 0})}function M(){var a=z(),c=y();b.removeClass("jspScrollable").unbind(".jsp"),O.unbind(".jsp"),b.replaceWith(ya.append(O.children())),ya.scrollTop(a),ya.scrollLeft(c),pa&&clearInterval(pa)}var N,O,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,aa,ba,ca,da,ea,fa,ga,ha,ia,ja,ka,la,ma,na,oa,pa,qa,ra,sa,ta=this,ua=!0,va=!0,wa=!1,xa=!1,ya=b.clone(!1,!1).empty(),za=a.fn.mwheelIntent?"mwheelIntent.jsp":"mousewheel.jsp";"border-box"===b.css("box-sizing")?(qa=0,ra=0):(qa=b.css("paddingTop")+" "+b.css("paddingRight")+" "+b.css("paddingBottom")+" "+b.css("paddingLeft"),ra=(parseInt(b.css("paddingLeft"),10)||0)+(parseInt(b.css("paddingRight"),10)||0)),a.extend(ta,{reinitialise:function(b){b=a.extend({},N,b),d(b)},scrollToElement:function(a,b,c){x(a,b,c)},scrollTo:function(a,b,c){w(a,c),v(b,c)},scrollToX:function(a,b){w(a,b)},scrollToY:function(a,b){v(a,b)},scrollToPercentX:function(a,b){w(a*(S-P),b)},scrollToPercentY:function(a,b){v(a*(T-Q),b)},scrollBy:function(a,b,c){ta.scrollByX(a,c),ta.scrollByY(b,c)},scrollByX:function(a,b){var c=y()+Math[0>a?"floor":"ceil"](a),d=c/(S-P);r(d*aa,b)},scrollByY:function(a,b){var c=z()+Math[0>a?"floor":"ceil"](a),d=c/(T-Q);p(d*Z,b)},positionDragX:function(a,b){r(a,b)},positionDragY:function(a,b){p(a,b)},animate:function(a,b,c,d){var e={};e[b]=c,a.animate(e,{duration:N.animateDuration,easing:N.animateEase,queue:!1,step:d})},getContentPositionX:function(){return y()},getContentPositionY:function(){return z()},getContentWidth:function(){return S},getContentHeight:function(){return T},getPercentScrolledX:function(){return y()/(S-P)},getPercentScrolledY:function(){return z()/(T-Q)},getIsScrollableH:function(){return X},getIsScrollableV:function(){return W},getContentPane:function(){return O},scrollToBottom:function(a){p(Z,a)},hijackInternalLinks:a.noop,destroy:function(){M()}}),d(c)}return b=a.extend({},a.fn.jScrollPane.defaults,b),a.each(["arrowButtonSpeed","trackClickSpeed","keyboardSpeed"],function(){b[this]=b[this]||b.speed}),this.each(function(){var d=a(this),e=d.data("jsp");e?e.reinitialise(b):(a("script",d).filter('[type="text/javascript"],:not([type])').remove(),e=new c(d,b),d.data("jsp",e))})},a.fn.jScrollPane.defaults={showArrows:!1,maintainPosition:!0,stickToBottom:!1,stickToRight:!1,clickOnTrack:!0,autoReinitialise:!1,autoReinitialiseDelay:500,verticalDragMinHeight:0,verticalDragMaxHeight:99999,horizontalDragMinWidth:0,horizontalDragMaxWidth:99999,contentWidth:void 0,animateScroll:!1,animateDuration:300,animateEase:"linear",hijackInternalLinks:!1,verticalGutter:4,horizontalGutter:4,mouseWheelSpeed:3,arrowButtonSpeed:0,arrowRepeatFreq:50,arrowScrollOnHover:!1,trackClickSpeed:0,trackClickRepeatFreq:70,verticalArrowPositions:"split",horizontalArrowPositions:"split",enableKeyboardNavigation:!0,hideFocus:!1,keyboardSpeed:0,initialDelay:300,speed:30,scrollPagePercent:.8}});
/*!
 * jQuery Mousewheel 3.1.12
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

/**
 * @author trixta
 * @version 1.2
 */
(function($){

var mwheelI = {
			pos: [-260, -260]
		},
	minDif 	= 3,
	doc 	= document,
	root 	= doc.documentElement,
	body 	= doc.body,
	longDelay, shortDelay
;

function unsetPos(){
	if(this === mwheelI.elem){
		mwheelI.pos = [-260, -260];
		mwheelI.elem = false;
		minDif = 3;
	}
}

$.event.special.mwheelIntent = {
	setup: function(){
		var jElm = $(this).bind('mousewheel', $.event.special.mwheelIntent.handler);
		if( this !== doc && this !== root && this !== body ){
			jElm.bind('mouseleave', unsetPos);
		}
		jElm = null;
        return true;
    },
	teardown: function(){
        $(this)
			.unbind('mousewheel', $.event.special.mwheelIntent.handler)
			.unbind('mouseleave', unsetPos)
		;
        return true;
    },
    handler: function(e, d){
		var pos = [e.clientX, e.clientY];
		if( this === mwheelI.elem || Math.abs(mwheelI.pos[0] - pos[0]) > minDif || Math.abs(mwheelI.pos[1] - pos[1]) > minDif ){
            mwheelI.elem = this;
			mwheelI.pos = pos;
			minDif = 250;
			
			clearTimeout(shortDelay);
			shortDelay = setTimeout(function(){
				minDif = 10;
			}, 200);
			clearTimeout(longDelay);
			longDelay = setTimeout(function(){
				minDif = 3;
			}, 1500);
			e = $.extend({}, e, {type: 'mwheelIntent'});
            return ($.event.dispatch || $.event.handle).apply(this, arguments);
		}
    }
};
$.fn.extend({
	mwheelIntent: function(fn) {
		return fn ? this.bind("mwheelIntent", fn) : this.trigger("mwheelIntent");
	},
	
	unmwheelIntent: function(fn) {
		return this.unbind("mwheelIntent", fn);
	}
});

$(function(){
	body = doc.body;
	//assume that document is always scrollable, doesn't hurt if not
	$(doc).bind('mwheelIntent.mwheelIntentDefault', $.noop);
});
})(jQuery);

/* Javascript plotting library for jQuery, version 0.8.3.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

*/

// first an inline dependency, jquery.colorhelpers.js, we inline it here
// for convenience

/* Plugin for jQuery for working with colors.
 *
 * Version 1.1.
 *
 * Inspiration from jQuery color animation plugin by John Resig.
 *
 * Released under the MIT license by Ole Laursen, October 2009.
 *
 * Examples:
 *
 *   $.color.parse("#fff").scale('rgb', 0.25).add('a', -0.5).toString()
 *   var c = $.color.extract($("#mydiv"), 'background-color');
 *   console.log(c.r, c.g, c.b, c.a);
 *   $.color.make(100, 50, 25, 0.4).toString() // returns "rgba(100,50,25,0.4)"
 *
 * Note that .scale() and .add() return the same modified object
 * instead of making a new one.
 *
 * V. 1.1: Fix error handling so e.g. parsing an empty string does
 * produce a color rather than just crashing.
 */
(function($){$.color={};$.color.make=function(r,g,b,a){var o={};o.r=r||0;o.g=g||0;o.b=b||0;o.a=a!=null?a:1;o.add=function(c,d){for(var i=0;i<c.length;++i)o[c.charAt(i)]+=d;return o.normalize()};o.scale=function(c,f){for(var i=0;i<c.length;++i)o[c.charAt(i)]*=f;return o.normalize()};o.toString=function(){if(o.a>=1){return"rgb("+[o.r,o.g,o.b].join(",")+")"}else{return"rgba("+[o.r,o.g,o.b,o.a].join(",")+")"}};o.normalize=function(){function clamp(min,value,max){return value<min?min:value>max?max:value}o.r=clamp(0,parseInt(o.r),255);o.g=clamp(0,parseInt(o.g),255);o.b=clamp(0,parseInt(o.b),255);o.a=clamp(0,o.a,1);return o};o.clone=function(){return $.color.make(o.r,o.b,o.g,o.a)};return o.normalize()};$.color.extract=function(elem,css){var c;do{c=elem.css(css).toLowerCase();if(c!=""&&c!="transparent")break;elem=elem.parent()}while(elem.length&&!$.nodeName(elem.get(0),"body"));if(c=="rgba(0, 0, 0, 0)")c="transparent";return $.color.parse(c)};$.color.parse=function(str){var res,m=$.color.make;if(res=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str))return m(parseInt(res[1],10),parseInt(res[2],10),parseInt(res[3],10));if(res=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str))return m(parseInt(res[1],10),parseInt(res[2],10),parseInt(res[3],10),parseFloat(res[4]));if(res=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str))return m(parseFloat(res[1])*2.55,parseFloat(res[2])*2.55,parseFloat(res[3])*2.55);if(res=/rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str))return m(parseFloat(res[1])*2.55,parseFloat(res[2])*2.55,parseFloat(res[3])*2.55,parseFloat(res[4]));if(res=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str))return m(parseInt(res[1],16),parseInt(res[2],16),parseInt(res[3],16));if(res=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str))return m(parseInt(res[1]+res[1],16),parseInt(res[2]+res[2],16),parseInt(res[3]+res[3],16));var name=$.trim(str).toLowerCase();if(name=="transparent")return m(255,255,255,0);else{res=lookupColors[name]||[0,0,0];return m(res[0],res[1],res[2])}};var lookupColors={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);

// the actual Flot code
(function($) {

	// Cache the prototype hasOwnProperty for faster access

	var hasOwnProperty = Object.prototype.hasOwnProperty;

    // A shim to provide 'detach' to jQuery versions prior to 1.4.  Using a DOM
    // operation produces the same effect as detach, i.e. removing the element
    // without touching its jQuery data.

    // Do not merge this into Flot 0.9, since it requires jQuery 1.4.4+.

    if (!$.fn.detach) {
        $.fn.detach = function() {
            return this.each(function() {
                if (this.parentNode) {
                    this.parentNode.removeChild( this );
                }
            });
        };
    }

	///////////////////////////////////////////////////////////////////////////
	// The Canvas object is a wrapper around an HTML5 <canvas> tag.
	//
	// @constructor
	// @param {string} cls List of classes to apply to the canvas.
	// @param {element} container Element onto which to append the canvas.
	//
	// Requiring a container is a little iffy, but unfortunately canvas
	// operations don't work unless the canvas is attached to the DOM.

	function Canvas(cls, container) {

		var element = container.children("." + cls)[0];

		if (element == null) {

			element = document.createElement("canvas");
			element.className = cls;

			$(element).css({ direction: "ltr", position: "absolute", left: 0, top: 0 })
				.appendTo(container);

			// If HTML5 Canvas isn't available, fall back to [Ex|Flash]canvas

			if (!element.getContext) {
				if (window.G_vmlCanvasManager) {
					element = window.G_vmlCanvasManager.initElement(element);
				} else {
					throw new Error("Canvas is not available. If you're using IE with a fall-back such as Excanvas, then there's either a mistake in your conditional include, or the page has no DOCTYPE and is rendering in Quirks Mode.");
				}
			}
		}

		this.element = element;

		var context = this.context = element.getContext("2d");

		// Determine the screen's ratio of physical to device-independent
		// pixels.  This is the ratio between the canvas width that the browser
		// advertises and the number of pixels actually present in that space.

		// The iPhone 4, for example, has a device-independent width of 320px,
		// but its screen is actually 640px wide.  It therefore has a pixel
		// ratio of 2, while most normal devices have a ratio of 1.

		var devicePixelRatio = window.devicePixelRatio || 1,
			backingStoreRatio =
				context.webkitBackingStorePixelRatio ||
				context.mozBackingStorePixelRatio ||
				context.msBackingStorePixelRatio ||
				context.oBackingStorePixelRatio ||
				context.backingStorePixelRatio || 1;

		this.pixelRatio = devicePixelRatio / backingStoreRatio;

		// Size the canvas to match the internal dimensions of its container

		this.resize(container.width(), container.height());

		// Collection of HTML div layers for text overlaid onto the canvas

		this.textContainer = null;
		this.text = {};

		// Cache of text fragments and metrics, so we can avoid expensively
		// re-calculating them when the plot is re-rendered in a loop.

		this._textCache = {};
	}

	// Resizes the canvas to the given dimensions.
	//
	// @param {number} width New width of the canvas, in pixels.
	// @param {number} width New height of the canvas, in pixels.

	Canvas.prototype.resize = function(width, height) {

		if (width <= 0 || height <= 0) {
			throw new Error("Invalid dimensions for plot, width = " + width + ", height = " + height);
		}

		var element = this.element,
			context = this.context,
			pixelRatio = this.pixelRatio;

		// Resize the canvas, increasing its density based on the display's
		// pixel ratio; basically giving it more pixels without increasing the
		// size of its element, to take advantage of the fact that retina
		// displays have that many more pixels in the same advertised space.

		// Resizing should reset the state (excanvas seems to be buggy though)

		if (this.width != width) {
			element.width = width * pixelRatio;
			element.style.width = width + "px";
			this.width = width;
		}

		if (this.height != height) {
			element.height = height * pixelRatio;
			element.style.height = height + "px";
			this.height = height;
		}

		// Save the context, so we can reset in case we get replotted.  The
		// restore ensure that we're really back at the initial state, and
		// should be safe even if we haven't saved the initial state yet.

		context.restore();
		context.save();

		// Scale the coordinate space to match the display density; so even though we
		// may have twice as many pixels, we still want lines and other drawing to
		// appear at the same size; the extra pixels will just make them crisper.

		context.scale(pixelRatio, pixelRatio);
	};

	// Clears the entire canvas area, not including any overlaid HTML text

	Canvas.prototype.clear = function() {
		this.context.clearRect(0, 0, this.width, this.height);
	};

	// Finishes rendering the canvas, including managing the text overlay.

	Canvas.prototype.render = function() {

		var cache = this._textCache;

		// For each text layer, add elements marked as active that haven't
		// already been rendered, and remove those that are no longer active.

		for (var layerKey in cache) {
			if (hasOwnProperty.call(cache, layerKey)) {

				var layer = this.getTextLayer(layerKey),
					layerCache = cache[layerKey];

				layer.hide();

				for (var styleKey in layerCache) {
					if (hasOwnProperty.call(layerCache, styleKey)) {
						var styleCache = layerCache[styleKey];
						for (var key in styleCache) {
							if (hasOwnProperty.call(styleCache, key)) {

								var positions = styleCache[key].positions;

								for (var i = 0, position; position = positions[i]; i++) {
									if (position.active) {
										if (!position.rendered) {
											layer.append(position.element);
											position.rendered = true;
										}
									} else {
										positions.splice(i--, 1);
										if (position.rendered) {
											position.element.detach();
										}
									}
								}

								if (positions.length == 0) {
									delete styleCache[key];
								}
							}
						}
					}
				}

				layer.show();
			}
		}
	};

	// Creates (if necessary) and returns the text overlay container.
	//
	// @param {string} classes String of space-separated CSS classes used to
	//     uniquely identify the text layer.
	// @return {object} The jQuery-wrapped text-layer div.

	Canvas.prototype.getTextLayer = function(classes) {

		var layer = this.text[classes];

		// Create the text layer if it doesn't exist

		if (layer == null) {

			// Create the text layer container, if it doesn't exist

			if (this.textContainer == null) {
				this.textContainer = $("<div class='flot-text'></div>")
					.css({
						position: "absolute",
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
						'font-size': "smaller",
						color: "#545454"
					})
					.insertAfter(this.element);
			}

			layer = this.text[classes] = $("<div></div>")
				.addClass(classes)
				.css({
					position: "absolute",
					top: 0,
					left: 0,
					bottom: 0,
					right: 0
				})
				.appendTo(this.textContainer);
		}

		return layer;
	};

	// Creates (if necessary) and returns a text info object.
	//
	// The object looks like this:
	//
	// {
	//     width: Width of the text's wrapper div.
	//     height: Height of the text's wrapper div.
	//     element: The jQuery-wrapped HTML div containing the text.
	//     positions: Array of positions at which this text is drawn.
	// }
	//
	// The positions array contains objects that look like this:
	//
	// {
	//     active: Flag indicating whether the text should be visible.
	//     rendered: Flag indicating whether the text is currently visible.
	//     element: The jQuery-wrapped HTML div containing the text.
	//     x: X coordinate at which to draw the text.
	//     y: Y coordinate at which to draw the text.
	// }
	//
	// Each position after the first receives a clone of the original element.
	//
	// The idea is that that the width, height, and general 'identity' of the
	// text is constant no matter where it is placed; the placements are a
	// secondary property.
	//
	// Canvas maintains a cache of recently-used text info objects; getTextInfo
	// either returns the cached element or creates a new entry.
	//
	// @param {string} layer A string of space-separated CSS classes uniquely
	//     identifying the layer containing this text.
	// @param {string} text Text string to retrieve info for.
	// @param {(string|object)=} font Either a string of space-separated CSS
	//     classes or a font-spec object, defining the text's font and style.
	// @param {number=} angle Angle at which to rotate the text, in degrees.
	//     Angle is currently unused, it will be implemented in the future.
	// @param {number=} width Maximum width of the text before it wraps.
	// @return {object} a text info object.

	Canvas.prototype.getTextInfo = function(layer, text, font, angle, width) {

		var textStyle, layerCache, styleCache, info;

		// Cast the value to a string, in case we were given a number or such

		text = "" + text;

		// If the font is a font-spec object, generate a CSS font definition

		if (typeof font === "object") {
			textStyle = font.style + " " + font.variant + " " + font.weight + " " + font.size + "px/" + font.lineHeight + "px " + font.family;
		} else {
			textStyle = font;
		}

		// Retrieve (or create) the cache for the text's layer and styles

		layerCache = this._textCache[layer];

		if (layerCache == null) {
			layerCache = this._textCache[layer] = {};
		}

		styleCache = layerCache[textStyle];

		if (styleCache == null) {
			styleCache = layerCache[textStyle] = {};
		}

		info = styleCache[text];

		// If we can't find a matching element in our cache, create a new one

		if (info == null) {

			var element = $("<div></div>").html(text)
				.css({
					position: "absolute",
					'max-width': width,
					top: -9999
				})
				.appendTo(this.getTextLayer(layer));

			if (typeof font === "object") {
				element.css({
					font: textStyle,
					color: font.color
				});
			} else if (typeof font === "string") {
				element.addClass(font);
			}

			info = styleCache[text] = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				element: element,
				positions: []
			};

			element.detach();
		}

		return info;
	};

	// Adds a text string to the canvas text overlay.
	//
	// The text isn't drawn immediately; it is marked as rendering, which will
	// result in its addition to the canvas on the next render pass.
	//
	// @param {string} layer A string of space-separated CSS classes uniquely
	//     identifying the layer containing this text.
	// @param {number} x X coordinate at which to draw the text.
	// @param {number} y Y coordinate at which to draw the text.
	// @param {string} text Text string to draw.
	// @param {(string|object)=} font Either a string of space-separated CSS
	//     classes or a font-spec object, defining the text's font and style.
	// @param {number=} angle Angle at which to rotate the text, in degrees.
	//     Angle is currently unused, it will be implemented in the future.
	// @param {number=} width Maximum width of the text before it wraps.
	// @param {string=} halign Horizontal alignment of the text; either "left",
	//     "center" or "right".
	// @param {string=} valign Vertical alignment of the text; either "top",
	//     "middle" or "bottom".

	Canvas.prototype.addText = function(layer, x, y, text, font, angle, width, halign, valign) {

		var info = this.getTextInfo(layer, text, font, angle, width),
			positions = info.positions;

		// Tweak the div's position to match the text's alignment

		if (halign == "center") {
			x -= info.width / 2;
		} else if (halign == "right") {
			x -= info.width;
		}

		if (valign == "middle") {
			y -= info.height / 2;
		} else if (valign == "bottom") {
			y -= info.height;
		}

		// Determine whether this text already exists at this position.
		// If so, mark it for inclusion in the next render pass.

		for (var i = 0, position; position = positions[i]; i++) {
			if (position.x == x && position.y == y) {
				position.active = true;
				return;
			}
		}

		// If the text doesn't exist at this position, create a new entry

		// For the very first position we'll re-use the original element,
		// while for subsequent ones we'll clone it.

		position = {
			active: true,
			rendered: false,
			element: positions.length ? info.element.clone() : info.element,
			x: x,
			y: y
		};

		positions.push(position);

		// Move the element to its final position within the container

		position.element.css({
			top: Math.round(y),
			left: Math.round(x),
			'text-align': halign	// In case the text wraps
		});
	};

	// Removes one or more text strings from the canvas text overlay.
	//
	// If no parameters are given, all text within the layer is removed.
	//
	// Note that the text is not immediately removed; it is simply marked as
	// inactive, which will result in its removal on the next render pass.
	// This avoids the performance penalty for 'clear and redraw' behavior,
	// where we potentially get rid of all text on a layer, but will likely
	// add back most or all of it later, as when redrawing axes, for example.
	//
	// @param {string} layer A string of space-separated CSS classes uniquely
	//     identifying the layer containing this text.
	// @param {number=} x X coordinate of the text.
	// @param {number=} y Y coordinate of the text.
	// @param {string=} text Text string to remove.
	// @param {(string|object)=} font Either a string of space-separated CSS
	//     classes or a font-spec object, defining the text's font and style.
	// @param {number=} angle Angle at which the text is rotated, in degrees.
	//     Angle is currently unused, it will be implemented in the future.

	Canvas.prototype.removeText = function(layer, x, y, text, font, angle) {
		if (text == null) {
			var layerCache = this._textCache[layer];
			if (layerCache != null) {
				for (var styleKey in layerCache) {
					if (hasOwnProperty.call(layerCache, styleKey)) {
						var styleCache = layerCache[styleKey];
						for (var key in styleCache) {
							if (hasOwnProperty.call(styleCache, key)) {
								var positions = styleCache[key].positions;
								for (var i = 0, position; position = positions[i]; i++) {
									position.active = false;
								}
							}
						}
					}
				}
			}
		} else {
			var positions = this.getTextInfo(layer, text, font, angle).positions;
			for (var i = 0, position; position = positions[i]; i++) {
				if (position.x == x && position.y == y) {
					position.active = false;
				}
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////
	// The top-level container for the entire plot.

    function Plot(placeholder, data_, options_, plugins) {
        // data is on the form:
        //   [ series1, series2 ... ]
        // where series is either just the data as [ [x1, y1], [x2, y2], ... ]
        // or { data: [ [x1, y1], [x2, y2], ... ], label: "some label", ... }

        var series = [],
            options = {
                // the color theme used for graphs
                colors: ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
                legend: {
                    show: true,
                    noColumns: 1, // number of colums in legend table
                    labelFormatter: null, // fn: string -> string
                    labelBoxBorderColor: "#ccc", // border color for the little label boxes
                    container: null, // container (as jQuery object) to put legend in, null means default on top of graph
                    position: "ne", // position of default legend container within plot
                    margin: 5, // distance from grid edge to default legend container within plot
                    backgroundColor: null, // null means auto-detect
                    backgroundOpacity: 0.85, // set to 0 to avoid background
                    sorted: null    // default to no legend sorting
                },
                xaxis: {
                    show: null, // null = auto-detect, true = always, false = never
                    position: "bottom", // or "top"
                    mode: null, // null or "time"
                    font: null, // null (derived from CSS in placeholder) or object like { size: 11, lineHeight: 13, style: "italic", weight: "bold", family: "sans-serif", variant: "small-caps" }
                    color: null, // base color, labels, ticks
                    tickColor: null, // possibly different color of ticks, e.g. "rgba(0,0,0,0.15)"
                    transform: null, // null or f: number -> number to transform axis
                    inverseTransform: null, // if transform is set, this should be the inverse function
                    min: null, // min. value to show, null means set automatically
                    max: null, // max. value to show, null means set automatically
                    autoscaleMargin: null, // margin in % to add if auto-setting min/max
                    ticks: null, // either [1, 3] or [[1, "a"], 3] or (fn: axis info -> ticks) or app. number of ticks for auto-ticks
                    tickFormatter: null, // fn: number -> string
                    labelWidth: null, // size of tick labels in pixels
                    labelHeight: null,
                    reserveSpace: null, // whether to reserve space even if axis isn't shown
                    tickLength: null, // size in pixels of ticks, or "full" for whole line
                    alignTicksWithAxis: null, // axis number or null for no sync
                    tickDecimals: null, // no. of decimals, null means auto
                    tickSize: null, // number or [number, "unit"]
                    minTickSize: null // number or [number, "unit"]
                },
                yaxis: {
                    autoscaleMargin: 0.02,
                    position: "left" // or "right"
                },
                xaxes: [],
                yaxes: [],
                series: {
                    points: {
                        show: false,
                        radius: 3,
                        lineWidth: 2, // in pixels
                        fill: true,
                        fillColor: "#ffffff",
                        symbol: "circle" // or callback
                    },
                    lines: {
                        // we don't put in show: false so we can see
                        // whether lines were actively disabled
                        lineWidth: 2, // in pixels
                        fill: false,
                        fillColor: null,
                        steps: false
                        // Omit 'zero', so we can later default its value to
                        // match that of the 'fill' option.
                    },
                    bars: {
                        show: false,
                        lineWidth: 2, // in pixels
                        barWidth: 1, // in units of the x axis
                        fill: true,
                        fillColor: null,
                        align: "left", // "left", "right", or "center"
                        horizontal: false,
                        zero: true
                    },
                    shadowSize: 3,
                    highlightColor: null
                },
                grid: {
                    show: true,
                    aboveData: false,
                    color: "#545454", // primary color used for outline and labels
                    backgroundColor: null, // null for transparent, else color
                    borderColor: null, // set if different from the grid color
                    tickColor: null, // color for the ticks, e.g. "rgba(0,0,0,0.15)"
                    margin: 0, // distance from the canvas edge to the grid
                    labelMargin: 5, // in pixels
                    axisMargin: 8, // in pixels
                    borderWidth: 2, // in pixels
                    minBorderMargin: null, // in pixels, null means taken from points radius
                    markings: null, // array of ranges or fn: axes -> array of ranges
                    markingsColor: "#f4f4f4",
                    markingsLineWidth: 2,
                    // interactive stuff
                    clickable: false,
                    hoverable: false,
                    autoHighlight: true, // highlight in case mouse is near
                    mouseActiveRadius: 10 // how far the mouse can be away to activate an item
                },
                interaction: {
                    redrawOverlayInterval: 1000/60 // time between updates, -1 means in same flow
                },
                hooks: {}
            },
        surface = null,     // the canvas for the plot itself
        overlay = null,     // canvas for interactive stuff on top of plot
        eventHolder = null, // jQuery object that events should be bound to
        ctx = null, octx = null,
        xaxes = [], yaxes = [],
        plotOffset = { left: 0, right: 0, top: 0, bottom: 0},
        plotWidth = 0, plotHeight = 0,
        hooks = {
            processOptions: [],
            processRawData: [],
            processDatapoints: [],
            processOffset: [],
            drawBackground: [],
            drawSeries: [],
            draw: [],
            bindEvents: [],
            drawOverlay: [],
            shutdown: []
        },
        plot = this;

        // public functions
        plot.setData = setData;
        plot.setupGrid = setupGrid;
        plot.draw = draw;
        plot.getPlaceholder = function() { return placeholder; };
        plot.getCanvas = function() { return surface.element; };
        plot.getPlotOffset = function() { return plotOffset; };
        plot.width = function () { return plotWidth; };
        plot.height = function () { return plotHeight; };
        plot.offset = function () {
            var o = eventHolder.offset();
            o.left += plotOffset.left;
            o.top += plotOffset.top;
            return o;
        };
        plot.getData = function () { return series; };
        plot.getAxes = function () {
            var res = {}, i;
            $.each(xaxes.concat(yaxes), function (_, axis) {
                if (axis)
                    res[axis.direction + (axis.n != 1 ? axis.n : "") + "axis"] = axis;
            });
            return res;
        };
        plot.getXAxes = function () { return xaxes; };
        plot.getYAxes = function () { return yaxes; };
        plot.c2p = canvasToAxisCoords;
        plot.p2c = axisToCanvasCoords;
        plot.getOptions = function () { return options; };
        plot.highlight = highlight;
        plot.unhighlight = unhighlight;
        plot.triggerRedrawOverlay = triggerRedrawOverlay;
        plot.pointOffset = function(point) {
            return {
                left: parseInt(xaxes[axisNumber(point, "x") - 1].p2c(+point.x) + plotOffset.left, 10),
                top: parseInt(yaxes[axisNumber(point, "y") - 1].p2c(+point.y) + plotOffset.top, 10)
            };
        };
        plot.shutdown = shutdown;
        plot.destroy = function () {
            shutdown();
            placeholder.removeData("plot").empty();

            series = [];
            options = null;
            surface = null;
            overlay = null;
            eventHolder = null;
            ctx = null;
            octx = null;
            xaxes = [];
            yaxes = [];
            hooks = null;
            highlights = [];
            plot = null;
        };
        plot.resize = function () {
        	var width = placeholder.width(),
        		height = placeholder.height();
            surface.resize(width, height);
            overlay.resize(width, height);
        };

        // public attributes
        plot.hooks = hooks;

        // initialize
        initPlugins(plot);
        parseOptions(options_);
        setupCanvases();
        setData(data_);
        setupGrid();
        draw();
        bindEvents();


        function executeHooks(hook, args) {
            args = [plot].concat(args);
            for (var i = 0; i < hook.length; ++i)
                hook[i].apply(this, args);
        }

        function initPlugins() {

            // References to key classes, allowing plugins to modify them

            var classes = {
                Canvas: Canvas
            };

            for (var i = 0; i < plugins.length; ++i) {
                var p = plugins[i];
                p.init(plot, classes);
                if (p.options)
                    $.extend(true, options, p.options);
            }
        }

        function parseOptions(opts) {

            $.extend(true, options, opts);

            // $.extend merges arrays, rather than replacing them.  When less
            // colors are provided than the size of the default palette, we
            // end up with those colors plus the remaining defaults, which is
            // not expected behavior; avoid it by replacing them here.

            if (opts && opts.colors) {
            	options.colors = opts.colors;
            }

            if (options.xaxis.color == null)
                options.xaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();
            if (options.yaxis.color == null)
                options.yaxis.color = $.color.parse(options.grid.color).scale('a', 0.22).toString();

            if (options.xaxis.tickColor == null) // grid.tickColor for back-compatibility
                options.xaxis.tickColor = options.grid.tickColor || options.xaxis.color;
            if (options.yaxis.tickColor == null) // grid.tickColor for back-compatibility
                options.yaxis.tickColor = options.grid.tickColor || options.yaxis.color;

            if (options.grid.borderColor == null)
                options.grid.borderColor = options.grid.color;
            if (options.grid.tickColor == null)
                options.grid.tickColor = $.color.parse(options.grid.color).scale('a', 0.22).toString();

            // Fill in defaults for axis options, including any unspecified
            // font-spec fields, if a font-spec was provided.

            // If no x/y axis options were provided, create one of each anyway,
            // since the rest of the code assumes that they exist.

            var i, axisOptions, axisCount,
                fontSize = placeholder.css("font-size"),
                fontSizeDefault = fontSize ? +fontSize.replace("px", "") : 13,
                fontDefaults = {
                    style: placeholder.css("font-style"),
                    size: Math.round(0.8 * fontSizeDefault),
                    variant: placeholder.css("font-variant"),
                    weight: placeholder.css("font-weight"),
                    family: placeholder.css("font-family")
                };

            axisCount = options.xaxes.length || 1;
            for (i = 0; i < axisCount; ++i) {

                axisOptions = options.xaxes[i];
                if (axisOptions && !axisOptions.tickColor) {
                    axisOptions.tickColor = axisOptions.color;
                }

                axisOptions = $.extend(true, {}, options.xaxis, axisOptions);
                options.xaxes[i] = axisOptions;

                if (axisOptions.font) {
                    axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);
                    if (!axisOptions.font.color) {
                        axisOptions.font.color = axisOptions.color;
                    }
                    if (!axisOptions.font.lineHeight) {
                        axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
                    }
                }
            }

            axisCount = options.yaxes.length || 1;
            for (i = 0; i < axisCount; ++i) {

                axisOptions = options.yaxes[i];
                if (axisOptions && !axisOptions.tickColor) {
                    axisOptions.tickColor = axisOptions.color;
                }

                axisOptions = $.extend(true, {}, options.yaxis, axisOptions);
                options.yaxes[i] = axisOptions;

                if (axisOptions.font) {
                    axisOptions.font = $.extend({}, fontDefaults, axisOptions.font);
                    if (!axisOptions.font.color) {
                        axisOptions.font.color = axisOptions.color;
                    }
                    if (!axisOptions.font.lineHeight) {
                        axisOptions.font.lineHeight = Math.round(axisOptions.font.size * 1.15);
                    }
                }
            }

            // backwards compatibility, to be removed in future
            if (options.xaxis.noTicks && options.xaxis.ticks == null)
                options.xaxis.ticks = options.xaxis.noTicks;
            if (options.yaxis.noTicks && options.yaxis.ticks == null)
                options.yaxis.ticks = options.yaxis.noTicks;
            if (options.x2axis) {
                options.xaxes[1] = $.extend(true, {}, options.xaxis, options.x2axis);
                options.xaxes[1].position = "top";
                // Override the inherit to allow the axis to auto-scale
                if (options.x2axis.min == null) {
                    options.xaxes[1].min = null;
                }
                if (options.x2axis.max == null) {
                    options.xaxes[1].max = null;
                }
            }
            if (options.y2axis) {
                options.yaxes[1] = $.extend(true, {}, options.yaxis, options.y2axis);
                options.yaxes[1].position = "right";
                // Override the inherit to allow the axis to auto-scale
                if (options.y2axis.min == null) {
                    options.yaxes[1].min = null;
                }
                if (options.y2axis.max == null) {
                    options.yaxes[1].max = null;
                }
            }
            if (options.grid.coloredAreas)
                options.grid.markings = options.grid.coloredAreas;
            if (options.grid.coloredAreasColor)
                options.grid.markingsColor = options.grid.coloredAreasColor;
            if (options.lines)
                $.extend(true, options.series.lines, options.lines);
            if (options.points)
                $.extend(true, options.series.points, options.points);
            if (options.bars)
                $.extend(true, options.series.bars, options.bars);
            if (options.shadowSize != null)
                options.series.shadowSize = options.shadowSize;
            if (options.highlightColor != null)
                options.series.highlightColor = options.highlightColor;

            // save options on axes for future reference
            for (i = 0; i < options.xaxes.length; ++i)
                getOrCreateAxis(xaxes, i + 1).options = options.xaxes[i];
            for (i = 0; i < options.yaxes.length; ++i)
                getOrCreateAxis(yaxes, i + 1).options = options.yaxes[i];

            // add hooks from options
            for (var n in hooks)
                if (options.hooks[n] && options.hooks[n].length)
                    hooks[n] = hooks[n].concat(options.hooks[n]);

            executeHooks(hooks.processOptions, [options]);
        }

        function setData(d) {
            series = parseData(d);
            fillInSeriesOptions();
            processData();
        }

        function parseData(d) {
            var res = [];
            for (var i = 0; i < d.length; ++i) {
                var s = $.extend(true, {}, options.series);

                if (d[i].data != null) {
                    s.data = d[i].data; // move the data instead of deep-copy
                    delete d[i].data;

                    $.extend(true, s, d[i]);

                    d[i].data = s.data;
                }
                else
                    s.data = d[i];
                res.push(s);
            }

            return res;
        }

        function axisNumber(obj, coord) {
            var a = obj[coord + "axis"];
            if (typeof a == "object") // if we got a real axis, extract number
                a = a.n;
            if (typeof a != "number")
                a = 1; // default to first axis
            return a;
        }

        function allAxes() {
            // return flat array without annoying null entries
            return $.grep(xaxes.concat(yaxes), function (a) { return a; });
        }

        function canvasToAxisCoords(pos) {
            // return an object with x/y corresponding to all used axes
            var res = {}, i, axis;
            for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i];
                if (axis && axis.used)
                    res["x" + axis.n] = axis.c2p(pos.left);
            }

            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i];
                if (axis && axis.used)
                    res["y" + axis.n] = axis.c2p(pos.top);
            }

            if (res.x1 !== undefined)
                res.x = res.x1;
            if (res.y1 !== undefined)
                res.y = res.y1;

            return res;
        }

        function axisToCanvasCoords(pos) {
            // get canvas coords from the first pair of x/y found in pos
            var res = {}, i, axis, key;

            for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i];
                if (axis && axis.used) {
                    key = "x" + axis.n;
                    if (pos[key] == null && axis.n == 1)
                        key = "x";

                    if (pos[key] != null) {
                        res.left = axis.p2c(pos[key]);
                        break;
                    }
                }
            }

            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i];
                if (axis && axis.used) {
                    key = "y" + axis.n;
                    if (pos[key] == null && axis.n == 1)
                        key = "y";

                    if (pos[key] != null) {
                        res.top = axis.p2c(pos[key]);
                        break;
                    }
                }
            }

            return res;
        }

        function getOrCreateAxis(axes, number) {
            if (!axes[number - 1])
                axes[number - 1] = {
                    n: number, // save the number for future reference
                    direction: axes == xaxes ? "x" : "y",
                    options: $.extend(true, {}, axes == xaxes ? options.xaxis : options.yaxis)
                };

            return axes[number - 1];
        }

        function fillInSeriesOptions() {

            var neededColors = series.length, maxIndex = -1, i;

            // Subtract the number of series that already have fixed colors or
            // color indexes from the number that we still need to generate.

            for (i = 0; i < series.length; ++i) {
                var sc = series[i].color;
                if (sc != null) {
                    neededColors--;
                    if (typeof sc == "number" && sc > maxIndex) {
                        maxIndex = sc;
                    }
                }
            }

            // If any of the series have fixed color indexes, then we need to
            // generate at least as many colors as the highest index.

            if (neededColors <= maxIndex) {
                neededColors = maxIndex + 1;
            }

            // Generate all the colors, using first the option colors and then
            // variations on those colors once they're exhausted.

            var c, colors = [], colorPool = options.colors,
                colorPoolSize = colorPool.length, variation = 0;

            for (i = 0; i < neededColors; i++) {

                c = $.color.parse(colorPool[i % colorPoolSize] || "#666");

                // Each time we exhaust the colors in the pool we adjust
                // a scaling factor used to produce more variations on
                // those colors. The factor alternates negative/positive
                // to produce lighter/darker colors.

                // Reset the variation after every few cycles, or else
                // it will end up producing only white or black colors.

                if (i % colorPoolSize == 0 && i) {
                    if (variation >= 0) {
                        if (variation < 0.5) {
                            variation = -variation - 0.2;
                        } else variation = 0;
                    } else variation = -variation;
                }

                colors[i] = c.scale('rgb', 1 + variation);
            }

            // Finalize the series options, filling in their colors

            var colori = 0, s;
            for (i = 0; i < series.length; ++i) {
                s = series[i];

                // assign colors
                if (s.color == null) {
                    s.color = colors[colori].toString();
                    ++colori;
                }
                else if (typeof s.color == "number")
                    s.color = colors[s.color].toString();

                // turn on lines automatically in case nothing is set
                if (s.lines.show == null) {
                    var v, show = true;
                    for (v in s)
                        if (s[v] && s[v].show) {
                            show = false;
                            break;
                        }
                    if (show)
                        s.lines.show = true;
                }

                // If nothing was provided for lines.zero, default it to match
                // lines.fill, since areas by default should extend to zero.

                if (s.lines.zero == null) {
                    s.lines.zero = !!s.lines.fill;
                }

                // setup axes
                s.xaxis = getOrCreateAxis(xaxes, axisNumber(s, "x"));
                s.yaxis = getOrCreateAxis(yaxes, axisNumber(s, "y"));
            }
        }

        function processData() {
            var topSentry = Number.POSITIVE_INFINITY,
                bottomSentry = Number.NEGATIVE_INFINITY,
                fakeInfinity = Number.MAX_VALUE,
                i, j, k, m, length,
                s, points, ps, x, y, axis, val, f, p,
                data, format;

            function updateAxis(axis, min, max) {
                if (min < axis.datamin && min != -fakeInfinity)
                    axis.datamin = min;
                if (max > axis.datamax && max != fakeInfinity)
                    axis.datamax = max;
            }

            $.each(allAxes(), function (_, axis) {
                // init axis
                axis.datamin = topSentry;
                axis.datamax = bottomSentry;
                axis.used = false;
            });

            for (i = 0; i < series.length; ++i) {
                s = series[i];
                s.datapoints = { points: [] };

                executeHooks(hooks.processRawData, [ s, s.data, s.datapoints ]);
            }

            // first pass: clean and copy data
            for (i = 0; i < series.length; ++i) {
                s = series[i];

                data = s.data;
                format = s.datapoints.format;

                if (!format) {
                    format = [];
                    // find out how to copy
                    format.push({ x: true, number: true, required: true });
                    format.push({ y: true, number: true, required: true });

                    if (s.bars.show || (s.lines.show && s.lines.fill)) {
                        var autoscale = !!((s.bars.show && s.bars.zero) || (s.lines.show && s.lines.zero));
                        format.push({ y: true, number: true, required: false, defaultValue: 0, autoscale: autoscale });
                        if (s.bars.horizontal) {
                            delete format[format.length - 1].y;
                            format[format.length - 1].x = true;
                        }
                    }

                    s.datapoints.format = format;
                }

                if (s.datapoints.pointsize != null)
                    continue; // already filled in

                s.datapoints.pointsize = format.length;

                ps = s.datapoints.pointsize;
                points = s.datapoints.points;

                var insertSteps = s.lines.show && s.lines.steps;
                s.xaxis.used = s.yaxis.used = true;

                for (j = k = 0; j < data.length; ++j, k += ps) {
                    p = data[j];

                    var nullify = p == null;
                    if (!nullify) {
                        for (m = 0; m < ps; ++m) {
                            val = p[m];
                            f = format[m];

                            if (f) {
                                if (f.number && val != null) {
                                    val = +val; // convert to number
                                    if (isNaN(val))
                                        val = null;
                                    else if (val == Infinity)
                                        val = fakeInfinity;
                                    else if (val == -Infinity)
                                        val = -fakeInfinity;
                                }

                                if (val == null) {
                                    if (f.required)
                                        nullify = true;

                                    if (f.defaultValue != null)
                                        val = f.defaultValue;
                                }
                            }

                            points[k + m] = val;
                        }
                    }

                    if (nullify) {
                        for (m = 0; m < ps; ++m) {
                            val = points[k + m];
                            if (val != null) {
                                f = format[m];
                                // extract min/max info
                                if (f.autoscale !== false) {
                                    if (f.x) {
                                        updateAxis(s.xaxis, val, val);
                                    }
                                    if (f.y) {
                                        updateAxis(s.yaxis, val, val);
                                    }
                                }
                            }
                            points[k + m] = null;
                        }
                    }
                    else {
                        // a little bit of line specific stuff that
                        // perhaps shouldn't be here, but lacking
                        // better means...
                        if (insertSteps && k > 0
                            && points[k - ps] != null
                            && points[k - ps] != points[k]
                            && points[k - ps + 1] != points[k + 1]) {
                            // copy the point to make room for a middle point
                            for (m = 0; m < ps; ++m)
                                points[k + ps + m] = points[k + m];

                            // middle point has same y
                            points[k + 1] = points[k - ps + 1];

                            // we've added a point, better reflect that
                            k += ps;
                        }
                    }
                }
            }

            // give the hooks a chance to run
            for (i = 0; i < series.length; ++i) {
                s = series[i];

                executeHooks(hooks.processDatapoints, [ s, s.datapoints]);
            }

            // second pass: find datamax/datamin for auto-scaling
            for (i = 0; i < series.length; ++i) {
                s = series[i];
                points = s.datapoints.points;
                ps = s.datapoints.pointsize;
                format = s.datapoints.format;

                var xmin = topSentry, ymin = topSentry,
                    xmax = bottomSentry, ymax = bottomSentry;

                for (j = 0; j < points.length; j += ps) {
                    if (points[j] == null)
                        continue;

                    for (m = 0; m < ps; ++m) {
                        val = points[j + m];
                        f = format[m];
                        if (!f || f.autoscale === false || val == fakeInfinity || val == -fakeInfinity)
                            continue;

                        if (f.x) {
                            if (val < xmin)
                                xmin = val;
                            if (val > xmax)
                                xmax = val;
                        }
                        if (f.y) {
                            if (val < ymin)
                                ymin = val;
                            if (val > ymax)
                                ymax = val;
                        }
                    }
                }

                if (s.bars.show) {
                    // make sure we got room for the bar on the dancing floor
                    var delta;

                    switch (s.bars.align) {
                        case "left":
                            delta = 0;
                            break;
                        case "right":
                            delta = -s.bars.barWidth;
                            break;
                        default:
                            delta = -s.bars.barWidth / 2;
                    }

                    if (s.bars.horizontal) {
                        ymin += delta;
                        ymax += delta + s.bars.barWidth;
                    }
                    else {
                        xmin += delta;
                        xmax += delta + s.bars.barWidth;
                    }
                }

                updateAxis(s.xaxis, xmin, xmax);
                updateAxis(s.yaxis, ymin, ymax);
            }

            $.each(allAxes(), function (_, axis) {
                if (axis.datamin == topSentry)
                    axis.datamin = null;
                if (axis.datamax == bottomSentry)
                    axis.datamax = null;
            });
        }

        function setupCanvases() {

            // Make sure the placeholder is clear of everything except canvases
            // from a previous plot in this container that we'll try to re-use.

            placeholder.css("padding", 0) // padding messes up the positioning
                .children().filter(function(){
                    return !$(this).hasClass("flot-overlay") && !$(this).hasClass('flot-base');
                }).remove();

            if (placeholder.css("position") == 'static')
                placeholder.css("position", "relative"); // for positioning labels and overlay

            surface = new Canvas("flot-base", placeholder);
            overlay = new Canvas("flot-overlay", placeholder); // overlay canvas for interactive features

            ctx = surface.context;
            octx = overlay.context;

            // define which element we're listening for events on
            eventHolder = $(overlay.element).unbind();

            // If we're re-using a plot object, shut down the old one

            var existing = placeholder.data("plot");

            if (existing) {
                existing.shutdown();
                overlay.clear();
            }

            // save in case we get replotted
            placeholder.data("plot", plot);
        }

        function bindEvents() {
            // bind events
            if (options.grid.hoverable) {
                eventHolder.mousemove(onMouseMove);

                // Use bind, rather than .mouseleave, because we officially
                // still support jQuery 1.2.6, which doesn't define a shortcut
                // for mouseenter or mouseleave.  This was a bug/oversight that
                // was fixed somewhere around 1.3.x.  We can return to using
                // .mouseleave when we drop support for 1.2.6.

                eventHolder.bind("mouseleave", onMouseLeave);
            }

            if (options.grid.clickable)
                eventHolder.click(onClick);

            executeHooks(hooks.bindEvents, [eventHolder]);
        }

        function shutdown() {
            if (redrawTimeout)
                clearTimeout(redrawTimeout);

            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mouseleave", onMouseLeave);
            eventHolder.unbind("click", onClick);

            executeHooks(hooks.shutdown, [eventHolder]);
        }

        function setTransformationHelpers(axis) {
            // set helper functions on the axis, assumes plot area
            // has been computed already

            function identity(x) { return x; }

            var s, m, t = axis.options.transform || identity,
                it = axis.options.inverseTransform;

            // precompute how much the axis is scaling a point
            // in canvas space
            if (axis.direction == "x") {
                s = axis.scale = plotWidth / Math.abs(t(axis.max) - t(axis.min));
                m = Math.min(t(axis.max), t(axis.min));
            }
            else {
                s = axis.scale = plotHeight / Math.abs(t(axis.max) - t(axis.min));
                s = -s;
                m = Math.max(t(axis.max), t(axis.min));
            }

            // data point to canvas coordinate
            if (t == identity) // slight optimization
                axis.p2c = function (p) { return (p - m) * s; };
            else
                axis.p2c = function (p) { return (t(p) - m) * s; };
            // canvas coordinate to data point
            if (!it)
                axis.c2p = function (c) { return m + c / s; };
            else
                axis.c2p = function (c) { return it(m + c / s); };
        }

        function measureTickLabels(axis) {

            var opts = axis.options,
                ticks = axis.ticks || [],
                labelWidth = opts.labelWidth || 0,
                labelHeight = opts.labelHeight || 0,
                maxWidth = labelWidth || (axis.direction == "x" ? Math.floor(surface.width / (ticks.length || 1)) : null),
                legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
                layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
                font = opts.font || "flot-tick-label tickLabel";

            for (var i = 0; i < ticks.length; ++i) {

                var t = ticks[i];

                if (!t.label)
                    continue;

                var info = surface.getTextInfo(layer, t.label, font, null, maxWidth);

                labelWidth = Math.max(labelWidth, info.width);
                labelHeight = Math.max(labelHeight, info.height);
            }

            axis.labelWidth = opts.labelWidth || labelWidth;
            axis.labelHeight = opts.labelHeight || labelHeight;
        }

        function allocateAxisBoxFirstPhase(axis) {
            // find the bounding box of the axis by looking at label
            // widths/heights and ticks, make room by diminishing the
            // plotOffset; this first phase only looks at one
            // dimension per axis, the other dimension depends on the
            // other axes so will have to wait

            var lw = axis.labelWidth,
                lh = axis.labelHeight,
                pos = axis.options.position,
                isXAxis = axis.direction === "x",
                tickLength = axis.options.tickLength,
                axisMargin = options.grid.axisMargin,
                padding = options.grid.labelMargin,
                innermost = true,
                outermost = true,
                first = true,
                found = false;

            // Determine the axis's position in its direction and on its side

            $.each(isXAxis ? xaxes : yaxes, function(i, a) {
                if (a && (a.show || a.reserveSpace)) {
                    if (a === axis) {
                        found = true;
                    } else if (a.options.position === pos) {
                        if (found) {
                            outermost = false;
                        } else {
                            innermost = false;
                        }
                    }
                    if (!found) {
                        first = false;
                    }
                }
            });

            // The outermost axis on each side has no margin

            if (outermost) {
                axisMargin = 0;
            }

            // The ticks for the first axis in each direction stretch across

            if (tickLength == null) {
                tickLength = first ? "full" : 5;
            }

            if (!isNaN(+tickLength))
                padding += +tickLength;

            if (isXAxis) {
                lh += padding;

                if (pos == "bottom") {
                    plotOffset.bottom += lh + axisMargin;
                    axis.box = { top: surface.height - plotOffset.bottom, height: lh };
                }
                else {
                    axis.box = { top: plotOffset.top + axisMargin, height: lh };
                    plotOffset.top += lh + axisMargin;
                }
            }
            else {
                lw += padding;

                if (pos == "left") {
                    axis.box = { left: plotOffset.left + axisMargin, width: lw };
                    plotOffset.left += lw + axisMargin;
                }
                else {
                    plotOffset.right += lw + axisMargin;
                    axis.box = { left: surface.width - plotOffset.right, width: lw };
                }
            }

             // save for future reference
            axis.position = pos;
            axis.tickLength = tickLength;
            axis.box.padding = padding;
            axis.innermost = innermost;
        }

        function allocateAxisBoxSecondPhase(axis) {
            // now that all axis boxes have been placed in one
            // dimension, we can set the remaining dimension coordinates
            if (axis.direction == "x") {
                axis.box.left = plotOffset.left - axis.labelWidth / 2;
                axis.box.width = surface.width - plotOffset.left - plotOffset.right + axis.labelWidth;
            }
            else {
                axis.box.top = plotOffset.top - axis.labelHeight / 2;
                axis.box.height = surface.height - plotOffset.bottom - plotOffset.top + axis.labelHeight;
            }
        }

        function adjustLayoutForThingsStickingOut() {
            // possibly adjust plot offset to ensure everything stays
            // inside the canvas and isn't clipped off

            var minMargin = options.grid.minBorderMargin,
                axis, i;

            // check stuff from the plot (FIXME: this should just read
            // a value from the series, otherwise it's impossible to
            // customize)
            if (minMargin == null) {
                minMargin = 0;
                for (i = 0; i < series.length; ++i)
                    minMargin = Math.max(minMargin, 2 * (series[i].points.radius + series[i].points.lineWidth/2));
            }

            var margins = {
                left: minMargin,
                right: minMargin,
                top: minMargin,
                bottom: minMargin
            };

            // check axis labels, note we don't check the actual
            // labels but instead use the overall width/height to not
            // jump as much around with replots
            $.each(allAxes(), function (_, axis) {
                if (axis.reserveSpace && axis.ticks && axis.ticks.length) {
                    if (axis.direction === "x") {
                        margins.left = Math.max(margins.left, axis.labelWidth / 2);
                        margins.right = Math.max(margins.right, axis.labelWidth / 2);
                    } else {
                        margins.bottom = Math.max(margins.bottom, axis.labelHeight / 2);
                        margins.top = Math.max(margins.top, axis.labelHeight / 2);
                    }
                }
            });

            plotOffset.left = Math.ceil(Math.max(margins.left, plotOffset.left));
            plotOffset.right = Math.ceil(Math.max(margins.right, plotOffset.right));
            plotOffset.top = Math.ceil(Math.max(margins.top, plotOffset.top));
            plotOffset.bottom = Math.ceil(Math.max(margins.bottom, plotOffset.bottom));
        }

        function setupGrid() {
            var i, axes = allAxes(), showGrid = options.grid.show;

            // Initialize the plot's offset from the edge of the canvas

            for (var a in plotOffset) {
                var margin = options.grid.margin || 0;
                plotOffset[a] = typeof margin == "number" ? margin : margin[a] || 0;
            }

            executeHooks(hooks.processOffset, [plotOffset]);

            // If the grid is visible, add its border width to the offset

            for (var a in plotOffset) {
                if(typeof(options.grid.borderWidth) == "object") {
                    plotOffset[a] += showGrid ? options.grid.borderWidth[a] : 0;
                }
                else {
                    plotOffset[a] += showGrid ? options.grid.borderWidth : 0;
                }
            }

            $.each(axes, function (_, axis) {
                var axisOpts = axis.options;
                axis.show = axisOpts.show == null ? axis.used : axisOpts.show;
                axis.reserveSpace = axisOpts.reserveSpace == null ? axis.show : axisOpts.reserveSpace;
                setRange(axis);
            });

            if (showGrid) {

                var allocatedAxes = $.grep(axes, function (axis) {
                    return axis.show || axis.reserveSpace;
                });

                $.each(allocatedAxes, function (_, axis) {
                    // make the ticks
                    setupTickGeneration(axis);
                    setTicks(axis);
                    snapRangeToTicks(axis, axis.ticks);
                    // find labelWidth/Height for axis
                    measureTickLabels(axis);
                });

                // with all dimensions calculated, we can compute the
                // axis bounding boxes, start from the outside
                // (reverse order)
                for (i = allocatedAxes.length - 1; i >= 0; --i)
                    allocateAxisBoxFirstPhase(allocatedAxes[i]);

                // make sure we've got enough space for things that
                // might stick out
                adjustLayoutForThingsStickingOut();

                $.each(allocatedAxes, function (_, axis) {
                    allocateAxisBoxSecondPhase(axis);
                });
            }

            plotWidth = surface.width - plotOffset.left - plotOffset.right;
            plotHeight = surface.height - plotOffset.bottom - plotOffset.top;

            // now we got the proper plot dimensions, we can compute the scaling
            $.each(axes, function (_, axis) {
                setTransformationHelpers(axis);
            });

            if (showGrid) {
                drawAxisLabels();
            }

            insertLegend();
        }

        function setRange(axis) {
            var opts = axis.options,
                min = +(opts.min != null ? opts.min : axis.datamin),
                max = +(opts.max != null ? opts.max : axis.datamax),
                delta = max - min;

            if (delta == 0.0) {
                // degenerate case
                var widen = max == 0 ? 1 : 0.01;

                if (opts.min == null)
                    min -= widen;
                // always widen max if we couldn't widen min to ensure we
                // don't fall into min == max which doesn't work
                if (opts.max == null || opts.min != null)
                    max += widen;
            }
            else {
                // consider autoscaling
                var margin = opts.autoscaleMargin;
                if (margin != null) {
                    if (opts.min == null) {
                        min -= delta * margin;
                        // make sure we don't go below zero if all values
                        // are positive
                        if (min < 0 && axis.datamin != null && axis.datamin >= 0)
                            min = 0;
                    }
                    if (opts.max == null) {
                        max += delta * margin;
                        if (max > 0 && axis.datamax != null && axis.datamax <= 0)
                            max = 0;
                    }
                }
            }
            axis.min = min;
            axis.max = max;
        }

        function setupTickGeneration(axis) {
            var opts = axis.options;

            // estimate number of ticks
            var noTicks;
            if (typeof opts.ticks == "number" && opts.ticks > 0)
                noTicks = opts.ticks;
            else
                // heuristic based on the model a*sqrt(x) fitted to
                // some data points that seemed reasonable
                noTicks = 0.3 * Math.sqrt(axis.direction == "x" ? surface.width : surface.height);

            var delta = (axis.max - axis.min) / noTicks,
                dec = -Math.floor(Math.log(delta) / Math.LN10),
                maxDec = opts.tickDecimals;

            if (maxDec != null && dec > maxDec) {
                dec = maxDec;
            }

            var magn = Math.pow(10, -dec),
                norm = delta / magn, // norm is between 1.0 and 10.0
                size;

            if (norm < 1.5) {
                size = 1;
            } else if (norm < 3) {
                size = 2;
                // special case for 2.5, requires an extra decimal
                if (norm > 2.25 && (maxDec == null || dec + 1 <= maxDec)) {
                    size = 2.5;
                    ++dec;
                }
            } else if (norm < 7.5) {
                size = 5;
            } else {
                size = 10;
            }

            size *= magn;

            if (opts.minTickSize != null && size < opts.minTickSize) {
                size = opts.minTickSize;
            }

            axis.delta = delta;
            axis.tickDecimals = Math.max(0, maxDec != null ? maxDec : dec);
            axis.tickSize = opts.tickSize || size;

            // Time mode was moved to a plug-in in 0.8, and since so many people use it
            // we'll add an especially friendly reminder to make sure they included it.

            if (opts.mode == "time" && !axis.tickGenerator) {
                throw new Error("Time mode requires the flot.time plugin.");
            }

            // Flot supports base-10 axes; any other mode else is handled by a plug-in,
            // like flot.time.js.

            if (!axis.tickGenerator) {

                axis.tickGenerator = function (axis) {

                    var ticks = [],
                        start = floorInBase(axis.min, axis.tickSize),
                        i = 0,
                        v = Number.NaN,
                        prev;

                    do {
                        prev = v;
                        v = start + i * axis.tickSize;
                        ticks.push(v);
                        ++i;
                    } while (v < axis.max && v != prev);
                    return ticks;
                };

				axis.tickFormatter = function (value, axis) {

					var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
					var formatted = "" + Math.round(value * factor) / factor;

					// If tickDecimals was specified, ensure that we have exactly that
					// much precision; otherwise default to the value's own precision.

					if (axis.tickDecimals != null) {
						var decimal = formatted.indexOf(".");
						var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
						if (precision < axis.tickDecimals) {
							return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
						}
					}

                    return formatted;
                };
            }

            if ($.isFunction(opts.tickFormatter))
                axis.tickFormatter = function (v, axis) { return "" + opts.tickFormatter(v, axis); };

            if (opts.alignTicksWithAxis != null) {
                var otherAxis = (axis.direction == "x" ? xaxes : yaxes)[opts.alignTicksWithAxis - 1];
                if (otherAxis && otherAxis.used && otherAxis != axis) {
                    // consider snapping min/max to outermost nice ticks
                    var niceTicks = axis.tickGenerator(axis);
                    if (niceTicks.length > 0) {
                        if (opts.min == null)
                            axis.min = Math.min(axis.min, niceTicks[0]);
                        if (opts.max == null && niceTicks.length > 1)
                            axis.max = Math.max(axis.max, niceTicks[niceTicks.length - 1]);
                    }

                    axis.tickGenerator = function (axis) {
                        // copy ticks, scaled to this axis
                        var ticks = [], v, i;
                        for (i = 0; i < otherAxis.ticks.length; ++i) {
                            v = (otherAxis.ticks[i].v - otherAxis.min) / (otherAxis.max - otherAxis.min);
                            v = axis.min + v * (axis.max - axis.min);
                            ticks.push(v);
                        }
                        return ticks;
                    };

                    // we might need an extra decimal since forced
                    // ticks don't necessarily fit naturally
                    if (!axis.mode && opts.tickDecimals == null) {
                        var extraDec = Math.max(0, -Math.floor(Math.log(axis.delta) / Math.LN10) + 1),
                            ts = axis.tickGenerator(axis);

                        // only proceed if the tick interval rounded
                        // with an extra decimal doesn't give us a
                        // zero at end
                        if (!(ts.length > 1 && /\..*0$/.test((ts[1] - ts[0]).toFixed(extraDec))))
                            axis.tickDecimals = extraDec;
                    }
                }
            }
        }

        function setTicks(axis) {
            var oticks = axis.options.ticks, ticks = [];
            if (oticks == null || (typeof oticks == "number" && oticks > 0))
                ticks = axis.tickGenerator(axis);
            else if (oticks) {
                if ($.isFunction(oticks))
                    // generate the ticks
                    ticks = oticks(axis);
                else
                    ticks = oticks;
            }

            // clean up/labelify the supplied ticks, copy them over
            var i, v;
            axis.ticks = [];
            for (i = 0; i < ticks.length; ++i) {
                var label = null;
                var t = ticks[i];
                if (typeof t == "object") {
                    v = +t[0];
                    if (t.length > 1)
                        label = t[1];
                }
                else
                    v = +t;
                if (label == null)
                    label = axis.tickFormatter(v, axis);
                if (!isNaN(v))
                    axis.ticks.push({ v: v, label: label });
            }
        }

        function snapRangeToTicks(axis, ticks) {
            if (axis.options.autoscaleMargin && ticks.length > 0) {
                // snap to ticks
                if (axis.options.min == null)
                    axis.min = Math.min(axis.min, ticks[0].v);
                if (axis.options.max == null && ticks.length > 1)
                    axis.max = Math.max(axis.max, ticks[ticks.length - 1].v);
            }
        }

        function draw() {

            surface.clear();

            executeHooks(hooks.drawBackground, [ctx]);

            var grid = options.grid;

            // draw background, if any
            if (grid.show && grid.backgroundColor)
                drawBackground();

            if (grid.show && !grid.aboveData) {
                drawGrid();
            }

            for (var i = 0; i < series.length; ++i) {
                executeHooks(hooks.drawSeries, [ctx, series[i]]);
                drawSeries(series[i]);
            }

            executeHooks(hooks.draw, [ctx]);

            if (grid.show && grid.aboveData) {
                drawGrid();
            }

            surface.render();

            // A draw implies that either the axes or data have changed, so we
            // should probably update the overlay highlights as well.

            triggerRedrawOverlay();
        }

        function extractRange(ranges, coord) {
            var axis, from, to, key, axes = allAxes();

            for (var i = 0; i < axes.length; ++i) {
                axis = axes[i];
                if (axis.direction == coord) {
                    key = coord + axis.n + "axis";
                    if (!ranges[key] && axis.n == 1)
                        key = coord + "axis"; // support x1axis as xaxis
                    if (ranges[key]) {
                        from = ranges[key].from;
                        to = ranges[key].to;
                        break;
                    }
                }
            }

            // backwards-compat stuff - to be removed in future
            if (!ranges[key]) {
                axis = coord == "x" ? xaxes[0] : yaxes[0];
                from = ranges[coord + "1"];
                to = ranges[coord + "2"];
            }

            // auto-reverse as an added bonus
            if (from != null && to != null && from > to) {
                var tmp = from;
                from = to;
                to = tmp;
            }

            return { from: from, to: to, axis: axis };
        }

        function drawBackground() {
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            ctx.fillStyle = getColorOrGradient(options.grid.backgroundColor, plotHeight, 0, "rgba(255, 255, 255, 0)");
            ctx.fillRect(0, 0, plotWidth, plotHeight);
            ctx.restore();
        }

        function drawGrid() {
            var i, axes, bw, bc;

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            // draw markings
            var markings = options.grid.markings;
            if (markings) {
                if ($.isFunction(markings)) {
                    axes = plot.getAxes();
                    // xmin etc. is backwards compatibility, to be
                    // removed in the future
                    axes.xmin = axes.xaxis.min;
                    axes.xmax = axes.xaxis.max;
                    axes.ymin = axes.yaxis.min;
                    axes.ymax = axes.yaxis.max;

                    markings = markings(axes);
                }

                for (i = 0; i < markings.length; ++i) {
                    var m = markings[i],
                        xrange = extractRange(m, "x"),
                        yrange = extractRange(m, "y");

                    // fill in missing
                    if (xrange.from == null)
                        xrange.from = xrange.axis.min;
                    if (xrange.to == null)
                        xrange.to = xrange.axis.max;
                    if (yrange.from == null)
                        yrange.from = yrange.axis.min;
                    if (yrange.to == null)
                        yrange.to = yrange.axis.max;

                    // clip
                    if (xrange.to < xrange.axis.min || xrange.from > xrange.axis.max ||
                        yrange.to < yrange.axis.min || yrange.from > yrange.axis.max)
                        continue;

                    xrange.from = Math.max(xrange.from, xrange.axis.min);
                    xrange.to = Math.min(xrange.to, xrange.axis.max);
                    yrange.from = Math.max(yrange.from, yrange.axis.min);
                    yrange.to = Math.min(yrange.to, yrange.axis.max);

                    var xequal = xrange.from === xrange.to,
                        yequal = yrange.from === yrange.to;

                    if (xequal && yequal) {
                        continue;
                    }

                    // then draw
                    xrange.from = Math.floor(xrange.axis.p2c(xrange.from));
                    xrange.to = Math.floor(xrange.axis.p2c(xrange.to));
                    yrange.from = Math.floor(yrange.axis.p2c(yrange.from));
                    yrange.to = Math.floor(yrange.axis.p2c(yrange.to));

                    if (xequal || yequal) {
                        var lineWidth = m.lineWidth || options.grid.markingsLineWidth,
                            subPixel = lineWidth % 2 ? 0.5 : 0;
                        ctx.beginPath();
                        ctx.strokeStyle = m.color || options.grid.markingsColor;
                        ctx.lineWidth = lineWidth;
                        if (xequal) {
                            ctx.moveTo(xrange.to + subPixel, yrange.from);
                            ctx.lineTo(xrange.to + subPixel, yrange.to);
                        } else {
                            ctx.moveTo(xrange.from, yrange.to + subPixel);
                            ctx.lineTo(xrange.to, yrange.to + subPixel);                            
                        }
                        ctx.stroke();
                    } else {
                        ctx.fillStyle = m.color || options.grid.markingsColor;
                        ctx.fillRect(xrange.from, yrange.to,
                                     xrange.to - xrange.from,
                                     yrange.from - yrange.to);
                    }
                }
            }

            // draw the ticks
            axes = allAxes();
            bw = options.grid.borderWidth;

            for (var j = 0; j < axes.length; ++j) {
                var axis = axes[j], box = axis.box,
                    t = axis.tickLength, x, y, xoff, yoff;
                if (!axis.show || axis.ticks.length == 0)
                    continue;

                ctx.lineWidth = 1;

                // find the edges
                if (axis.direction == "x") {
                    x = 0;
                    if (t == "full")
                        y = (axis.position == "top" ? 0 : plotHeight);
                    else
                        y = box.top - plotOffset.top + (axis.position == "top" ? box.height : 0);
                }
                else {
                    y = 0;
                    if (t == "full")
                        x = (axis.position == "left" ? 0 : plotWidth);
                    else
                        x = box.left - plotOffset.left + (axis.position == "left" ? box.width : 0);
                }

                // draw tick bar
                if (!axis.innermost) {
                    ctx.strokeStyle = axis.options.color;
                    ctx.beginPath();
                    xoff = yoff = 0;
                    if (axis.direction == "x")
                        xoff = plotWidth + 1;
                    else
                        yoff = plotHeight + 1;

                    if (ctx.lineWidth == 1) {
                        if (axis.direction == "x") {
                            y = Math.floor(y) + 0.5;
                        } else {
                            x = Math.floor(x) + 0.5;
                        }
                    }

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + xoff, y + yoff);
                    ctx.stroke();
                }

                // draw ticks

                ctx.strokeStyle = axis.options.tickColor;

                ctx.beginPath();
                for (i = 0; i < axis.ticks.length; ++i) {
                    var v = axis.ticks[i].v;

                    xoff = yoff = 0;

                    if (isNaN(v) || v < axis.min || v > axis.max
                        // skip those lying on the axes if we got a border
                        || (t == "full"
                            && ((typeof bw == "object" && bw[axis.position] > 0) || bw > 0)
                            && (v == axis.min || v == axis.max)))
                        continue;

                    if (axis.direction == "x") {
                        x = axis.p2c(v);
                        yoff = t == "full" ? -plotHeight : t;

                        if (axis.position == "top")
                            yoff = -yoff;
                    }
                    else {
                        y = axis.p2c(v);
                        xoff = t == "full" ? -plotWidth : t;

                        if (axis.position == "left")
                            xoff = -xoff;
                    }

                    if (ctx.lineWidth == 1) {
                        if (axis.direction == "x")
                            x = Math.floor(x) + 0.5;
                        else
                            y = Math.floor(y) + 0.5;
                    }

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + xoff, y + yoff);
                }

                ctx.stroke();
            }


            // draw border
            if (bw) {
                // If either borderWidth or borderColor is an object, then draw the border
                // line by line instead of as one rectangle
                bc = options.grid.borderColor;
                if(typeof bw == "object" || typeof bc == "object") {
                    if (typeof bw !== "object") {
                        bw = {top: bw, right: bw, bottom: bw, left: bw};
                    }
                    if (typeof bc !== "object") {
                        bc = {top: bc, right: bc, bottom: bc, left: bc};
                    }

                    if (bw.top > 0) {
                        ctx.strokeStyle = bc.top;
                        ctx.lineWidth = bw.top;
                        ctx.beginPath();
                        ctx.moveTo(0 - bw.left, 0 - bw.top/2);
                        ctx.lineTo(plotWidth, 0 - bw.top/2);
                        ctx.stroke();
                    }

                    if (bw.right > 0) {
                        ctx.strokeStyle = bc.right;
                        ctx.lineWidth = bw.right;
                        ctx.beginPath();
                        ctx.moveTo(plotWidth + bw.right / 2, 0 - bw.top);
                        ctx.lineTo(plotWidth + bw.right / 2, plotHeight);
                        ctx.stroke();
                    }

                    if (bw.bottom > 0) {
                        ctx.strokeStyle = bc.bottom;
                        ctx.lineWidth = bw.bottom;
                        ctx.beginPath();
                        ctx.moveTo(plotWidth + bw.right, plotHeight + bw.bottom / 2);
                        ctx.lineTo(0, plotHeight + bw.bottom / 2);
                        ctx.stroke();
                    }

                    if (bw.left > 0) {
                        ctx.strokeStyle = bc.left;
                        ctx.lineWidth = bw.left;
                        ctx.beginPath();
                        ctx.moveTo(0 - bw.left/2, plotHeight + bw.bottom);
                        ctx.lineTo(0- bw.left/2, 0);
                        ctx.stroke();
                    }
                }
                else {
                    ctx.lineWidth = bw;
                    ctx.strokeStyle = options.grid.borderColor;
                    ctx.strokeRect(-bw/2, -bw/2, plotWidth + bw, plotHeight + bw);
                }
            }

            ctx.restore();
        }

        function drawAxisLabels() {

            $.each(allAxes(), function (_, axis) {
                var box = axis.box,
                    legacyStyles = axis.direction + "Axis " + axis.direction + axis.n + "Axis",
                    layer = "flot-" + axis.direction + "-axis flot-" + axis.direction + axis.n + "-axis " + legacyStyles,
                    font = axis.options.font || "flot-tick-label tickLabel",
                    tick, x, y, halign, valign;

                // Remove text before checking for axis.show and ticks.length;
                // otherwise plugins, like flot-tickrotor, that draw their own
                // tick labels will end up with both theirs and the defaults.

                surface.removeText(layer);

                if (!axis.show || axis.ticks.length == 0)
                    return;

                for (var i = 0; i < axis.ticks.length; ++i) {

                    tick = axis.ticks[i];
                    if (!tick.label || tick.v < axis.min || tick.v > axis.max)
                        continue;

                    if (axis.direction == "x") {
                        halign = "center";
                        x = plotOffset.left + axis.p2c(tick.v);
                        if (axis.position == "bottom") {
                            y = box.top + box.padding;
                        } else {
                            y = box.top + box.height - box.padding;
                            valign = "bottom";
                        }
                    } else {
                        valign = "middle";
                        y = plotOffset.top + axis.p2c(tick.v);
                        if (axis.position == "left") {
                            x = box.left + box.width - box.padding;
                            halign = "right";
                        } else {
                            x = box.left + box.padding;
                        }
                    }

                    surface.addText(layer, x, y, tick.label, font, null, null, halign, valign);
                }
            });
        }

        function drawSeries(series) {
            if (series.lines.show)
                drawSeriesLines(series);
            if (series.bars.show)
                drawSeriesBars(series);
            if (series.points.show)
                drawSeriesPoints(series);
        }

        function drawSeriesLines(series) {
            function plotLine(datapoints, xoffset, yoffset, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    prevx = null, prevy = null;

                ctx.beginPath();
                for (var i = ps; i < points.length; i += ps) {
                    var x1 = points[i - ps], y1 = points[i - ps + 1],
                        x2 = points[i], y2 = points[i + 1];

                    if (x1 == null || x2 == null)
                        continue;

                    // clip with ymin
                    if (y1 <= y2 && y1 < axisy.min) {
                        if (y2 < axisy.min)
                            continue;   // line segment is outside
                        // compute new intersection point
                        x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.min;
                    }
                    else if (y2 <= y1 && y2 < axisy.min) {
                        if (y1 < axisy.min)
                            continue;
                        x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.min;
                    }

                    // clip with ymax
                    if (y1 >= y2 && y1 > axisy.max) {
                        if (y2 > axisy.max)
                            continue;
                        x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.max;
                    }
                    else if (y2 >= y1 && y2 > axisy.max) {
                        if (y1 > axisy.max)
                            continue;
                        x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.max;
                    }

                    // clip with xmin
                    if (x1 <= x2 && x1 < axisx.min) {
                        if (x2 < axisx.min)
                            continue;
                        y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.min;
                    }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue;
                        y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.min;
                    }

                    // clip with xmax
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue;
                        y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.max;
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue;
                        y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.max;
                    }

                    if (x1 != prevx || y1 != prevy)
                        ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset);

                    prevx = x2;
                    prevy = y2;
                    ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset);
                }
                ctx.stroke();
            }

            function plotLineArea(datapoints, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    bottom = Math.min(Math.max(0, axisy.min), axisy.max),
                    i = 0, top, areaOpen = false,
                    ypos = 1, segmentStart = 0, segmentEnd = 0;

                // we process each segment in two turns, first forward
                // direction to sketch out top, then once we hit the
                // end we go backwards to sketch the bottom
                while (true) {
                    if (ps > 0 && i > points.length + ps)
                        break;

                    i += ps; // ps is negative if going backwards

                    var x1 = points[i - ps],
                        y1 = points[i - ps + ypos],
                        x2 = points[i], y2 = points[i + ypos];

                    if (areaOpen) {
                        if (ps > 0 && x1 != null && x2 == null) {
                            // at turning point
                            segmentEnd = i;
                            ps = -ps;
                            ypos = 2;
                            continue;
                        }

                        if (ps < 0 && i == segmentStart + ps) {
                            // done with the reverse sweep
                            ctx.fill();
                            areaOpen = false;
                            ps = -ps;
                            ypos = 1;
                            i = segmentStart = segmentEnd + ps;
                            continue;
                        }
                    }

                    if (x1 == null || x2 == null)
                        continue;

                    // clip x values

                    // clip with xmin
                    if (x1 <= x2 && x1 < axisx.min) {
                        if (x2 < axisx.min)
                            continue;
                        y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.min;
                    }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue;
                        y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.min;
                    }

                    // clip with xmax
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue;
                        y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.max;
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue;
                        y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.max;
                    }

                    if (!areaOpen) {
                        // open area
                        ctx.beginPath();
                        ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom));
                        areaOpen = true;
                    }

                    // now first check the case where both is outside
                    if (y1 >= axisy.max && y2 >= axisy.max) {
                        ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max));
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max));
                        continue;
                    }
                    else if (y1 <= axisy.min && y2 <= axisy.min) {
                        ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min));
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min));
                        continue;
                    }

                    // else it's a bit more complicated, there might
                    // be a flat maxed out rectangle first, then a
                    // triangular cutout or reverse; to find these
                    // keep track of the current x values
                    var x1old = x1, x2old = x2;

                    // clip the y values, without shortcutting, we
                    // go through all cases in turn

                    // clip with ymin
                    if (y1 <= y2 && y1 < axisy.min && y2 >= axisy.min) {
                        x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.min;
                    }
                    else if (y2 <= y1 && y2 < axisy.min && y1 >= axisy.min) {
                        x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.min;
                    }

                    // clip with ymax
                    if (y1 >= y2 && y1 > axisy.max && y2 <= axisy.max) {
                        x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.max;
                    }
                    else if (y2 >= y1 && y2 > axisy.max && y1 <= axisy.max) {
                        x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.max;
                    }

                    // if the x value was changed we got a rectangle
                    // to fill
                    if (x1 != x1old) {
                        ctx.lineTo(axisx.p2c(x1old), axisy.p2c(y1));
                        // it goes to (x1, y1), but we fill that below
                    }

                    // fill triangular section, this sometimes result
                    // in redundant points if (x1, y1) hasn't changed
                    // from previous line to, but we just ignore that
                    ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1));
                    ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));

                    // fill the other rectangle if it's there
                    if (x2 != x2old) {
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));
                        ctx.lineTo(axisx.p2c(x2old), axisy.p2c(y2));
                    }
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            ctx.lineJoin = "round";

            var lw = series.lines.lineWidth,
                sw = series.shadowSize;
            // FIXME: consider another form of shadow when filling is turned on
            if (lw > 0 && sw > 0) {
                // draw shadow as a thick and thin line with transparency
                ctx.lineWidth = sw;
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                // position shadow at angle from the mid of line
                var angle = Math.PI/18;
                plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/2), Math.cos(angle) * (lw/2 + sw/2), series.xaxis, series.yaxis);
                ctx.lineWidth = sw/2;
                plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/4), Math.cos(angle) * (lw/2 + sw/4), series.xaxis, series.yaxis);
            }

            ctx.lineWidth = lw;
            ctx.strokeStyle = series.color;
            var fillStyle = getFillStyle(series.lines, series.color, 0, plotHeight);
            if (fillStyle) {
                ctx.fillStyle = fillStyle;
                plotLineArea(series.datapoints, series.xaxis, series.yaxis);
            }

            if (lw > 0)
                plotLine(series.datapoints, 0, 0, series.xaxis, series.yaxis);
            ctx.restore();
        }

        function drawSeriesPoints(series) {
            function plotPoints(datapoints, radius, fillStyle, offset, shadow, axisx, axisy, symbol) {
                var points = datapoints.points, ps = datapoints.pointsize;

                for (var i = 0; i < points.length; i += ps) {
                    var x = points[i], y = points[i + 1];
                    if (x == null || x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                        continue;

                    ctx.beginPath();
                    x = axisx.p2c(x);
                    y = axisy.p2c(y) + offset;
                    if (symbol == "circle")
                        ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, false);
                    else
                        symbol(ctx, x, y, radius, shadow);
                    ctx.closePath();

                    if (fillStyle) {
                        ctx.fillStyle = fillStyle;
                        ctx.fill();
                    }
                    ctx.stroke();
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            var lw = series.points.lineWidth,
                sw = series.shadowSize,
                radius = series.points.radius,
                symbol = series.points.symbol;

            // If the user sets the line width to 0, we change it to a very 
            // small value. A line width of 0 seems to force the default of 1.
            // Doing the conditional here allows the shadow setting to still be 
            // optional even with a lineWidth of 0.

            if( lw == 0 )
                lw = 0.0001;

            if (lw > 0 && sw > 0) {
                // draw shadow in two steps
                var w = sw / 2;
                ctx.lineWidth = w;
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                plotPoints(series.datapoints, radius, null, w + w/2, true,
                           series.xaxis, series.yaxis, symbol);

                ctx.strokeStyle = "rgba(0,0,0,0.2)";
                plotPoints(series.datapoints, radius, null, w/2, true,
                           series.xaxis, series.yaxis, symbol);
            }

            ctx.lineWidth = lw;
            ctx.strokeStyle = series.color;
            plotPoints(series.datapoints, radius,
                       getFillStyle(series.points, series.color), 0, false,
                       series.xaxis, series.yaxis, symbol);
            ctx.restore();
        }

        function drawBar(x, y, b, barLeft, barRight, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth) {
            var left, right, bottom, top,
                drawLeft, drawRight, drawTop, drawBottom,
                tmp;

            // in horizontal mode, we start the bar from the left
            // instead of from the bottom so it appears to be
            // horizontal rather than vertical
            if (horizontal) {
                drawBottom = drawRight = drawTop = true;
                drawLeft = false;
                left = b;
                right = x;
                top = y + barLeft;
                bottom = y + barRight;

                // account for negative bars
                if (right < left) {
                    tmp = right;
                    right = left;
                    left = tmp;
                    drawLeft = true;
                    drawRight = false;
                }
            }
            else {
                drawLeft = drawRight = drawTop = true;
                drawBottom = false;
                left = x + barLeft;
                right = x + barRight;
                bottom = b;
                top = y;

                // account for negative bars
                if (top < bottom) {
                    tmp = top;
                    top = bottom;
                    bottom = tmp;
                    drawBottom = true;
                    drawTop = false;
                }
            }

            // clip
            if (right < axisx.min || left > axisx.max ||
                top < axisy.min || bottom > axisy.max)
                return;

            if (left < axisx.min) {
                left = axisx.min;
                drawLeft = false;
            }

            if (right > axisx.max) {
                right = axisx.max;
                drawRight = false;
            }

            if (bottom < axisy.min) {
                bottom = axisy.min;
                drawBottom = false;
            }

            if (top > axisy.max) {
                top = axisy.max;
                drawTop = false;
            }

            left = axisx.p2c(left);
            bottom = axisy.p2c(bottom);
            right = axisx.p2c(right);
            top = axisy.p2c(top);

            // fill the bar
            if (fillStyleCallback) {
                c.fillStyle = fillStyleCallback(bottom, top);
                c.fillRect(left, top, right - left, bottom - top)
            }

            // draw outline
            if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
                c.beginPath();

                // FIXME: inline moveTo is buggy with excanvas
                c.moveTo(left, bottom);
                if (drawLeft)
                    c.lineTo(left, top);
                else
                    c.moveTo(left, top);
                if (drawTop)
                    c.lineTo(right, top);
                else
                    c.moveTo(right, top);
                if (drawRight)
                    c.lineTo(right, bottom);
                else
                    c.moveTo(right, bottom);
                if (drawBottom)
                    c.lineTo(left, bottom);
                else
                    c.moveTo(left, bottom);
                c.stroke();
            }
        }

        function drawSeriesBars(series) {
            function plotBars(datapoints, barLeft, barRight, fillStyleCallback, axisx, axisy) {
                var points = datapoints.points, ps = datapoints.pointsize;

                for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null)
                        continue;
                    drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth);
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            // FIXME: figure out a way to add shadows (for instance along the right edge)
            ctx.lineWidth = series.bars.lineWidth;
            ctx.strokeStyle = series.color;

            var barLeft;

            switch (series.bars.align) {
                case "left":
                    barLeft = 0;
                    break;
                case "right":
                    barLeft = -series.bars.barWidth;
                    break;
                default:
                    barLeft = -series.bars.barWidth / 2;
            }

            var fillStyleCallback = series.bars.fill ? function (bottom, top) { return getFillStyle(series.bars, series.color, bottom, top); } : null;
            plotBars(series.datapoints, barLeft, barLeft + series.bars.barWidth, fillStyleCallback, series.xaxis, series.yaxis);
            ctx.restore();
        }

        function getFillStyle(filloptions, seriesColor, bottom, top) {
            var fill = filloptions.fill;
            if (!fill)
                return null;

            if (filloptions.fillColor)
                return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor);

            var c = $.color.parse(seriesColor);
            c.a = typeof fill == "number" ? fill : 0.4;
            c.normalize();
            return c.toString();
        }

        function insertLegend() {

            if (options.legend.container != null) {
                $(options.legend.container).html("");
            } else {
                placeholder.find(".legend").remove();
            }

            if (!options.legend.show) {
                return;
            }

            var fragments = [], entries = [], rowStarted = false,
                lf = options.legend.labelFormatter, s, label;

            // Build a list of legend entries, with each having a label and a color

            for (var i = 0; i < series.length; ++i) {
                s = series[i];
                if (s.label) {
                    label = lf ? lf(s.label, s) : s.label;
                    if (label) {
                        entries.push({
                            label: label,
                            color: s.color
                        });
                    }
                }
            }

            // Sort the legend using either the default or a custom comparator

            if (options.legend.sorted) {
                if ($.isFunction(options.legend.sorted)) {
                    entries.sort(options.legend.sorted);
                } else if (options.legend.sorted == "reverse") {
                	entries.reverse();
                } else {
                    var ascending = options.legend.sorted != "descending";
                    entries.sort(function(a, b) {
                        return a.label == b.label ? 0 : (
                            (a.label < b.label) != ascending ? 1 : -1   // Logical XOR
                        );
                    });
                }
            }

            // Generate markup for the list of entries, in their final order

            for (var i = 0; i < entries.length; ++i) {

                var entry = entries[i];

                if (i % options.legend.noColumns == 0) {
                    if (rowStarted)
                        fragments.push('</tr>');
                    fragments.push('<tr>');
                    rowStarted = true;
                }

                fragments.push(
                    '<td class="legendColorBox"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + entry.color + ';overflow:hidden"></div></div></td>' +
                    '<td class="legendLabel">' + entry.label + '</td>'
                );
            }

            if (rowStarted)
                fragments.push('</tr>');

            if (fragments.length == 0)
                return;

            var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';
            if (options.legend.container != null)
                $(options.legend.container).html(table);
            else {
                var pos = "",
                    p = options.legend.position,
                    m = options.legend.margin;
                if (m[0] == null)
                    m = [m, m];
                if (p.charAt(0) == "n")
                    pos += 'top:' + (m[1] + plotOffset.top) + 'px;';
                else if (p.charAt(0) == "s")
                    pos += 'bottom:' + (m[1] + plotOffset.bottom) + 'px;';
                if (p.charAt(1) == "e")
                    pos += 'right:' + (m[0] + plotOffset.right) + 'px;';
                else if (p.charAt(1) == "w")
                    pos += 'left:' + (m[0] + plotOffset.left) + 'px;';
                var legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos +';') + '</div>').appendTo(placeholder);
                if (options.legend.backgroundOpacity != 0.0) {
                    // put in the transparent background
                    // separately to avoid blended labels and
                    // label boxes
                    var c = options.legend.backgroundColor;
                    if (c == null) {
                        c = options.grid.backgroundColor;
                        if (c && typeof c == "string")
                            c = $.color.parse(c);
                        else
                            c = $.color.extract(legend, 'background-color');
                        c.a = 1;
                        c = c.toString();
                    }
                    var div = legend.children();
                    $('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos +'background-color:' + c + ';"> </div>').prependTo(legend).css('opacity', options.legend.backgroundOpacity);
                }
            }
        }


        // interactive features

        var highlights = [],
            redrawTimeout = null;

        // returns the data item the mouse is over, or null if none is found
        function findNearbyItem(mouseX, mouseY, seriesFilter) {
            var maxDistance = options.grid.mouseActiveRadius,
                smallestDistance = maxDistance * maxDistance + 1,
                item = null, foundPoint = false, i, j, ps;

            for (i = series.length - 1; i >= 0; --i) {
                if (!seriesFilter(series[i]))
                    continue;

                var s = series[i],
                    axisx = s.xaxis,
                    axisy = s.yaxis,
                    points = s.datapoints.points,
                    mx = axisx.c2p(mouseX), // precompute some stuff to make the loop faster
                    my = axisy.c2p(mouseY),
                    maxx = maxDistance / axisx.scale,
                    maxy = maxDistance / axisy.scale;

                ps = s.datapoints.pointsize;
                // with inverse transforms, we can't use the maxx/maxy
                // optimization, sadly
                if (axisx.options.inverseTransform)
                    maxx = Number.MAX_VALUE;
                if (axisy.options.inverseTransform)
                    maxy = Number.MAX_VALUE;

                if (s.lines.show || s.points.show) {
                    for (j = 0; j < points.length; j += ps) {
                        var x = points[j], y = points[j + 1];
                        if (x == null)
                            continue;

                        // For points and lines, the cursor must be within a
                        // certain distance to the data point
                        if (x - mx > maxx || x - mx < -maxx ||
                            y - my > maxy || y - my < -maxy)
                            continue;

                        // We have to calculate distances in pixels, not in
                        // data units, because the scales of the axes may be different
                        var dx = Math.abs(axisx.p2c(x) - mouseX),
                            dy = Math.abs(axisy.p2c(y) - mouseY),
                            dist = dx * dx + dy * dy; // we save the sqrt

                        // use <= to ensure last point takes precedence
                        // (last generally means on top of)
                        if (dist < smallestDistance) {
                            smallestDistance = dist;
                            item = [i, j / ps];
                        }
                    }
                }

                if (s.bars.show && !item) { // no other point can be nearby

                    var barLeft, barRight;

                    switch (s.bars.align) {
                        case "left":
                            barLeft = 0;
                            break;
                        case "right":
                            barLeft = -s.bars.barWidth;
                            break;
                        default:
                            barLeft = -s.bars.barWidth / 2;
                    }

                    barRight = barLeft + s.bars.barWidth;

                    for (j = 0; j < points.length; j += ps) {
                        var x = points[j], y = points[j + 1], b = points[j + 2];
                        if (x == null)
                            continue;

                        // for a bar graph, the cursor must be inside the bar
                        if (series[i].bars.horizontal ?
                            (mx <= Math.max(b, x) && mx >= Math.min(b, x) &&
                             my >= y + barLeft && my <= y + barRight) :
                            (mx >= x + barLeft && mx <= x + barRight &&
                             my >= Math.min(b, y) && my <= Math.max(b, y)))
                                item = [i, j / ps];
                    }
                }
            }

            if (item) {
                i = item[0];
                j = item[1];
                ps = series[i].datapoints.pointsize;

                return { datapoint: series[i].datapoints.points.slice(j * ps, (j + 1) * ps),
                         dataIndex: j,
                         series: series[i],
                         seriesIndex: i };
            }

            return null;
        }

        function onMouseMove(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e,
                                       function (s) { return s["hoverable"] != false; });
        }

        function onMouseLeave(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e,
                                       function (s) { return false; });
        }

        function onClick(e) {
            triggerClickHoverEvent("plotclick", e,
                                   function (s) { return s["clickable"] != false; });
        }

        // trigger click or hover event (they send the same parameters
        // so we share their code)
        function triggerClickHoverEvent(eventname, event, seriesFilter) {
            var offset = eventHolder.offset(),
                canvasX = event.pageX - offset.left - plotOffset.left,
                canvasY = event.pageY - offset.top - plotOffset.top,
            pos = canvasToAxisCoords({ left: canvasX, top: canvasY });

            pos.pageX = event.pageX;
            pos.pageY = event.pageY;

            var item = findNearbyItem(canvasX, canvasY, seriesFilter);

            if (item) {
                // fill in mouse pos for any listeners out there
                item.pageX = parseInt(item.series.xaxis.p2c(item.datapoint[0]) + offset.left + plotOffset.left, 10);
                item.pageY = parseInt(item.series.yaxis.p2c(item.datapoint[1]) + offset.top + plotOffset.top, 10);
            }

            if (options.grid.autoHighlight) {
                // clear auto-highlights
                for (var i = 0; i < highlights.length; ++i) {
                    var h = highlights[i];
                    if (h.auto == eventname &&
                        !(item && h.series == item.series &&
                          h.point[0] == item.datapoint[0] &&
                          h.point[1] == item.datapoint[1]))
                        unhighlight(h.series, h.point);
                }

                if (item)
                    highlight(item.series, item.datapoint, eventname);
            }

            placeholder.trigger(eventname, [ pos, item ]);
        }

        function triggerRedrawOverlay() {
            var t = options.interaction.redrawOverlayInterval;
            if (t == -1) {      // skip event queue
                drawOverlay();
                return;
            }

            if (!redrawTimeout)
                redrawTimeout = setTimeout(drawOverlay, t);
        }

        function drawOverlay() {
            redrawTimeout = null;

            // draw highlights
            octx.save();
            overlay.clear();
            octx.translate(plotOffset.left, plotOffset.top);

            var i, hi;
            for (i = 0; i < highlights.length; ++i) {
                hi = highlights[i];

                if (hi.series.bars.show)
                    drawBarHighlight(hi.series, hi.point);
                else
                    drawPointHighlight(hi.series, hi.point);
            }
            octx.restore();

            executeHooks(hooks.drawOverlay, [octx]);
        }

        function highlight(s, point, auto) {
            if (typeof s == "number")
                s = series[s];

            if (typeof point == "number") {
                var ps = s.datapoints.pointsize;
                point = s.datapoints.points.slice(ps * point, ps * (point + 1));
            }

            var i = indexOfHighlight(s, point);
            if (i == -1) {
                highlights.push({ series: s, point: point, auto: auto });

                triggerRedrawOverlay();
            }
            else if (!auto)
                highlights[i].auto = false;
        }

        function unhighlight(s, point) {
            if (s == null && point == null) {
                highlights = [];
                triggerRedrawOverlay();
                return;
            }

            if (typeof s == "number")
                s = series[s];

            if (typeof point == "number") {
                var ps = s.datapoints.pointsize;
                point = s.datapoints.points.slice(ps * point, ps * (point + 1));
            }

            var i = indexOfHighlight(s, point);
            if (i != -1) {
                highlights.splice(i, 1);

                triggerRedrawOverlay();
            }
        }

        function indexOfHighlight(s, p) {
            for (var i = 0; i < highlights.length; ++i) {
                var h = highlights[i];
                if (h.series == s && h.point[0] == p[0]
                    && h.point[1] == p[1])
                    return i;
            }
            return -1;
        }

        function drawPointHighlight(series, point) {
            var x = point[0], y = point[1],
                axisx = series.xaxis, axisy = series.yaxis,
                highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString();

            if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                return;

            var pointRadius = series.points.radius + series.points.lineWidth / 2;
            octx.lineWidth = pointRadius;
            octx.strokeStyle = highlightColor;
            var radius = 1.5 * pointRadius;
            x = axisx.p2c(x);
            y = axisy.p2c(y);

            octx.beginPath();
            if (series.points.symbol == "circle")
                octx.arc(x, y, radius, 0, 2 * Math.PI, false);
            else
                series.points.symbol(octx, x, y, radius, false);
            octx.closePath();
            octx.stroke();
        }

        function drawBarHighlight(series, point) {
            var highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString(),
                fillStyle = highlightColor,
                barLeft;

            switch (series.bars.align) {
                case "left":
                    barLeft = 0;
                    break;
                case "right":
                    barLeft = -series.bars.barWidth;
                    break;
                default:
                    barLeft = -series.bars.barWidth / 2;
            }

            octx.lineWidth = series.bars.lineWidth;
            octx.strokeStyle = highlightColor;

            drawBar(point[0], point[1], point[2] || 0, barLeft, barLeft + series.bars.barWidth,
                    function () { return fillStyle; }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth);
        }

        function getColorOrGradient(spec, bottom, top, defaultColor) {
            if (typeof spec == "string")
                return spec;
            else {
                // assume this is a gradient spec; IE currently only
                // supports a simple vertical gradient properly, so that's
                // what we support too
                var gradient = ctx.createLinearGradient(0, top, 0, bottom);

                for (var i = 0, l = spec.colors.length; i < l; ++i) {
                    var c = spec.colors[i];
                    if (typeof c != "string") {
                        var co = $.color.parse(defaultColor);
                        if (c.brightness != null)
                            co = co.scale('rgb', c.brightness);
                        if (c.opacity != null)
                            co.a *= c.opacity;
                        c = co.toString();
                    }
                    gradient.addColorStop(i / (l - 1), c);
                }

                return gradient;
            }
        }
    }

    // Add the plot function to the top level of the jQuery object

    $.plot = function(placeholder, data, options) {
        //var t0 = new Date();
        var plot = new Plot($(placeholder), data, options, $.plot.plugins);
        //(window.console ? console.log : alert)("time used (msecs): " + ((new Date()).getTime() - t0.getTime()));
        return plot;
    };

    $.plot.version = "0.8.3";

    $.plot.plugins = [];

    // Also add the plot function as a chainable property

    $.fn.plot = function(data, options) {
        return this.each(function() {
            $.plot(this, data, options);
        });
    };

    // round to nearby lower multiple of base
    function floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

})(jQuery);

/* Flot plugin for rendering pie charts.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin assumes that each series has a single data value, and that each
value is a positive integer or zero.  Negative numbers don't make sense for a
pie chart, and have unpredictable results.  The values do NOT need to be
passed in as percentages; the plugin will calculate the total and per-slice
percentages internally.

* Created by Brian Medendorp

* Updated with contributions from btburnett3, Anthony Aragues and Xavi Ivars

The plugin supports these options:

	series: {
		pie: {
			show: true/false
			radius: 0-1 for percentage of fullsize, or a specified pixel length, or 'auto'
			innerRadius: 0-1 for percentage of fullsize or a specified pixel length, for creating a donut effect
			startAngle: 0-2 factor of PI used for starting angle (in radians) i.e 3/2 starts at the top, 0 and 2 have the same result
			tilt: 0-1 for percentage to tilt the pie, where 1 is no tilt, and 0 is completely flat (nothing will show)
			offset: {
				top: integer value to move the pie up or down
				left: integer value to move the pie left or right, or 'auto'
			},
			stroke: {
				color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#FFF')
				width: integer pixel width of the stroke
			},
			label: {
				show: true/false, or 'auto'
				formatter:  a user-defined function that modifies the text/style of the label text
				radius: 0-1 for percentage of fullsize, or a specified pixel length
				background: {
					color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#000')
					opacity: 0-1
				},
				threshold: 0-1 for the percentage value at which to hide labels (if they're too small)
			},
			combine: {
				threshold: 0-1 for the percentage value at which to combine slices (if they're too small)
				color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#CCC'), if null, the plugin will automatically use the color of the first slice to be combined
				label: any text value of what the combined slice should be labeled
			}
			highlight: {
				opacity: 0-1
			}
		}
	}

More detail and specific examples can be found in the included HTML file.

*/

(function($) {

	// Maximum redraw attempts when fitting labels within the plot

	var REDRAW_ATTEMPTS = 10;

	// Factor by which to shrink the pie when fitting labels within the plot

	var REDRAW_SHRINK = 0.95;

	function init(plot) {

		var canvas = null,
			target = null,
			options = null,
			maxRadius = null,
			centerLeft = null,
			centerTop = null,
			processed = false,
			ctx = null;

		// interactive variables

		var highlights = [];

		// add hook to determine if pie plugin in enabled, and then perform necessary operations

		plot.hooks.processOptions.push(function(plot, options) {
			if (options.series.pie.show) {

				options.grid.show = false;

				// set labels.show

				if (options.series.pie.label.show == "auto") {
					if (options.legend.show) {
						options.series.pie.label.show = false;
					} else {
						options.series.pie.label.show = true;
					}
				}

				// set radius

				if (options.series.pie.radius == "auto") {
					if (options.series.pie.label.show) {
						options.series.pie.radius = 3/4;
					} else {
						options.series.pie.radius = 1;
					}
				}

				// ensure sane tilt

				if (options.series.pie.tilt > 1) {
					options.series.pie.tilt = 1;
				} else if (options.series.pie.tilt < 0) {
					options.series.pie.tilt = 0;
				}
			}
		});

		plot.hooks.bindEvents.push(function(plot, eventHolder) {
			var options = plot.getOptions();
			if (options.series.pie.show) {
				if (options.grid.hoverable) {
					eventHolder.unbind("mousemove").mousemove(onMouseMove);
				}
				if (options.grid.clickable) {
					eventHolder.unbind("click").click(onClick);
				}
			}
		});

		plot.hooks.processDatapoints.push(function(plot, series, data, datapoints) {
			var options = plot.getOptions();
			if (options.series.pie.show) {
				processDatapoints(plot, series, data, datapoints);
			}
		});

		plot.hooks.drawOverlay.push(function(plot, octx) {
			var options = plot.getOptions();
			if (options.series.pie.show) {
				drawOverlay(plot, octx);
			}
		});

		plot.hooks.draw.push(function(plot, newCtx) {
			var options = plot.getOptions();
			if (options.series.pie.show) {
				draw(plot, newCtx);
			}
		});

		function processDatapoints(plot, series, datapoints) {
			if (!processed)	{
				processed = true;
				canvas = plot.getCanvas();
				target = $(canvas).parent();
				options = plot.getOptions();
				plot.setData(combine(plot.getData()));
			}
		}

		function combine(data) {

			var total = 0,
				combined = 0,
				numCombined = 0,
				color = options.series.pie.combine.color,
				newdata = [];

			// Fix up the raw data from Flot, ensuring the data is numeric

			for (var i = 0; i < data.length; ++i) {

				var value = data[i].data;

				// If the data is an array, we'll assume that it's a standard
				// Flot x-y pair, and are concerned only with the second value.

				// Note how we use the original array, rather than creating a
				// new one; this is more efficient and preserves any extra data
				// that the user may have stored in higher indexes.

				if ($.isArray(value) && value.length == 1) {
    				value = value[0];
				}

				if ($.isArray(value)) {
					// Equivalent to $.isNumeric() but compatible with jQuery < 1.7
					if (!isNaN(parseFloat(value[1])) && isFinite(value[1])) {
						value[1] = +value[1];
					} else {
						value[1] = 0;
					}
				} else if (!isNaN(parseFloat(value)) && isFinite(value)) {
					value = [1, +value];
				} else {
					value = [1, 0];
				}

				data[i].data = [value];
			}

			// Sum up all the slices, so we can calculate percentages for each

			for (var i = 0; i < data.length; ++i) {
				total += data[i].data[0][1];
			}

			// Count the number of slices with percentages below the combine
			// threshold; if it turns out to be just one, we won't combine.

			for (var i = 0; i < data.length; ++i) {
				var value = data[i].data[0][1];
				if (value / total <= options.series.pie.combine.threshold) {
					combined += value;
					numCombined++;
					if (!color) {
						color = data[i].color;
					}
				}
			}

			for (var i = 0; i < data.length; ++i) {
				var value = data[i].data[0][1];
				if (numCombined < 2 || value / total > options.series.pie.combine.threshold) {
					newdata.push(
						$.extend(data[i], {     /* extend to allow keeping all other original data values
						                           and using them e.g. in labelFormatter. */
							data: [[1, value]],
							color: data[i].color,
							label: data[i].label,
							angle: value * Math.PI * 2 / total,
							percent: value / (total / 100)
						})
					);
				}
			}

			if (numCombined > 1) {
				newdata.push({
					data: [[1, combined]],
					color: color,
					label: options.series.pie.combine.label,
					angle: combined * Math.PI * 2 / total,
					percent: combined / (total / 100)
				});
			}

			return newdata;
		}

		function draw(plot, newCtx) {

			if (!target) {
				return; // if no series were passed
			}

			var canvasWidth = plot.getPlaceholder().width(),
				canvasHeight = plot.getPlaceholder().height(),
				legendWidth = target.children().filter(".legend").children().width() || 0;

			ctx = newCtx;

			// WARNING: HACK! REWRITE THIS CODE AS SOON AS POSSIBLE!

			// When combining smaller slices into an 'other' slice, we need to
			// add a new series.  Since Flot gives plugins no way to modify the
			// list of series, the pie plugin uses a hack where the first call
			// to processDatapoints results in a call to setData with the new
			// list of series, then subsequent processDatapoints do nothing.

			// The plugin-global 'processed' flag is used to control this hack;
			// it starts out false, and is set to true after the first call to
			// processDatapoints.

			// Unfortunately this turns future setData calls into no-ops; they
			// call processDatapoints, the flag is true, and nothing happens.

			// To fix this we'll set the flag back to false here in draw, when
			// all series have been processed, so the next sequence of calls to
			// processDatapoints once again starts out with a slice-combine.
			// This is really a hack; in 0.9 we need to give plugins a proper
			// way to modify series before any processing begins.

			processed = false;

			// calculate maximum radius and center point

			maxRadius =  Math.min(canvasWidth, canvasHeight / options.series.pie.tilt) / 2;
			centerTop = canvasHeight / 2 + options.series.pie.offset.top;
			centerLeft = canvasWidth / 2;

			if (options.series.pie.offset.left == "auto") {
				if (options.legend.position.match("w")) {
					centerLeft += legendWidth / 2;
				} else {
					centerLeft -= legendWidth / 2;
				}
				if (centerLeft < maxRadius) {
					centerLeft = maxRadius;
				} else if (centerLeft > canvasWidth - maxRadius) {
					centerLeft = canvasWidth - maxRadius;
				}
			} else {
				centerLeft += options.series.pie.offset.left;
			}

			var slices = plot.getData(),
				attempts = 0;

			// Keep shrinking the pie's radius until drawPie returns true,
			// indicating that all the labels fit, or we try too many times.

			do {
				if (attempts > 0) {
					maxRadius *= REDRAW_SHRINK;
				}
				attempts += 1;
				clear();
				if (options.series.pie.tilt <= 0.8) {
					drawShadow();
				}
			} while (!drawPie() && attempts < REDRAW_ATTEMPTS)

			if (attempts >= REDRAW_ATTEMPTS) {
				clear();
				target.prepend("<div class='error'>Could not draw pie with labels contained inside canvas</div>");
			}

			if (plot.setSeries && plot.insertLegend) {
				plot.setSeries(slices);
				plot.insertLegend();
			}

			// we're actually done at this point, just defining internal functions at this point

			function clear() {
				ctx.clearRect(0, 0, canvasWidth, canvasHeight);
				target.children().filter(".pieLabel, .pieLabelBackground").remove();
			}

			function drawShadow() {

				var shadowLeft = options.series.pie.shadow.left;
				var shadowTop = options.series.pie.shadow.top;
				var edge = 10;
				var alpha = options.series.pie.shadow.alpha;
				var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;

				if (radius >= canvasWidth / 2 - shadowLeft || radius * options.series.pie.tilt >= canvasHeight / 2 - shadowTop || radius <= edge) {
					return;	// shadow would be outside canvas, so don't draw it
				}

				ctx.save();
				ctx.translate(shadowLeft,shadowTop);
				ctx.globalAlpha = alpha;
				ctx.fillStyle = "#000";

				// center and rotate to starting position

				ctx.translate(centerLeft,centerTop);
				ctx.scale(1, options.series.pie.tilt);

				//radius -= edge;

				for (var i = 1; i <= edge; i++) {
					ctx.beginPath();
					ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
					ctx.fill();
					radius -= i;
				}

				ctx.restore();
			}

			function drawPie() {

				var startAngle = Math.PI * options.series.pie.startAngle;
				var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;

				// center and rotate to starting position

				ctx.save();
				ctx.translate(centerLeft,centerTop);
				ctx.scale(1, options.series.pie.tilt);
				//ctx.rotate(startAngle); // start at top; -- This doesn't work properly in Opera

				// draw slices

				ctx.save();
				var currentAngle = startAngle;
				for (var i = 0; i < slices.length; ++i) {
					slices[i].startAngle = currentAngle;
					drawSlice(slices[i].angle, slices[i].color, true);
				}
				ctx.restore();

				// draw slice outlines

				if (options.series.pie.stroke.width > 0) {
					ctx.save();
					ctx.lineWidth = options.series.pie.stroke.width;
					currentAngle = startAngle;
					for (var i = 0; i < slices.length; ++i) {
						drawSlice(slices[i].angle, options.series.pie.stroke.color, false);
					}
					ctx.restore();
				}

				// draw donut hole

				drawDonutHole(ctx);

				ctx.restore();

				// Draw the labels, returning true if they fit within the plot

				if (options.series.pie.label.show) {
					return drawLabels();
				} else return true;

				function drawSlice(angle, color, fill) {

					if (angle <= 0 || isNaN(angle)) {
						return;
					}

					if (fill) {
						ctx.fillStyle = color;
					} else {
						ctx.strokeStyle = color;
						ctx.lineJoin = "round";
					}

					ctx.beginPath();
					if (Math.abs(angle - Math.PI * 2) > 0.000000001) {
						ctx.moveTo(0, 0); // Center of the pie
					}

					//ctx.arc(0, 0, radius, 0, angle, false); // This doesn't work properly in Opera
					ctx.arc(0, 0, radius,currentAngle, currentAngle + angle / 2, false);
					ctx.arc(0, 0, radius,currentAngle + angle / 2, currentAngle + angle, false);
					ctx.closePath();
					//ctx.rotate(angle); // This doesn't work properly in Opera
					currentAngle += angle;

					if (fill) {
						ctx.fill();
					} else {
						ctx.stroke();
					}
				}

				function drawLabels() {

					var currentAngle = startAngle;
					var radius = options.series.pie.label.radius > 1 ? options.series.pie.label.radius : maxRadius * options.series.pie.label.radius;

					for (var i = 0; i < slices.length; ++i) {
						if (slices[i].percent >= options.series.pie.label.threshold * 100) {
							if (!drawLabel(slices[i], currentAngle, i)) {
								return false;
							}
						}
						currentAngle += slices[i].angle;
					}

					return true;

					function drawLabel(slice, startAngle, index) {

						if (slice.data[0][1] == 0) {
							return true;
						}

						// format label text

						var lf = options.legend.labelFormatter, text, plf = options.series.pie.label.formatter;

						if (lf) {
							text = lf(slice.label, slice);
						} else {
							text = slice.label;
						}

						if (plf) {
							text = plf(text, slice);
						}

						var halfAngle = ((startAngle + slice.angle) + startAngle) / 2;
						var x = centerLeft + Math.round(Math.cos(halfAngle) * radius);
						var y = centerTop + Math.round(Math.sin(halfAngle) * radius) * options.series.pie.tilt;

						var html = "<span class='pieLabel' id='pieLabel" + index + "' style='position:absolute;top:" + y + "px;left:" + x + "px;'>" + text + "</span>";
						target.append(html);

						var label = target.children("#pieLabel" + index);
						var labelTop = (y - label.height() / 2);
						var labelLeft = (x - label.width() / 2);

						label.css("top", labelTop);
						label.css("left", labelLeft);

						// check to make sure that the label is not outside the canvas

						if (0 - labelTop > 0 || 0 - labelLeft > 0 || canvasHeight - (labelTop + label.height()) < 0 || canvasWidth - (labelLeft + label.width()) < 0) {
							return false;
						}

						if (options.series.pie.label.background.opacity != 0) {

							// put in the transparent background separately to avoid blended labels and label boxes

							var c = options.series.pie.label.background.color;

							if (c == null) {
								c = slice.color;
							}

							var pos = "top:" + labelTop + "px;left:" + labelLeft + "px;";
							$("<div class='pieLabelBackground' style='position:absolute;width:" + label.width() + "px;height:" + label.height() + "px;" + pos + "background-color:" + c + ";'></div>")
								.css("opacity", options.series.pie.label.background.opacity)
								.insertBefore(label);
						}

						return true;
					} // end individual label function
				} // end drawLabels function
			} // end drawPie function
		} // end draw function

		// Placed here because it needs to be accessed from multiple locations

		function drawDonutHole(layer) {
			if (options.series.pie.innerRadius > 0) {

				// subtract the center

				layer.save();
				var innerRadius = options.series.pie.innerRadius > 1 ? options.series.pie.innerRadius : maxRadius * options.series.pie.innerRadius;
				layer.globalCompositeOperation = "destination-out"; // this does not work with excanvas, but it will fall back to using the stroke color
				layer.beginPath();
				layer.fillStyle = options.series.pie.stroke.color;
				layer.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
				layer.fill();
				layer.closePath();
				layer.restore();

				// add inner stroke

				layer.save();
				layer.beginPath();
				layer.strokeStyle = options.series.pie.stroke.color;
				layer.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
				layer.stroke();
				layer.closePath();
				layer.restore();

				// TODO: add extra shadow inside hole (with a mask) if the pie is tilted.
			}
		}

		//-- Additional Interactive related functions --

		function isPointInPoly(poly, pt) {
			for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
				((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1]< poly[i][1]))
				&& (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
				&& (c = !c);
			return c;
		}

		function findNearbySlice(mouseX, mouseY) {

			var slices = plot.getData(),
				options = plot.getOptions(),
				radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius,
				x, y;

			for (var i = 0; i < slices.length; ++i) {

				var s = slices[i];

				if (s.pie.show) {

					ctx.save();
					ctx.beginPath();
					ctx.moveTo(0, 0); // Center of the pie
					//ctx.scale(1, options.series.pie.tilt);	// this actually seems to break everything when here.
					ctx.arc(0, 0, radius, s.startAngle, s.startAngle + s.angle / 2, false);
					ctx.arc(0, 0, radius, s.startAngle + s.angle / 2, s.startAngle + s.angle, false);
					ctx.closePath();
					x = mouseX - centerLeft;
					y = mouseY - centerTop;

					if (ctx.isPointInPath) {
						if (ctx.isPointInPath(mouseX - centerLeft, mouseY - centerTop)) {
							ctx.restore();
							return {
								datapoint: [s.percent, s.data],
								dataIndex: 0,
								series: s,
								seriesIndex: i
							};
						}
					} else {

						// excanvas for IE doesn;t support isPointInPath, this is a workaround.

						var p1X = radius * Math.cos(s.startAngle),
							p1Y = radius * Math.sin(s.startAngle),
							p2X = radius * Math.cos(s.startAngle + s.angle / 4),
							p2Y = radius * Math.sin(s.startAngle + s.angle / 4),
							p3X = radius * Math.cos(s.startAngle + s.angle / 2),
							p3Y = radius * Math.sin(s.startAngle + s.angle / 2),
							p4X = radius * Math.cos(s.startAngle + s.angle / 1.5),
							p4Y = radius * Math.sin(s.startAngle + s.angle / 1.5),
							p5X = radius * Math.cos(s.startAngle + s.angle),
							p5Y = radius * Math.sin(s.startAngle + s.angle),
							arrPoly = [[0, 0], [p1X, p1Y], [p2X, p2Y], [p3X, p3Y], [p4X, p4Y], [p5X, p5Y]],
							arrPoint = [x, y];

						// TODO: perhaps do some mathmatical trickery here with the Y-coordinate to compensate for pie tilt?

						if (isPointInPoly(arrPoly, arrPoint)) {
							ctx.restore();
							return {
								datapoint: [s.percent, s.data],
								dataIndex: 0,
								series: s,
								seriesIndex: i
							};
						}
					}

					ctx.restore();
				}
			}

			return null;
		}

		function onMouseMove(e) {
			triggerClickHoverEvent("plothover", e);
		}

		function onClick(e) {
			triggerClickHoverEvent("plotclick", e);
		}

		// trigger click or hover event (they send the same parameters so we share their code)

		function triggerClickHoverEvent(eventname, e) {

			var offset = plot.offset();
			var canvasX = parseInt(e.pageX - offset.left);
			var canvasY =  parseInt(e.pageY - offset.top);
			var item = findNearbySlice(canvasX, canvasY);

			if (options.grid.autoHighlight) {

				// clear auto-highlights

				for (var i = 0; i < highlights.length; ++i) {
					var h = highlights[i];
					if (h.auto == eventname && !(item && h.series == item.series)) {
						unhighlight(h.series);
					}
				}
			}

			// highlight the slice

			if (item) {
				highlight(item.series, eventname);
			}

			// trigger any hover bind events

			var pos = { pageX: e.pageX, pageY: e.pageY };
			target.trigger(eventname, [pos, item]);
		}

		function highlight(s, auto) {
			//if (typeof s == "number") {
			//	s = series[s];
			//}

			var i = indexOfHighlight(s);

			if (i == -1) {
				highlights.push({ series: s, auto: auto });
				plot.triggerRedrawOverlay();
			} else if (!auto) {
				highlights[i].auto = false;
			}
		}

		function unhighlight(s) {
			if (s == null) {
				highlights = [];
				plot.triggerRedrawOverlay();
			}

			//if (typeof s == "number") {
			//	s = series[s];
			//}

			var i = indexOfHighlight(s);

			if (i != -1) {
				highlights.splice(i, 1);
				plot.triggerRedrawOverlay();
			}
		}

		function indexOfHighlight(s) {
			for (var i = 0; i < highlights.length; ++i) {
				var h = highlights[i];
				if (h.series == s)
					return i;
			}
			return -1;
		}

		function drawOverlay(plot, octx) {

			var options = plot.getOptions();

			var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;

			octx.save();
			octx.translate(centerLeft, centerTop);
			octx.scale(1, options.series.pie.tilt);

			for (var i = 0; i < highlights.length; ++i) {
				drawHighlight(highlights[i].series);
			}

			drawDonutHole(octx);

			octx.restore();

			function drawHighlight(series) {

				if (series.angle <= 0 || isNaN(series.angle)) {
					return;
				}

				//octx.fillStyle = parseColor(options.series.pie.highlight.color).scale(null, null, null, options.series.pie.highlight.opacity).toString();
				octx.fillStyle = "rgba(255, 255, 255, " + options.series.pie.highlight.opacity + ")"; // this is temporary until we have access to parseColor
				octx.beginPath();
				if (Math.abs(series.angle - Math.PI * 2) > 0.000000001) {
					octx.moveTo(0, 0); // Center of the pie
				}
				octx.arc(0, 0, radius, series.startAngle, series.startAngle + series.angle / 2, false);
				octx.arc(0, 0, radius, series.startAngle + series.angle / 2, series.startAngle + series.angle, false);
				octx.closePath();
				octx.fill();
			}
		}
	} // end init (plugin body)

	// define pie specific options and their default values

	var options = {
		series: {
			pie: {
				show: false,
				radius: "auto",	// actual radius of the visible pie (based on full calculated radius if <=1, or hard pixel value)
				innerRadius: 0, /* for donut */
				startAngle: 3/2,
				tilt: 1,
				shadow: {
					left: 5,	// shadow left offset
					top: 15,	// shadow top offset
					alpha: 0.02	// shadow alpha
				},
				offset: {
					top: 0,
					left: "auto"
				},
				stroke: {
					color: "#fff",
					width: 1
				},
				label: {
					show: "auto",
					formatter: function(label, slice) {
						return "<div style='font-size:x-small;text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>" + Math.round(slice.percent) + "%</div>";
					},	// formatter function
					radius: 1,	// radius at which to place the labels (based on full calculated radius if <=1, or hard pixel value)
					background: {
						color: null,
						opacity: 0
					},
					threshold: 0	// percentage at which to hide the label (i.e. the slice is too narrow)
				},
				combine: {
					threshold: -1,	// percentage at which to combine little slices into one larger slice
					color: null,	// color to give the new slice (auto-generated if null)
					label: "Other"	// label to give the new slice
				},
				highlight: {
					//color: "#fff",		// will add this functionality once parseColor is available
					opacity: 0.5
				}
			}
		}
	};

	$.plot.plugins.push({
		init: init,
		options: options,
		name: "pie",
		version: "1.1"
	});

})(jQuery);

/* Flot plugin for thresholding data.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

	series: {
		threshold: {
			below: number
			color: colorspec
		}
	}

It can also be applied to a single series, like this:

	$.plot( $("#placeholder"), [{
		data: [ ... ],
		threshold: { ... }
	}])

An array can be passed for multiple thresholding, like this:

	threshold: [{
		below: number1
		color: color1
	},{
		below: number2
		color: color2
	}]

These multiple threshold objects can be passed in any order since they are
sorted by the processing function.

The data points below "below" are drawn with the specified color. This makes
it easy to mark points below 0, e.g. for budget data.

Internally, the plugin works by splitting the data into two series, above and
below the threshold. The extra series below the threshold will have its label
cleared and the special "originSeries" attribute set to the original series.
You may need to check for this in hover events.

*/

(function ($) {
    var options = {
        series: { threshold: null } // or { below: number, color: color spec}
    };
    
    function init(plot) {
        function thresholdData(plot, s, datapoints, below, color) {
            var ps = datapoints.pointsize, i, x, y, p, prevp,
                thresholded = $.extend({}, s); // note: shallow copy

            thresholded.datapoints = { points: [], pointsize: ps, format: datapoints.format };
            thresholded.label = null;
            thresholded.color = color;
            thresholded.threshold = null;
            thresholded.originSeries = s;
            thresholded.data = [];
 
            var origpoints = datapoints.points,
                addCrossingPoints = s.lines.show;

            var threspoints = [];
            var newpoints = [];
            var m;

            for (i = 0; i < origpoints.length; i += ps) {
                x = origpoints[i];
                y = origpoints[i + 1];

                prevp = p;
                if (y < below)
                    p = threspoints;
                else
                    p = newpoints;

                if (addCrossingPoints && prevp != p && x != null
                    && i > 0 && origpoints[i - ps] != null) {
                    var interx = x + (below - y) * (x - origpoints[i - ps]) / (y - origpoints[i - ps + 1]);
                    prevp.push(interx);
                    prevp.push(below);
                    for (m = 2; m < ps; ++m)
                        prevp.push(origpoints[i + m]);
                    
                    p.push(null); // start new segment
                    p.push(null);
                    for (m = 2; m < ps; ++m)
                        p.push(origpoints[i + m]);
                    p.push(interx);
                    p.push(below);
                    for (m = 2; m < ps; ++m)
                        p.push(origpoints[i + m]);
                }

                p.push(x);
                p.push(y);
                for (m = 2; m < ps; ++m)
                    p.push(origpoints[i + m]);
            }

            datapoints.points = newpoints;
            thresholded.datapoints.points = threspoints;
            
            if (thresholded.datapoints.points.length > 0) {
                var origIndex = $.inArray(s, plot.getData());
                // Insert newly-generated series right after original one (to prevent it from becoming top-most)
                plot.getData().splice(origIndex + 1, 0, thresholded);
            }
                
            // FIXME: there are probably some edge cases left in bars
        }
        
        function processThresholds(plot, s, datapoints) {
            if (!s.threshold)
                return;
            
            if (s.threshold instanceof Array) {
                s.threshold.sort(function(a, b) {
                    return a.below - b.below;
                });
                
                $(s.threshold).each(function(i, th) {
                    thresholdData(plot, s, datapoints, th.below, th.color);
                });
            }
            else {
                thresholdData(plot, s, datapoints, s.threshold.below, s.threshold.color);
            }
        }
        
        plot.hooks.processDatapoints.push(processThresholds);
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'threshold',
        version: '1.2'
    });
})(jQuery);

/* Flot plugin for selecting regions of a plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

selection: {
	mode: null or "x" or "y" or "xy",
	color: color,
	shape: "round" or "miter" or "bevel",
	minSize: number of pixels
}

Selection support is enabled by setting the mode to one of "x", "y" or "xy".
In "x" mode, the user will only be able to specify the x range, similarly for
"y" mode. For "xy", the selection becomes a rectangle where both ranges can be
specified. "color" is color of the selection (if you need to change the color
later on, you can get to it with plot.getOptions().selection.color). "shape"
is the shape of the corners of the selection.

"minSize" is the minimum size a selection can be in pixels. This value can
be customized to determine the smallest size a selection can be and still
have the selection rectangle be displayed. When customizing this value, the
fact that it refers to pixels, not axis units must be taken into account.
Thus, for example, if there is a bar graph in time mode with BarWidth set to 1
minute, setting "minSize" to 1 will not make the minimum selection size 1
minute, but rather 1 pixel. Note also that setting "minSize" to 0 will prevent
"plotunselected" events from being fired when the user clicks the mouse without
dragging.

When selection support is enabled, a "plotselected" event will be emitted on
the DOM element you passed into the plot function. The event handler gets a
parameter with the ranges selected on the axes, like this:

	placeholder.bind( "plotselected", function( event, ranges ) {
		alert("You selected " + ranges.xaxis.from + " to " + ranges.xaxis.to)
		// similar for yaxis - with multiple axes, the extra ones are in
		// x2axis, x3axis, ...
	});

The "plotselected" event is only fired when the user has finished making the
selection. A "plotselecting" event is fired during the process with the same
parameters as the "plotselected" event, in case you want to know what's
happening while it's happening,

A "plotunselected" event with no arguments is emitted when the user clicks the
mouse to remove the selection. As stated above, setting "minSize" to 0 will
destroy this behavior.

The plugin allso adds the following methods to the plot object:

- setSelection( ranges, preventEvent )

  Set the selection rectangle. The passed in ranges is on the same form as
  returned in the "plotselected" event. If the selection mode is "x", you
  should put in either an xaxis range, if the mode is "y" you need to put in
  an yaxis range and both xaxis and yaxis if the selection mode is "xy", like
  this:

	setSelection({ xaxis: { from: 0, to: 10 }, yaxis: { from: 40, to: 60 } });

  setSelection will trigger the "plotselected" event when called. If you don't
  want that to happen, e.g. if you're inside a "plotselected" handler, pass
  true as the second parameter. If you are using multiple axes, you can
  specify the ranges on any of those, e.g. as x2axis/x3axis/... instead of
  xaxis, the plugin picks the first one it sees.

- clearSelection( preventEvent )

  Clear the selection rectangle. Pass in true to avoid getting a
  "plotunselected" event.

- getSelection()

  Returns the current selection in the same format as the "plotselected"
  event. If there's currently no selection, the function returns null.

*/

(function ($) {
    function init(plot) {
        var selection = {
                first: { x: -1, y: -1}, second: { x: -1, y: -1},
                show: false,
                active: false
            };

        // FIXME: The drag handling implemented here should be
        // abstracted out, there's some similar code from a library in
        // the navigation plugin, this should be massaged a bit to fit
        // the Flot cases here better and reused. Doing this would
        // make this plugin much slimmer.
        var savedhandlers = {};

        var mouseUpHandler = null;
        
        function onMouseMove(e) {
            if (selection.active) {
                updateSelection(e);
                
                plot.getPlaceholder().trigger("plotselecting", [ getSelection() ]);
            }
        }

        function onMouseDown(e) {
            if (e.which != 1)  // only accept left-click
                return;
            
            // cancel out any text selections
            document.body.focus();

            // prevent text selection and drag in old-school browsers
            if (document.onselectstart !== undefined && savedhandlers.onselectstart == null) {
                savedhandlers.onselectstart = document.onselectstart;
                document.onselectstart = function () { return false; };
            }
            if (document.ondrag !== undefined && savedhandlers.ondrag == null) {
                savedhandlers.ondrag = document.ondrag;
                document.ondrag = function () { return false; };
            }

            setSelectionPos(selection.first, e);

            selection.active = true;

            // this is a bit silly, but we have to use a closure to be
            // able to whack the same handler again
            mouseUpHandler = function (e) { onMouseUp(e); };
            
            $(document).one("mouseup", mouseUpHandler);
        }

        function onMouseUp(e) {
            mouseUpHandler = null;
            
            // revert drag stuff for old-school browsers
            if (document.onselectstart !== undefined)
                document.onselectstart = savedhandlers.onselectstart;
            if (document.ondrag !== undefined)
                document.ondrag = savedhandlers.ondrag;

            // no more dragging
            selection.active = false;
            updateSelection(e);

            if (selectionIsSane())
                triggerSelectedEvent();
            else {
                // this counts as a clear
                plot.getPlaceholder().trigger("plotunselected", [ ]);
                plot.getPlaceholder().trigger("plotselecting", [ null ]);
            }

            return false;
        }

        function getSelection() {
            if (!selectionIsSane())
                return null;
            
            if (!selection.show) return null;

            var r = {}, c1 = selection.first, c2 = selection.second;
            $.each(plot.getAxes(), function (name, axis) {
                if (axis.used) {
                    var p1 = axis.c2p(c1[axis.direction]), p2 = axis.c2p(c2[axis.direction]); 
                    r[name] = { from: Math.min(p1, p2), to: Math.max(p1, p2) };
                }
            });
            return r;
        }

        function triggerSelectedEvent() {
            var r = getSelection();

            plot.getPlaceholder().trigger("plotselected", [ r ]);

            // backwards-compat stuff, to be removed in future
            if (r.xaxis && r.yaxis)
                plot.getPlaceholder().trigger("selected", [ { x1: r.xaxis.from, y1: r.yaxis.from, x2: r.xaxis.to, y2: r.yaxis.to } ]);
        }

        function clamp(min, value, max) {
            return value < min ? min: (value > max ? max: value);
        }

        function setSelectionPos(pos, e) {
            var o = plot.getOptions();
            var offset = plot.getPlaceholder().offset();
            var plotOffset = plot.getPlotOffset();
            pos.x = clamp(0, e.pageX - offset.left - plotOffset.left, plot.width());
            pos.y = clamp(0, e.pageY - offset.top - plotOffset.top, plot.height());

            if (o.selection.mode == "y")
                pos.x = pos == selection.first ? 0 : plot.width();

            if (o.selection.mode == "x")
                pos.y = pos == selection.first ? 0 : plot.height();
        }

        function updateSelection(pos) {
            if (pos.pageX == null)
                return;

            setSelectionPos(selection.second, pos);
            if (selectionIsSane()) {
                selection.show = true;
                plot.triggerRedrawOverlay();
            }
            else
                clearSelection(true);
        }

        function clearSelection(preventEvent) {
            if (selection.show) {
                selection.show = false;
                plot.triggerRedrawOverlay();
                if (!preventEvent)
                    plot.getPlaceholder().trigger("plotunselected", [ ]);
            }
        }

        // function taken from markings support in Flot
        function extractRange(ranges, coord) {
            var axis, from, to, key, axes = plot.getAxes();

            for (var k in axes) {
                axis = axes[k];
                if (axis.direction == coord) {
                    key = coord + axis.n + "axis";
                    if (!ranges[key] && axis.n == 1)
                        key = coord + "axis"; // support x1axis as xaxis
                    if (ranges[key]) {
                        from = ranges[key].from;
                        to = ranges[key].to;
                        break;
                    }
                }
            }

            // backwards-compat stuff - to be removed in future
            if (!ranges[key]) {
                axis = coord == "x" ? plot.getXAxes()[0] : plot.getYAxes()[0];
                from = ranges[coord + "1"];
                to = ranges[coord + "2"];
            }

            // auto-reverse as an added bonus
            if (from != null && to != null && from > to) {
                var tmp = from;
                from = to;
                to = tmp;
            }
            
            return { from: from, to: to, axis: axis };
        }
        
        function setSelection(ranges, preventEvent) {
            var axis, range, o = plot.getOptions();

            if (o.selection.mode == "y") {
                selection.first.x = 0;
                selection.second.x = plot.width();
            }
            else {
                range = extractRange(ranges, "x");

                selection.first.x = range.axis.p2c(range.from);
                selection.second.x = range.axis.p2c(range.to);
            }

            if (o.selection.mode == "x") {
                selection.first.y = 0;
                selection.second.y = plot.height();
            }
            else {
                range = extractRange(ranges, "y");

                selection.first.y = range.axis.p2c(range.from);
                selection.second.y = range.axis.p2c(range.to);
            }

            selection.show = true;
            plot.triggerRedrawOverlay();
            if (!preventEvent && selectionIsSane())
                triggerSelectedEvent();
        }

        function selectionIsSane() {
            var minSize = plot.getOptions().selection.minSize;
            return Math.abs(selection.second.x - selection.first.x) >= minSize &&
                Math.abs(selection.second.y - selection.first.y) >= minSize;
        }

        plot.clearSelection = clearSelection;
        plot.setSelection = setSelection;
        plot.getSelection = getSelection;

        plot.hooks.bindEvents.push(function(plot, eventHolder) {
            var o = plot.getOptions();
            if (o.selection.mode != null) {
                eventHolder.mousemove(onMouseMove);
                eventHolder.mousedown(onMouseDown);
            }
        });


        plot.hooks.drawOverlay.push(function (plot, ctx) {
            // draw selection
            if (selection.show && selectionIsSane()) {
                var plotOffset = plot.getPlotOffset();
                var o = plot.getOptions();

                ctx.save();
                ctx.translate(plotOffset.left, plotOffset.top);

                var c = $.color.parse(o.selection.color);

                ctx.strokeStyle = c.scale('a', 0.8).toString();
                ctx.lineWidth = 1;
                ctx.lineJoin = o.selection.shape;
                ctx.fillStyle = c.scale('a', 0.4).toString();

                var x = Math.min(selection.first.x, selection.second.x) + 0.5,
                    y = Math.min(selection.first.y, selection.second.y) + 0.5,
                    w = Math.abs(selection.second.x - selection.first.x) - 1,
                    h = Math.abs(selection.second.y - selection.first.y) - 1;

                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);

                ctx.restore();
            }
        });
        
        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mousedown", onMouseDown);
            
            if (mouseUpHandler)
                $(document).unbind("mouseup", mouseUpHandler);
        });

    }

    $.plot.plugins.push({
        init: init,
        options: {
            selection: {
                mode: null, // one of null, "x", "y" or "xy"
                color: "#e8cfac",
                shape: "round", // one of "round", "miter", or "bevel"
                minSize: 5 // minimum number of pixels
            }
        },
        name: 'selection',
        version: '1.1'
    });
})(jQuery);

/* Flot plugin for automatically redrawing plots as the placeholder resizes.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

It works by listening for changes on the placeholder div (through the jQuery
resize event plugin) - if the size changes, it will redraw the plot.

There are no options. If you need to disable the plugin for some plots, you
can just fix the size of their placeholders.

*/

/* Inline dependency:
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,e,t){"$:nomunge";var i=[],n=$.resize=$.extend($.resize,{}),a,r=false,s="setTimeout",u="resize",m=u+"-special-event",o="pendingDelay",l="activeDelay",f="throttleWindow";n[o]=200;n[l]=20;n[f]=true;$.event.special[u]={setup:function(){if(!n[f]&&this[s]){return false}var e=$(this);i.push(this);e.data(m,{w:e.width(),h:e.height()});if(i.length===1){a=t;h()}},teardown:function(){if(!n[f]&&this[s]){return false}var e=$(this);for(var t=i.length-1;t>=0;t--){if(i[t]==this){i.splice(t,1);break}}e.removeData(m);if(!i.length){if(r){cancelAnimationFrame(a)}else{clearTimeout(a)}a=null}},add:function(e){if(!n[f]&&this[s]){return false}var i;function a(e,n,a){var r=$(this),s=r.data(m)||{};s.w=n!==t?n:r.width();s.h=a!==t?a:r.height();i.apply(this,arguments)}if($.isFunction(e)){i=e;return a}else{i=e.handler;e.handler=a}}};function h(t){if(r===true){r=t||1}for(var s=i.length-1;s>=0;s--){var l=$(i[s]);if(l[0]==e||l.is(":visible")){var f=l.width(),c=l.height(),d=l.data(m);if(d&&(f!==d.w||c!==d.h)){l.trigger(u,[d.w=f,d.h=c]);r=t||true}}else{d=l.data(m);d.w=0;d.h=0}}if(a!==null){if(r&&(t==null||t-r<1e3)){a=e.requestAnimationFrame(h)}else{a=setTimeout(h,n[o]);r=false}}}if(!e.requestAnimationFrame){e.requestAnimationFrame=function(){return e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.oRequestAnimationFrame||e.msRequestAnimationFrame||function(t,i){return e.setTimeout(function(){t((new Date).getTime())},n[l])}}()}if(!e.cancelAnimationFrame){e.cancelAnimationFrame=function(){return e.webkitCancelRequestAnimationFrame||e.mozCancelRequestAnimationFrame||e.oCancelRequestAnimationFrame||e.msCancelRequestAnimationFrame||clearTimeout}()}})(jQuery,this);

(function ($) {
    var options = { }; // no options

    function init(plot) {
        function onResize() {
            var placeholder = plot.getPlaceholder();

            // somebody might have hidden us and we can't plot
            // when we don't have the dimensions
            if (placeholder.width() == 0 || placeholder.height() == 0)
                return;

            plot.resize();
            plot.setupGrid();
            plot.draw();
        }
        
        function bindEvents(plot, eventHolder) {
            plot.getPlaceholder().resize(onResize);
        }

        function shutdown(plot, eventHolder) {
            plot.getPlaceholder().unbind("resize", onResize);
        }
        
        plot.hooks.bindEvents.push(bindEvents);
        plot.hooks.shutdown.push(shutdown);
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'resize',
        version: '1.0'
    });
})(jQuery);

/* Flot plugin for stacking data sets rather than overlyaing them.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin assumes the data is sorted on x (or y if stacking horizontally).
For line charts, it is assumed that if a line has an undefined gap (from a
null point), then the line above it should have the same gap - insert zeros
instead of "null" if you want another behaviour. This also holds for the start
and end of the chart. Note that stacking a mix of positive and negative values
in most instances doesn't make sense (so it looks weird).

Two or more series are stacked when their "stack" attribute is set to the same
key (which can be any number or string or just "true"). To specify the default
stack, you can set the stack option like this:

	series: {
		stack: null/false, true, or a key (number/string)
	}

You can also specify it for a single series, like this:

	$.plot( $("#placeholder"), [{
		data: [ ... ],
		stack: true
	}])

The stacking order is determined by the order of the data series in the array
(later series end up on top of the previous).

Internally, the plugin modifies the datapoints in each series, adding an
offset to the y value. For line series, extra data points are inserted through
interpolation. If there's a second y value, it's also adjusted (e.g for bar
charts or filled areas).

*/

(function ($) {
    var options = {
        series: { stack: null } // or number/string
    };
    
    function init(plot) {
        function findMatchingSeries(s, allseries) {
            var res = null;
            for (var i = 0; i < allseries.length; ++i) {
                if (s == allseries[i])
                    break;
                
                if (allseries[i].stack == s.stack)
                    res = allseries[i];
            }
            
            return res;
        }
        
        function stackData(plot, s, datapoints) {
            if (s.stack == null || s.stack === false)
                return;

            var other = findMatchingSeries(s, plot.getData());
            if (!other)
                return;

            var ps = datapoints.pointsize,
                points = datapoints.points,
                otherps = other.datapoints.pointsize,
                otherpoints = other.datapoints.points,
                newpoints = [],
                px, py, intery, qx, qy, bottom,
                withlines = s.lines.show,
                horizontal = s.bars.horizontal,
                withbottom = ps > 2 && (horizontal ? datapoints.format[2].x : datapoints.format[2].y),
                withsteps = withlines && s.lines.steps,
                fromgap = true,
                keyOffset = horizontal ? 1 : 0,
                accumulateOffset = horizontal ? 0 : 1,
                i = 0, j = 0, l, m;

            while (true) {
                if (i >= points.length)
                    break;

                l = newpoints.length;

                if (points[i] == null) {
                    // copy gaps
                    for (m = 0; m < ps; ++m)
                        newpoints.push(points[i + m]);
                    i += ps;
                }
                else if (j >= otherpoints.length) {
                    // for lines, we can't use the rest of the points
                    if (!withlines) {
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);
                    }
                    i += ps;
                }
                else if (otherpoints[j] == null) {
                    // oops, got a gap
                    for (m = 0; m < ps; ++m)
                        newpoints.push(null);
                    fromgap = true;
                    j += otherps;
                }
                else {
                    // cases where we actually got two points
                    px = points[i + keyOffset];
                    py = points[i + accumulateOffset];
                    qx = otherpoints[j + keyOffset];
                    qy = otherpoints[j + accumulateOffset];
                    bottom = 0;

                    if (px == qx) {
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);

                        newpoints[l + accumulateOffset] += qy;
                        bottom = qy;
                        
                        i += ps;
                        j += otherps;
                    }
                    else if (px > qx) {
                        // we got past point below, might need to
                        // insert interpolated extra point
                        if (withlines && i > 0 && points[i - ps] != null) {
                            intery = py + (points[i - ps + accumulateOffset] - py) * (qx - px) / (points[i - ps + keyOffset] - px);
                            newpoints.push(qx);
                            newpoints.push(intery + qy);
                            for (m = 2; m < ps; ++m)
                                newpoints.push(points[i + m]);
                            bottom = qy; 
                        }

                        j += otherps;
                    }
                    else { // px < qx
                        if (fromgap && withlines) {
                            // if we come from a gap, we just skip this point
                            i += ps;
                            continue;
                        }
                            
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);
                        
                        // we might be able to interpolate a point below,
                        // this can give us a better y
                        if (withlines && j > 0 && otherpoints[j - otherps] != null)
                            bottom = qy + (otherpoints[j - otherps + accumulateOffset] - qy) * (px - qx) / (otherpoints[j - otherps + keyOffset] - qx);

                        newpoints[l + accumulateOffset] += bottom;
                        
                        i += ps;
                    }

                    fromgap = false;
                    
                    if (l != newpoints.length && withbottom)
                        newpoints[l + 2] += bottom;
                }

                // maintain the line steps invariant
                if (withsteps && l != newpoints.length && l > 0
                    && newpoints[l] != null
                    && newpoints[l] != newpoints[l - ps]
                    && newpoints[l + 1] != newpoints[l - ps + 1]) {
                    for (m = 0; m < ps; ++m)
                        newpoints[l + ps + m] = newpoints[l + m];
                    newpoints[l + 1] = newpoints[l - ps + 1];
                }
            }

            datapoints.points = newpoints;
        }
        
        plot.hooks.processDatapoints.push(stackData);
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'stack',
        version: '1.2'
    });
})(jQuery);