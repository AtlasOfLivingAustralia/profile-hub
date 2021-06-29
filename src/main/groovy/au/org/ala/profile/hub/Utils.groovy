package au.org.ala.profile.hub


import org.apache.http.HttpStatus
import org.apache.tika.config.TikaConfig
import org.apache.tika.mime.MimeTypeException

import java.nio.file.Files
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.regex.Matcher
import java.util.regex.Pattern

import static com.google.common.net.UrlEscapers.urlFragmentEscaper
import static com.google.common.net.UrlEscapers.urlPathSegmentEscaper

class Utils {
    static final String UUID_REGEX_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
    /** Regex used to parse content-disposition headers */
    private static final Pattern CONTENT_DISPOSITION_PATTERN = Pattern.compile(/filename\s*=\s*"([^"]*)"/)

    static String getCCLicenceIcon(String ccLicence) {
        String icon

        switch (ccLicence) {
            case "Creative Commons Attribution":
                icon = "https://licensebuttons.net/l/by/4.0/80x15.png"
                break
            case "Creative Commons Attribution-Noncommercial":
                icon = "https://licensebuttons.net/l/by-nc/3.0/80x15.png"
                break
            case "Creative Commons Attribution-Share Alike":
                icon = "https://licensebuttons.net/l/by-sa/3.0/80x15.png"
                break
            case "Creative Commons Attribution-Noncommercial-Share Alike":
                icon = "https://licensebuttons.net/l/by-nc-sa/3.0/80x15.png"
                break
            default:
                icon = "https://licensebuttons.net/l/by/4.0/80x15.png"
        }

        icon
    }

    static String getContentType(File file) {
        def result = Files.probeContentType(file.toPath())
        if (!result) {
            // take an educated guess (maybe use tika instead?)
            def name = file.name
            if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.jpe')) {
                result = 'image/jpeg'
            } else if (name.endsWith('.png')) {
                result = 'image/png'
            } else if (name.endsWith('.gif')) {
                result = 'image/gif'
            } else if (name.endsWith('.webp')) {
                result = 'image/webp'
            } else if (name.endsWith('.bmp')) {
                result = 'image/bmp'
            } else if (name.endsWith('.tiff') || name.endsWith('.tif')) {
                result = 'image/tiff'
            } else {
                result = 'application/octet-stream'
            }
        }
    }

    static String getExtension(String fileName) {
        if (!fileName) {
            return ''
        }
        final idx = fileName.lastIndexOf(".")
        return idx == -1 ? '' : fileName.substring(idx)
    }

    static String getExtensionFromContentType(String contentType) {
        try {
            TikaConfig.defaultConfig.mimeRepository.forName(contentType).extension
        } catch (MimeTypeException e) {
            ''
        }
    }

    static String encPath(value) {
        value ? urlPathSegmentEscaper().escape(value.toString()) : ''
    }

    static String encFragment(value) {
        value ? urlFragmentEscaper().escape(value.toString()) : ''
    }

    static String enc(String value) {
        value ? URLEncoder.encode(value, "UTF-8") : ""
    }

    static String extractFilenameFromContentDisposition(String contentDisposition) {
        try {
            Matcher m = CONTENT_DISPOSITION_PATTERN.matcher(contentDisposition)
            if (m.find()) {
                return m.group(1)
            }
        } catch (IllegalStateException e) {
        }
        return ''
    }

    static boolean isHttpSuccess(int statusCode) {
        HttpStatus.SC_OK <= statusCode && 299 >= statusCode
    }

    static Date parseISODateToObject(String date){
        DateFormat df1 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX");
        df1.parse(date);
    }
}
