package au.org.ala.profile.hub

import javax.xml.transform.OutputKeys
import javax.xml.transform.sax.SAXTransformerFactory
import javax.xml.transform.sax.TransformerHandler
import javax.xml.transform.stream.StreamResult

import org.apache.tika.config.TikaConfig
import org.apache.tika.metadata.Metadata
import org.apache.tika.parser.AutoDetectParser
import org.apache.tika.parser.ParseContext
import org.apache.tika.parser.Parser

class TikaService {

    static transactional = false

    /**
     * Parse a file and return the content and metadata that Apache Tika has found
     * through its parsers as an XML string.
     * @param file the file to parse
     * @param tikaConfig a TikaConfig instance
     * @param metadata a TikaMetadata instance
     * @return an XML string which contains an XHTML document with metadata in the head and
     * content data in the body section.
     */
    String parseFile(File file, TikaConfig tikaConfig, Metadata metadata){
        SAXTransformerFactory factory = SAXTransformerFactory.newInstance()
        TransformerHandler handler = factory.newTransformerHandler()
        handler.transformer.setOutputProperty(OutputKeys.METHOD, "xml")
        handler.transformer.setOutputProperty(OutputKeys.INDENT, "yes")

        StringWriter sw = new StringWriter()
        handler.result = new StreamResult(sw)

        Parser parser = new AutoDetectParser(tikaConfig)
        ParseContext pc = new ParseContext()
        try {
            parser.parse(new FileInputStream(file), handler, metadata, pc)
            return sw.toString()
        } catch (Exception e) {
            log.error("Failed to parse file ${file.absolutePath}", e)
            throw e
        }
    }

    /**
     * Parse a file and return the content and metadata that Apache Tika has found
     * through its parsers as an XML string.
     * @param file the file to parse - Tika will employ a heuristic to determine
     * the correct format. If this fails, use supply a tikaConfig and metadata parameter
     * to the parseFile method.
     * @return an XML string which contains an XHTML document with metadata in the head and
     * content data in the body section.
     */
    String parseFile(File file){
        TikaConfig tikaConfig = new TikaConfig()
        Metadata tikaMeta = new Metadata()
        return parseFile(file, tikaConfig, tikaMeta)
    }
}
