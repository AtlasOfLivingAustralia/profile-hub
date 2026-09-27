<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="au.org.ala.profile.hub.Utils" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.getProperty('layout')}-nocontainer"/>
    <title>Profile filter | Atlas of Living Australia</title>

</head>

<body>
<g:render template="banner" model="[opus: opus]"/>
<div class="container">
    <g:include controller="opus" action="opusSummaryPanel" params="[opusId: params.opusId]"/>
    <h3>Filter</h3>
    <auth:ifNotLoggedIn>
        <div class="alert alert-warning">
            <i class="fa fa-2x fa-exclamation-triangle"></i> You are not logged in.
            Any filter set will not persist beyond this browser session.
        </div>
    </auth:ifNotLoggedIn>
    <filter-select></filter-select>

</div>
<asset:script type="text/javascript">
    angular.module("profileEditor").constant("filterConfig", {
        opusId: "${params.opusId}",
        lists: ${o.json(value: lists)},
        value: "${florulaListId}"
    });

</asset:script>
</body>

</html>