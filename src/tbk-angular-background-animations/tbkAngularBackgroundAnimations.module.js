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
