package au.org.ala.profile.hub.reports

import spock.lang.Specification
import spock.lang.Unroll

import java.awt.Color

class ColourParserSpec extends Specification {

    @Unroll
    def "ColourParser decodes #cssColour"(String cssColour, Color result) {
        given:
        ColourParser cp = new ColourParser()
        expect:
        cp.decodeColor(cssColour) == result

        where:
        cssColour || result
        "BLACK" || Color.BLACK
        "       blaCK     " || Color.BLACK
        "red" || Color.RED
        "rgb(255,0,0)" || Color.RED
        "rgb(255,0,0,255)" || Color.RED
        "rgb(255 0 0)" || Color.RED
        "rgb(255 0 0 / 1.0)" || Color.RED
        "rgb(6 7 8 / 0.9)" || new Color(6,7,8,230)
        "rgb(  0  ,  255  ,  0  )" || Color.GREEN
        "  rgb(0, 0, 255)  " || Color.BLUE
        "rgb(255,255,0)" || Color.YELLOW
        "rgb(255,0,255)" || Color.MAGENTA
        "rgb(0,255,255)" || Color.CYAN
        "rgba(255,255,0)" || Color.YELLOW
        "rgba(255,0,255)" || Color.MAGENTA
        "rgba(0,255,255)" || Color.CYAN
        "rgba(255,255,0, 1)" || Color.YELLOW
        "rgba(255,0,255, 1)" || Color.MAGENTA
        "rgba(0,255,255, 1)" || Color.CYAN
        "rgba(0 255 255/1)" || Color.CYAN
        "#fff" || Color.WHITE
        "#ccc" || new Color(0xcc, 0xcc, 0xcc)
        "#ffffff" || Color.WHITE
        "#cccccc" || new Color(0xcc, 0xcc, 0xcc)
        "#ffffffff" || Color.WHITE
        "#cccccccc" || new Color(0xcc, 0xcc, 0xcc, 0xcc)
        "#ffff" || Color.WHITE
        "#cccc" || new Color(0xcc, 0xcc, 0xcc, 0xcc)
        "hsl(0,0%,0%)" || Color.BLACK
        "   hsl(     0  ,    0%     ,    0%  )     " || Color.BLACK
        "hsl(0,0%,100%)" || Color.WHITE
        "hsl(0,100%,50%)" || Color.RED
        "hsl(120,100%,50%)" || Color.GREEN
        "hsl(240,100%,50%)" || Color.BLUE
        "hsl(60,100%,50%)" || Color.YELLOW
        "hsl(180,100%,50%)" || Color.CYAN
        "  hsl(  180,  100%,  50%, 0.9)" || new Color(0, 0xFF, 0xFF, 230)
        "\t\thsl(  \t180  \t  100% \t       50%    )       " || Color.CYAN
        "       hsl(   180     100%         50% \t/ 0.9  )       " || new Color(0, 0xFF, 0xFF, 230)
        "hsl(300,100%,50%)" || Color.MAGENTA
        "hsl(0,0%,75%)" || new Color(0xBF, 0xBF, 0xBF)
        "hsl(0,0%,50%)" || Color.GRAY
        "hsl(0,100%,25%)" || new Color(0x80, 0, 0)
        "hsl(60,100%,25%)" || new Color(0x80, 0x80, 0)
        "hsl(120,100%,25%)" || new Color(0, 0x80, 0)
        "hsl(300,100%,25%)" || new Color(0x80, 0, 0x80)
        "hsl(180,100%,25%)" || new Color(0, 0x80, 0x80)
        "hsl(240,100%,25%)" || new Color(0, 0, 0x80)
        "hsl(300deg,100%,50%)" || Color.MAGENTA
        "hsl(5.23599rad,100%,50%)" || Color.MAGENTA
        "hsl(333.3333333333grad,100%,50%)" || Color.MAGENTA
        "hsl(0.833333333turn,100%,50%)" || Color.MAGENTA
        "hsl(1.833333333turn,100%,50%)" || Color.MAGENTA
        "hsla(240,100%,25%)" || new Color(0, 0, 0x80)
        "hsla(240,100%,25%, 0.9)" || new Color(0, 0, 0x80, 230)
        "hsla(300deg, 100%, 50%, 1.0)" || Color.MAGENTA
        "hsla(5.23599rad, 100%, 50%, 1.0)" || Color.MAGENTA
        "hsla(333.3333333333grad, 100%, 50%, 1.0)" || Color.MAGENTA
        "hsla(0.833333333turn,100%,50%, 1.0)" || Color.MAGENTA
        "hsla(300deg 100% 50%/1.0)" || Color.MAGENTA
    }

}
