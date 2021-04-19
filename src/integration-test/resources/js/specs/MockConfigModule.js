angular.module('app.config', []).constant('config', {
    contextPath: '/path',
    readonly: false,
    profileServiceUrl: "http://profileService",
    development: true // required for Unit tests to load templates
});