package au.org.ala.profile.hub
import grails.converters.JSON
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException

import javax.servlet.http.HttpServletResponse

class WebService {

    static transactional = false

    def grailsApplication, userService

    def get(String url, boolean includeUserId) {
        def conn = null
        try {
            conn = configureConnection(url, includeUserId)
            return responseText(conn)
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out calling web service. URL= ${url}."]
            log.error error
            return error
        } catch (Exception e) {
            def error = [error     : "Failed calling web service. ${e.getClass()} ${e.getMessage()} URL= ${url}.",
                         statusCode: conn?.responseCode ?: "",
                         detail    : conn?.errorStream?.text]
            log.error error
            return error
        }
    }

    private int defaultTimeout() {
        grailsApplication.config.webservice.readTimeout as int
    }

    private URLConnection configureConnection(String url, boolean includeUserId, Integer timeout = null) {
        URLConnection conn = new URL(url).openConnection()

        def readTimeout = timeout ?: defaultTimeout()
        conn.setConnectTimeout(grailsApplication.config.webservice.connectTimeout as int)
        conn.setReadTimeout(readTimeout)
        def user = userService.getUser()
        if (includeUserId && user) {
            conn.setRequestProperty(grailsApplication.config.app.http.header.userId, user.userId)
        }
        conn
    }

    /**
     * Proxies a request URL but doesn't assume the response is text based. (Used for proxying requests to
     * ecodata for excel-based reports)
     */
    def proxyGetRequest(HttpServletResponse response, String url, boolean includeUserId = true, boolean includeApiKey = false, Integer timeout = null) {

        HttpURLConnection conn = configureConnection(url, includeUserId)
        def readTimeout = timeout ?: defaultTimeout()
        conn.setConnectTimeout(grailsApplication.config.webservice.connectTimeout as int)
        conn.setReadTimeout(readTimeout)

        if (includeApiKey) {
            conn.setRequestProperty("Authorization", grailsApplication.config.api_key);
        }

        def headers = [HttpHeaders.CONTENT_DISPOSITION, HttpHeaders.TRANSFER_ENCODING]
        response.setContentType(conn.getContentType())
        response.setContentLength(conn.getContentLength())

        headers.each { header ->
            response.setHeader(header, conn.getHeaderField(header))
        }
        response.status = conn.responseCode
        response.outputStream << conn.inputStream

    }

    def get(String url) {
        return get(url, true)
    }


    def getJson(String url, Integer timeout = null) {
        def conn = null
        try {
            conn = configureConnection(url, true, timeout)
            def json = responseText(conn)
            return JSON.parse(json)
        } catch (ConverterException e) {
            def error = ['error': "Failed to parse json. ${e.getClass()} ${e.getMessage()} URL= ${url}."]
            log.error error
            return error
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out getting json. URL= ${url}."]
            println error
            return error
        } catch (ConnectException ce) {
            log.info "Exception class = ${ce.getClass().name} - ${ce.getMessage()}"
            def error = [error: "ecodata service not available. URL= ${url}."]
            println error
            return error
        } catch (Exception e) {
            log.info "Exception class = ${e.getClass().name} - ${e.getMessage()}"
            def error = [error     : "Failed to get json from web service. ${e.getClass()} ${e.getMessage()} URL= ${url}.",
                         statusCode: conn?.responseCode ?: "",
                         detail    : conn?.errorStream?.text]
            log.error error
            return error
        }
    }

    /**
     * Reads the response from a URLConnection taking into account the character encoding.
     * @param urlConnection the URLConnection to read the response from.
     * @return the contents of the response, as a String.
     */
    def responseText(urlConnection) {

        def charset = 'UTF-8' // default
        def contentType = urlConnection.getContentType()
        if (contentType) {
            def mediaType = MediaType.parseMediaType(contentType)
            charset = (mediaType.charSet) ? mediaType.charSet.toString() : 'UTF-8'
        }
        return urlConnection.content.getText(charset)
    }

    def doPostWithParams(String url, Map params) {
        def conn = null
        def charEncoding = 'utf-8'
        try {
            String query = ""
            boolean first = true
            for (String name : params.keySet()) {
                query += first ? "?" : "&"
                first = false
                query += name.encodeAsURL() + "=" + params.get(name).encodeAsURL()
            }
            conn = new URL(url + query).openConnection()
            conn.setRequestMethod("POST")
            conn.setDoOutput(true)
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            conn.setRequestProperty("Authorization", grailsApplication.config.api_key);

            def user = userService.getUser()
            if (user) {
                conn.setRequestProperty(grailsApplication.config.app.http.header.userId, user.userId) // used by ecodata
                conn.setRequestProperty("Cookie", "ALA-Auth=" + java.net.URLEncoder.encode(user.userName, charEncoding))
                // used by specieslist
            }
            OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream(), charEncoding)

            wr.flush()
            def resp = conn.inputStream.text
            wr.close()
            return [resp: JSON.parse(resp ?: "{}")]
            // fail over to empty json object if empty response string otherwise JSON.parse fails
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out calling web service. URL= ${url}."]
            log.error(error, e)
            return error
        } catch (Exception e) {
            def error = [error     : "Failed calling web service. ${e.getMessage()} URL= ${url}.",
                         statusCode: conn?.responseCode ?: "",
                         detail    : conn?.errorStream?.text]
            log.error(error, e)
            return error
        }
    }

    def doPost(String url, Map postBody) {
        def conn = null
        def charEncoding = 'utf-8'
        try {
            conn = new URL(url).openConnection()
            conn.setDoOutput(true)
            conn.setRequestProperty("Content-Type", "application/json;charset=${charEncoding}");
            conn.setRequestProperty("Authorization", grailsApplication.config.api_key);

            def user = userService.getUser()
            if (user) {
                conn.setRequestProperty(grailsApplication.config.app.http.header.userId, user.userId) // used by ecodata
                conn.setRequestProperty("Cookie", "ALA-Auth=" + java.net.URLEncoder.encode(user.userName, charEncoding))
                // used by specieslist
            }
            OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream(), charEncoding)
            wr.write((postBody as JSON).toString())
            wr.flush()
            def resp = conn.inputStream.text
            wr.close()
            return [resp: JSON.parse(resp ?: "{}")]
            // fail over to empty json object if empty response string otherwise JSON.parse fails
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out calling web service. URL= ${url}."]
            log.error(error, e)
            return error
        } catch (Exception e) {
            def error = [error     : "Failed calling web service. ${e.getMessage()} URL= ${url}.",
                         statusCode: conn?.responseCode ?: "",
                         detail    : conn?.errorStream?.text]
            log.error(error, e)
            return error
        }
    }

    def doDelete(String url) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + "api_key=${grailsApplication.config.api_key}"
        def conn = null
        try {
            conn = new URL(url).openConnection()
            conn.setRequestMethod("DELETE")
            conn.setRequestProperty("Authorization", grailsApplication.config.api_key);
            def user = userService.getUser()
            if (user) {
                conn.setRequestProperty(grailsApplication.config.app.http.header.userId, user.userId)
            }
            return conn.getResponseCode()
        } catch (Exception e) {
            println e.message
            return 500
        } finally {
            if (conn != null) {
                conn?.disconnect()
            }
        }
    }

//    /**
//     * Forwards a HTTP multipart/form-data request to ecodata.
//     * @param url the URL to forward to.
//     * @param params the (string typed) HTTP parameters to be attached.
//     * @param file the Multipart file object to forward.
//     * @return [status:<request status>, content:<The response content from the server, assumed to be JSON>
//     */
//    def postMultipart(url, Map params, MultipartFile file, fileParam = null) {
//
//        def result = [:]
//        def user = userService.getUser()
//
//        def fileParamName = fileParam ?: file.name
//        HTTPBuilder builder = new HTTPBuilder(url)
//        builder.request(Method.POST) { request ->
//            requestContentType: 'multipart/form-data'
//            MultipartEntity content = new MultipartEntity(HttpMultipartMode.BROWSER_COMPATIBLE)
//            content.addPart(fileParamName, new InputStreamBody(file.inputStream, file.contentType, file.originalFilename))
//            params.each { key, value ->
//                content.addPart(key, new StringBody(value))
//            }
//            headers.'Authorization' = grailsApplication.config.api_key
//            if (user) {
//                headers[grailsApplication.config.app.http.header.userId] = user.userId
//            } else {
//                log.warn("No user associated with request: ${url}")
//            }
//            request.setEntity(content)
//
//            response.success = { resp, message ->
//                result.status = resp.status
//                result.content = message
//            }
//
//            response.failure = { resp ->
//                result.status = resp.status
//                result.error = "Error POSTing to ${url}"
//            }
//        }
//        result
//    }
}