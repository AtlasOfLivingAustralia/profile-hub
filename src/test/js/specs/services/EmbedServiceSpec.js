describe("EmbedService tests", function () {
  var embedService;

  beforeAll(function () {
    console.log("****** Embed Service Tests ******")
  });
  afterAll(function () {
    console.log("----------------------------");
  });

  beforeEach(module("profileEditor"));

  beforeEach(inject(function (_embedService_) {
    console.log("injecting " + _embedService_);
    embedService = _embedService_;
  }));

  var inputs = [
      ['https://www.youtube.com/watch?v=sCAlIDe5Hi8&t=2261s', 'YouTube'],
      ['https://soundcloud.com/marcfennell/green-room-reviewed', 'SoundCloud'],
      ['http://www.ted.com/talks/ken_robinson_says_schools_kill_creativity', 'TED Talks'],
      ['http://home.wistia.com/medias/e4a27b971d', 'Wistia'],
      ['http://fast.wistia.com/embed/playlists/fbe3880a4e?theme=trime&version=v1&videoOptions%5BvideoHeight%5D=360&videoOptions%5BvideoWidth%5D=640', 'Wistia'],
      ['http://fast.wistia.com/embed/iframe/b0767e8ebb?version=v1&controlsVisibleOnLoad=true&playerColor=aae3d8', 'Wistia'],
      ['https://vimeo.com/147173661', 'Vimeo']
  ];

  for (var i = 0; i < inputs.length; i++) {
    iterationTest(inputs[i]);
  }

  function iterationTest(input){
      var url = input[0],
          name = input[1];
      it("test for - " + url + " " + name, function () {
          var service = embedService.findService(url);

          expect(service).not.toBe(null);
          expect(service).not.toBeUndefined();
          expect(service.name).toBe(name);
      });
  }
});