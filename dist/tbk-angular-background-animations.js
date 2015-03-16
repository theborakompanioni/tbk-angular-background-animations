(function (angular) {

  angular.module('tbkBackgroundAnimations.config', [])
    .value('tbkBackgroundAnimations.config', {
      debug: true
    });

  angular.module('tbkBackgroundAnimations.directives', []);
  angular.module('tbkBackgroundAnimations.services', []);

  angular.module('tbkBackgroundAnimations.core', [
    'tbkBackgroundAnimations.config',
    'tbkBackgroundAnimations.directives',
    'tbkBackgroundAnimations.services'
  ]);

  angular.module('tbkBackgroundAnimations.animations', [
    'tbkBackgroundAnimations.core'
  ]);

  angular.module('tbkBackgroundAnimations', [
    'tbkBackgroundAnimations.core',
    'tbkBackgroundAnimations.animations'
  ]);

})(angular);

angular.module('tbkBackgroundAnimations.services')
  .factory('tbkAnimationFrame', ['$window', function(window) {
    'use strict';
    var requestAnimationFrame = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
    })();

    var cancelAnimationFrame = (function () {
      return (window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      window.clearTimeout);
    })();

    return {
      request: function(consumer) {
        return requestAnimationFrame.call(window, consumer);
      },
      cancel: function(requestAnimationFrameId) {
        return cancelAnimationFrame.call(window, requestAnimationFrameId);
      }
    };
  }]);

angular.module('tbkBackgroundAnimations.services')
  .factory('tbkColors', ['$window', function (window) {
    'use strict';

    var hexToRgb = function hexToRgbInner(hex, defaultHex) {
      var _defaultHex = (defaultHex || '#000');
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : hexToRgbInner(_defaultHex, '#000');
    };

    var rgbToHex = function (r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    return {
      rgbToHex: rgbToHex,
      hexToRgb: hexToRgb
    };
  }]);

(function (angular, undefined) {
  'use strict';

  var particleGravityAnimationFactory = function (tbkAnimationFrame, tbkColors) {
    return function (element, options) {
      var width = element.width;
      var height = element.height;

      var config = options || {};
      if (!config.backgroundColor) {
        config.backgroundColor = 'rgba(0,0,0,1)';
      }
      if (!config.particleColor) {
        config.particleColor = '#fff';
      }
      if (!config.particleSize) {
        config.particleSize = 3;
      }
      if (!config.particleCount) {
        var particleCountByCanvasSize = Math.round(width * height / 600);
        config.particleCount = Math.max(50, particleCountByCanvasSize);
      }
      if (!config.minDistance) {
        config.minDistance = 100; // 70
      }
      if (!config.accelerate) {
        config.accelerate = 1 / 3000; // 1 / 2000
      }
      if (!config.strokeColor) {
        config.strokeColor = '#fff';
      }

      var strokeColorAsRgbStringPartial = tbkColors.hexToRgb(
        config.strokeColor, '#fff').join(',');

      var ctx = element.getContext('2d');

      var particles = [];

      // Time to push the particles into an array
      for (var i = 0, n = config.particleCount; i < n; i++) {
        particles.push(new Particle());
      }

      function paintCanvas() {
        ctx.fillStyle = config.backgroundColor;

        // Create a rectangle from thetop left (0,0)
        // to the bottom right corner (width,height)
        ctx.fillRect(0, 0, width, height);
      }

      // Now the idea is to create some particles that will attract
      // each other when they come close. We will set a minimum
      // distance for it and also draw a line when they come
      // close to each other.

      // The attraction can be done by increasing their velocity as
      // they reach closer to each other

      // Let's make a function that will act as a class for
      // our particles.

      function Particle() {
        // Position them randomly on the canvas
        // Math.random() generates a random value between 0
        // and 1 so we will need to multiply that with the
        // canvas width and height.
        this.x = Math.random() * width;
        this.y = Math.random() * height;


        // We would also need some velocity for the particles
        // so that they can move freely across the space
        this.vx = -1 + Math.random() * 2;
        this.vy = -1 + Math.random() * 2;

        // Now the radius of the particles. I want all of
        // them to be equal in size so no Math.random() here..
        this.radius = config.particleSize;

        // This is the method that will draw the Particle on the
        // canvas. It is using the basic fillStyle, then we start
        // the path and after we use the `arc` function to
        // draw our circle. The `arc` function accepts four
        // parameters in which first two depicts the position
        // of the center point of our arc as x and y coordinates.
        // The third value is for radius, then start angle,
        // end angle and finally a boolean value which decides
        // whether the arc is to be drawn in counter clockwise or
        // in a clockwise direction. False for clockwise.
        this.draw = function () {
          ctx.fillStyle = config.particleColor;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

          // Fill the color to the arc that we just created
          ctx.fill();
        };
      }

      // Function to draw everything on the canvas that we'll use when
      // animating the whole scene.
      function draw() {

        // Call the paintCanvas function here so that our canvas
        // will get re-painted in each next frame
        paintCanvas();

        // Call the function that will draw the balls using a loop
        for (var i = 0, n = particles.length; i < n; i++) {
          particles[i].draw();
        }

        //Finally call the update function
        update();
      }

      // Give every particle some life
      function update() {
        var minDist = config.minDistance;
        // In this function, we are first going to update every
        // particle's position according to their velocities
        for (var i = 0, n = particles.length; i < n; i++) {
          var p = particles[i];

          // Change the velocities
          p.x += p.vx;
          p.y += p.vy;

          // We don't want to make the particles leave the
          // area, so just change their position when they
          // touch the walls of the window
          if (p.x + p.radius > width) {
            p.x = p.radius;
          } else if (p.x - p.radius < 0) {
            p.x = width - p.radius;
          }

          if (p.y + p.radius > height) {
            p.y = p.radius;
          } else if (p.y - p.radius < 0) {
            p.y = height - p.radius;
          }

          // Now we need to make them attract each other
          // so first, we'll check the distance between
          // them and compare it to the minDist we have
          // already set

          // We will need another loop so that each
          // particle can be compared to every other particle
          // except itself
          for (var j = i + 1; j < n; j++) {
            var p2 = particles[j];
            var dist = distance(p, p2);
            // Draw the line when distance is smaller
            // then the minimum distance
            if (dist <= minDist) {
              drawLine(p, p2, dist / minDist);

              accelerate(p, p2, config.accelerate);
            }
          }
        }
      }

      function accelerate(p1, p2, factor) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;

        // Some acceleration for the partcles
        // depending upon their distance
        var ax = dx * factor;
        var ay = dy * factor;

        // Apply the acceleration on the particles
        p1.vx -= ax;
        p1.vy -= ay;
        p2.vx += ax;
        p2.vy += ay;
      }

      function drawLine(p1, p2, strokeColorDelta) {
        // Draw the line
        ctx.beginPath();

        //ctx.strokeStyle = config.particleColor;
        ctx.strokeStyle = 'rgba(' + strokeColorAsRgbStringPartial + ',' +
          (1.2 - strokeColorDelta) + ')';

        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        ctx.stroke();

        ctx.closePath();
      }

      // Distance calculator between two particles
      function distance(p1, p2) {
        var dx = p1.x - p2.x,
          dy = p1.y - p2.y;

        return Math.sqrt(dx * dx + dy * dy);
      }

      var requestAnimationFrameId;
      (function animationLoop() {
        draw();
        requestAnimationFrameId = tbkAnimationFrame.request(animationLoop);
      })();

      return function () {
        tbkAnimationFrame.cancel(requestAnimationFrameId);
      };
    };
  };

  angular.module('tbkBackgroundAnimations.animations.ParticleGravity', [
    'tbkBackgroundAnimations.animations'
  ])
    .factory('tbkParticleGravityAnimationService', [
      'tbkAnimationFrame', 'tbkColors',
      function (tbkAnimationFrame, tbkColors) {
        return particleGravityAnimationFactory(tbkAnimationFrame, tbkColors);
      }])
    .directive('tbkParticleGravityAnimation', [
      'tbkParticleGravityAnimationService',
      function (particleGravityAnimation) {
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

              var cancelRequestAnimationFrame = particleGravityAnimation(canvas, $scope.options);

              $scope.$on('$destroy', function () {
                cancelRequestAnimationFrame();
              });
            };
          }
        };
      }]);
}(angular));


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
      var width = element.width;
      var height = element.height;

      var config = options || {};
      if (!config.bubbleCount) {
        config.bubbleCount = width * 0.5;
      }
      if (!config.bubbleColor) {
        config.bubbleColor = '#000';
      }
      if (!config.backgroundColor) {
        config.backgroundColor = '#fff';
      }

      var ctx = element.getContext('2d');

      var circles = [];

      var bubbleColor = {
        colorRgbArray: tbkColors.hexToRgb(
          config.bubbleColor, '#000'),
        alphaFactor: config.alphaFactor || 0.5,
        scaleFactor: config.scaleFactor || 0.5,
        velocityFactor: config.velocityFactor || 1
      };

      for (var i = 0; i < config.bubbleCount; i++) {
        circles.push(new Circle(bubbleColor));
      }

      function paintCanvas() {
        ctx.fillStyle = config.backgroundColor;

        // Create a rectangle from thetop left (0,0)
        // to the bottom right corner (width,height)
        ctx.fillRect(0, 0, width, height);
      }

      function draw() {
        //ctx.clearRect(0, 0, width, height);

        paintCanvas();

        for (var i = 0, n = circles.length; i < n; i++) {
          circles[i].draw(ctx, width, height);
        }
      }

      var requestAnimationFrameId;
      (function animationLoop() {
        draw();
        requestAnimationFrameId = tbkAnimationFrame.request(animationLoop);
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

