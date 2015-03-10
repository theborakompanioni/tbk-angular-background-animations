(function (angular, undefined) {
  'use strict';
  var randomCircleConfig = function (maxWidth, maxHeight, options) {
    var config = options || {};
    var alphaFactor = config.alphaFactor || 0.5;
    var scaleFactor = config.scaleFactor || 0.5;
    var velocityFactor = config.velocityFactor || 1;

    return {
      pos: {
        x: Math.random() * maxWidth,
        y: maxHeight + Math.random() * 100
      },
      alpha: 0.1 + Math.random() * alphaFactor,
      scale: 0.1 + Math.random() * scaleFactor,
      velocity: 0.1 + Math.random() * velocityFactor
    };
  };

  function Circle(options) {
    var _this = this;

    var config = options || {};
    var rgbaStringPartial = (config.colorRgbArray || [0, 0, 0]).join(',');

    this.draw = function (ctx, width, height) {
      if (!_this.options || _this.options.alpha <= 0) {
        _this.options = randomCircleConfig(width, height, config);
      }
      _this.options.pos.y -= _this.options.velocity;
      _this.options.alpha -= 0.0005;
      ctx.beginPath();
      ctx.arc(_this.options.pos.x, _this.options.pos.y, _this.options.scale * 10, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(' + rgbaStringPartial + ',' + _this.options.alpha + ')';
      ctx.fill();
    };
  }

  var bubblesAnimationFactory = function (tbkAnimationFrame, tbkColors) {
    return function (element, options) {
      var width = element.width
      var height = element.height;

      var config = options || {};
      if (!config.bubbleCount) {
        config.bubbleCount = width * 0.5;
      }
      if (!config.bubbleColor) {
        config.bubbleColor = '#fff';
      }

      var ctx = element.getContext('2d');

      var circles = [];

      var bubbleColor = {
        colorRgbArray: tbkColors.hexToRgb(
          config.bubbleColor, '#fff'),
        alphaFactor: config.alphaFactor || 0.5,
        scaleFactor: config.scaleFactor || 0.5,
        velocityFactor: config.velocityFactor || 1
      };

      for (var i = 0; i < config.bubbleCount; i++) {
        circles.push(new Circle(bubbleColor));
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        for (var i = 0, n = circles.length; i < n; i++) {
          circles[i].draw(ctx, width, height);
        }
      }

      var requestAnimationFrameId;
      (function animloop() {
        draw();
        requestAnimationFrameId = tbkAnimationFrame.request(animloop);
      })();

      return function () {
        tbkAnimationFrame.cancel(requestAnimationFrameId);
      };
    };
  };

  angular.module('tbkBackgroundAnimations.animations.Bubbles', [
    'tbkBackgroundAnimations.animations'
  ])
    .factory('tbkBubblesAnimationService', [
      'tbkAnimationFrame', 'tbkColors',
      function (tbkAnimationFrame, tbkColors) {
        return bubblesAnimationFactory(tbkAnimationFrame, tbkColors);
      }])
    .directive('tbkBubblesAnimation', [
      'tbkBubblesAnimationService',
      function (bubblesAnimation) {
        return {
          scope: {
            width: '@',
            height: '@',
            style: '=?',
            options: '=?'
          },
          template: '<canvas></canvas>',
          controller: [function () {

          }],
          compile: function ($element) {
            var canvas = $element.children()[0];

            return function link($scope) {
              $scope.options = $scope.options || {};
              $scope.style = $scope.style || [];
              canvas.width = $scope.width || canvas.width;
              canvas.height = $scope.height || canvas.height;

              var $canvas = angular.element(canvas);
              angular.forEach($scope.style, function (value, key) {
                $canvas.css(key, value);
              });

              var cancelRequestAnimationFrame = bubblesAnimation(canvas, $scope.options);

              $scope.$on('$destroy', function () {
                cancelRequestAnimationFrame();
              });
            };
          }
        };
      }]);
}(angular));

