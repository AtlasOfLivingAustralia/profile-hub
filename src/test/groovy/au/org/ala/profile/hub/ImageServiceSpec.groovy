package au.org.ala.profile.hub


import grails.testing.services.ServiceUnitTest
import junit.framework.TestCase
import org.apache.http.HttpStatus
import org.springframework.web.multipart.MultipartFile
import spock.lang.Specification

class ImageServiceSpec extends Specification implements ServiceUnitTest<ImageService>{

    ImageService imageService
    BiocacheService biocacheService
    ProfileService profileService
    MultipartFile dummyFile
    MultipartFileTransferrableAdapter dummyFileTransferrable

    String testId = UUID.randomUUID().toString()

    def setup() {
        String path = System.getProperty("java.io.tmpdir")
        if (!path.endsWith("/")) {
            path += "/"
        }
        grailsApplication.config.image.staging.dir = "${path}${testId}"
        new File("${grailsApplication.config.image.staging.dir}").mkdir()

        println "Test files will be written to ${grailsApplication.config.image.staging.dir}"

        biocacheService = Mock(BiocacheService)
        profileService = Mock(ProfileService)
        imageService = new ImageService()
        imageService.biocacheService = biocacheService
        imageService.profileService = profileService
        imageService.grailsApplication = grailsApplication

        dummyFile = Mock(MultipartFile)
        dummyFile.getName() >> "image.jpg"
        dummyFile.getOriginalFilename() >> "image.jpg"
        dummyFileTransferrable = new MultipartFileTransferrableAdapter(multipartFile: dummyFile)
    }

    def cleanup() {
        println "Deleting test directory ${grailsApplication.config.image.staging.dir}"
        boolean deleted = new File("${grailsApplication.config.image.staging.dir}").delete()
        println deleted ? "Succeded" : "Failed"
    }

    def "uploadImage should send the image to the biocache immediately if the profile is not in draft mode"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [privateMode: false], opus: [usePrivateRecordData:false]]

        when:
        imageService.uploadImage("contextPath", "opusId", "profileId", "dataResourceId", [:], dummyFileTransferrable)

        then:
        1 * biocacheService.uploadImage(_, _, _, _, _, _) >> [:]
    }

    def "uploadImage should move the image to the staging directory and invoke profileService.recordStagedImage if the profile is in draft mode"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1", privateMode: true], opus: [uuid: "opus1"]]

        when:
        imageService.uploadImage("contextPath", "opusId", "profileId", "dataResourceId", [:], dummyFileTransferrable)

        then:
        1 * dummyFile.transferTo(_) // the actual destination file is randomly named, so we can't check the path
        1 * profileService.recordStagedImage(_, _, _)
        0 * biocacheService.uploadImage(_, _, _, _, _, _)
    }

    def "deleteStagedImage should do nothing if the profile has no staged images"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1", privateMode: true]]

        when:
        boolean deleted = imageService.deleteStagedImage("opusId", "profileId", "imageId")

        then:
        deleted == false
        0 * profileService.recordStagedImage(_, _, _)
    }

    def "deleteStagedImage should delete the image file, and invoke profileService.recordStagedImage"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1", stagedImages: [[imageId: "image1", originalFileName: "image1.jpg"], [imageId: "image2", originalFileName: "image2.jpg"]]]]
        File stagedDir = new File("${grailsApplication.config.image.staging.dir}/profile1")
        stagedDir.mkdir()
        File stagedFile1 = new File("${grailsApplication.config.image.staging.dir}/profile1/image1.jpg")
        File stagedFile2 = new File("${grailsApplication.config.image.staging.dir}/profile1/image2.jpg")
        stagedFile1.createNewFile()
        stagedFile2.createNewFile()

        expect:
        new File("${grailsApplication.config.image.staging.dir}/profile1").list().size() == 2

        when:
        boolean deleted = imageService.deleteStagedImage("opusId", "profileId", "image1")

        then:
        deleted == true
        1 * profileService.recordStagedImage(_, _, _)
        new File("${grailsApplication.config.image.staging.dir}/profile1").list().size() == 1
    }

    def "deleteStagedImage should delete the profile's temp dir if there are no more staged images"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1", stagedImages: [[imageId: "image1", originalFileName: "image1.jpg"]]]]
        File stagedDir = new File("${grailsApplication.config.image.staging.dir}/profile1")
        stagedDir.mkdir()
        File stagedFile1 = new File("${grailsApplication.config.image.staging.dir}/profile1/image1.jpg")
        stagedFile1.createNewFile()

        expect:
        new File("${grailsApplication.config.image.staging.dir}/profile1").list().size() == 1

        when:
        boolean deleted = imageService.deleteStagedImage("opusId", "profileId", "image1")

        then:
        deleted == true
        1 * profileService.recordStagedImage(_, _, _)
        new File("${grailsApplication.config.image.staging.dir}/profile1").exists() == false
    }

    def "retrieveImages should fetch images from the biocache"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1"], opus: [:]]

        List<Map> image1Metadata = [[title: "image 1"]]
        List<Map> image2Metadata = [[title: "image 2"]]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: [
                [image: "image1", uuid: "occurrenceId1", largeImageUrl: "largeUrl1", thumbnailUrl: "thumbnailUrl1", dataResourceName: "resource1", imageMetadata: image1Metadata],
                [image: "image2", uuid: "occurrenceId2", largeImageUrl: "largeUrl2", thumbnailUrl: "thumbnailUrl2", dataResourceName: "resource2", imageMetadata: image2Metadata]
        ], privateImages                                                                         : []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "image1"
        result.resp[0].occurrenceId == "occurrenceId1"
        result.resp[0].dataResourceName == "resource1"
        result.resp[0].largeImageUrl == "largeUrl1"
        result.resp[0].thumbnailUrl == "thumbnailUrl1"
        result.resp[0].metadata == image1Metadata[0]
        result.resp[0].type == ImageType.OPEN
        result.resp[1].imageId == "image2"
        result.resp[1].occurrenceId == "occurrenceId2"
        result.resp[1].dataResourceName == "resource2"
        result.resp[1].largeImageUrl == "largeUrl2"
        result.resp[1].thumbnailUrl == "thumbnailUrl2"
        result.resp[1].metadata == image2Metadata[0]
        result.resp[1].type == ImageType.OPEN
    }

    def "retrieveImages should fetch staged images if the profile is in draft mode"() {
        setup:
        Map stagedImage1 = [imageId: "staged1", originalFileName: "staged1.jpg", title: "staged image 1"]
        Map stagedImage2 = [imageId: "staged2", originalFileName: "staged2.jpg", title: "staged image 2"]

        profileService.getProfile(_, _, _) >> [opus: [uuid: "opusId", title: "opus title"], profile: [uuid: "profileId", privateMode: true, stagedImages: [
                stagedImage1, stagedImage2
        ], privateImages                                                                                  : []]]

        List<Map> image1Metadata = [[title: "image 1"]]
        List<Map> image2Metadata = [[title: "image 2"]]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: [
                [image: "image1", uuid: "occurrenceId1", largeImageUrl: "largeUrl1", thumbnailUrl: "thumbnailUrl1", dataResourceName: "resource1", imageMetadata: image1Metadata],
                [image: "image2", uuid: "occurrenceId2", largeImageUrl: "largeUrl2", thumbnailUrl: "thumbnailUrl2", dataResourceName: "resource2", imageMetadata: image2Metadata]
        ]]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 4
        result.resp[0].imageId == "staged1"
        result.resp[0].dataResourceName == "opus title"
        result.resp[0].largeImageUrl == "/opus/opusId/profile/profileId/image/staged1.jpg?type=STAGED"
        result.resp[0].thumbnailUrl == "/opus/opusId/profile/profileId/image/thumbnail/staged1.jpg?type=STAGED"
        result.resp[0].metadata == stagedImage1
        result.resp[0].type == ImageType.STAGED
        result.resp[1].imageId == "staged2"
        result.resp[1].dataResourceName == "opus title"
        result.resp[1].largeImageUrl == "/opus/opusId/profile/profileId/image/staged2.jpg?type=STAGED"
        result.resp[1].thumbnailUrl == "/opus/opusId/profile/profileId/image/thumbnail/staged2.jpg?type=STAGED"
        result.resp[1].metadata == stagedImage2
        result.resp[1].type == ImageType.STAGED

        result.resp[2].imageId == "image1"
        result.resp[2].occurrenceId == "occurrenceId1"
        result.resp[2].dataResourceName == "resource1"
        result.resp[2].largeImageUrl == "largeUrl1"
        result.resp[2].thumbnailUrl == "thumbnailUrl1"
        result.resp[2].metadata == image1Metadata[0]
        result.resp[2].type == ImageType.OPEN
        result.resp[3].imageId == "image2"
        result.resp[3].occurrenceId == "occurrenceId2"
        result.resp[3].dataResourceName == "resource2"
        result.resp[3].largeImageUrl == "largeUrl2"
        result.resp[3].thumbnailUrl == "thumbnailUrl2"
        result.resp[3].metadata == image2Metadata[0]
        result.resp[3].type == ImageType.OPEN


    }

    def "retrieveImages should not fetch staged images if the profile is not in draft mode"() {
        setup:
        Map stagedImage1 = [imageId: "staged1", originalFileName: "staged1.jpg", title: "staged image 1"]
        Map stagedImage2 = [imageId: "staged2", originalFileName: "staged2.jpg", title: "staged image 2"]

        profileService.getProfile(_, _, _) >> [opus: [title: "opus title"], profile: [uuid: "profileId", privateMode: false, stagedImages: [
                stagedImage1, stagedImage2
        ], privateImages                                                                  : []]]

        Map image1Metadata = [title: "image 1"]
        Map image2Metadata = [title: "image 2"]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: [
                [image: "image1", uuid: "occurrenceId1", largeImageUrl: "largeUrl1", thumbnailUrl: "thumbnailUrl1", dataResourceName: "resource1", imageMetadata: image1Metadata],
                [image: "image2", uuid: "occurrenceId2", largeImageUrl: "largeUrl2", thumbnailUrl: "thumbnailUrl2", dataResourceName: "resource2", imageMetadata: image2Metadata]
        ]]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "image1"
        result.resp[1].imageId == "image2"
    }

    def "retrieveImages should fetch staged images even if there are no biocache images"() {
        setup:
        Map stagedImage1 = [imageId: "staged1", originalFileName: "staged1.jpg", title: "staged image 1"]
        Map stagedImage2 = [imageId: "staged2", originalFileName: "staged2.jpg", title: "staged image 2"]

        profileService.getProfile(_, _, _) >> [opus: [title: "opus title"], profile: [uuid: "profileId", privateMode: true, stagedImages: [
                stagedImage1, stagedImage2
        ], privateImages                                                                  : []]]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "staged1"
        result.resp[1].imageId == "staged2"
    }

    def "retrieveImages should set the primary flag for staged images"() {
        setup:
        Map stagedImage1 = [imageId: "staged1", originalFileName: "staged1.jpg", title: "staged image 1"]
        Map stagedImage2 = [imageId: "staged2", originalFileName: "staged2.jpg", title: "staged image 2"]

        profileService.getProfile(_, _, _) >> [opus: [title: "opus title"], profile: [uuid: "profileId", privateMode: true, stagedImages: [
                stagedImage1, stagedImage2
        ], privateImages                                                                  : [], primaryImage: "staged1"]]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "staged1"
        result.resp[0].primary == true
        result.resp[1].imageId == "staged2"
        result.resp[1].primary == false
    }

    def "retrieveImages should set the display option for staged images"() {
        setup:
        Map stagedImage1 = [imageId: "staged1", originalFileName: "staged1.jpg", title: "staged image 1"]
        Map stagedImage2 = [imageId: "staged2", originalFileName: "staged2.jpg", title: "staged image 2"]

        profileService.getProfile(_, _, _) >> [
                opus   : [title: "opus title"],
                profile: [uuid         : "profileId", privateMode: true, stagedImages: [stagedImage1, stagedImage2],
                          privateImages: [], primaryImage: "staged1",
                          imageSettings: [
                                  [imageId: "staged1", displayOption: "INCLUDE"],
                                  [imageId: "staged2", displayOption: "INCLUDE"]
                          ]
                ]
        ]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "staged1"
        result.resp[0].displayOption == "INCLUDE"
        result.resp[1].imageId == "staged2"
        result.resp[1].displayOption == "INCLUDE"
    }

    def "retrieveImages should set the primary flag for private images"() {
        setup:
        Map privateImage1 = [imageId: "private1", originalFileName: "private1.jpg", title: "private image 1"]
        Map privateImage2 = [imageId: "private2", originalFileName: "private2.jpg", title: "private image 2"]

        profileService.getProfile(_, _, _) >> [opus: [title: "opus title"], profile: [uuid: "profileId", privateMode: true, privateImages: [
                privateImage1, privateImage2
        ], stagedImages                                                                   : [], primaryImage: "private1"]]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "private1"
        result.resp[0].primary == true
        result.resp[1].imageId == "private2"
        result.resp[1].primary == false
    }

    def "retrieveImages should set the display option for private images"() {
        setup:
        Map privateImage1 = [imageId: "private1", originalFileName: "private1.jpg", title: "private image 1"]
        Map privateImage2 = [imageId: "private2", originalFileName: "private2.jpg", title: "private image 2"]

        profileService.getProfile(_, _, _) >> [
                opus   : [title: "opus title"],
                profile: [uuid         : "profileId", privateMode: true, privateImages: [privateImage1, privateImage2],
                          stagedImages : [], primaryImage: "private1",
                          imageSettings: [
                                  [imageId: "private1", displayOption: "INCLUDE"],
                                  [imageId: "private2", displayOption: "INCLUDE"]
                          ]
                ]
        ]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "private1"
        result.resp[0].displayOption == "INCLUDE"
        result.resp[1].imageId == "private2"
        result.resp[1].displayOption == "INCLUDE"
    }

    def "retrieveImages should set the primary flag for biocache images"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1", primaryImage: "image1", privateImages: []], opus: [:]]

        Map image1Metadata = [title: "image 1"]
        Map image2Metadata = [title: "image 2"]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: [
                [image: "image1", uuid: "occurrenceId1", largeImageUrl: "largeUrl1", thumbnailUrl: "thumbnailUrl1", dataResourceName: "resource1", imageMetadata: image1Metadata],
                [image: "image2", uuid: "occurrenceId2", largeImageUrl: "largeUrl2", thumbnailUrl: "thumbnailUrl2", dataResourceName: "resource2", imageMetadata: image2Metadata]
        ], privateImages                                                                         : []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "image1"
        result.resp[0].primary == true
        result.resp[1].imageId == "image2"
        result.resp[1].primary == false
    }

    def "retrieveImages should set the display option for biocache images"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1", primaryImage: "image1", privateImages: [], imageSettings: [[imageId: "image1", displayOption: "INCLUDE"], [imageId: "image2", displayOption: "INCLUDE"]]], opus: [:]]

        Map image1Metadata = [title: "image 1"]
        Map image2Metadata = [title: "image 2"]

        biocacheService.retrieveImages(_, _) >> [statusCode: HttpStatus.SC_OK, resp: [occurrences: [
                [image: "image1", uuid: "occurrenceId1", largeImageUrl: "largeUrl1", thumbnailUrl: "thumbnailUrl1", dataResourceName: "resource1", imageMetadata: image1Metadata],
                [image: "image2", uuid: "occurrenceId2", largeImageUrl: "largeUrl2", thumbnailUrl: "thumbnailUrl2", dataResourceName: "resource2", imageMetadata: image2Metadata]
        ], privateImages                                                                         : []]]

        when:
        Map result = imageService.retrieveImages("opusId", "profileId", true, "search string")

        then:
        result.resp.size() == 2
        result.resp[0].imageId == "image1"
        result.resp[0].displayOption == "INCLUDE"
        result.resp[1].imageId == "image2"
        result.resp[1].displayOption == "INCLUDE"
    }

    def "publishImage should do nothing if there are no staged images"() {
        setup:
        profileService.getProfile(_, _, _) >> [profile: [uuid: "profile1"]]

        when:
        imageService.publishStagedImages("opusId", "profileId")

        then:
        0 * profileService.updateProfile(_, _, _, _)
        0 * biocacheService.uploadImage(_, _, _, _, _)
        0 * profileService.recordStagedImage(_, _, _)
    }

    def "publishImages should upload images to the biocache and delete the staged files"() {
        setup:
        profileService.getProfile(_, _, _) >> [opus: [dataResourceUid: "dr1", usePrivateRecordData:false],
                                               profile: [uuid: "profile1", stagedImages: [
                [imageId: "image1", originalFileName: "image1.jpg"],
                [imageId: "image2", originalFileName: "image2.jpg"]
        ]]]

        File stagedDir = new File("${grailsApplication.config.image.staging.dir}/profile1")
        stagedDir.mkdir()
        File stagedFile1 = new File("${grailsApplication.config.image.staging.dir}/profile1/image1.jpg")
        File stagedFile2 = new File("${grailsApplication.config.image.staging.dir}/profile1/image2.jpg")
        stagedFile1.createNewFile()
        stagedFile2.createNewFile()

        expect:
        new File("${grailsApplication.config.image.staging.dir}/profile1").list().size() == 2

        when:
        imageService.publishStagedImages("opusId", "profile1")

        then:
        imageService.biocacheService.uploadImage(_,_,_,_,_,_) >> [statusCode: 201, resp: ['images':'123']]
        2 * profileService.recordStagedImage(_, _, _)
        TestCase.assertFalse ("Staged images were not removed after upload",new File("${grailsApplication.config.image.staging.dir}/profile1").exists())
    }

    def "publishImages should replace the staged id with a permanent id for the primary image if it was a staged image"() {
        setup:
        profileService.getProfile(_, _, _) >> [opus: [dataResourceUid: "dr1", usePrivateRecordData:false], profile: [uuid: "profile1", stagedImages: [
                [imageId: "image1", originalFileName: "image1.jpg"],
                [imageId: "image2", originalFileName: "image2.jpg"]
        ], primaryImage                                                                      : "image1"]]
        File stagedDir = new File("${grailsApplication.config.image.staging.dir}/profile1")
        stagedDir.mkdir()
        File stagedFile1 = new File("${grailsApplication.config.image.staging.dir}/profile1/image1.jpg")
        File stagedFile2 = new File("${grailsApplication.config.image.staging.dir}/profile1/image2.jpg")
        stagedFile1.createNewFile()
        stagedFile2.createNewFile()

        biocacheService.uploadImage(_, _, _, stagedFile1, _, _) >> [statusCode: 201, resp: [images: ["permId1"]]]
        biocacheService.uploadImage(_, _, _, stagedFile2, _, _) >> [statusCode: 201,resp: [images: ["permId2"]]]

        expect:
        new File("${grailsApplication.config.image.staging.dir}/profile1").list().size() == 2

        Map expectedUpdates = [primaryImage: "permId1"]

        when:
        imageService.publishStagedImages("opusId", "profile1")

        then:
        1 * profileService.updateProfile(_, _, expectedUpdates, true)
    }


    def "publishImages should not crash if the images do not have any metadata"() {
        setup:
        profileService.getProfile(_, _, _) >> [opus: [dataResourceUid: "dr1", usePrivateRecordData:false], profile: [uuid: "profile1", stagedImages: [
                [imageId: "image2", originalFileName: "image2.jpg"]
        ]]]
        File stagedDir = new File("${grailsApplication.config.image.staging.dir}/profile1")
        stagedDir.mkdir()
        File stagedFile1 = new File("${grailsApplication.config.image.staging.dir}/profile1/image1.jpg")
        File stagedFile2 = new File("${grailsApplication.config.image.staging.dir}/profile1/image2.jpg")
        stagedFile1.createNewFile()
        stagedFile2.createNewFile()

        expect:
        new File("${grailsApplication.config.image.staging.dir}/profile1").list().size() == 2

        when:
        imageService.publishStagedImages("opusId", "profile1")

        then:
        imageService.biocacheService.uploadImage(_,_,_,_,_,_) >> [statusCode: 201, resp: ['images':['123']]]
        1 * profileService.recordStagedImage(_, _, _)
        TestCase.assertFalse("Something went wrong when an image has no metadata",new File("${grailsApplication.config.image.staging.dir}/profile1/image2.jpg").exists())
  }
}
