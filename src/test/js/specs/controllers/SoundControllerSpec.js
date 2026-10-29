describe("SoundUploadController tests", function () {
    var controller;
    var scope;
    var upload;
    var modalInstance;
    var profileService;

    beforeEach(module("profileEditor"));

    beforeEach(inject(function ($controller, $rootScope, _profileService_, $q) {
        scope = $rootScope.$new();
        profileService = _profileService_;

        spyOn(profileService, "getLicences").and.returnValue(
            $q.when([{name: "Test licence"}])
        );

        upload = {
            upload: jasmine.createSpy("upload").and.returnValue({
                success: function() {
                    return {
                        error: function() {}
                    };
                }
            })
        };

        modalInstance = {
            close: jasmine.createSpy("close"),
            dismiss: jasmine.createSpy("dismiss")
        };

        controller = $controller("SoundUploadController", {
            profileService: profileService,
            Upload: upload,
            $modalInstance: modalInstance,
            sound: null
        });

        controller.maxFileSize = 5000000;
        controller.maxFileSizeMb = "5.0";
        controller.metadata.title = "Test sound";
        controller.metadata.licence = "Test licence";
    }));

    it("should reject an oversized file supplied as an array without uploading it", function () {
        controller.file = [{
            name: "too-large.wav",
            size: 5010000,
            type: "audio/wav"
        }];

        controller.ok();

        expect(controller.error).toBe(
            "The sound file exceeds the maximum size of 5.0 MB."
        );
        expect(upload.upload).not.toHaveBeenCalled();
    });

    it("should unwrap a valid file supplied as an array before uploading it", function () {
        var file = {
            name: "valid.wav",
            size: 265000,
            type: "audio/wav"
        };
        controller.file = [file];

        controller.ok();

        expect(upload.upload).toHaveBeenCalled();
        expect(upload.upload.calls.mostRecent().args[0].file).toBe(file);
    });

    it("should upload a replacement file while preserving the existing sound UUID", function () {
        var file = {
            name: "replacement.wav",
            size: 265000,
            type: "audio/wav"
        };

        controller.metadata.uuid = "existing-sound-uuid";
        controller.metadata.filename = "original.mp3";
        controller.file = [file];

        controller.ok();

        expect(upload.upload).toHaveBeenCalled();

        var uploadArgs = upload.upload.calls.mostRecent().args[0];

        expect(uploadArgs.file).toBe(file);
        expect(uploadArgs.data.uuid).toBe("existing-sound-uuid");
    });

    it("should allow metadata-only edits without uploading a replacement file", function () {
        controller.metadata.uuid = "existing-sound-uuid";
        controller.metadata.filename = "original.mp3";
        controller.metadata.title = "Updated sound title";
        controller.file = null;

        controller.ok();

        expect(controller.error).toBeNull();
        expect(upload.upload).toHaveBeenCalled();

        var uploadArgs = upload.upload.calls.mostRecent().args[0];

        expect(uploadArgs.file).toBeNull();
        expect(uploadArgs.data.uuid).toBe("existing-sound-uuid");
        expect(uploadArgs.data.title).toBe("Updated sound title");
    });

    it("should reject an oversized replacement file", function () {
        controller.metadata.uuid = "existing-sound-uuid";
        controller.metadata.filename = "original.mp3";
        controller.file = [{
            name: "too-large.wav",
            size: 5010000,
            type: "audio/wav"
        }];

        controller.ok();

        expect(controller.error).toBe(
            "The sound file exceeds the maximum size of 5.0 MB."
        );

        expect(upload.upload).not.toHaveBeenCalled();
    });
});
