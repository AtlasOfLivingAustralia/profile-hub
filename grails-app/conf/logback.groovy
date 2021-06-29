import org.springframework.boot.logging.logback.ColorConverter
import org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter

conversionRule 'clr', ColorConverter
conversionRule 'wex', WhitespaceThrowableProxyConverter

// See http://logback.qos.ch/manual/groovy.html for details on configuration
def loggingDir = (System.getProperty('catalina.base') ? System.getProperty('catalina.base') + '/logs' : './logs')
def appName = 'profile-hub'
final TOMCAT_LOG = 'TOMCAT_LOG'
appender(TOMCAT_LOG, ConsoleAppender) {
    encoder(PatternLayoutEncoder) {
        pattern = '%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} ' + // Date
                '%clr(%5p) ' + // Log level
                '%clr(---){faint} %clr([%15.15t]){faint} ' + // Thread
                '%clr(%-40.40logger{39}){cyan} %clr(:){faint} ' + // Logger
                '%m%n%wex' // Message
    }
}

root(INFO, [TOMCAT_LOG])


[
        (OFF): [],
        (ERROR): [
                'au.org.ala.cas.client',
                "au.org.ala",
                'grails.spring.BeanBuilder',
                'grails.plugin.webxml',
                "grails.plugin.mail",
                'grails.plugin.cache.web.filter'
        ],
        (WARN): [
        ],
        (INFO): [
        ],
        (DEBUG): [
//                "grails.app",
//                "grails.plugin.mail",
                "au.org.ala",
                "asset.pipeline"
        ],
        (TRACE): [
//                "grails.plugin.mail"
        ]
].each { level, names -> names.each { name -> logger(name, level) } }
