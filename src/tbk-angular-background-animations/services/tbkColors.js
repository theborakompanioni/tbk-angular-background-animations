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
