package au.org.ala.profile.hub

import au.com.bytecode.opencsv.CSVWriter
import au.org.ala.profile.security.Role
import au.org.ala.profile.security.Secured
import grails.converters.JSON
import groovy.json.JsonSlurper
import org.apache.commons.io.FileUtils
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.select.Elements
import org.springframework.web.multipart.commons.CommonsMultipartFile
import static au.org.ala.profile.hub.Utils.enc
import au.org.ala.web.AuthService
import au.org.ala.ws.service.WebService
import org.apache.http.entity.ContentType

import static au.org.ala.profile.hub.Utils.isHttpSuccess

@Secured(role = Role.ROLE_USER, opusSpecific = true)
class SandboxProxyController extends BaseController {
    WebService webService
    AuthService authService
    TikaService tikaService
    ProfileService profileService

    def parseCsvColumns() {
        webService.proxyPostRequest(response, "${getSandboxPath()}dataCheck/parseColumns", request.reader.text)
    }

    def parseFileColumns() {
        webService.proxyPostRequest(response, "${getSandboxPath()}upload/parseColumns?id=${params.id}", request.reader.text)
    }

    def parseCsvColumnsWithFirstLineInfo() {
        webService.proxyPostRequest(response, "${getSandboxPath()}dataCheck/parseColumnsWithFirstLineInfo", request.parameterMap, ContentType.APPLICATION_FORM_URLENCODED)
    }

    def parseFileColumnsWithFirstLineInfo() {
        webService.proxyPostRequest(response, "${getSandboxPath()}upload/parseColumnsWithFirstLineInfo", request.parameterMap, ContentType.APPLICATION_FORM_URLENCODED)
    }

    def processCsvData() {
        webService.proxyPostRequest(response, "${getSandboxPath()}dataCheck/processData", request.parameterMap, ContentType.APPLICATION_FORM_URLENCODED)
    }

    def processFileData() {
        webService.proxyPostRequest(response, "${getSandboxPath()}upload/viewProcessData?id=${params.id}", request.parameterMap, ContentType.APPLICATION_FORM_URLENCODED)
    }

    def csvUploadStatus() {
        webService.proxyGetRequest(response, "${getSandboxPath()}dataCheck/uploadStatus?uid=${enc(params.uid)}&random=${enc(params.random)}")
    }

    def fileUploadStatus() {
        webService.proxyGetRequest(response, "${getSandboxPath()}dataCheck/uploadStatus?uid=${enc(params.uid)}&random=${enc(params.random)}")
    }

    def previewUpload() {
        render view: "data/uploadData", mode: [fn: params.fn, id: params.id, userId: authService.getUserId()]
    }

    def uploadFile() {
        CommonsMultipartFile file = request.getFile('file')

        long fileId = System.currentTimeMillis()
        String uploadDirPath = "${grailsApplication.config.sandbox.upload.directory}/${fileId}"
        log.debug "Creating upload directory " + uploadDirPath

        File uploadDir = new File(uploadDirPath)
        FileUtils.forceMkdir(uploadDir)

        log.debug "Transferring file to directory...."
        File newFile = new File("${uploadDirPath}${File.separatorChar}${file.getFileItem().getName()}")
        file.transferTo(newFile)

        log.debug "Detecting file formats...."
        String contentType = FileUtil.detectFormat(newFile)

        log.debug "Content type...." + contentType
        //if its GZIPPED or ZIPPED extract the file
        if (contentType == "application/zip") {
            //upzip it
            Map result = FileUtil.extractZip(newFile)
            if (result.success) {
                newFile = result.file
                contentType = FileUtil.detectFormat(result.file)
            }
        } else if (contentType == "application/x-gzip") {
            Map result = FileUtil.extractGZip(newFile)
            if (result.success) {
                newFile = result.file
                contentType = FileUtil.detectFormat(result.file)
            }
        }

        File extractedFile = new File("${uploadDirPath}${File.separatorChar}${fileId}.csv")

        if (contentType.startsWith("text")) {
            //extract and re-write into common CSV format
            log.debug("Is a CSV....")
            FileUtils.copyFile(newFile, extractedFile)
        } else {
            //extract the data
            CSVWriter csvWriter = new CSVWriter(new FileWriter(extractedFile))
            String extractedString = tikaService.parseFile(newFile)
            //HTML version of the file
            Document doc = Jsoup.parse(extractedString);
            Elements dataTable = doc.select("tr");

            if (dataTable?.size() > 0) {
                int cellCount = dataTable?.get(0)?.select("td")?.size() ?: 0
                dataTable.each { tr ->
                    Elements cells = tr.select("td")
                    String[] fields = new String[cellCount]
                    if (cells) {
                        cells.eachWithIndex { cell, idx ->
                            if (idx < cellCount) {
                                fields[idx] = cell.text().trim()
                            }
                        }
                    }
                    csvWriter.writeNext(fields)
                }
                csvWriter.close()
            }
        }
        //create a zipped version for uploading.....
        FileUtil.zipFile(extractedFile)

        render([fileId: fileId, fileName: newFile.getName()] as JSON)
    }

    def sendFileToBiocache() {
        Map json = request.getJSON()

        Map data = [
                headers            : json.headers.trim(),
                datasetName        : json.datasetName.trim(),
                csvZippedUrl       : "${getSandboxPath()}upload/serveFile?fileId=${json.fileId}",
                separator          : "COMMA",
                firstLineIsData    : json.firstLineIsData,
                alaId              : authService.getUserId()
        ]

        Map result = webService.post("${grailsApplication.config.sandbox.biocache.service.url}/upload/",
                data, [:], ContentType.APPLICATION_FORM_URLENCODED, true, true,
                [Accept: ContentType.APPLICATION_JSON.toString()])

        // refresh the biocache data cache
        webService.get("${grailsApplication.config.sandbox.biocache.service.url}/cache/refresh")

        handleFileUploadResponse(result, params.opusId)
    }

    def sendCsvDataToBiocache() {
        String csvData = request.getParameter("rawData").trim()
        Map data = [
                headers            : request.getParameter("headers").trim(),
                datasetName        : request.getParameter("datasetName").trim(),
                csvData            : csvData,
                separator          : getSeparatorName(csvData),
                customIndexedFields: request.getParameter("customIndexedFields").trim(),
                firstLineIsData    : request.getParameter("firstLineIsData"),
                alaId              : authService.getUserId()
        ]

        Map result = webService.post("${grailsApplication.config.sandbox.biocache.service.url}/upload/",
                data, [:], ContentType.APPLICATION_FORM_URLENCODED, true, true,
                [Accept: ContentType.APPLICATION_JSON.toString()])

        // refresh the biocache data cache
        webService.get("${grailsApplication.config.sandbox.biocache.service.url}/cache/refresh")

        handleFileUploadResponse(result, params.opusId)
    }

    private handleFileUploadResponse(Map result, String opusId) {
        Map opus = profileService.getOpus(opusId)

        // the biocache-service upload operation returns a json string in the format {uid: 'drId'}, which is jammed into
        // the resp map returned by the WebService class, as the KEY (with a value of null).
        if (isHttpSuccess(result.statusCode as int) && result?.resp?.keySet()) {
            String dataResourceId = new JsonSlurper().parseText(result.resp.keySet()[0]).uid

            if (!opus.dataResourceConfig.privateRecordSources) {
                opus.dataResourceConfig.privateRecordSources = []
            }
            opus.dataResourceConfig.privateRecordSources << dataResourceId
            profileService.updateOpus(opus.uuid, opus)

            response.contentType = ContentType.APPLICATION_JSON.toString()
            render result.resp.keySet()[0]
        } else {
            handle result
        }
    }

    private static String getSeparatorName(String raw) {
        int tabs = raw.count("\t")
        int commas = raw.count(",")

        tabs > commas ? "TAB" : "COMMA"
    }

    private String getSandboxPath() {
        String path = "${grailsApplication.config.sandbox.base.url}${grailsApplication.config.sandbox.context.path}"

        if (!path.endsWith("/")) {
            path += "/"
        }

        path
    }
}
