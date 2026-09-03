/**
 * Angular service for embedding external content that supports the oEmbed standard
 */
profileEditor.factory('embedService', ['$http', '$q', '$sce', 'util', function ($http, $q, $sce, util) {

  var services = [
    {
      "type": "video",
      "name": "YouTube",
      "patterns": [
        /https?:\/\/(?:[^\.]+\.)?youtube\.com\/watch\/?\?(?:.+&)?v=([^&]+)/i,
        /https?:\/\/(?:[^\.]+\.)?(?:youtu\.be|youtube\.com\/embed)\/([a-zA-Z0-9_-]+)/i
      ]
    },
    {
      "type": "video",
      "name": "TED Talks",
      "patterns": [
        /https?:\/\/ted\.com\/talks\/.*/i,
        /https?:\/\/((?:www|embed)\.)?ted\.com\/talks\/.*/i
      ]
    },
    {
      "type": "audio",
      "name": "SoundCloud",
      "patterns": [
        /https?:\/\/soundcloud\.com\/.*/i,
        /https?:\/\/soundcloud\.com\/.*\/.*/i
      ]
    },
    {
      "type": "video",
      "name": "Wistia",
      "patterns": [
        /https?:\/\/(.+)?(wistia.com|wi.st)\/.*/i
      ]
    },
    {
      "type": "video",
      "name": "Vimeo",
      "patterns": [
        /https?:\/\/(?:www\.)?vimeo\.com\/.+/i,
        /https?:\/\/vimeo\.com\/.*/i,
        /https?:\/\/vimeo\.com\/album\/.*\/video\/.*/i,
        /https?:\/\/vimeo\.com\/channels\/.*\/.*/i,
        /https?:\/\/vimeo\.com\/groups\/.*\/videos\/.*/i,
        /https?:\/\/vimeo\.com\/ondemand\/.*\/.*/i,
        /https?:\/\/player\.vimeo\.com\/video\/.*/i
      ]
    }
  ];

  // var servicesMap = _.indexBy(services, 'name');

  return {
    describe: function(url) {
      if (url) {
        return $http.get(util.contextRoot() + '/multimedia/describe', {params: { url: url } }).then(function (response) {
          if (response.data.embed && response.data.embed.html) {
            response.data.embed.html = $sce.trustAsHtml(response.data.embed.html);
          }
          return response.data;
        });
      } else {
        return $q.reject({error: "No matching service"});
      }
    },
    findService: function(url) {
      return _.find(services, function(service) {
        return _.any(service.patterns, function(pattern) {
          return url.search(pattern) != -1;
        });
      });
    }
  }
}]);
