package au.org.ala.profile.hub.reports


import groovy.util.logging.Slf4j

import java.awt.*
import java.util.regex.MatchResult
import java.util.regex.Pattern

import static java.lang.Math.*

@Slf4j
class ColourParser {

    static final Pattern rgbPattern = Pattern.compile(/^rgba?\((.*)\)$/)
    static final Pattern hslPattern = Pattern.compile(/^hsla?\((.*)\)$/)
    public static final Color TRANSPARENT = new Color(0, 0, 0, 0)
    public static final Color BLACK = Color.decode('#000000')
    public static final Color SILVER = Color.decode('#c0c0c0')
    public static final Color GREY = Color.decode('#808080')
    public static final Color WHITE = Color.decode('#ffffff')
    public static final Color MAROON = Color.decode('#800000')
    public static final Color RED = Color.decode('#ff0000')
    public static final Color PURPLE = Color.decode('#800080')
    public static final Color MAGENTA = Color.decode('#ff00ff')
    public static final Color GREEN = Color.decode('#008000')
    public static final Color LIME = Color.decode('#00ff00')
    public static final Color OLIVE = Color.decode('#808000')
    public static final Color YELLOW = Color.decode('#ffff00')
    public static final Color NAVY = Color.decode('#000080')
    public static final Color BLUE = Color.decode('#0000ff')
    public static final Color TEAL = Color.decode('#008080')
    public static final Color CYAN = Color.decode('#00ffff')
    public static final Color ORANGE = Color.decode('#ffa500')
    public static final Color ALICEBLUE = Color.decode('#f0f8ff')
    public static final Color ANTIQUEWHITE = Color.decode('#faebd7')
    public static final Color AQUAMARINE = Color.decode('#7fffd4')
    public static final Color AZURE = Color.decode('#f0ffff')
    public static final Color BEIGE = Color.decode('#f5f5dc')
    public static final Color BISQUE = Color.decode('#ffe4c4')
    public static final Color BLANCHED_ALMOND = Color.decode('#ffebcd')
    public static final Color BLUE_VIOLET = Color.decode('#8a2be2')
    public static final Color BROWN = Color.decode('#a52a2a')
    public static final Color BURLYWOOD = Color.decode('#deb887')
    public static final Color CADETBLUE = Color.decode('#5f9ea0')
    public static final Color CHARTREUSE = Color.decode('#7fff00')
    public static final Color CHOCOLATE = Color.decode('#d2691e')
    public static final Color CORAL = Color.decode('#ff7f50')
    public static final Color CORNFLOWERBLUE = Color.decode('#6495ed')
    public static final Color CORNSILK = Color.decode('#fff8dc')
    public static final Color CRIMSON = Color.decode('#dc143c')
    public static final Color DARKBLUE = Color.decode('#00008b')
    public static final Color DARKCYAN = Color.decode('#008b8b')
    public static final Color DARKGOLDENROD = Color.decode('#b8860b')
    public static final Color DARKGREY = Color.decode('#a9a9a9')
    public static final Color DARKGREEN = Color.decode('#006400')
    public static final Color DARKKHAKI = Color.decode('#bdb76b')
    public static final Color DARKMAGENTA = Color.decode('#8b008b')
    public static final Color DARKOLIVEGREEN = Color.decode('#556b2f')
    public static final Color DARKORANGE = Color.decode('#ff8c00')
    public static final Color DARKORCHID = Color.decode('#9932cc')
    public static final Color DARKRED = Color.decode('#8b0000')
    public static final Color DARKSALMON = Color.decode('#e9967a')
    public static final Color DARKSEAGREEN = Color.decode('#8fbc8f')
    public static final Color DARKSLATEBLUE = Color.decode('#483d8b')
    public static final Color DARKSLATEGREY = Color.decode('#2f4f4f')
    public static final Color DARKTURQUOISE = Color.decode('#00ced1')
    public static final Color DARKVIOLET = Color.decode('#9400d3')
    public static final Color DEEPPINK = Color.decode('#ff1493')
    public static final Color DEEPSKYBLUE = Color.decode('#00bfff')
    public static final Color DIMGREY = Color.decode('#696969')
    public static final Color DODGERBLUE = Color.decode('#1e90ff')
    public static final Color FIREBRICK = Color.decode('#b22222')
    public static final Color FLORALWHITE = Color.decode('#fffaf0')
    public static final Color FORESTGREEN = Color.decode('#228b22')
    public static final Color GAINSBORO = Color.decode('#dcdcdc')
    public static final Color GHOSTWHITE = Color.decode('#f8f8ff')
    public static final Color GOLD = Color.decode('#ffd700')
    public static final Color GOLDENROD = Color.decode('#daa520')
    public static final Color GREENYELLOW = Color.decode('#adff2f')
    public static final Color HONEYDEW = Color.decode('#f0fff0')
    public static final Color HOTPINK = Color.decode('#ff69b4')
    public static final Color INDIANRED = Color.decode('#cd5c5c')
    public static final Color INDIGO = Color.decode('#4b0082')
    public static final Color IVORY = Color.decode('#fffff0')
    public static final Color KHAKI = Color.decode('#f0e68c')
    public static final Color LAVENDER = Color.decode('#e6e6fa')
    public static final Color LAVENDERBLUSH = Color.decode('#fff0f5')
    public static final Color LAWNGREEN = Color.decode('#7cfc00')
    public static final Color LEMONCHIFFON = Color.decode('#fffacd')
    public static final Color LIGHTBLUE = Color.decode('#add8e6')
    public static final Color LIGHTCORAL = Color.decode('#f08080')
    public static final Color LIGHTCYAN = Color.decode('#e0ffff')
    public static final Color LIGHTGOLDENRODYELLOW = Color.decode('#fafad2')
    public static final Color LIGHTGREY = Color.decode('#d3d3d3')
    public static final Color LIGHTGREEN = Color.decode('#90ee90')
    public static final Color LIGHTPINK = Color.decode('#ffb6c1')
    public static final Color LIGHTSALMON = Color.decode('#ffa07a')
    public static final Color LIGHTSEAGREEN = Color.decode('#20b2aa')
    public static final Color LIGHTSKYBLUE = Color.decode('#87cefa')
    public static final Color LIGHTSLATEGREY = Color.decode('#778899')
    public static final Color LIGHTSTEELBLUE = Color.decode('#b0c4de')
    public static final Color LIGHTYELLOW = Color.decode('#ffffe0')
    public static final Color LIMEGREEN = Color.decode('#32cd32')
    public static final Color LINEN = Color.decode('#faf0e6')
    public static final Color MEDIUMAQUAMARINE = Color.decode('#66cdaa')
    public static final Color MEDIUMBLUE = Color.decode('#0000cd')
    public static final Color MEDIUMORCHID = Color.decode('#ba55d3')
    public static final Color MEDIUMPURPLE = Color.decode('#9370db')
    public static final Color MEDIUMSEAGREEN = Color.decode('#3cb371')
    public static final Color MEDIUMSLATEBLUE = Color.decode('#7b68ee')
    public static final Color MEDIUMSPRINGGREEN = Color.decode('#00fa9a')
    public static final Color MEDIUMTURQUOISE = Color.decode('#48d1cc')
    public static final Color MEDIUMVIOLETRED = Color.decode('#c71585')
    public static final Color MIDNIGHTBLUE = Color.decode('#191970')
    public static final Color MINTCREAM = Color.decode('#f5fffa')
    public static final Color MISTYROSE = Color.decode('#ffe4e1')
    public static final Color MOCCASIN = Color.decode('#ffe4b5')
    public static final Color NAVAJOWHITE = Color.decode('#ffdead')
    public static final Color OLDLACE = Color.decode('#fdf5e6')
    public static final Color OLIVEDRAB = Color.decode('#6b8e23')
    public static final Color ORANGERED = Color.decode('#ff4500')
    public static final Color ORCHID = Color.decode('#da70d6')
    public static final Color PALEGOLDENROD = Color.decode('#eee8aa')
    public static final Color PALEGREEN = Color.decode('#98fb98')
    public static final Color PALETURQUOISE = Color.decode('#afeeee')
    public static final Color PALEVIOLETRED = Color.decode('#db7093')
    public static final Color PAPAYAWHIP = Color.decode('#ffefd5')
    public static final Color PEACHPUFF = Color.decode('#ffdab9')
    public static final Color PERU = Color.decode('#cd853f')
    public static final Color PINK = Color.decode('#ffc0cb')
    public static final Color PLUM = Color.decode('#dda0dd')
    public static final Color POWDERBLUE = Color.decode('#b0e0e6')
    public static final Color ROSYBROWN = Color.decode('#bc8f8f')
    public static final Color ROYALBLUE = Color.decode('#4169e1')
    public static final Color SADDLEBROWN = Color.decode('#8b4513')
    public static final Color SALMON = Color.decode('#fa8072')
    public static final Color SANDYBROWN = Color.decode('#f4a460')
    public static final Color SEAGREEN = Color.decode('#2e8b57')
    public static final Color SEASHELL = Color.decode('#fff5ee')
    public static final Color SIENNA = Color.decode('#a0522d')
    public static final Color SKYBLUE = Color.decode('#87ceeb')
    public static final Color SLATEBLUE = Color.decode('#6a5acd')
    public static final Color SLATEGREY = Color.decode('#708090')
    public static final Color SNOW = Color.decode('#fffafa')
    public static final Color SPRINGGREEN = Color.decode('#00ff7f')
    public static final Color STEELBLUE = Color.decode('#4682b4')
    public static final Color TAN = Color.decode('#d2b48c')
    public static final Color THISTLE = Color.decode('#d8bfd8')
    public static final Color TOMATO = Color.decode('#ff6347')
    public static final Color TURQUOISE = Color.decode('#40e0d0')
    public static final Color VIOLET = Color.decode('#ee82ee')
    public static final Color WHEAT = Color.decode('#f5deb3')
    public static final Color WHITESMOKE = Color.decode('#f5f5f5')
    public static final Color YELLOWGREEN = Color.decode('#9acd32')
    public static final Color REBECCA_PURPLE = Color.decode('#663399')

    Color decodeColorWithDefault(String cssColour, Color defaultColor = BLACK) {
        if (!cssColour) return defaultColor
        try {
            return decodeColor(cssColour)
        } catch (e) {
            log.warn("Couldn't parse $cssColour because ${e.message}")
            return defaultColor
        }
    }

    Color decodeColor(String cssColour) {
        def c = cssColour?.trim()?.toLowerCase() ?: ''

        MatchResult m

        if (c?.startsWith('#')) {
            return decodeHexColor(c)
        } else if ((m = c =~ rgbPattern).matches()) {
            decodeRgbaColor(m.group(1))
        } else if ((m = c =~ hslPattern).matches()) {
            decodeHslaColor(m.group(1))
        } else {
            decodeNamedColor(c)
        }
    }

    private Color decodeNamedColor(String cssColour) {
        switch (cssColour) {
            case 'transparent': return TRANSPARENT
            case "black": return BLACK
            case "silver": return SILVER
            case "gray":
            case "grey": return GREY
            case "white": return WHITE
            case "maroon": return MAROON
            case "red": return RED
            case "purple": return PURPLE
            case "fuchsia":
            case "magenta": return MAGENTA
            case "green": return GREEN
            case "lime": return LIME
            case "olive": return OLIVE
            case "yellow": return YELLOW
            case "navy": return NAVY
            case "blue": return BLUE
            case "teal": return TEAL
            case "aqua":
            case "cyan": return CYAN
            case "orange": return ORANGE
            case "aliceblue": return ALICEBLUE
            case "antiquewhite": return ANTIQUEWHITE
            case "aquamarine": return AQUAMARINE
            case "azure": return AZURE
            case "beige": return BEIGE
            case "bisque": return BISQUE
            case "blanchedalmond": return BLANCHED_ALMOND
            case "blueviolet": return BLUE_VIOLET
            case "brown": return BROWN
            case "burlywood": return BURLYWOOD
            case "cadetblue": return CADETBLUE
            case "chartreuse": return CHARTREUSE
            case "chocolate": return CHOCOLATE
            case "coral": return CORAL
            case "cornflowerblue": return CORNFLOWERBLUE
            case "cornsilk": return CORNSILK
            case "crimson": return CRIMSON
            case "cyanaqua": return CYAN
            case "darkblue": return DARKBLUE
            case "darkcyan": return DARKCYAN
            case "darkgoldenrod": return DARKGOLDENROD
            case "darkgray":
            case "darkgrey": return DARKGREY
            case "darkgreen": return DARKGREEN
            case "darkkhaki": return DARKKHAKI
            case "darkmagenta": return DARKMAGENTA
            case "darkolivegreen": return DARKOLIVEGREEN
            case "darkorange": return DARKORANGE
            case "darkorchid": return DARKORCHID
            case "darkred": return DARKRED
            case "darksalmon": return DARKSALMON
            case "darkseagreen": return DARKSEAGREEN
            case "darkslateblue": return DARKSLATEBLUE
            case "darkslategray":
            case "darkslategrey": return DARKSLATEGREY
            case "darkturquoise": return DARKTURQUOISE
            case "darkviolet": return DARKVIOLET
            case "deeppink": return DEEPPINK
            case "deepskyblue": return DEEPSKYBLUE
            case "dimgray":
            case "dimgrey": return DIMGREY
            case "dodgerblue": return DODGERBLUE
            case "firebrick": return FIREBRICK
            case "floralwhite": return FLORALWHITE
            case "forestgreen": return FORESTGREEN
            case "gainsboro": return GAINSBORO
            case "ghostwhite": return GHOSTWHITE
            case "gold": return GOLD
            case "goldenrod": return GOLDENROD
            case "greenyellow": return GREENYELLOW
            case "honeydew": return HONEYDEW
            case "hotpink": return HOTPINK
            case "indianred": return INDIANRED
            case "indigo": return INDIGO
            case "ivory": return IVORY
            case "khaki": return KHAKI
            case "lavender": return LAVENDER
            case "lavenderblush": return LAVENDERBLUSH
            case "lawngreen": return LAWNGREEN
            case "lemonchiffon": return LEMONCHIFFON
            case "lightblue": return LIGHTBLUE
            case "lightcoral": return LIGHTCORAL
            case "lightcyan": return LIGHTCYAN
            case "lightgoldenrodyellow": return LIGHTGOLDENRODYELLOW
            case "lightgray":
            case "lightgrey": return LIGHTGREY
            case "lightgreen": return LIGHTGREEN
            case "lightpink": return LIGHTPINK
            case "lightsalmon": return LIGHTSALMON
            case "lightseagreen": return LIGHTSEAGREEN
            case "lightskyblue": return LIGHTSKYBLUE
            case "lightslategray":
            case "lightslategrey": return LIGHTSLATEGREY
            case "lightsteelblue": return LIGHTSTEELBLUE
            case "lightyellow": return LIGHTYELLOW
            case "limegreen": return LIMEGREEN
            case "linen": return LINEN
            case "magentafuchsia": return MAGENTA
            case "mediumaquamarine": return MEDIUMAQUAMARINE
            case "mediumblue": return MEDIUMBLUE
            case "mediumorchid": return MEDIUMORCHID
            case "mediumpurple": return MEDIUMPURPLE
            case "mediumseagreen": return MEDIUMSEAGREEN
            case "mediumslateblue": return MEDIUMSLATEBLUE
            case "mediumspringgreen": return MEDIUMSPRINGGREEN
            case "mediumturquoise": return MEDIUMTURQUOISE
            case "mediumvioletred": return MEDIUMVIOLETRED
            case "midnightblue": return MIDNIGHTBLUE
            case "mintcream": return MINTCREAM
            case "mistyrose": return MISTYROSE
            case "moccasin": return MOCCASIN
            case "navajowhite": return NAVAJOWHITE
            case "oldlace": return OLDLACE
            case "olivedrab": return OLIVEDRAB
            case "orangered": return ORANGERED
            case "orchid": return ORCHID
            case "palegoldenrod": return PALEGOLDENROD
            case "palegreen": return PALEGREEN
            case "paleturquoise": return PALETURQUOISE
            case "palevioletred": return PALEVIOLETRED
            case "papayawhip": return PAPAYAWHIP
            case "peachpuff": return PEACHPUFF
            case "peru": return PERU
            case "pink": return PINK
            case "plum": return PLUM
            case "powderblue": return POWDERBLUE
            case "rosybrown": return ROSYBROWN
            case "royalblue": return ROYALBLUE
            case "saddlebrown": return SADDLEBROWN
            case "salmon": return SALMON
            case "sandybrown": return SANDYBROWN
            case "seagreen": return SEAGREEN
            case "seashell": return SEASHELL
            case "sienna": return SIENNA
            case "skyblue": return SKYBLUE
            case "slateblue": return SLATEBLUE
            case "slategrey":
            case "slategray": return SLATEGREY
            case "snow": return SNOW
            case "springgreen": return SPRINGGREEN
            case "steelblue": return STEELBLUE
            case "tan": return TAN
            case "thistle": return THISTLE
            case "tomato": return TOMATO
            case "turquoise": return TURQUOISE
            case "violet": return VIOLET
            case "wheat": return WHEAT
            case "whitesmoke": return WHITESMOKE
            case "yellowgreen": return YELLOWGREEN
            case "rebeccapurple": return REBECCA_PURPLE
            default: throw new IllegalArgumentException("unknown colour name $cssColour")
        }
    }

    private Color decodeHexColor(String s) {

        Long intval = Long.decode(s)
        int i = intval.intValue()
        switch (s.length() - 1) {
            case 3:
                def r = (i >> 8) & 0xF
                def g = (i >> 4) & 0xF
                def b  = i & 0xF
                return new Color(r * 0x10 + r, g * 0x10 + g, b * 0x10 + b)
            case 4:
                def r = (i >> 12) & 0xF
                def g = (i >> 8) & 0xF
                def b = (i >> 4) & 0xF
                def a = i & 0xF
                return new Color(r * 0x10 + r, g * 0x10 + g, b * 0x10 + b, a * 0x10 + a)
            case 6:
                def r = (i >> 16) & 0xFF
                def g = (i >> 8) & 0xFF
                def b  = i & 0xFF
                return new Color(r, g, b)
            case 8:
                def r = (i >> 24) & 0xFF
                def g = (i >> 16) & 0xFF
                def b = (i >> 8) & 0xFF
                def a = i & 0xFF
                return new Color(r, g, b, a)
            default:
                throw new IllegalArgumentException("$s is not a valid hex colour")
        }

    }

    private double parsePercentOrNumber(String n, Range<Double> range = 0.0..255.0) {
        def trimmed = n.trim()
        def isPercentage = trimmed.endsWith('%')
        if (isPercentage) {
            def val = parsePercent(trimmed)
            def y = range.to - range.from
            return val * y + range.from
        } else {
            return Double.parseDouble(trimmed)
        }
    }

    private double parsePercent(String n) {
        def trimmed = n.trim()
        if (!trimmed.endsWith('%')) throw new IllegalArgumentException("$n is not a percentage")
        return Double.parseDouble(trimmed.substring(0, trimmed.length() - 1)) / 100.0
    }

    private double parseAngle(String n) {
        def trimmed = n.trim()
        double deg
        if (trimmed.endsWith('deg')) {
            deg = Double.parseDouble(trimmed.substring(0, trimmed.length() - 3))
        } else if (trimmed.endsWith('grad'))  {
            def grad = Double.parseDouble(trimmed.substring(0, trimmed.length() - 4))
            deg = (grad / 400) * 360.0
        } else if (trimmed.endsWith('rad')) {
            def rad = Double.parseDouble(trimmed.substring(0, trimmed.length() - 3))
            deg = (rad / (2 * PI)) * 360.0
        } else if (trimmed.endsWith('turn')) {
            def turn = Double.parseDouble(trimmed.substring(0, trimmed.length() - 4))
            deg = turn * 360.0
        } else {
            deg = Double.parseDouble(trimmed)
        }
        return deg % 360.0
    }

    private Color decodeRgbaColor(String colourString) {
        // ad hoc parser of CSS rgb colours
        def colours = colourString.split(',')
        def r,g,b,a = 255
        if (colours.length > 1) {
            r = parsePercentOrNumber(colours[0])
            g = parsePercentOrNumber(colours[1])
            b = parsePercentOrNumber(colours[2])
            if (colours.length > 3) {
                a = constrain(round(parsePercentOrNumber(colours[3], 0.0..1.0) * 255))
            }
        } else {
            def coloursAlpha = colourString.split('/')
            def coloursPart
            if (coloursAlpha.length > 1) {
                a = constrain(round(parsePercentOrNumber(coloursAlpha[1], 0.0..1.0) * 255))
                coloursPart = coloursAlpha[0]
            } else {
                coloursPart = colourString
            }

            colours = coloursPart.split('\\s').findAll { it }
            r = parsePercentOrNumber(colours[0])
            g = parsePercentOrNumber(colours[1])
            b = parsePercentOrNumber(colours[2])
        }

        new Color(r.toInteger(),g.toInteger(),b.toInteger(),a.toInteger())
    }

    private Color decodeHslaColor(String colourString) {
        // ad hoc parser of CSS rgb colours
        def colours = colourString.split(',')
        double h,s,l
        int a = 255
        if (colours.length > 1) {
            if (colours.length < 3 || colours.length > 4) throw new IllegalArgumentException("$colourString is not a valid colour")
            h = parseAngle(colours[0])
            s = parsePercent(colours[1])
            l = parsePercent(colours[2])
            if (colours.length > 3) {
                a = constrain(round(parsePercentOrNumber(colours[3], 0.0..1.0) * 255))
            }
        } else {
            def coloursAlpha = colourString.split('/')
            def coloursPart
            if (coloursAlpha.length > 1) {
                a = constrain(round(parsePercentOrNumber(coloursAlpha[1], 0.0..1.0) * 255))
                coloursPart = coloursAlpha[0]
            } else {
                coloursPart = colourString
            }

            def colours2 = coloursPart.split('\\s').findAll { it }
            if (colours2.size() != 3) throw new IllegalArgumentException("$colourString is not a valid colour")
            h = parseAngle(colours2[0])
            s = parsePercent(colours2[1])
            l = parsePercent(colours2[2])
        }
        def c = (1.0 - abs(2.0 * l - 1.0)) * s
        def x = c * (1.0 - abs((h / 60.0) % 2.0 - 1.0))
        def m = l - c / 2.0
        double rp = 0.0, gp = 0.0, bp = 0.0
        if (0.0 <= h && h < 60.0) { rp = c; gp = x; }
        else if (60.0 <= h && h < 120.0) { rp = x; gp = c; }
        else if (120.0 <= h && h < 180.0) { gp = c; bp = x; }
        else if (180.0 <= h && h < 240.0) { gp = x; bp = c; }
        else if (240.0 <= h && h < 300.0) { rp = x; bp = c; }
        else if (300.0 <= h && h < 360.0) { rp = c; bp = x; }
        else throw new IllegalArgumentException("$colourString is not a valid colour")

        def r = round((rp + m) * 255.0)
        def g = round((gp + m) * 255.0)
        def b = round((bp + m) * 255.0)

        new Color(r.toInteger(),g.toInteger(),b.toInteger(),a.toInteger())
    }

    private int constrain(number, int min = 0, int max = 255) {
        int n = number.toInteger()
        if (n > max) return max
        if (n < min) return min
        return n
    }
}
