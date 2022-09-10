class Hexagon {
  constructor(radius, center) {
    this.center = center
    this.radius = radius
    this.corners = []
  }

  getCorners() {
    if (this.corners.length === 0) {
      this.corners = Array.from({ length: 6 }, (_, i) =>
        this.center.add(
          new Vector(
            this.radius * Math.cos((i * Math.PI) / 3),
            this.radius * Math.sin((i * Math.PI) / 3)
          )
        )
      )
    }
    return this.corners
  }
}

class RenderedHexagon {
  constructor(hexagon, color = '#000', alpha = 0) {
    this.hexagon = hexagon
    this.color = color
    this.alpha = alpha
  }

  render() {
    const corners = this.hexagon.getCorners()
    ctx.save()

    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(corners[0].v[0], corners[0].v[1])
    for (const corner of corners) {
      ctx.lineTo(corner.v[0], corner.v[1])
    }
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = this.color
    ctx.globalAlpha = this.alpha
    ctx.fill()

    ctx.restore()
  }
}
