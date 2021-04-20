import grails.util.Environment
import groovy.xml.StreamingMarkupBuilder
import org.apache.catalina.connector.Connector
import org.apache.catalina.startup.Tomcat

import java.text.SimpleDateFormat

def ant = new AntBuilder()

eventCompileEnd = {
    println "\n- Starting JasperReports *.jrxml compilation process..."
    // define the Jasper Reports Compile Task
    ant.taskdef(name:'reportCompile', classname: 'net.sf.jasperreports.ant.JRAntCompileTask', classpath: projectWorkDir)

    // remove existing jasper files
    ant.delete{
        fileset('dir':'grails-app/conf/reports', 'defaultexcludes':'yes'){
            include('name':'**/*.jasper')
        }
    }

    // create a temporary directory for use by the jasper compiler
    ant.mkdir(dir:'target/jasper')

    // compile the reports
    ant.reportCompile(srcdir:'grails-app/conf/reports', destdir:'grails-app/conf/reports', tempdir:'target/jasper', keepJava:true, xmlvalidation:true){
        include(name:'**/*.jrxml')
//        include(name:'**/*.jrtx')
    }
    println "-------\n- JasperReports compilation process finished"
}

eventCreateWarStart = { warName, stagingDir ->
    ant.propertyfile(file: "${stagingDir}/WEB-INF/classes/application.properties") {
        entry(key:"app.build", value: new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new Date()))
    }
}

eventConfigureTomcat = { Tomcat tomcat ->
    if (Environment.current == Environment.DEVELOPMENT) {
        println "### Enabling AJP/1.3 connector"

        def ajpConnector = new Connector("org.apache.coyote.ajp.AjpProtocol")
        ajpConnector.port = 8009
        ajpConnector.protocol = 'AJP/1.3'
        ajpConnector.redirectPort = 8443
        ajpConnector.enableLookups = false
        ajpConnector.URIEncoding = 'UTF-8'
        ajpConnector.setProperty('redirectPort', '8443')
        ajpConnector.setProperty('protocol', 'AJP/1.3')
        ajpConnector.setProperty('enableLookups', 'false')
        ajpConnector.setProperty('URIEncoding', 'UTF-8')
        tomcat.service.addConnector ajpConnector

        println ajpConnector.toString()

        println "### Ending enabling AJP connector"
    }
}

eventWebXmlEnd = { tempFile ->
    println "### Setting HTTP session timeout to 4 hours in ${webXmlFile}"
    def root = new XmlSlurper().parse(webXmlFile)
    root.'session-config'.replaceNode {
        'session-config' { 'session-timeout' (240) }
    }

    webXmlFile.text = new StreamingMarkupBuilder().bind {
        mkp.declareNamespace("": "http://java.sun.com/xml/ns/javaee")
        mkp.yield(root)
    }
}