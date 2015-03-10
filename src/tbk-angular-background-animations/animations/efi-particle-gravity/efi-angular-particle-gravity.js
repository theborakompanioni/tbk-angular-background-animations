(function (angular, undefined) {
  'use strict';

  var particleGravityAnimationFactory = function (tbkAnimationFrame, tbkColors) {
    return function (element, options) {
      var width = element.width
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
      (function animloop() {
        draw();
        requestAnimationFrameId = tbkAnimationFrame.request(animloop);
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

