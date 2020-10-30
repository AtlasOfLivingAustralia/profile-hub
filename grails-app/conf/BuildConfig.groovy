import grails.util.Environment

grails.servlet.version = "3.0" // Change depending on target container compliance (2.5 or 3.0)
grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.work.dir = "target/work"
grails.project.target.level = 1.7
grails.project.source.level = 1.7
grails.reload.enabled = true

grails.project.fork = [
        // configure settings for the test-app JVM, uses the daemon by default
        test   : [maxMemory: 1024, minMemory: 64, debug: false, maxPerm: 256, daemon: true],
        // configure settings for the run-app JVM
        run    : [maxMemory: 2048, minMemory: 64, debug: false, maxPerm: 256, forkReserve: false],
        // configure settings for the run-war JVM
        war    : [maxMemory: 1024, minMemory: 64, debug: false, maxPerm: 256, forkReserve: false],
        // configure settings for the Console UI JVM
        console: [maxMemory: 1024, minMemory: 64, debug: false, maxPerm: 256]
]

//grails.plugin.location."asset-pipeline" = "../../grails-asset-pipeline"
//grails.plugin.location."ala-map" = "../ala-map-plugin"
//grails.plugin.location."ala-ws-plugin" = "../ala-ws-plugin"

grails.project.dependency.resolver = "maven"
grails.project.dependency.resolution = {

    inherits("global") {
        // This is to remove itext conficting version with jasperreports and we don't need that plugin anyway
        excludes "grails-docs"
    }
    log "warn" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    checksums true // Whether to verify checksums on resolve
    legacyResolve false
    // whether to do a secondary resolve on plugin installation, not advised and here for backwards compatibility

    def httpmimeVersion = "4.4.1"

    repositories {
        mavenLocal()
        mavenRepo("http://nexus.ala.org.au/content/groups/public/") {
            updatePolicy 'always'
        }
    }

    management {
        dependency "org.codehaus.groovy.modules.http-builder:http-builder:0.7.1"
        // manage the ecj version for Java 8 compat, this should match the version provided by Jasper
        // TODO remove after Grails 3 upgrade?
        // TODO Maybe a more recent version would be better?
        dependency "org.eclipse.jdt.core.compiler:ecj:4.3.1"
    }

    dependencies {
        build "org.apache.httpcomponents:httpmime:${httpmimeVersion}"
        build "org.apache.httpcomponents:httpcore:${httpmimeVersion}"
        build "org.apache.httpcomponents:httpclient:${httpmimeVersion}"

        compile 'net.sf.ehcache:ehcache:2.8.4'
        runtime "org.springframework:spring-test:4.1.2.RELEASE" // required by the rendering plugin
        runtime 'au.org.ala:image-utils:1.8.2'
        runtime 'org.jsoup:jsoup:1.7.2'

        compile 'net.sf.jasperreports:jasperreports:6.4.1'
        compile 'net.sf.jasperreports:jasperreports-functions:6.4.1'
        compile 'au.org.ala:jasper-liberation-fonts-2.00.1:1.3'
        compile 'net.glxn:qrgen:1.4'
        compile 'org.apache.xmlgraphics:batik-bridge:1.9'
        compile 'org.apache.xmlgraphics:batik-svggen:1.9'
        compile 'com.googlecode.owasp-java-html-sanitizer:owasp-java-html-sanitizer:20160827.1'
        compile 'com.google.guava:guava:19.0'
        compile 'com.google.code.findbugs:jsr305:3.0.1'
        compile 'com.squareup.retrofit2:retrofit:2.2.0'
        compile "org.apache.httpcomponents:httpcore:${httpmimeVersion}"
        compile "org.apache.httpcomponents:httpclient:${httpmimeVersion}"
        compile "org.apache.httpcomponents:httpmime:${httpmimeVersion}"
    }

    plugins {
        build(":release:3.1.2")
        build ":tomcat:7.0.70"

        compile ":mail:1.0.7"
        compile ":cache:1.1.8"
        compile ":cors:1.1.6"
        compile ":csv:0.3.1"
        compile(":ala-map:2.1.8-SNAPSHOT") {
            excludes "resources", "httpclient"
        }
        compile(":ala-ws-plugin:1.6.1") {
            excludes "resources"
        }
        compile(":ala-admin-plugin:1.3") {
            excludes "resources"
        }
        compile ":quartz:1.0.2"

        runtime(":images-client-plugin:0.6.1") {
            excludes "ala-bootstrap3", "resources"
        }
        runtime(":ala-auth:2.1.3") {
            excludes "resources"
        }
        runtime ":tika-parser:1.3.0.1"

        //compile ":twitter-bootstrap:3.3.6"
        runtime ":jquery:1.11.1"
        compile ":asset-pipeline:2.14.1"
        compile ':sass-asset-pipeline:2.7.2' // 2.9+ requires Java 8, TODO upgrade to Java 8
        runtime ":angular-annotate-asset-pipeline:2.4.1"
        runtime ":angular-template-asset-pipeline:2.3.0"

        if (Environment.current == Environment.DEVELOPMENT) {
            compile "org.grails.plugins:console:1.5.11"
        }
    }
}
