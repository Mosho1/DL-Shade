'use strict';

angular.module('mgcrea.ngStrap.tooltip', ['ngAnimate', 'mgcrea.ngStrap.helpers.dimensions'])

  .provider('$customTooltip', function() {

    var defaults = this.defaults = {
      animation: 'am-fade',
      prefixClass: 'tooltip',
      container: false,
      afterContainer: true,
      placement: 'top',
      template: 'DL_libs/ng-popover/tooltip.tpl.html',
      contentTemplate: false,
      trigger: 'hover focus',
      varTrigger: '',
      keyboard: false,
      html: false,
      show: false,
      title: '',
      type: '',
      delay: 0
    };

    this.$get = function($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, dimensions, $$animateReflow) {

      var trim = String.prototype.trim;
      var isTouch = 'createTouch' in $window.document;
      var htmlReplaceRegExp = /ng-bind="/ig;

      function TooltipFactory(element, config) {

        var $customTooltip = {};

        // Common vars
        var options = $customTooltip.$options = angular.extend({}, defaults, config);
        $customTooltip.$promise = fetchTemplate(options.template);
        var scope = $customTooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new();
        if(options.delay && angular.isString(options.delay)) {
          options.delay = parseFloat(options.delay);
        }

        // Support scope as string options
        if(options.title) {
          $customTooltip.$scope.title = options.title;
        }

        // Provide scope helpers
        scope.$hide = function() {
          scope.$$postDigest(function() {
            $customTooltip.hide();
          });
        };
        scope.$show = function() {
          scope.$$postDigest(function() {
            $customTooltip.show();
          });
        };
        scope.$toggle = function() {
          scope.$$postDigest(function() {
            $customTooltip.toggle();
          });
        };
        $customTooltip.$isShown = scope.$isShown = false;

        // Private vars
        var timeout, hoverState;

        // Support contentTemplate option
        if(options.contentTemplate) {
          $customTooltip.$promise = $customTooltip.$promise.then(function(template) {
            var templateEl = angular.element(template);
            return fetchTemplate(options.contentTemplate)
            .then(function(contentTemplate) {
              findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
              return templateEl[0].outerHTML;
            });
          });
        }

        // Fetch, compile then initialize tooltip
        var tipLinker, tipElement, tipTemplate, tipContainer;
        $customTooltip.$promise.then(function(template) {
          if(angular.isObject(template)) template = template.data;
          if(options.html) template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
          template = trim.apply(template);
          tipTemplate = template;
          tipLinker = $compile(template);
          $customTooltip.init();
        });

        $customTooltip.init = function() {

          // Options: delay
          if (options.delay && angular.isNumber(options.delay)) {
            options.delay = {
              show: options.delay,
              hide: options.delay
            };
          }

          // Replace trigger on touch devices ?
          // if(isTouch && options.trigger === defaults.trigger) {
          //   options.trigger.replace(/hover/g, 'click');
          // }

          // Options : container
          if(options.container === 'self') {
            tipContainer = element;
          } else if(options.container) {
                if (options.afterContainer) {
                    tipContainer = angular.element(findElement(options.container)[0].parentNode);
                } else {
                    tipContainer = findElement(options.container);
                }
          }

          // Options: trigger
          var triggers = options.trigger.split(' ');
          angular.forEach(triggers, function(trigger) {
            if(trigger === 'click') {
              element.on('click', $customTooltip.toggle);
            } else if(trigger !== 'manual') {
              element.on(trigger === 'hover' ? 'mouseenter' : 'focus', $customTooltip.enter);
              element.on(trigger === 'hover' ? 'mouseleave' : 'blur', $customTooltip.leave);
              trigger !== 'hover' && element.on(isTouch ? 'touchstart' : 'mousedown', $customTooltip.$onFocusElementMouseDown);
            } else {
                element.on('popup', function(){$timeout($customTooltip.toggle)});
                element.on('leave',  function(){$timeout($customTooltip.leave)})
            }

          });

          // Options: show
          if(options.show) {
            scope.$$postDigest(function() {
              options.trigger === 'focus' ? element[0].focus() : $customTooltip.show();
            });
          }

        };

        $customTooltip.destroy = function() {

          // Unbind events
          var triggers = options.trigger.split(' ');
          for (var i = triggers.length; i--;) {
            var trigger = triggers[i];
            if(trigger === 'click') {
              element.off('click', $customTooltip.toggle);
            } else if(trigger !== 'manual') {
              element.off(trigger === 'hover' ? 'mouseenter' : 'focus', $customTooltip.enter);
              element.off(trigger === 'hover' ? 'mouseleave' : 'blur', $customTooltip.leave);
              trigger !== 'hover' && element.off(isTouch ? 'touchstart' : 'mousedown', $customTooltip.$onFocusElementMouseDown);
            } else { element.off('popup', $customTooltip.toggle);
                     element.off('leave', $customTooltip.leave)
            }
          }

          // Remove element
          if(tipElement) {
            tipElement.remove();
            tipElement = null;
          }

          // Destroy scope
          scope.$destroy();

        };

        $customTooltip.enter = function() {

          clearTimeout(timeout);
          hoverState = 'in';
          if (!options.delay || !options.delay.show) {
            return $customTooltip.show();
          }

          timeout = setTimeout(function() {
            if (hoverState ==='in') $customTooltip.show();
          }, options.delay.show);

        };

        $customTooltip.show = function() {

          var parent = options.container ? tipContainer : null;
          var after = options.container ? null : element;

          // Remove any existing tipElement
          if(tipElement) tipElement.remove();
          // Fetch a cloned element linked from template
          tipElement = $customTooltip.$element = tipLinker(scope, function(clonedElement, scope) {});

          // Set the initial positioning.
          tipElement.css({top: '0px', left: '0px', display: 'block'}).addClass(options.placement);

          // Options: animation
          if(options.animation) tipElement.addClass(options.animation);
          // Options: type
          if(options.type) tipElement.addClass(options.prefixClass + '-' + options.type);

          $animate.enter(tipElement, parent, after, function() {});
          $customTooltip.$isShown = scope.$isShown = true;
          scope.$$phase || scope.$digest();
          $$animateReflow($customTooltip.$applyPlacement);

          // Bind events
          if(options.keyboard) {
            if(options.trigger !== 'focus') {
              $customTooltip.focus();
              tipElement.on('keyup', $customTooltip.$onKeyUp);
            } else {
              element.on('keyup', $customTooltip.$onFocusKeyUp);
            }
          }

        };

        $customTooltip.leave = function() {

          clearTimeout(timeout);
          hoverState = 'out';
          if (!options.delay || !options.delay.hide) {
            return $customTooltip.hide();
          }
          timeout = setTimeout(function () {
            if (hoverState === 'out') {
              $customTooltip.hide();
            }
          }, options.delay.hide);

        };

        $customTooltip.hide = function(blur) {

          if(!$customTooltip.$isShown) return;

          $animate.leave(tipElement, function() {
            tipElement = null;
          });
          $customTooltip.$isShown = scope.$isShown = false;
          scope.$$phase || scope.$digest();

          // Unbind events
          if(options.keyboard) {
            tipElement.off('keyup', $customTooltip.$onKeyUp);
          }

          // Allow to blur the input when hidden, like when pressing enter key
          if(blur && options.trigger === 'focus') {
            return element[0].blur();
          }

        };

        $customTooltip.toggle = function() {
          if (options.trigger === 'manual')
            $customTooltip.$isShown ? $customTooltip.leave() : $customTooltip.enter();
        };

        $customTooltip.focus = function() {
          tipElement[0].focus();
        };

        // Protected methods

        $customTooltip.$applyPlacement = function() {
          if(!tipElement) return;

          // Get the position of the tooltip element.
          var elementPosition = getPosition();

          // Get the height and width of the tooltip so we can center it.
          var tipWidth = tipElement.prop('offsetWidth'),
              tipHeight = tipElement.prop('offsetHeight');

          // Get the tooltip's top and left coordinates to center it with this directive.
          var tipPosition = getCalculatedOffset(options.placement, elementPosition, tipWidth, tipHeight);

          // Now set the calculated positioning.
          tipPosition.top += 'px';
          tipPosition.left += 'px';
          tipElement.css(tipPosition);

        };

        $customTooltip.$onKeyUp = function(evt) {
          evt.which === 27 && $customTooltip.hide();
        };

        $customTooltip.$onFocusKeyUp = function(evt) {
          evt.which === 27 && element[0].blur();
        };

        $customTooltip.$onFocusElementMouseDown = function(evt) {
          evt.preventDefault();
          evt.stopPropagation();
          // Some browsers do not auto-focus buttons (eg. Safari)
          $customTooltip.$isShown ? element[0].blur() : element[0].focus();
        };

        // Private methods

        function getPosition() {
          if(options.container === 'body') {
            return dimensions.offset(element[0]);
          } else {
            return dimensions.position(element[0]);
          }
        }

        function getCalculatedOffset(placement, position, actualWidth, actualHeight) {
          var offset;
          var split = placement.split('-');

          switch (split[0]) {
          case 'right':
            offset = {
              top: position.top + position.height / 2 - actualHeight / 2,
              left: position.left + position.width
            };
            break;
          case 'bottom':
            offset = {
              top: position.top + position.height,
              left: position.left + position.width / 2 - actualWidth / 2
            };
            break;
          case 'left':
            offset = {
              top: position.top + position.height / 2 - actualHeight / 2,
              left: position.left - actualWidth
            };
            break;
          default:
            offset = {
              top: position.top - actualHeight,
              left: position.left + position.width / 2 - actualWidth / 2
            };
            break;
          }

          if(!split[1]) {
            return offset;
          }

          // Add support for corners @todo css
          if(split[0] === 'top' || split[0] === 'bottom') {
            switch (split[1]) {
            case 'left':
              offset.left = position.left;
              break;
            case 'right':
              offset.left =  position.left + position.width - actualWidth;
            }
          } else if(split[0] === 'left' || split[0] === 'right') {
            switch (split[1]) {
            case 'top':
              offset.top = position.top - actualHeight;
              break;
            case 'bottom':
              offset.top = position.top + position.height;
            }
          }

          return offset;
        }

        return $customTooltip;

      }

      // Helper functions

      function findElement(query, element) {
        return angular.element((element || document).querySelectorAll(query));
      }

      function templateString(template) {
          if (angular.isString(template))
            return template;
      }


      function fetchTemplate(template) {
        return $q.when($templateCache.get(template) || templateString(template) || $http.get(template))
        .then(function(res) {
          if(angular.isObject(res)) {
            $templateCache.put(template, res.data);
            return res.data;
          }
          return res;
        });
      }

      return TooltipFactory;

    };

  })

  .directive('bsTooltip', function($window, $location, $sce, $customTooltip, $$animateReflow) {

    return {
      restrict: 'EAC',
      scope: true,
      link: function postLink(scope, element, attr, transclusion) {

        // Directive options
        var options = {scope: scope};
        angular.forEach(['template', 'contentTemplate', 'placement', 'container', 'afterContainer', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'type'], function(key) {
          if(angular.isDefined(attr[key])) options[key] = attr[key];
        });

        // Observe scope attributes for change
        angular.forEach(['title'], function(key) {
          attr[key] && attr.$observe(key, function(newValue, oldValue) {
            scope[key] = $sce.trustAsHtml(newValue);
            angular.isDefined(oldValue) && $$animateReflow(function() {
              tooltip && tooltip.$applyPlacement();
            });
          });
        });

        // Support scope as an object
        attr.bsTooltip && scope.$watch(attr.bsTooltip, function(newValue, oldValue) {
          if(angular.isObject(newValue)) {
            angular.extend(scope, newValue);
          } else {
            scope.content = newValue;
          }
          angular.isDefined(oldValue) && $$animateReflow(function() {
            tooltip && tooltip.$applyPlacement();
          });
        }, true);

        // Initialize popover
        var tooltip = $customTooltip(element, options);

        // Garbage collection
        scope.$on('$destroy', function() {
          tooltip.destroy();
          options = null;
          tooltip = null;
        });

      }
    };

  });
