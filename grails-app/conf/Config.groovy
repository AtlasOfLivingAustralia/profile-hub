import org.apache.log4j.Level

def appName = 'profile-hub'
def ENV_NAME = "${appName.toUpperCase()}_CONFIG"
def default_config = "/data/${appName}/config/${appName}-config.properties"
environments {
    development {
        default_config = "/data/${appName}/config/${appName}-config-grails2.properties"
    }
}

if (!grails.config.locations || !(grails.config.locations instanceof List)) {
    grails.config.locations = []
}
if (System.getenv(ENV_NAME) && new File(System.getenv(ENV_NAME)).exists()) {
    println "[${appName}] Including configuration file specified in environment: " + System.getenv(ENV_NAME);
    grails.config.locations.add "file:" + System.getenv(ENV_NAME)
} else if (System.getProperty(ENV_NAME) && new File(System.getProperty(ENV_NAME)).exists()) {
    println "[${appName}] Including configuration file specified on command line: " + System.getProperty(ENV_NAME);
    grails.config.locations.add "file:" + System.getProperty(ENV_NAME)
} else if (new File(default_config).exists()) {
    println "[${appName}] Including default configuration file: " + default_config;
    grails.config.locations.add "file:" + default_config
} else {
    println "[${appName}] No external configuration file defined."
}

grails.project.groupId = 'au.org.ala' // change this to alter the default package name and Maven publishing destination

// The ACCEPT header will not be used for content negotiation for user agents containing the following strings (defaults to the 4 major rendering engines)
grails.mime.disable.accept.header.userAgents = []
grails.mime.types = [ // the first one is the default format
                      all          : '*/*', // 'all' maps to '*' or the first available format in withFormat
                      atom         : 'application/atom+xml',
                      css          : 'text/css',
                      csv          : 'text/csv',
                      form         : 'application/x-www-form-urlencoded',
                      html         : ['text/html', 'application/xhtml+xml'],
                      js           : 'text/javascript',
                      json         : ['application/json', 'text/json'],
                      multipartForm: 'multipart/form-data',
                      rss          : 'application/rss+xml',
                      text         : 'text/plain',
                      hal          : ['application/hal+json', 'application/hal+xml'],
                      xml          : ['text/xml', 'application/xml'],
                      pdf          : ['application/x-pdf', 'application/pdf']
]

// URL Mapping Cache Max Size, defaults to 5000
//grails.urlmapping.cache.maxsize = 1000

// Legacy setting for codec used to encode data with ${}
grails.views.default.codec = "html"

//grails.assets.bundle=true
grails.assets.minifyOptions.excludes = ["**/*.min.js"]
grails.assets.excludes= ["ckeditor5/node_modules/**", "**/insertimage.js",  "ckeditor5/build/**", "ckeditor5/src/**", "ckeditor5/webpack.config.js"]
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

// configure auto-caching of queries by default (if false you can cache individual queries with 'cache: true')
grails.hibernate.cache.queries = false

// configure passing transaction's read-only attribute to Hibernate session, queries and criterias
// set "singleSession = false" OSIV mode in hibernate configuration after enabling
grails.hibernate.pass.readonly = false
// configure passing read-only to OSIV session by default, requires "singleSession = false" OSIV mode
grails.hibernate.osiv.readonly = false

layout = 'custom'
skin.fluidLayout = true
app.http.header.userId = "X-ALA-userId"
app.view.nocache = true

security {
    cas {
        adminRole='ROLE_ADMIN'
        uriExclusionFilterPattern='/images.*,/css.*,/js.*,/less.*,/assets/.*'
        uriFilterPattern='/admin.*,/.*/update.*,/.*/create.*,/.*/delete.*,/user/.*,/audit/.*,/.*/respond.*,/.*/shareRequest.*'
        authenticateOnlyIfLoggedInPattern='.*'
    }
}

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
        name "ehcache-profile-hub-" + (new Date().format("yyyyMMddHHmmss"))
    }
}

// log4j configuration
def loggingDir = (System.getProperty('catalina.base') ? System.getProperty('catalina.base') + '/logs' : './logs')

log4j = {
    appenders {
        environments {
            production {
                println "Log4j logs will be written to : ${loggingDir}"
                rollingFile name: "tomcatLog", maxFileSize: '1MB', file: "${loggingDir}/${appName}.log", threshold: Level.DEBUG, layout: pattern(conversionPattern: "%d %-5p [%c{1}] %m%n")
            }
            development {
                console name: "stdout", layout: pattern(conversionPattern: "%d %-5p [%c{1}] %m%n"), threshold: Level.TRACE
            }
            test {
                println "Log4j logs will be written to : ${loggingDir}"
                rollingFile name: "tomcatLog", maxFileSize: '1MB', file: "/tmp/${appName}", threshold: Level.DEBUG, layout: pattern(conversionPattern: "%d %-5p [%c{1}] %m%n")
                console name: "stdout", layout: pattern(conversionPattern: "%d %-5p [%c{1}] %m%n"), threshold: Level.DEBUG
            }
        }
    }
    root {
        // change the root logger to my tomcatLog file
        error 'tomcatLog'
        warn 'tomcatLog'
        additivity = true
    }

    error 'au.org.ala.cas.client',
            "au.org.ala",
            'grails.spring.BeanBuilder',
            'grails.plugin.webxml',
            "grails.plugin.mail",
            'grails.plugin.cache.web.filter'

    debug "grails.app",
            "grails.plugin.mail",
            "au.org.ala"

    trace "grails.plugin.mail"
}
