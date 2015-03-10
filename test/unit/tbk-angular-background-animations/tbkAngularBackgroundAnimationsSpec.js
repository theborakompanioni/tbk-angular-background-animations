'use strict';

describe('', function () {

  var module;
  var dependencies;
  dependencies = [];

  var hasModule = function (module) {
    return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function () {
    module = angular.module('tbkBackgroundAnimations');
    dependencies = module.requires;
  });

  it('should load core module', function () {
    expect(hasModule('tbkBackgroundAnimations.core')).to.be.ok;
  });


  it('should load animations module', function () {
    expect(hasModule('tbkBackgroundAnimations.animations')).to.be.ok;
  });


  describe('core module', function () {

    var module;
    var dependencies;
    dependencies = [];

    var hasModule = function (module) {
      return dependencies.indexOf(module) >= 0;
    };

    beforeEach(function () {
      module = angular.module('tbkBackgroundAnimations.core');
      dependencies = module.requires;
    });

    it('should load config module', function () {
      expect(hasModule('tbkBackgroundAnimations.config')).to.be.ok;
    });


    it('should load directives module', function () {
      expect(hasModule('tbkBackgroundAnimations.directives')).to.be.ok;
    });


    it('should load services module', function () {
      expect(hasModule('tbkBackgroundAnimations.services')).to.be.ok;
    });

  });

  describe('animations module', function () {

    var module;
    var dependencies;
    dependencies = [];

    var hasModule = function (module) {
      return dependencies.indexOf(module) >= 0;
    };

    beforeEach(function () {
      module = angular.module('tbkBackgroundAnimations.animations');
      dependencies = module.requires;
    });

    it('should load core module', function () {
      expect(hasModule('tbkBackgroundAnimations.core')).to.be.ok;
    });

  });

});
