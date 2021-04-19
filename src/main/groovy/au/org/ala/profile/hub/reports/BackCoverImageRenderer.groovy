package au.org.ala.profile.hub.reports


import groovy.util.logging.Slf4j
import groovyx.gpars.dataflow.Dataflows
import net.sf.jasperreports.engine.JRException
import net.sf.jasperreports.engine.JasperReportsContext
import net.sf.jasperreports.renderers.AbstractRenderToImageDataRenderer

import java.awt.*
import java.awt.geom.Dimension2D
import java.awt.geom.Rectangle2D
import java.awt.image.BufferedImage
import java.awt.image.ImageObserver

import static java.lang.Math.round

/**
 * Renderer for the report back cover image.
 *
 * First it synchronously loads the image from the URL and at the same time, scales it to required width
 * and height, preserving aspect ratio by centre cropping.
 *
 * At render time it will also desaturate each pixel and then apply a wash using the washColour.  WashColour
 * should have an alpha value at most 0.8.  Wash colours alpha will then transition to 1.0 from gradientThreshold of
 * the height to 1.0 of the height, so that the colour fades into the main background colour.
 */
@Slf4j
class BackCoverImageRenderer extends AbstractRenderToImageDataRenderer {

    private final BufferedImage bufferedImage
    private final Color washColor
    private final double gradientThreshold
    private final int width
    private final int height

    BackCoverImageRenderer(URL url, Color washColor, double gradientThreshold = 0.7, int width = 595, int height = 230) {
        this.gradientThreshold = gradientThreshold
        this.washColor = washColor
        this.bufferedImage = create(url, new Dimension(width, height))
        this.width = width
        this.height = height
    }

    @Override
    Dimension2D getDimension(JasperReportsContext jasperReportsContext) throws JRException {
        return new Dimension(width, height)
    }

    /**
     * Takes the scaled image bytes and applies the desaturation, wash and gradient before painting the new image
     * into the graphics context
     * @param jasperReportsContext
     * @param grx
     * @param rectangle
     * @throws JRException
     */
    @Override
    void render(JasperReportsContext jasperReportsContext, Graphics2D grx, Rectangle2D rectangle) throws JRException {
        log.debug("BackCoverImageRenderer.render()")
        def gradThresh = round(bufferedImage.height.toDouble() * gradientThreshold).toInteger()
        def gradThreshD = gradThresh.toDouble()
        def gradientHeight = (bufferedImage.height - gradThresh).toDouble()
        def alphaRemaining = 255 - washColor.alpha
        def alphaRemainingDouble = alphaRemaining.toDouble()

        for (int i = 0;  i < bufferedImage.width; ++i) {
            for (int j = 0; j < bufferedImage.height; ++j) {
                def colour = bufferedImage.getRGB(i, j)
                def c = new Color(colour, true)
                def fgd
                if (j > gradThresh) {
                    def alphaDelta = alphaRemainingDouble * ((j.toDouble() - gradThreshD) / gradientHeight)
                    def newAlpha = ColourUtils.clamp(washColor.alpha + round(alphaDelta).toInteger())

                    fgd = ColourUtils.withAlpha(washColor, newAlpha)
                } else {
                    fgd = washColor
                }
                def c2 = ColourUtils.blend(fgd, ColourUtils.asLuminosity(c))
                bufferedImage.setRGB(i,j, c2.getRGB())
            }
        }

        grx.paint = new TexturePaint(bufferedImage, new Rectangle(bufferedImage.width, bufferedImage.height))
//        g2d.paint = TexturePaint(image, Rectangle(image.width, image.height))
        grx.fillRect(0, 0, width, height)
    }

    /**
     * Load and scale the image to the required size using the method from
     * https://javagraphics.blogspot.com.au/2011/05/images-scaling-jpegs-and-pngs.html
     *
     * @param url
     * @param maxSize
     * @return
     * @throws Throwable
     */
    BufferedImage create(URL url, Dimension maxSize) throws Throwable {
        Image image = Toolkit.getDefaultToolkit().createImage(url)

        // Could also do this with Java 8 CompletableFutures
        final def df = new Dataflows()
//        CompletableFuture<Integer> widthFuture = new CompletableFuture<>()

        def initWidth = image.getWidth(new ImageObserver() {
            @Override
            boolean imageUpdate(Image img, int infoflags, int x, int y, int width, int height) {

                def error = (infoflags & ERROR) != 0
                def abort = (infoflags & ABORT) != 0

                if (error || abort) {
//                    widthFuture.completeExceptionally(new IOException())
                    df.width = -1
                    return false
                }

                def finished = (infoflags & WIDTH) != 0
//                widthFuture.complete(width)
                df.width = width
                return !finished
            }
        })

        if (initWidth != -1) {
            df.width = initWidth
//            widthFuture.complete(initWidth)
        }

//        CompletableFuture<Integer> heightFuture = new CompletableFuture<>()
        def initHeight = image.getHeight(new ImageObserver() {
            @Override
            boolean imageUpdate(Image img, int infoflags, int x, int y, int width, int height) {

                def error = (infoflags & ERROR) != 0
                def abort = (infoflags & ABORT) != 0

                if (error || abort) {
//                    heightFuture.completeExceptionally(new IOException())
                    df.height = -1
                    return false
                }

                def finished = (infoflags & HEIGHT) != 0
//                heightFuture.complete(height)
                df.height = height
                return !finished
            }
        })

        if (initHeight != -1) {
//            heightFuture.complete(initHeight)
            df.height = initHeight
        }

//        def imageWidth = widthFuture.join()
//        def imageHeight = heightFuture.join()
        int imageWidth = df.width
        int imageHeight = df.height
        if (imageWidth == -1 || imageHeight == -1) {
            throw new IOException("Couldn't read width ($imageWidth) or height ($imageHeight) from $url")
        }
        def maxWidth = maxSize.width.toInteger()
        def maxHeight = maxSize.height.toInteger()

        BufferedImage thumbnail = new BufferedImage(maxWidth, maxHeight, BufferedImage.TYPE_INT_ARGB)
        Graphics2D g = thumbnail.createGraphics()
        if (imageWidth != maxWidth || imageHeight != maxHeight) {
            def widthPct = maxWidth.toDouble() / imageWidth.toDouble()
            def heightPct = maxHeight.toDouble() / imageHeight.toDouble()

            def scalePct = Math.max(widthPct, heightPct)
            g.scale(scalePct, scalePct)

            def scaledWidth = imageWidth * scalePct
            def scaledHeight = imageHeight * scalePct

            // centre scaled image
            def startX = round((scaledWidth - maxWidth) / 2).toInteger()
            def startY = round((scaledHeight - maxHeight) / 2).toInteger()
            g.translate(-startX, -startY)
        }

        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR)
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
        while (!g.drawImage(image, 0, 0, null));
        g.dispose()

        image.flush()

        return thumbnail
    }

}
