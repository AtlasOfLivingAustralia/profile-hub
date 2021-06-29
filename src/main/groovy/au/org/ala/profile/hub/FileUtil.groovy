package au.org.ala.profile.hub

import au.com.bytecode.opencsv.CSVReader
import groovy.util.logging.Slf4j
import org.apache.tika.metadata.HttpHeaders
import org.apache.tika.metadata.Metadata
import org.apache.tika.metadata.TikaMetadataKeys
import org.apache.tika.mime.MediaType
import org.apache.tika.parser.AutoDetectParser
import org.apache.tika.parser.ParseContext
import org.apache.tika.parser.Parser
import org.xml.sax.helpers.DefaultHandler

import java.util.jar.JarFile
import java.util.zip.GZIPInputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

@Slf4j
class FileUtil {
    static String detectFormat(file) {
        AutoDetectParser parser = new AutoDetectParser()
        parser.setParsers(new HashMap<MediaType, Parser>())

        Metadata metadata = new Metadata()
        metadata.add(TikaMetadataKeys.RESOURCE_NAME_KEY, file.getName())

        InputStream stream = new FileInputStream(file)
        parser.parse(stream, new DefaultHandler(), metadata, new ParseContext())
        stream.close()

        metadata.get(HttpHeaders.CONTENT_TYPE)
    }

    static Map extractZip(File file) {
        try {
            def todir = file.getParentFile()
            def jar = new JarFile(file)
            def enu = jar.entries()
            if (enu.hasMoreElements()) {
                def entry = enu.nextElement()
                def entryPath = entry.getName()
                def istream = jar.getInputStream(entry)
                def outputFile = new File(todir, entryPath)
                def ostream = new FileOutputStream(outputFile)
                copyStream(istream, ostream)
                ostream.close()
                istream.close()
                [file: outputFile, success: true]
            } else {
                [file: null, success: false, message: "Empty zip file"]
            }
        } catch (Exception e) {
            log.error("Failed to extract ZIP file", e)
            [file: null, success: false, message: "Problem extracting ZIP"]
        }
    }

    static void zipFile(File file) {
        // input file
        FileInputStream input = new FileInputStream(file);

        // out put file
        ZipOutputStream output = new ZipOutputStream(new FileOutputStream(file.getAbsolutePath() + ".zip"))

        // name the file inside the zip  file
        output.putNextEntry(new ZipEntry(file.getName()))

        // buffer size
        byte[] b = new byte[1024]
        int count = -1

        while ((count = input.read(b)) > 0) {
            output.write(b, 0, count);
        }

        output.close()
        input.close()
    }

    static Map extractGZip(File file) {
        GZIPInputStream istream = null
        FileOutputStream ostream = null
        Map result = null
        try {
            String basename = file.getName().substring(0, file.getName().lastIndexOf("."))
            File todir = file.getParentFile()
            istream = new GZIPInputStream(new FileInputStream(file))
            File outputFile = new File(todir, basename)
            ostream = new FileOutputStream(outputFile)
            copyStream(istream, ostream)
            result = [file: outputFile, success: true]
        } catch (Exception e) {
            log.error("Failed to extract GZIP file", e)
            result = [file: null, success: false, message: "Problem extracting GZIP"]
        } finally {
            ostream?.close()
            istream?.close()
        }

        result
    }

    static void copyStream(istream, ostream) {
        byte[] bytes = new byte[1024]
        int len = -1
        while ((len = istream.read(bytes, 0, 1024)) != -1) {
            ostream.write(bytes, 0, len)
        }
    }

    static CSVReader getCSVReaderForText(String raw) {
        String separator = getSeparator(raw)
        CSVReader csvReader = new CSVReader(new StringReader(raw), separator.charAt(0))
        csvReader
    }

    static String getSeparator(String raw) {
        int tabs = raw.count("\t")
        int commas = raw.count(",")

        String separator = null
        if (tabs > commas) {
            separator = '\t'
        } else if (commas) {
            separator = ','
        }

        separator
    }
}
