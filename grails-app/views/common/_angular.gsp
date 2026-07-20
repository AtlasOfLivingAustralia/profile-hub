%{--
  Loads the Angular multi-root bundle and exposes page context for bootstrap.
  Include once per page that hosts Angular custom elements.
  Built by: ./gradlew copyAngularAssets
--}%
<%@ page import="groovy.json.JsonOutput" %>
<script type="text/javascript">
    window.profilesAngular = ${raw(JsonOutput.toJson([
            contextPath   : request.contextPath ?: '',
            opusId        : (params.opusId ?: opus?.shortName ?: opus?.uuid ?: '') as String,
            opusUuid      : (opus?.uuid ?: '') as String,
            opusShortName : (opus?.shortName ?: '') as String,
            profileId     : (params.profileId ?: '') as String,
            pageName      : (pageName ?: '') as String,
            edit          : !!edit,
            isOpusAdmin   : !!params.isOpusAdmin,
            isOpusEditor  : !!params.isOpusEditor,
            isOpusAuthor  : !!params.isOpusAuthor,
            isOpusReviewer: !!params.isOpusReviewer,
            isALAAdmin    : !!params.isALAAdmin,
            currentUser   : (params.currentUser ?: '') as String,
            currentUserId : (params.currentUserId ?: '') as String
    ]))};
</script>
<link rel="stylesheet" href="${asset.assetPath(src: 'profiles-angular/styles.css')}"/>
<script type="module" src="${asset.assetPath(src: 'profiles-angular/main.js')}"></script>
