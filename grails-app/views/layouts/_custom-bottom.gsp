<%@ page import="grails.util.Environment" %>
<footer class="main-footer">
    <div class="container margin-bottom-2">
        <div class="main-footer-border"></div>

        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-8 margin-bottom-1 site-logo" id="site-logo">
                <div class="row margin-bottom-1">
                    <g:each in="${logos?:[[logoUrl:asset.assetPath(src: "ala-logo-2016-inline.png")]]}" var="logo">
                        <g:if test="${logo.hyperlink}">
                            <a href="${logo.hyperlink}" target="_blank">
                                <img class="col-xs-12 col-sm-6 col-md-4 img-responsive customizable-logo-img"
                                     src="${logo.logoUrl}"
                                     alt="logo"/>
                            </a>
                        </g:if>
                        <g:else>
                            <img class="col-xs-12 col-sm-6 col-md-4 img-responsive customizable-logo-img"
                                 src="${logo.logoUrl}"
                                 alt="logo"/>
                        </g:else>
                    </g:each>
                </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-4 margin-bottom-1 border-left">
                <div class="row">
                    <div class="col-xs-12 col-md-7">
                        <g:if test="${footerText}">
                            <div class="row margin-bottom-1">
                                <div class="col-xs-12">
                                    <b>${raw(footerText)}</b>
                                </div>
                            </div>
                        </g:if>
                        <g:if test="${contact?.email?.contains('@')}">
                            <div class="row">
                                <div class="col-xs-12">
                                    <a class="soc-envelope" href="${'mailto:' + contact.email}"
                                       title="${'Email this collection'}"
                                       target="_blank"><i class="fa fa-envelope"></i>&nbsp;&nbsp;${contact.email}</a>
                                </div>
                            </div>
                        </g:if>
                        <g:elseif test="${contact?.email}">
                            <div class="row">
                                <div class="col-xs-12">
                                    <a class="soc-envelope" href="${contact.email}"
                                       title="${'Contact the Atlas'}"
                                       target="_blank"><i class="fa fa-globe"></i>&nbsp;&nbsp;Contact the Atlas</a>
                                </div>
                            </div>
                        </g:elseif>
                        <g:if test="${contact?.facebook || contact?.twitter}">
                            <div class="row margin-top-1">
                                <div class="col-xs-12">
                                    <ul class="social list-inline">
                                        <g:if test="${contact.facebook}">
                                            <li><a class="soc-facebook" href="${contact.facebook}"
                                                   title="${opus ? 'Contact this collection via Facebook' : 'Contact the Atlas via Facebook'}"
                                                   target="_blank"><i class="fa fa-facebook"></i></a></li>
                                        </g:if>
                                        <g:if test="${contact.twitter}">
                                            <li><a class="soc-twitter" href="${contact.twitter}"
                                                   title="${opus ? 'Contact this collection via Twitter' : 'Contact the Atlas via Twitter'}"
                                                   target="_blank"><i class="fa fa-twitter"></i></a></li>
                                        </g:if>
                                    </ul>
                                </div>
                            </div>
                        </g:if>
                    </div>
                    <div class="col-xs-12 col-md-5">
                        <g:if test="${opus?.brandingConfig?.issn}">
                            <div class="row margin-bottom-1">
                                <div class="col-xs-12">
                                    <g:render template="/opus/issn" model="${[issn: opus.brandingConfig.issn]}"></g:render>
                                </div>
                            </div>
                        </g:if>
                        <g:if test="${opus?.brandingConfig?.shortLicense}">
                            <div class="row margin-bottom-1">
                                <div class="col-xs-12">
                                    ${raw(opus.brandingConfig.shortLicense)}
                                </div>
                            </div>
                        </g:if>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-12 col-md-5 col-md-offset-7">
                        <div class="row">
                            <div class="col-xs-12">
                                <a href="${createLink(uri: '/')}">Other collections</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>

<asset:script type="text/javascript">
    // show warning if using IE6
    if ($.browser && $.browser.msie && $.browser.version.slice(0, 1) < 11) {
        $('#header').prepend($('<div style="text-align:center;color:red;">WARNING: This page is not compatible with IE10 or below.' +
' Many functions will still work but layout and image transparency will be disrupted.</div>'));
    }
</asset:script>

<asset:script type="text/javascript">
    angular.module('app.config', []).constant('config', {
        contextPath: '${request.contextPath}',
        edit: ${!!edit},
        readonly: ${!edit},
        currentUser: '${params.currentUser}',
        currentUserId: '${params.currentUserId}',
        profileServiceUrl: '${grailsApplication.config.profile.service.url}',
        keybaseProjectUrl: '${grailsApplication.config.keybase.project.lookup}',
        imageServiceUrl: '${grailsApplication.config.images.service.url}',
        bieServiceUrl: '${grailsApplication.config.bie.ws.url}',
        biocacheServiceUrl: '${opus && opus.usePrivateRecordData ? "${request.contextPath}${request.contextPath.endsWith("/") ? '' : '/'}opus/${opus.uuid}" : grailsApplication.config.biocache.base.url}',
        biocacheRecordUrl: '${grailsApplication.config.biocache.base.url}${grailsApplication.config.biocache.occurrence.record.path}',
        nslNameUrl: '${grailsApplication.config.nsl.name.url.prefix}',
        isOpusReviewer: ${!!params.isOpusReviewer},
        isOpusAuthor: ${!!params.isOpusAuthor},
        isOpusEditor: ${!!params.isOpusEditor},
        isOpusAdmin: ${!!params.isOpusAdmin},
        isALAAdmin: ${!!params.isALAAdmin},
        listServiceUrl: '${grailsApplication.config.lists.base.url}',
        masterListType: '${grailsApplication.config.lists.masterlist.type ?: 'PROFILE' }',
        nslServiceUrlPrefix: '${grailsApplication.config.nsl.service.url.prefix}',
        nslNameUrlPrefix: '${grailsApplication.config.nsl.name.url.prefix}',
        nslServiceApniConceptSuffix: '${grailsApplication.config.nsl.service.apni.concept.suffix}',
        features: {publications: '${grailsApplication.config.feature.publications}',
                   imageUpload:'${grailsApplication.config.feature.feature.imageUpload}'},
        map: {mapId: '${grailsApplication.config.map.id}',
              accessKey: '${grailsApplication.config.map.access.key}'},
        bootstrapCssFile: '${assetPath(src: "/bootstrap/css/bootstrap3.3.4.min.css")}',
        imageLoadErrorUrl: '${assetPath(src: "not-available.png")}',
        development: ${Environment.current == Environment.DEVELOPMENT},
        pdfHighThresholdLimit :  '${grailsApplication.config.pdf.highThresholdLimit?:50}',
        facetGroupUrl: '${g.createLink(controller: 'resource', action: 'facets')}'
    });
</asset:script>

<!-- JS resources-->
%{--<r:layoutResources/>--}%
<asset:javascript src="application.js" />
<asset:deferredScripts />

</body>
<script type='text/javascript'>
  <g:if test="${!excludeBugherd && !grailsApplication.config.bugherd.disabled}">
  (function (d, t) {
    var bh = d.createElement(t), s = d.getElementsByTagName(t)[0];
    bh.type = 'text/javascript';
    bh.src = '//www.bugherd.com/sidebarv2.js?apikey=kqamg3xuhww6j6zrpthdmw';
    s.parentNode.insertBefore(bh, s);
  })(document, 'script');
  </g:if>

  // This unsaved changes code relies on AngularJS adding the ng-dirty flag to fields as they are modified.
  $(window).bind('beforeunload', function() {
    var dirty = false;

    $(":not(form).ng-dirty").each(function (index, field) {
      var $field = $(field);

      if (!$field.hasClass("ignore-save-warning") && (!$field.is("div") || ($field.is("div") && $field.hasClass("dirty-check-container"))) && !$field.is("ul") && !$field.closest(".dualmultiselect")) {
        $field.addClass("show-dirty");
        dirty = true;
      }

      // handle CKE Text editors: the input field is a hidden textarea, followed by a number of divs and an iframe
      // with the rendered content. We need to highlight the nested div with the class 'cke_contents'
      if (!$field.hasClass("ignore-save-warning") && $field.is("textarea") && $field.next().hasClass("cke")) {
        $field.next().find(".cke_contents").addClass("show-dirty");
        dirty = true;
      }

      if (!$field.hasClass("ignore-save-warning") && ($field.attr("type") == "checkbox" || $field.attr("type") == "radio")) {
        $field.parent().addClass("show-dirty");
        dirty = true;
      }
    });

    if (dirty) {
      return "You have unsaved changes. These changes will be lost if you navigate away from this page."
    }
  })
</script>
