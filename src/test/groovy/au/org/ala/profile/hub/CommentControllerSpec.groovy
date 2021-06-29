package au.org.ala.profile.hub

import au.org.ala.web.AuthService
import grails.converters.JSON
import grails.testing.web.controllers.ControllerUnitTest
import org.apache.http.HttpStatus
import spock.lang.Specification

class CommentControllerSpec extends Specification implements ControllerUnitTest<CommentController>{

    ProfileService profileService
    CommentController controller

    def setup() {
        profileService = Mock(ProfileService)
        controller = new CommentController();

        controller.profileService = profileService
        controller.authService = Mock(AuthService)
        controller.authService.getUserId() >> "1234"
    }

    def "checkCommentPermissions should return true if the user is an admin"() {
        when:
        params.isOpusAdmin = true

        then:
        controller.checkCommentPermissions("", "")
    }

    def "checkCommentPermissions should return true if the user is an author"() {
        when:
        params.isOpusAuthor = true

        then:
        controller.checkCommentPermissions("", "")
    }

    def "checkCommentPermissions should return true if the user is an reviewer and authored the comment"() {
        when:
        profileService.getComment(_, _, _) >> [resp: [author: [userId: "1234"]]]
        params.isOpusReviewer = true

        then:
        controller.checkCommentPermissions("", "")
    }

    def "checkCommentPermissions should return false if the user is an admin review but did not author the comment"() {
        when:
        profileService.getComment(_, _, _) >> [resp: [author: [userId: "9876"]]]
        params.isOpusReviewer = true

        then:
        !controller.checkCommentPermissions("", "")
    }

    def "checkCommentPermissions should return false if the user is not a reviewer"() {
        when:
        boolean allowed = controller.checkCommentPermissions("", "")

        then:
        !allowed
    }

    def "updateComment should return a 401 NOT AUTHORISED if the user is not allowed to delete the comment"() {
        given:
        profileService.getComment(_, _, _) >> [resp: [author: [userId: "9876"]]]

        when:
        params.profileId = "profileId"
        params.commentId = "commentId"
        request.json = [a:"b"] as JSON
        controller.updateComment()

        then:
        response.status == HttpStatus.SC_UNAUTHORIZED
    }
}
