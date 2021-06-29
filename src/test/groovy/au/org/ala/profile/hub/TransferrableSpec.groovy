package au.org.ala.profile.hub

import spock.lang.Specification
import spock.lang.Unroll

import static com.google.common.net.HttpHeaders.CONTENT_DISPOSITION


class TransferrableSpec extends Specification {

    @Unroll
    def "A URL transferrable should be able to get an image filename"() {
        given:
        def connection = Stub(HttpURLConnection)
        connection.responseCode >> 200
        connection.contentType >> contentType
        connection.getHeaderField(CONTENT_DISPOSITION) >> contentDisposition
        def url = new URL(null, urlString, new StubURLStreamHandler(urlConnection: connection))

        expect:
        new UrlTransferrableAdapter(url: url).originalFilename == filename

        where:
        urlString | contentType | contentDisposition || filename
        'https://example.com/CIm-0Z6vheISX2-k8h_YkF2Qw2HPTbN0cqY0mAlGZiCh8sRA_h3fmjcabMefJ_IRlwxXM6BcZwIxomig5UmsG_cXpZ8wb6w' | 'image/jpeg' | 'attachment;filename="IMG_20160513_112215507.jpg"' || 'IMG_20160513_112215507.jpg'
        'https://example.com/CIm-0Z6vheISX2-k8h_YkF2Qw2HPTbN0cqY0mAlGZiCh8sRA_h3fmjcabMefJ_IRlwxXM6BcZwIxomig5UmsG_cXpZ8wb6w' | 'image/tiff' | 'inline ; filename = "IMG_20160513_112215507.tiff"; asdasd' || 'IMG_20160513_112215507.tiff'
        'https://example.com/5561/14997220705_696969e2b2.jpg' | 'image/jpeg' | '' || '14997220705_696969e2b2.jpg'
        'https://example.com/5561/14997220705_696969e2b2.jpg' | 'image/png' | '' || '14997220705_696969e2b2.jpg' // url path wins over content type
        'https://example.com/SADFHKSATKQ/ASDFASDF/ASDFASDF' | 'image/png' | '' || 'ASDFASDF.png'
        'https://example.com/' | 'image/gif' | '' || 'image.gif'
    }

    static class StubURLStreamHandler extends URLStreamHandler {

        URLConnection urlConnection;

        @Override
        protected URLConnection openConnection(URL u) throws IOException {
            return urlConnection;
        }
    };
}
