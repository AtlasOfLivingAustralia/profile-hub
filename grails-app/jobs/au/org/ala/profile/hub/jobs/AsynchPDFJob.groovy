package au.org.ala.profile.hub.jobs

import au.org.ala.profile.hub.EmailService
import au.org.ala.profile.hub.ExportService
import au.org.ala.profile.hub.ProfileService
import au.org.ala.ws.service.WebService
import grails.core.GrailsApplication
import org.apache.http.entity.ContentType

class AsynchPDFJob {
    static final int DEFAULT_MAX_ATTEMPTS = 3
    static triggers = {
        simple repeatInterval: 60000L // execute job once every 60 seconds
    }

    // Make sure only 1 job executes at a time to avoid overloading heap usage with multiple large pdfs
    def concurrent = false

    GrailsApplication grailsApplication
    ExportService exportService
    EmailService emailService
    WebService webService
    ProfileService profileService

    def execute() {
        int maxAttempts = (grailsApplication.config.pdf.jobs.maxAttempts ?: DEFAULT_MAX_ATTEMPTS) as int
        List jobs = webService.get("${grailsApplication.config.profile.service.url}/job/pdf", [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())?.resp?.jobs

        if (jobs) {
            Map pdf = jobs[0]
            if (pdf.attempt < maxAttempts) {
                try {
                    pdf.startDate = new Date().toString()
                    updateJob(pdf.jobType.name, pdf.jobId, pdf)
                    exportService.createAndEmailPDF(pdf.params, pdf.params.latest)
                    log.debug("PDF job ${pdf.jobId} succeeded. Deleting the job now.")
                    deleteJob(pdf.jobType.name, pdf.jobId)
                } catch (Throwable e) {
                    log.error("Exception occurred during attempt ${pdf.attempt} of PDF Job ${pdf.jobId}", e)
                    pdf.attempt = pdf.attempt + 1
                    pdf.error = e.message
                    updateJob(pdf.jobType.name, pdf.jobId, pdf)
                }
            } else {
                sendMaxAttemptsFailedEmail(pdf)

                log.debug("Maximum attempts for job ${pdf.jobId} exceeded. An email has been sent to the user requesting a retry. Deleting the job.")
                deleteJob(pdf.jobType.name, pdf.jobId)
            }
        }
    }

    private updateJob(String jobType, String jobId, Map data) {
        webService.post("${grailsApplication.config.profile.service.url}/job/${jobType}/${jobId}", data, [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())
    }

    private deleteJob(String jobType, String jobId) {
        webService.delete("${grailsApplication.config.profile.service.url}/job/${jobType}/${jobId}", [:], ContentType.APPLICATION_JSON, true, false, profileService.getCustomHeaderWithUserId())
    }

    private sendMaxAttemptsFailedEmail(Map pdf) {
        emailService.sendEmail(pdf.email, "${pdf.opusTitle}<no-reply@ala.org.au>", "Your download has failed",
                """<html><body>
                        <p>Generation of the PDF you requested from ${pdf.opusTitle} has failed.</p>
                        <p>Please try generating the PDF again.</p>
                        <p>This is an automated email. Please do not reply.</p>
                        </body></html>""")
    }
}
