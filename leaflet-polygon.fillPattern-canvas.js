/**
 *  Extend the Polygon Object to set an image to fill the path in canvas

 *  Author: bgx1012@163.com
 */

(function (window, document, undefined) {
    if (L.Canvas) {
        L.Canvas.include({
            _fillStroke: function (ctx, layer) {

                var options = layer.options

                if (options.imgId && options.textureScaleX !== 0 && options.textureScaleY !== 0) {
                    if (!layer.image || options.imgId !== layer.image.imgId) {
                        if (layer.image) {
                            layer.image.remove()
                        }

                        layer.image = this.getPane().querySelector("[src='"+options.imgId+"']")
                        if (!layer.image) {
                            layer.image = new Image()
                            layer.image.hidden = true
                            layer.image.src = options.imgId
                            layer.image.imgId = options.imgId
                            this.getPane().appendChild(layer.image)
                        }
                    }

                    const img = layer.image

                    if (!img.complete) {
                        return
                    }

                    const offscreen = new OffscreenCanvas(img.width, img.height);
                    const ctxOffscreen = offscreen.getContext("2d")
                    const patternOffscreen = ctxOffscreen.createPattern(img, 'repeat')
                    ctxOffscreen.globalCompositeOperation = "copy"
                    ctxOffscreen.globalAlpha = 1
                    ctxOffscreen.fillStyle = patternOffscreen
                    ctxOffscreen.fillRect(0, 0, img.width, img.height)
                    ctxOffscreen.globalCompositeOperation = "multiply"
                    ctxOffscreen.fillStyle = options.fillColor || options.color
                    ctxOffscreen.fillRect(0, 0, img.width, img.height)

                    if (offscreen.width != 0 && offscreen.height != 0) {
                        ctx.save() // so we can remove the clipping
                        ctx.clip()
                        ctx.globalAlpha = options.fillOpacity
                        ctx.imageSmoothingEnabled = false
                        const bounds = layer._rawPxBounds
                        const size = bounds.getSize()
                        const pattern = ctx.createPattern(offscreen, 'repeat')
                        const zoomScale = Math.pow(2, this._map.getZoom())
                        const pixelOrigin = this._map.getPixelOrigin()
                        const matrix = new DOMMatrix()
                        matrix.translateSelf(options.texturePositionX * zoomScale - pixelOrigin.x, options.texturePositionY * zoomScale - pixelOrigin.y)
                        matrix.scaleSelf(options.textureScaleX * zoomScale, options.textureScaleY * zoomScale, 1)
                        pattern.setTransform(matrix)
                        ctx.fillStyle = pattern
                        ctx.fillRect(bounds.min.x, bounds.min.y, size.x, size.y)
                        ctx.restore()
                    }
                } else {
                    ctx.globalAlpha = options.fillOpacity
                    ctx.fillStyle = options.fillColor || options.color

                    ctx.fill(options.fillRule || 'evenodd')
                }

                if (options.stroke && options.weight !== 0) {
                    if (ctx.setLineDash) {
                        ctx.setLineDash(layer.options && layer.options._dashArray || [])
                    }

                    ctx.globalAlpha = options.opacity
                    ctx.lineWidth = options.weight
                    ctx.strokeStyle = options.color
                    ctx.lineCap = options.lineCap
                    ctx.lineJoin = options.lineJoin
                    ctx.stroke()
                }
            }
        })
    }
}(this, document))
