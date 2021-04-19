package au.org.ala.profile.hub


import grails.testing.services.ServiceUnitTest
import spock.lang.Specification
import spock.lang.Unroll
/**
 * See the API for {@link grails.testing.services.ServiceUnitTest} for usage instructions
 */
class ExportServiceSpec extends Specification implements ServiceUnitTest<ExportService> {

    def setup() {
    }

    def cleanup() {
    }

    @Unroll
    def "test html text clean up"() {
        expect:
        service.stripTextFromNonFormattingHtmlTags(html) == cleanHtml

        where:
        html | cleanHtml
        "nomenclatural synonym: <scientific><name id='200482'><scientific><name id='72513'><element><i>Mimosa</i></element></name></scientific> <element><i>paradoxa</i></element> <authors>(<base id='6840' title='Candolle, A.P. de'>DC.</base>) <author id='7060' title='Poiret, J.L.M.'>Poir.</author></authors></name></scientific>" | "nomenclatural synonym: <i>Mimosa</i> <i>paradoxa</i> (DC.) Poir."
        "taxonomic synonym: <scientific><name id='202232'><scientific><name id='103551'><element><i>Racosperma</i></element></name></scientific> <element><i>undulata</i></element> <authors>(<ex-base id='1884' title='Willdenow, C.L. von'>Willd.</ex-base> ex <base id='7255' title='Wendland, H.L.'>H.L.Wendl.</base>) <author id='7355' title='Martius, C.P. von'>Mart.</author></authors></name></scientific>" | "taxonomic synonym: <i>Racosperma</i> <i>undulata</i> (Willd. ex H.L.Wendl.) Mart."
        "doubtful taxonomic synonym: <scientific><name id='71524'><scientific><name id='71512'><scientific><name id='56859'><element><i>Acacia</i></element></name></scientific> <element><i>undulata</i></element></name></scientific> <rank id='54412'>var.</rank> <element><i>longispina</i></element> <authors><ex id='10201' title='Hortorum (&quot;of gardens&quot;) or Hortulanorum (&quot;of gardeners&quot;)'>Hort.</ex> ex <author id='7665' title='Visiani, R. de'>Vis.</author></authors></name></scientific>" | "doubtful taxonomic synonym: <i>Acacia</i> <i>undulata</i> var. <i>longispina</i> <ex id='10201' title='Hortorum (&quot;of gardens&quot;) or Hortulanorum (&quot;of gardeners&quot;)'>Hort. ex Vis."
    }

    @Unroll
    def "test status text formatting"() {
        expect:
        service.formatStatusText(before) == after

        where:
        before | after
        "Inflorescence_arrangement" | "Inflorescence arrangement"
        "pca1" | "Pca1"
        "precip_seasonality" | "Precip seasonality"
    }

    @Unroll
    def "test attribute text formatting"() {
        expect:
        service.formatAttributeText(text, title) == formattedText

        where:
        text | title | formattedText
        "kangaroo thorn, hedge wattle" | "Common Name" | "<i>Common Name:</i> kangaroo thorn, hedge wattle"
        "<p>kangaroo thorn, hedge wattle</p>" | "Common Name" | "<p><i>Common Name:</i> kangaroo thorn, hedge wattle</p>"
        "<ol><li>July–November.</li></ol>" | "Flowering" | "<p><i>Flowering:</i></p><ol><li>July–November.</li></ol>"
    }

    @Unroll
    def "test Jasper element conversion"() {
        expect:
        ExportService.convertTagsForJasper(text) == formattedText

        where:
        text | formattedText
        '<p><b>Common Name:</b><em><div><strong><em>strong <s>em</s> text em <strong</em></strong></p></em> something <p></em>' | '<p><b>Common Name:</b><i><div><b><i>strong <strike>em</strike> text em <strong</i></b></p></i> something <p></i>'
    }

}
