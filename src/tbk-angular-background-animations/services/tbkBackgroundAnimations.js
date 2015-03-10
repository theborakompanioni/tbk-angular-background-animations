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
