package au.org.ala.profile.hub.reports


import groovy.util.logging.Slf4j
import net.sf.jasperreports.engine.JRException
import net.sf.jasperreports.engine.JasperReportsContext
import net.sf.jasperreports.renderers.AbstractRenderToImageDataRenderer

import java.awt.*
import java.awt.geom.Dimension2D
import java.awt.geom.Rectangle2D

import static java.awt.MultipleGradientPaint.CycleMethod.NO_CYCLE

/**
 * Renders a gradient from a start colour to transparent like so:
 * COLOUR --33%--> COLOUR --100%--> COLOUR_WITH_ALPHA_0
 */
@Slf4j
class GradientRenderer extends AbstractRenderToImageDataRenderer {

    private static final Color TRANSPARENT = new Color(0,0,0,0)

    private static final int DEFAULT_WIDTH = 595
    private static final int DEFAULT_HEIGHT = 185

    private final int width
    private final int height

    GradientRenderer(Color startColor, int width = DEFAULT_WIDTH, int height = DEFAULT_HEIGHT) {
        this.startColor = startColor
        this.width = width
        this.height = height
    }

    GradientRenderer(String startColor, int width = DEFAULT_WIDTH, int height = DEFAULT_HEIGHT) {
        this(new ColourParser().decodeColorWithDefault(startColor, Color.WHITE), width, height)
    }

    Color startColor

    @Override
    Dimension2D getDimension(JasperReportsContext jasperReportsContext) throws JRException {
        return new Dimension(width, height)
    }

    @Override
    void render(JasperReportsContext jasperReportsContext, Graphics2D g2d, Rectangle2D rect) throws JRException {
        log.debug("GradientRenderer.render() from $startColor")
        g2d.background = TRANSPARENT
        def transparentStartColor = new Color(startColor.red, startColor.green, startColor.blue, 0)
        log.debug("GradientRenderer.render() to $transparentStartColor")
        final float[] fractions = [ 0f, 0.33f, 1.0f ]
        final Color[] colors = [ startColor, startColor, transparentStartColor]
        g2d.paint = new LinearGradientPaint(0f, 0f, rect.width.toFloat(), 0f, fractions, colors, NO_CYCLE)

        g2d.fillRect(0, 0, rect.width.toInteger(), rect.height.toInteger())
    }
}
