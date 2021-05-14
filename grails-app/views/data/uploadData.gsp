<!DOCTYPE html>
<html>
<head>
    <g:set var="excludeBugherd" value="true" scope="request"/>
    <meta name="layout" content="${grailsApplication.config.layout}"/>
    <title>Upload data</title>
    <asset:javascript src="webcomponentsjs/webcomponents-0.7.24.js"/>
</head>

<body>

<div ng-controller="DataController as dataCtrl" ng-cloak>
    <ol class="breadcrumb" ng-cloak>
        <li><a class="font-xxsmall" href="${request.contextPath}/">Profile Collections</a></li>
        <li><a class="font-xxsmall"
               href="${request.contextPath}/opus/${opusId}">${pageTitle}</a>
        </li>
        <li class="font-xxsmall active">Upload data</li>
    </ol>

    <h1 class="hidden">Welcome to the eFlora website</h1><!-- Show the H1 on each page -->

    <div class="row">
        <div class="col-md-12">
            <h1 class="heading-large">Data upload</h1>

            <p>Upload occurrence data to be used in the ${pageTitle}. Data uploaded this way will only be visible within this collection: no other applications or sites will have access to this data.</p>

            <div class="radio">
                <label for="fileOption" class="inline-label">
                    <input id="fileOption" type="radio" name="file" ng-value="true" ng-change="dataCtrl.dataSourceOptionChanged()"
                           ng-model="dataCtrl.uploadFile" class="ignore-save-warning">
                    Upload an Excel spreadsheet or a CSV file containing your data
                </label>
            </div>

            <div class="radio">
                <label for="paste" class="inline-label">
                    <input id="paste" type="radio" name="paste" ng-value="false" ng-change="dataCtrl.dataSourceOptionChanged()"
                           ng-model="dataCtrl.uploadFile" class="ignore-save-warning">
                    Type or copy & paste comma-separated data
                </label>
            </div>
        </div>
    </div>

    <div class="embedded-sandbox">
        <g:if test="${params.uploadFile?.toBoolean()}">
            <div class="row embedded-sandbox">
                <div class="col-md-12">
                    <g:if test="${!params.fn}">
                        <h2>1. Select your data file</h2>
                        <div class="padding-bottom-1">
                            <span class="btn btn-default btn-file">
                                Choose file
                                <input id="file" type="file" ngf-select="" ng-model="dataCtrl.files" name="file"
                                       alt="Data file" title="Data file">
                            </span>
                            <span class="font-xsmall">{{ dataCtrl.files[0].name }}</span>
                        </div>
                        <button ng-show="dataCtrl.files.length > 0" ng-click="dataCtrl.doUpload()"
                                class="btn btn-primary">Upload</button>
                    </g:if>
                    <g:else>
                        <h2>1. Uploaded file</h2>
                        <web-component
                                url="${grailsApplication.config.sandbox.base.url}${grailsApplication.config.sandbox.context.path}/upload/preview/${params.id}?fn=${params.fn}"
                                content-selectors="#uploadedFileDetails,#recognisedDataDiv,#processSample"
                                exclude-selectors="#optionsAfterDownload,link[href*='bootstrap'],link[href*='jquery'],link[href*='ala-styles']"
                                onload-callback="dataCtrl.fixSandboxUploadUrls">
                        </web-component>
                    </g:else>
                </div>
            </div>
        </g:if>
        <g:else>
            <div class="row embedded-sandbox">
                <div class="col-md-12">
                    <web-component url="${grailsApplication.config.sandbox.base.url}${grailsApplication.config.sandbox.context.path}"
                                   content-selectors="#initialPaste,#recognisedDataDiv,#processSample,#processedData,#jsonBlob"
                                   exclude-selectors="#optionsAfterDownload,link[href*='bootstrap'],link[href*='jquery'],link[href*='ala-styles']"
                                   onload-callback="dataCtrl.fixSandboxUploadUrls">
                    </web-component>
                </div>
            </div>
        </g:else>
    </div>
</div>

</body>
</html>