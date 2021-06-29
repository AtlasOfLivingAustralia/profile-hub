package au.org.ala.profile.hub.reports;

import java.awt.*;

import static java.lang.Math.pow;
import static java.lang.Math.round;

public class ColourUtils {
    public static int clamp(long n) {
        if (n < 0) return 0;
        if (n > 255) return 255;
        return (int)n;
    }

    public static int clamp(int n) {
        if (n < 0) return 0;
        if (n > 255) return 255;
        return n;
    }

    public static int clamp(double n) {
        return clamp(Math.round(n));
    }

    /**
     * Generate the contrast ratio between two relative luminances.  The lighter value should be the first argument.
     * @param l1 The lighter relative luminance value
     * @param l2 The darker relative luminance value
     * @return The contrast ratio
     */
    public static double contrastRatio(double l1, double l2) {
        return (l1 + 0.05) / (l2 + 0.05);
    }

    /**
     * Calculate the relativeLuminance of a colour for determining the contrast ratio between two colours
     * @param red The red value
     * @param green The green value
     * @param blue The blue value
     * @return The relative luminance
     */
    public static double relativeLuminance(int red, int green, int blue) {
//        Note 1: For the sRGB colorspace, the relative luminance of a color is defined as L = 0.2126 * R + 0.7152 * G + 0.0722 * B where R, G and B are defined as:
//
//        if RsRGB <= 0.03928 then R = RsRGB/12.92 else R = ((RsRGB+0.055)/1.055) ^ 2.4
//        if GsRGB <= 0.03928 then G = GsRGB/12.92 else G = ((GsRGB+0.055)/1.055) ^ 2.4
//        if BsRGB <= 0.03928 then B = BsRGB/12.92 else B = ((BsRGB+0.055)/1.055) ^ 2.4
        double r = red / 255.0;
        double g = green / 255.0;
        double b = blue / 255.0;

        double R = enbiggen(r);
        double G = enbiggen(g);
        double B = enbiggen(b);

        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    private static double enbiggen(double c) {
        if (c <= 0.03928) {
            return c / 12.92;
        } else {
            return pow((c+0.055)/1.055, 2.4);
        }
    }

    /**
     * Essentiallity the same as relative luminance but ensures the result is in the range 0-255
     * @param color The colour
     * @return The luminosity of the colour
     */
    public static double luminosity(Color color) {
        return ((double)color.getRed()) * 0.21 + ((double)color.getGreen()) * 0.72 + ((double)color.getBlue()) * 0.07;
    }

    /**
     * Takes a colour and converts it to greyscale using the luminosity of the colour.
     * @param color The colour
     * @return The greyscale colour.
     */
    public static Color asLuminosity(Color color) {
        int l = clamp(luminosity(color));
        return new Color(l, l, l, color.getAlpha());
    }

    /**
     * Lighten a colour by a specified percentage
     * @param color The colour to lighten
     * @param percent The percentage to lighten
     * @return The lighter colour
     */
    public static Color lighten(Color color, double percent) {
        return new Color(clamp(round(color.getRed() + 255.0 * percent)), clamp(round(color.getGreen() + 255.0 * percent)), clamp(round(color.getBlue() + 255.0 * percent)));
    }

    /**
     * Darken a colour by a specified percentage
     * @param color The colour to darken
     * @param percent The percentage to darken
     * @return The darker colour
     */
    public static Color darken(Color color, double percent) {
        return new Color(clamp(round(color.getRed() - 255.0 * percent)), clamp(round(color.getGreen() - 255.0 * percent)), clamp(round(color.getBlue() - 255.0 * percent)));
    }

    /**
     * Return the argument colour with the alpha set to the given argument
     * @param color The colour
     * @param alpha The new alpha value (from 0.0 to 1.0)
     * @return The original colour with the alpha set
     */
    public static Color withAlpha(Color color, double alpha) {
        return new Color(color.getRed(), color.getGreen(), color.getBlue(), clamp(255.0 * alpha));
    }

    /**
     * Return the argument colour with the alpha set to the given argument
     * @param color The colour
     * @param alpha The new alpha value (from 0 to 255)
     * @return The original colour with the alpha set
     */
    public static Color withAlpha(Color color, int alpha) {
        return new Color(color.getRed(), color.getGreen(), color.getBlue(), alpha);
    }

    public static int minOf(int a, int b, int c) {
        return Math.min(Math.min(a, b), c);
    }

    public static int maxOf(int a, int b, int c) {
        return Math.max(Math.max(a, b), c);
    }

    /**
     * Generate a greyscale version of the given colour using the alleged photoshop desaturation algorithm
     * @param p The colour to get a greyscale value for
     * @return The new grey colour
     */
    public static Color desaturate(Color p) {
        int bw = clamp((minOf(p.getRed(), p.getGreen(), p.getBlue()) + maxOf(p.getRed(), p.getGreen(), p.getBlue())) / 2);
        return new Color(bw, bw, bw, p.getAlpha());
    }

    /**
     * Blend a background colour with a foreground colour.  For any appreciable results the foreground colour should
     * have an alpha value < 1.0.
     *
     * @param fg The foreground colour
     * @param bg The background colour
     * @return The blended colour
     */
    public static Color blend(Color fg, Color bg) {
        double fga = (double)fg.getAlpha() / 255.0;
        double bga = (double)bg.getAlpha() / 255.0;

        double outa = fga + bga * (1.0 - fga);

        if (outa <= 0.0) return new Color(0,0,0,0);

        double fgr = (double)fg.getRed() / 255.0;
        double bgr = (double)bg.getRed() / 255.0;
        double outr = (fgr * fga + bgr * bga * (1.0 - fga)) / outa;

        double fgg = (double)fg.getGreen() / 255.0;
        double bgg = (double)bg.getGreen() / 255.0;
        double outg = (fgg * fga + bgg * bga * (1.0 - fga)) / outa;

        double fgb = (double)fg.getBlue() / 255.0;
        double bgb = (double)bg.getBlue() / 255.0;
        double outb = (fgb * fga + bgb * bga * (1.0 - fga)) / outa;

        return new Color(clamp(outr * 255.0), clamp(outg * 255.0), clamp(outb * 255.0), clamp(outa * 255.0));
    }
}
