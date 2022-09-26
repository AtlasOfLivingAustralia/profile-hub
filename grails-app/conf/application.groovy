import java.text.SimpleDateFormat

grails.project.groupId = 'au.org.ala' // change this to alter the default package name and Maven publishing destination

// The ACCEPT header will not be used for content negotiation for user agents containing the following strings (defaults to the 4 major rendering engines)
grails.mime.disable.accept.header.userAgents = []

// URL Mapping Cache Max Size, defaults to 5000
//grails.urlmapping.cache.maxsize = 1000

// Legacy setting for codec used to encode data with ${}
grails.views.default.codec = "html"

// when patterns are added below, make sure build.gradle is updated as well.
grails.assets.minifyOptions.excludes = ["**/*.min.js", "ckeditor/plugins/symbol/dialogs/lang/en.js"]
grails.assets.excludes = ["webjars/leaflet/0.7.7/**/*.*"]
grails.assets.includes = ["webjars/leaflet/0.7.7/dist/*.*"]

// The default scope for controllers. May be prototype, session or singleton.
// If unspecified, controllers are prototype scoped.
grails.controllers.defaultScope = 'singleton'

// GSP settings
grails {
    views {
        gsp {
            encoding = 'UTF-8'
            htmlcodec = 'xml' // use xml escaping instead of HTML4 escaping
            codecs {
                expression = 'html' // escapes values inside ${}
                scriptlet = 'html' // escapes output from scriptlets in GSPs
                taglib = 'none' // escapes output from taglibs
                staticparts = 'none' // escapes output from static template parts
            }
        }
        // escapes all not-encoded output at final stage of outputting
        // filteringCodecForContentType.'text/html' = 'html'
    }
}

grails.converters.encoding = "UTF-8"
// scaffolding templates configuration
grails.scaffolding.templates.domainSuffix = 'Instance'

// Set to false to use the new Grails 1.2 JSONBuilder in the render method
grails.json.legacy.builder = false
// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true
// packages to include in Spring bean scanning
grails.spring.bean.packages = []
// whether to disable processing of multi part requests
grails.web.disable.multipart = false

// request parameters to mask when logging exceptions
grails.exceptionresolver.params.exclude = ['password']

layout = 'custom'
skin.fluidLayout = true
app.http.header.userId = "X-ALA-userId"
app.view.nocache = true


environments {
    development {
        grails.logging.jul.usebridge = true
        grails {
            // use something like FakeSMTP locally to test without actually sending emails.
            mail {
                host = "localhost"
                port = 1025
                props = ["mail.debug": "true"]
            }
        }
        security.cas.appServerName='http://devt.ala.org.au:8080'
    }
    test {
        security.cas.appServerName='http://devt.ala.org.au:8080'
        grails.serverURL= "http://devt.ala.org.au:8098"
    }
    production {
        grails.logging.jul.usebridge = false
        grails {
            mail {
                host = "localhost"
                port = 25
                props = ["mail.debug": "false"]
            }
        }
    }
}

jasper.dir.reports = 'classpath:reports'
googleAnalyticsId = 'UA-4355440-1'
doi.resolver.prefix = 'http://dx.doi.org/'

grails.cache.config = {
    provider {
        name "ehcache-profile-hub-" + (new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()))
    }
}