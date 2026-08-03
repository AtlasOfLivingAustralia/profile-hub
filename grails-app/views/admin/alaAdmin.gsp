<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.getProperty('layout')}"/>
    <title>Profile Admin</title>
</head>

<body>

<div>
    <g:if test="${flash.message}">
        <div class="alert alert-info">${flash.message}</div>
    </g:if>

    <g:render template="/ala-admin-form" plugin="ala-admin-plugin"/>

</div>
</body>
</html>




