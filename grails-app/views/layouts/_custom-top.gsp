<head>
    <base href="${request.contextPath}/">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="-1">
    <meta name="app.version" content="${g.meta(name: 'info.app.version')}"/>
    <meta name="description" content="Atlas of Living Australia"/>
    <meta name="author" content="Atlas of Living Australia">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="http://www.ala.org.au/wp-content/themes/ala2011/images/favicon.ico" rel="shortcut icon"
          type="image/x-icon"/>
    <title><g:layoutTitle/></title>
    <g:layoutHead/>
    <asset:stylesheet href="application.css" />
    <link rel="stylesheet" href="${createLink(controller: "stylesheet", action:"opus", id: "${opus?.uuid ?: ''}", params:[ver: o.cacheBuster(opus: opus)] )}" />
    <asset:javascript src="head.js" />
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    %{-- Fathom analytics  --}%
    <script src="https://cdn.usefathom.com/script.js" data-site="${grailsApplication.config.getProperty('fathom.site-id')}" defer></script>
    %{-- End Fathom analytics  --}%
</head>

<body id="${pageProperty(name: 'body.id')}" class="${request.forwardURI?.endsWith("update")?'':'public'}" onload="${pageProperty(name: 'body.onload')}" ng-app="profileEditor">

<ala:systemMessage/>

<div ng-controller="CustomAlertController" id="timeoutAlert" class="genericAlert">
    <alert ng-repeat="alert in alerts" type="{{alert.type}}" close="closeAlert($index)" ng-cloak>{{alert.msg}}</alert>
</div>

<div ng-controller="StayOnAlertController" id="stayOnAlert" class="genericAlert">
    <alert ng-repeat="alert in alerts" type="{{alert.type}}" close="closeAlert($index)" ng-cloak>{{alert.msg}}</alert>
</div>


<!-- Navbar -->
<nav class="navbar navbar-expand-md navbar-light bg-light" id="primary-nav">
    <div class="container">
        <button type="button" class="navbar-toggler" data-bs-toggle="collapse"
                data-bs-target="#bs-example-navbar-collapse-1"
                aria-controls="bs-example-navbar-collapse-1"
                aria-expanded="false"
                aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="navbar-nav me-auto bold">
                <g:if test="${opusUrl}">
                    <li class="nav-item ${pageName=='opus'?'active':''}">
                        <a class="nav-link" href="${opusUrl}">Home</a>
                    </li>
                </g:if>
                <g:if test="${browseUrl}">
                    <li class="nav-item ${pageName=='browse'?'active':''}">
                        <a class="nav-link" href="${browseUrl}">Browse</a>
                    </li>
                </g:if>
                <g:if test="${filterUrl}">
                    <li class="nav-item ${pageName=='filter'?'active':''}">
                        <a class="nav-link" href="${filterUrl}">Filter<g:if test="${hasFilter}"> <span class="filter-indicator" title="You currently have a filter applied to ${opus.shortName ?: opus.uuid}">◉</span></g:if></a>
                    </li>
                </g:if>
                <g:if test="${glossaryUrl}">
                    <li class="nav-item ${pageName=='glossary'?'active':''}">
                        <a class="nav-link" href="${glossaryUrl}" target="glossary">Glossary</a>
                    </li>
                </g:if>
                <g:if test="${glossaryUrl}">
                    <li class="nav-item ${pageName=='about'?'active':''}">
                        <a class="nav-link" href="${aboutPageUrl}">About&nbsp;&nbsp;</a>
                    </li>
                </g:if>
            </ul>

            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><delegated-search></delegated-search></li>
                <g:render template="/layouts/login"/>
                <li class="nav-item"><p:help help-id="main" collection-override="${helpLink}"/></li>
            </ul>
        </div>
    </div>
</nav>