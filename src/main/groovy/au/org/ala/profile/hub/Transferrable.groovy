package au.org.ala.profile.hub

import org.springframework.web.multipart.MultipartFile

import javax.annotation.concurrent.NotThreadSafe

import static com.google.common.net.HttpHeaders.CONTENT_DISPOSITION

/**
 * Simple trait that can be applied to something that can be transferred to a File or OutputStream
 */
trait Transferrable {

    abstract InputStream getInputStream()

    abstract String getContentType()

    abstract String getOriginalFilename()

    String getFileExtension() {
        Utils.getExtension(originalFilename) ?: Utils.getExtensionFromContentType(contentType)
    }

    void transferTo(OutputStream os) throws IOException {
        inputStream.withStream { is ->
            os << is
        }
    }

    void transferTo(File file) throws IOException, IllegalStateException {
        file.withOutputStream { os ->
            transferTo(os)
        }
    }
}

class MultipartFileTransferrableAdapter implements Transferrable {

    @Delegate MultipartFile multipartFile

    @Override
    void transferTo(File file) throws IOException, IllegalStateException {
        // the trait method would take precedence over the delegate
        // so explicitly use the mutlipartFile.transferTo(file) method.
        multipartFile.transferTo(file)
    }
}

@NotThreadSafe
class UrlTransferrableAdapter implements Transferrable, Closeable, AutoCloseable {

    @Delegate URL url

    private URLConnection connection = null
    private String _contentType = null
    private String _filename = null

    InputStream getInputStream() {
        return acquireConnection().inputStream
    }

    String getOriginalFilename() {
        if (!_filename) {
            final header = acquireConnection().getHeaderField(CONTENT_DISPOSITION)
            String filename = ''
            if (header) {
                filename = Utils.extractFilenameFromContentDisposition(header)
            }

            if (!filename) {
                String path = this.path
                int idx = path.lastIndexOf('/')
                if (idx != -1) {
                    String pathPart = path.substring(idx + 1)
                    if (pathPart) {
                        if (Utils.getExtension(pathPart) == '') {
                            pathPart += Utils.getExtensionFromContentType(contentType)
                        }
                        filename = pathPart
                    }
                }
            }

            if (!filename) {
                filename = 'image' + Utils.getExtensionFromContentType(contentType)
            }
            _filename = filename
        }

        return _filename
    }

    URLConnection acquireConnection() {
        if (!connection) {
            connection = openConnection()
            connection.connect()
            if (connection instanceof HttpURLConnection && !(connection.responseCode in 200..299)) {
                throw new IOException("HTTP request to $url was not successful")
            }
        }
        connection
    }

    String getContentType() {
        if (!_contentType) {
            this._contentType = acquireConnection().contentType
        }
        return _contentType
    }

    void close() {
        if (connection && connection instanceof HttpURLConnection) {
            connection.disconnect()
        }
    }
}