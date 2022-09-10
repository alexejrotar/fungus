class Game {
  constructor(levelDescriptions) {
    this.levelDescriptions = levelDescriptions
    this.currentLevel = undefined
    this.levelIndex = localStorage.getItem('levelIndex') ?? 0
    introBox.addEventListener('click', () => introBox.classList.add('closed'))
  }

  start() {
    this.nextLevel()
    window.setInterval(() => this.render(), 20)
  }

  nextLevel() {
    if (this.levelIndex >= this.levelDescriptions.length) return
    this.levelIndex++

    if (music) {
      music.modulate()
    }

    this.resetLevel()
  }

  resetLevel() {
    localStorage.setItem('levelIndex', this.levelIndex - 1)
    const desc = this.levelDescriptions[this.levelIndex - 1]
    if (desc.t !== undefined) {
      introBox.innerHTML = desc.t
      introBox.classList.remove('closed')
    }

    const molecules = desc.m.map((m) => DraggableMolecule.from(m))
    this.currentLevel = new Level(molecules, () => this.nextLevel())
  }

  resetGame() {
    this.levelIndex = 1
    this.resetLevel()
  }

  render() {
    ctx.save()
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    this.currentLevel.render(ctx)
  }
}
;class Grid {
  constructor(radius, center, size, color) {
    this.radius = radius
    this.center = center
    this.size = size
    this.color = color
    this.circle = Array.from(Position.circle(this.size)).map((position) =>
      this.getHexagon(position)
    )
  }

  render() {
    for (const hexagon of this.circle) {
      new RenderedHexagon(hexagon, this.color).render()
    }
  }

  getHexagon(position) {
    const cartesian = this.getCartesian(position)
    return new Hexagon(this.radius, cartesian)
  }

  getCartesian(position) {
    const cartesian = position.toNormalizedCartesian().scale(this.radius)
    return cartesian.add(this.center)
  }

  getPositions(cartesian) {
    const normalizedCartesian = cartesian
      .subtract(this.center)
      .scale(1 / this.radius)
    return Position.fromNormalizedCartesian(normalizedCartesian)
  }

  maxPositionsBetween(source, target) {
    return Math.floor(
      source.distance(target) / (2 * Math.cos(Math.PI / 3) * this.radius)
    )
  }

  *traceToPositions(trace) {
    const seenPositions = []
    for (const cartesian of trace) {
      const positions = this.getPositions(cartesian).filter(
        (position) =>
          seenPositions.find((other) => position.equals(other)) === undefined
      )
      for (const position of positions) {
        seenPositions.push(position)
        yield position
      }
    }
  }

  isInside(position) {
    return position.isInside(this.size)
  }

  output() {
    return { c: this.center.output(), r: this.radius, s: this.size }
  }

  static from({ r, c, s }) {
    return new Grid(r, new Vector(...c), s, '#777')
  }
}

class ReactiveGrid {
  constructor() {
    this.mousePosition = undefined
    this.setListeners()
    ;[
      'mousedown',
      'mouseup',
      'mousemove',
      'touchstart',
      'touchend',
      'touchmove',
    ].forEach((eventName) =>
      canvas.addEventListener(eventName, (event) =>
        this.handleMouseTouchEvent(eventName, event)
      )
    )

    const keymap = { KeyQ: 'left', KeyE: 'right', KeyD: 'special' }

    window.addEventListener('keydown', (event) => {
      Object.entries(keymap).forEach(([key, cb]) =>
        key === event.code ? this.listeners[cb].call() : {}
      )
    })
  }

  handleMouseTouchEvent(eventName, event) {
    event.preventDefault()

    let [x, y] = [0, 0]
    if (eventName.startsWith('touch')) {
      const touch = event.changedTouches[0]
      const br = event.target.getBoundingClientRect()
      x = touch.clientX - br.left
      y = touch.clientY - br.top
    } else {
      ;[x, y] = [event.offsetX, event.offsetY]
    }
    const position = grid.getPositions(new Vector(x, y))[0]

    switch (eventName) {
      case 'mousedown':
      case 'touchstart':
        this.listeners.mousedown(position)
        break
      case 'mouseup':
      case 'touchend':
        this.listeners.mouseup(position)
        break
      case 'mousemove':
      case 'touchmove':
        if (!this.mousePosition || !this.mousePosition.equals(position)) {
          this.mousePosition = position
          this.listeners.mousemove(position)
        }
        break
    }
  }

  setListeners(
    listeners = {
      mousedown: () => {},
      mousemove: () => {},
      mouseup: () => {},
      left: () => {},
      right: () => {},
      special: () => {},
    }
  ) {
    this.listeners = listeners
  }
}

class Position {
  constructor(u, v) {
    this.u = u
    this.v = v
    if (!Position.base) {
      Position.base = [
        [1 + Math.cos(Math.PI / 3), -(1 + Math.cos(Math.PI / 3))],
        [Math.sin(Math.PI / 3), Math.sin(Math.PI / 3)],
      ]
    }
  }

  static *circle(radius) {
    for (let u = 0; u < radius; u++) {
      for (let v = 0; v < radius; v++) {
        for (let w = 0; w < radius; w++) {
          if ([u, v, w].some((z) => z === 0)) {
            yield new Position(u - w, v - w)
          }
        }
      }
    }
  }

  static fromNormalizedCartesian(cartesian) {
    const matrix = new Matrix(Position.base).invert()
    const vector = matrix.multiply(cartesian)
    let candidates = vector
      .rounded()
      .map((candidate) => new Position(...candidate))

    let minDistance = Infinity
    const distances = candidates.map((candidate) => {
      const candidateCartesian = candidate.toNormalizedCartesian()
      const distance = cartesian.distance(candidateCartesian)

      if (distance < minDistance) {
        minDistance = distance
      }
      return distance
    })
    const positions = candidates
      .filter((_, i) => Math.abs(minDistance - distances[i]) < 0.01)
      .filter(
        (position, i, self) =>
          self.findIndex((other) => other.equals(position)) === i
      )
    return positions
  }

  toNormalizedCartesian() {
    const matrix = new Matrix(Position.base)
    return matrix.multiply(new Vector(this.u, this.v))
  }

  isInside(radius) {
    if (Math.sign(this.u) === Math.sign(this.v)) {
      return Math.abs(this.u) < radius && Math.abs(this.v) < radius
    } else {
      return Math.abs(this.u) + Math.abs(this.v) < radius
    }
  }

  equals(other) {
    return this.u === other.u && this.v === other.v
  }

  output() {
    return [this.u, this.v]
  }
}

class Matrix {
  constructor(rows) {
    this.rows = rows
  }

  multiply(vector) {
    return new Vector(
      ...this.rows.map((row) => vector.dotProduct(new Vector(...row)))
    )
  }

  scale(factor) {
    return new Matrix(this.rows.map((row) => row.map((u) => u * factor)))
  }

  invert() {
    // assuming 2x2 matrix
    return new Matrix([
      [this.rows[1][1], -this.rows[0][1]],
      [-this.rows[1][0], this.rows[0][0]],
    ]).scale(1 / this.determinant())
  }

  determinant() {
    // assuming 2x2 matrix
    return this.rows[0][0] * this.rows[1][1] - this.rows[1][0] * this.rows[0][1]
  }
}

class Vector {
  constructor(...v) {
    this.v = v
  }

  add(other) {
    return new Vector(...this.v.map((x, i) => x + other.v[i]))
  }

  subtract(other) {
    return this.add(other.scale(-1))
  }

  scale(factor) {
    return new Vector(...this.v.map((x) => x * factor))
  }

  dotProduct(other) {
    return this.v.reduce((sum, x, i) => sum + x * other.v[i], 0)
  }

  distance(other) {
    const diff = other.subtract(this)
    return Math.sqrt(diff.dotProduct(diff))
  }

  rounded() {
    // assuming 2 vector
    const { ceil, floor } = Math
    const v = this.v
    return [
      [floor(v[0]), floor(v[1])],
      [floor(v[0]), ceil(v[1])],
      [ceil(v[0]), ceil(v[1])],
      [ceil(v[0]), floor(v[1])],
    ]
  }

  output() {
    return [...this.v]
  }
}
;class Hexagon {
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
;class Hint {
  constructor(hexagon, expire) {
    this.hexagon = hexagon
    this.expire = expire
    this.fade = 10
  }

  render() {
    if (this.fade === 0) {
      this.expire(this)
      return
    }
    new RenderedHexagon(this.hexagon, 'white', this.fade / 10).render()
    this.fade--
  }
}
;class Level {
  constructor(molecules, completed = () => {}) {
    this.molecules = molecules
    this.hints = []
    this.completed = completed
    reactive.setListeners({
      mousedown: (position) => this.handleMousedown(position),
      mousemove: (position) => this.handleMousemove(position),
      mouseup: (position) => this.handleMouseup(position),
      left: this.handleLeft.bind(this),
      right: this.handleRight.bind(this),
    })
  }

  isOccupied(molecules, position) {
    return molecules.some((molecule) => molecule.isAt(position))
  }

  dissovle(molecule) {
    this.molecules = this.molecules.filter((other) => other !== molecule)
    if (this.molecules.length === 0) this.completed()
  }

  hintAt(position) {
    this.hints.push(
      new Hint(grid.getHexagon(position), this.expireHint.bind(this))
    )
  }

  expireHint(hint) {
    this.hints = this.hints.filter((other) => hint !== other)
  }

  render() {
    ctx.save()
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    grid.render()
    this.molecules.forEach((molecule) => molecule.render())
    this.hints.forEach((hint) => hint.render())
  }

  handleMousedown(position) {
    this.molecules.forEach((molecule) => molecule.mousedown(position))
  }

  handleMousemove(position) {
    this.molecules.forEach((molecule) =>
      molecule.mousemoved(
        position,
        this.dissovle.bind(this),
        this.isOccupied.bind(
          this,
          this.molecules.filter((other) => other !== molecule)
        ),
        this.hintAt.bind(this)
      )
    )
  }

  handleMouseup(_) {
    this.molecules.forEach((molecule) => molecule.mouseup())
  }

  handleLeft() {
    this.molecules.forEach((molecule) =>
      molecule.left(
        this.dissovle.bind(this),
        this.isOccupied.bind(
          this,
          this.molecules.filter((other) => other !== molecule)
        ),
        this.hintAt.bind(this)
      )
    )
  }

  handleRight() {
    this.molecules.forEach((molecule) =>
      molecule.right(
        this.dissovle.bind(this),
        this.isOccupied.bind(
          this,
          this.molecules.filter((other) => other !== molecule)
        ),
        this.hintAt.bind(this)
      )
    )
  }
}
;let game
let canvas
let ctx
let introBox
let grid
let reactive

function startGame() {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  introBox = document.getElementById('intro')
  grid = new Grid(
    15,
    new Vector(canvas.width / 2, canvas.height / 2),
    15,
    '#777'
  )
  reactive = new ReactiveGrid()

  const b64 = new URLSearchParams(window.location.search).get('level')
  if (b64) {
    const json = window.atob(b64)
    const description = JSON.parse(json)
    game = new Game([description])
  } else {
    game = new Game(levelCollection)
  }

  game.start()
}

function translateLevel() {
  const b64 = new URLSearchParams(window.location.search).get('level')
  const json = window.atob(b64)
  const desc = JSON.parse(json)
  const m = desc.m.map(({ c, s }) => ({
    c,
    s: s.map((p) => [p[0] - p[2], p[1] - p[2]]),
  }))
  console.log(JSON.stringify({ m }))
}
;class Molecule {
  constructor(shape, color) {
    this.shape = shape
    this.color = color
  }

  isAt(position) {
    return this.shape.some((other) => other.equals(position))
  }

  transform(transformation, dissolve, isOccupied, hintAt) {
    let aborted = false
    const shape = this.shape.map((position) =>
      transformation.transform(
        position,
        isOccupied,
        () => (aborted = true),
        hintAt
      )
    )

    if (aborted) return false

    if (shape.every((position) => !grid.isInside(position))) dissolve()
    this.shape = shape
    return true
  }

  overlaps(molecule) {
    return this.shape.some((position) => molecule.isAt(position))
  }

  render() {
    ctx.save()
    ctx.lineWidth = 3
    this.shape.forEach((position) => {
      let hexagon = grid.getHexagon(position)
      new RenderedHexagon(hexagon, this.color, 0.4).render()
    })
    ctx.restore()
  }

  output() {
    return { c: this.color, s: this.shape.map((position) => position.output()) }
  }

  highlighted() {
    return new HighlightedMolecule(this.shape, this.color)
  }

  unhighlighted() {
    return new Molecule(this.shape, this.color)
  }

  draggable() {
    return new DraggableMolecule(this.shape, this.color)
  }

  static from({ s, c }) {
    const shape = s.map((pos) => new Position(...pos))
    return new Molecule(shape, c)
  }
}

class HighlightedMolecule extends Molecule {
  constructor(shape, color) {
    super(shape, color)
  }

  render() {
    ctx.save()
    ctx.lineWidth = 3
    this.shape.forEach((position) => {
      let hexagon = grid.getHexagon(position)
      new RenderedHexagon(hexagon, this.color, 0.7).render()
    })
    ctx.restore()
  }
}

class DraggableMolecule extends Molecule {
  constructor(shape, color) {
    super(shape, color)
    this.selected = undefined
  }

  mousedown(position) {
    this.selected = super.isAt(position) ? position : undefined
  }

  mousemoved(position, dissolve, isOccupied, hintAt) {
    if (!this.selected) return

    const transformSuccessful = super.transform(
      new Transpose(this.selected, position),
      () => dissolve(this),
      isOccupied,
      hintAt
    )

    if (transformSuccessful) this.selected = position
  }

  mouseup() {
    this.selected = undefined
  }

  left(dissolve, isOccupied, hintAt) {
    if (!this.selected) return
    super.transform(
      new Rotation(this.selected, 1),
      () => dissolve(this),
      isOccupied,
      hintAt
    )
  }

  right(dissolve, isOccupied, hintAt) {
    if (!this.selected) return
    super.transform(
      new Rotation(this.selected, -1),
      () => dissolve(this),
      isOccupied,
      hintAt
    )
  }

  static from(description) {
    return Molecule.from(description).draggable()
  }
}

class Transformation {
  transform(position, isOccupied, abort, hintAt) {
    const trace = this.getTrace(position)
    const positions = Array.from(grid.traceToPositions(trace))

    for (const transformed of positions) {
      if (isOccupied(transformed)) {
        hintAt(transformed)
        hintAt(position)
        abort()
        return position
      }
    }
    return positions[positions.length - 1]
  }
}

class Transpose extends Transformation {
  constructor(source, target) {
    super()
    this.source = source
    this.target = target
  }

  getTrace(position) {
    const cartesianSource = grid.getCartesian(this.source)
    const cartesianTarget = grid.getCartesian(this.target)
    const offset = cartesianTarget.subtract(cartesianSource)
    const cartesian = grid.getCartesian(position)

    const maxDistance = grid.maxPositionsBetween(
      cartesianSource,
      cartesianTarget
    )
    if (maxDistance === 0) {
      return [cartesian.add(offset)]
    }
    return Array.from(Array(maxDistance + 1), (_, i) =>
      cartesian.add(offset.scale(i / maxDistance))
    )
  }
}

class Rotation extends Transformation {
  constructor(pivot, rotation) {
    super()
    this.pivot = pivot
    this.rotation = rotation
  }

  getTrace(position) {
    const { sin, cos, PI } = Math
    const pivotCartesian = grid.getCartesian(this.pivot)
    const cartesian = grid.getCartesian(position).subtract(pivotCartesian)

    const steps = Array.from(Array(31), (_, i) => i / 30)
    return steps.map((step) => {
      const angle = (step * this.rotation * PI) / 3
      const rotationMatrix = new Matrix([
        [cos(angle), -sin(angle)],
        [sin(angle), cos(angle)],
      ])
      return rotationMatrix.multiply(cartesian).add(pivotCartesian)
    })
  }
}
;const TEMPO = 10
let key = 0

const keys = [
  [
    makeScale([0, 5, 8], 1, 1),
    makeScale([2, 3, 5, 11], 2, 2),
    makeScale([0, 2, 3, 5, 7, 8, 11], 3, 2),
  ],
  [
    makeScale([3, 8, 11], 1, 1),
    makeScale([2, 5, 6, 8], 2, 2),
    makeScale([2, 3, 5, 6, 8, 10, 11], 3, 2),
  ],
  [
    makeScale([2, 6, 11], 1, 1),
    makeScale([5, 8, 9, 11], 2, 2),
    makeScale([1, 2, 5, 6, 8, 9, 11], 3, 2),
  ],
  [
    makeScale([2, 5, 9], 1, 1),
    makeScale([0, 2, 8, 11], 2, 2),
    makeScale([0, 2, 4, 5, 8, 9, 11], 3, 2),
  ],
]

let playing = false
let audioCtx
let merger
let gain

class Music {
  constructor(keys) {
    this.oscillators = keys[key].map(
      (scale, i) => new Oscillator(1 / (1 + i * 4), scale, TEMPO * (i + 1) ** 3)
    )
  }

  on() {
    this.oscillators.forEach((osc) => osc.start())
  }

  off() {
    this.oscillators.forEach((osc) => osc.stop())
  }

  modulate() {
    key = (key + 1) % keys.length
    this.oscillators.forEach((osc, i) => (osc.scale = keys[key][i]))
  }
}

class Oscillator {
  constructor(amplitude, scale, tempo) {
    console.log(tempo)
    this.scale = scale
    this.tempo = 60000 / tempo
    this.amplitude = amplitude

    this.osc = audioCtx.createOscillator()
    this.osc.connect(gain)
    this.index = 0
    this.osc.frequency.setValueAtTime(this.randomNote(), audioCtx.currentTime)
    this.osc.start()
  }

  start() {
    gain.gain.setValueAtTime(this.amplitude, audioCtx.currentTime)
    this.interval = setInterval(() => {
      this.osc.frequency.setValueAtTime(this.randomNote(), audioCtx.currentTime)
    }, this.tempo)
  }

  stop() {
    gain.gain.setValueAtTime(0, audioCtx.currentTime)
    clearInterval(this.interval)
  }

  randomNote() {
    let index = Math.floor(Math.random() * this.scale.length)
    if (index === this.index) index = (index + 1) % this.scale.length
    this.index = index
    return this.scale[index]
  }
}

let music = null

function toggleMusic(event) {
  if (music === null) {
    initialize()
  }

  if (playing) music.off()
  else music.on()
  event.target.textContent = playing ? 'Music On' : 'Music Off'
  playing = !playing
}

function makeScale(notes, octave, range = 1) {
  const a0 = 27.5
  const chromatic = Array.from(
    { length: 12 * range },
    (_, i) => a0 * 2 ** (i / 12)
  )
  return chromatic
    .filter((_, i) => notes.includes(i % 12))
    .map((note) => note * 2 ** octave)
}

function initialize() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  audioCtx = new AudioContext()
  gain = audioCtx.createGain()
  gain.connect(audioCtx.destination)
  music = new Music(keys)
}
;const levelCollection = [
    { "t": "some text", "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "#91f7d1", "s": [[-3, -2], [-3, -3], [-3, -4], [-3, -5], [-2, -6], [-1, -6], [0, -6], [-3, -6], [-1, -5], [-1, -4], [-2, 1], [-2, 2], [-2, 3], [-4, 3], [-4, 2], [-2, 0], [-3, 4], [-2, 4], [-2, -1]] }, { "c": "#e69e90", "s": [[3, 0], [3, -1], [3, -2], [4, -2], [5, -2], [6, -2], [7, -1], [8, 0]] }, { "c": "#f66ff0", "s": [[2, -6], [2, -7], [1, -8], [0, -9], [-1, -10], [-2, -11], [-3, -11], [-4, -11], [-5, -11], [-5, -10], [1, -5], [0, -5], [0, -4], [0, -3], [0, -2], [-2, -5], [-2, -4], [-1, -3], [1, -6]] }, { "c": "#e1cbc9", "s": [[4, -1], [4, 0], [4, 1], [4, 2], [4, 3], [3, 4], [2, 4], [1, 4], [0, 4], [0, 5], [4, 4], [5, 5], [6, 6], [7, 7], [7, 8], [1, 3], [1, 2]] }, { "c": "#8dbf64", "s": [[2, 2], [1, 1], [0, 1], [0, 2], [2, 1]] }, { "c": "#ffac7b", "s": [[-3, 6], [-2, 7], [1, 7], [1, 6], [1, 5], [2, 5], [3, 6], [4, 7], [5, 8], [5, 9], [-1, 8], [0, 8], [1, 8], [-1, 4], [-1, 5], [0, 6], [-4, 6], [-4, 5]] }, { "c": "#cc97b8", "s": [[1, -1], [1, -2], [1, -3], [1, -4], [2, -4], [3, -5], [4, -5], [5, -5], [6, -5], [7, -4], [2, -5]] }, { "c": "#eff5ae", "s": [[2, 0], [2, -1], [2, -2], [2, -3], [3, 1]] }, { "c": "#85989d", "s": [[-3, 2], [-5, 1], [-5, 2], [-5, 3], [-5, 4], [-5, 5], [-5, 6], [-5, 7], [-4, 7], [-3, 7], [-6, 4], [-7, 3], [-6, 3], [-4, 1], [-3, 3], [-3, 1]] }] },
    { "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(233, 133, 154)", "s": [[-3, 1], [-4, 1], [-5, 1], [-6, 1], [-7, 1], [-7, 2], [-6, 3], [-5, 4], [-4, 5], [-3, 5], [-3, 6], [-2, 7], [-1, 7], [0, 8], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [0, 2], [0, 1]] }, { "c": "rgb(155, 126, 144)", "s": [[-4, 2], [-3, 2], [-2, 2], [-2, 1], [-2, 0]] }, { "c": "rgb(120, 166, 189)", "s": [[-1, 5], [-1, 4], [-1, 3], [-1, 2], [-1, 1], [-1, 0], [-2, -1], [-3, -1], [-3, 0], [-4, -2], [-1, -1], [0, -1], [1, -1], [-1, -3], [-1, -2]] }, { "c": "rgb(139, 145, 163)", "s": [[1, 2], [1, 1], [1, 0], [2, 0], [3, 0], [3, -1], [3, -2], [3, -3], [2, -3], [1, -4], [0, -5], [0, -4]] }, { "c": "rgb(223, 255, 121)", "s": [[4, 0], [4, -1], [4, -2], [4, -3], [4, -4], [4, -5], [3, -6], [4, -6], [3, -7], [2, -8], [3, -4], [2, -4], [1, -5], [0, -6], [-1, -7], [0, -7]] }, { "c": "rgb(133, 245, 187)", "s": [[1, -6], [1, -7], [0, -8], [-1, -8], [-2, -8], [-2, -7], [-2, -6]] }, { "c": "rgb(213, 146, 240)", "s": [[1, -8], [2, -7], [2, -6]] }, { "c": "rgb(160, 150, 240)", "s": [[-1, -5], [-1, -4], [0, -3], [1, -2], [2, -1]] }, { "c": "rgb(170, 127, 220)", "s": [[-2, -5], [-2, -4], [-2, -3], [-3, -3], [-4, -3], [-5, -3], [-6, -3], [-2, -2]] }, { "c": "rgb(146, 174, 122)", "s": [[-5, 3], [-4, 3], [-3, 3], [-2, 3]] }] },
    {"m":[{"c":"#8ec8a7","s":[[-1,-1],[6,5],[1,-5],[2,-4],[3,-3],[0,-6],[5,-1],[5,0],[5,1],[-2,-7],[-6,-7],[-5,-7],[-7,-3],[-7,-4],[-7,-5],[4,5],[3,5],[2,5],[1,5],[-3,3],[-4,2],[6,4],[-2,4],[-1,5],[-7,-2],[6,3],[6,2],[4,-2],[-1,-7],[-3,-7],[-4,-7],[-7,-7],[-7,-6],[-7,-1],[-5,1],[-6,0],[0,5]]},{"c":"#aeaa7d","s":[[3,3],[4,4],[5,5],[6,6],[7,7],[7,8],[9,12],[10,12],[11,12],[12,8],[11,7],[10,6],[8,5],[7,4],[12,12],[9,5],[13,12],[13,11],[13,10],[13,9],[2,3],[5,7],[5,8],[6,9],[7,10],[8,11]]},{"c":"#b2a7dd","s":[[0,3],[0,2],[0,6],[0,7],[0,8],[0,9],[1,10],[1,11],[2,12],[3,13],[4,14],[0,1],[0,4],[1,1],[2,1]]},{"c":"#ffdb9d","s":[[8,2],[9,2],[10,3],[11,4],[12,4],[13,5],[14,5],[15,5],[7,1],[4,1],[2,0],[3,0],[1,0],[0,0]]},{"c":"#b57cb6","s":[[-3,5],[-3,6],[-2,7],[-2,8],[-1,9],[-1,10],[-1,11],[0,12],[0,13],[0,14],[-3,2],[-2,2],[-2,1],[-1,1]]},{"c":"#efb38a","s":[[3,-2],[6,-2],[7,-2],[8,-2],[9,-1],[10,-1],[10,-2],[11,-2],[2,-2],[1,-2],[0,-2],[-1,-2]]},{"c":"#dfdf6d","s":[[0,-8],[1,-8],[1,-9],[3,-8],[4,-8],[5,-8],[6,-8],[7,-7],[-1,-3],[-1,-4],[2,-9],[-2,-5]]},{"c":"#b49595","s":[[-3,-6],[-3,-9],[-4,-10],[-4,-11],[-4,-12],[-5,-13],[-6,-13],[-7,-13],[-8,-14],[-3,-5],[-5,-5],[-4,-5]]},{"c":"#71cbb7","s":[[-6,-5],[-9,-9],[-10,-10],[-11,-10],[-12,-10],[-12,-9],[-14,-10],[-15,-11],[-5,-4],[-5,-3],[-5,-2],[-13,-9]]},{"c":"#ce6f6b","s":[[-8,0],[-9,-1],[-10,-1],[-11,-1],[-11,0],[-12,0],[-12,1],[-12,2],[-11,4],[-10,4],[-9,5],[-8,6],[-7,7],[-2,-1],[-2,-2],[-12,3],[-3,0],[-4,0],[-3,-1],[-5,0]]}]},
    {"m":[{"c":"#bfa972","s":[[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[12,12],[12,11],[12,10],[12,9],[12,8],[12,7],[12,5],[9,2],[10,3],[11,4],[10,2],[11,2],[12,2],[13,2],[13,1],[13,0],[13,-1],[10,14],[13,12],[9,4],[10,5],[12,6],[11,6],[7,12],[6,11],[5,11]]},{"c":"#262626","s":[[-6,-2],[-4,-2],[-4,0],[-3,-3],[-1,-3],[-2,-1],[-3,-5]]},{"c":"#1ac125","s":[[-5,-1],[-5,-2],[-5,-3],[-4,-3],[-3,-2]]},{"c":"#90f3d4","s":[[-5,-7],[-5,-8],[-5,-9],[-6,-10],[-5,-6],[-4,-5],[-3,-4],[-2,-4],[-4,-7],[-3,-7],[-6,-6],[-2,-7],[-1,-6],[0,-5],[1,-4]]},{"c":"#6f5df8","s":[[-7,-7],[-8,-7],[-7,-6],[-6,-5],[-5,-4],[-4,-4]]},{"c":"#c56bf5","s":[[-2,-3],[-1,-2],[0,-2],[1,-2],[2,-2],[3,-2],[4,-2],[-2,-2]]},{"c":"#f05151","s":[[-4,-6],[-3,-6],[-2,-5],[-1,-4],[0,-3],[1,-3],[2,-3],[3,-3],[4,-3],[5,-2]]},{"c":"#b382a7","s":[[-6,-3],[-7,-3],[-7,-2],[-6,-1],[-5,0],[-4,1],[-8,-3],[-8,-4],[-8,-5],[-7,-5],[-9,-5],[-10,-6],[-10,-7],[-6,0]]},{"c":"#759683","s":[[-4,-1],[-3,-1],[-3,0],[-3,1],[-3,2],[-3,3],[-4,3],[-5,2],[-6,1],[-7,0],[-8,-1],[-8,-2]]},{"c":"#cdbadb","s":[[-2,0],[-1,0],[-1,-1],[0,1],[1,2],[2,3],[3,4],[3,5],[2,5],[4,5],[5,5],[6,5]]},{"c":"#e3df7e","s":[[-1,-12],[0,-11],[2,-9],[1,-10],[3,-8],[4,-7],[5,-6],[5,-5],[5,-4],[5,-3],[6,-2],[6,-1],[3,3],[3,2],[3,1],[3,0],[4,3],[5,0],[6,0],[3,-1],[4,-1]]},{"c":"#816693","s":[[4,-9],[5,-8],[6,-7],[7,-6],[7,-5],[7,-4],[7,-3],[7,-2],[7,-1],[7,0],[7,1],[7,2],[7,3],[7,4],[6,4],[5,4],[8,2],[9,3],[10,4]]},{"c":"#9d8a9b","s":[[1,4],[0,4],[-1,4],[-2,4],[-3,7],[-4,7],[-5,7],[-6,7],[-7,6],[-8,5],[-9,4],[-10,3],[-11,2],[-3,6],[-3,5],[-3,4],[-12,1],[-2,8],[2,4]]},{"c":"#a4e9b7","s":[[-10,4],[-9,5],[-8,6],[-7,7],[-6,8],[-5,9],[-3,9],[-2,9],[-4,9],[-1,9],[-1,8],[-2,7],[1,9],[0,9],[2,10]]},{"c":"#e196b7","s":[[-3,11],[-1,13],[-2,12],[0,14],[1,14],[1,13],[1,12],[1,11],[2,11],[1,10],[3,12],[6,12],[4,12],[5,12],[3,9],[2,8],[3,11],[3,10]]}]},
    { "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(109,116,196)", "s": [[-5, 1], [-4, 1], [-3, 2], [-2, 3], [-3, 3], [-2, 4], [-3, 4], [-2, 5], [-3, 5], [-4, 4], [-4, 5], [-5, 4], [-5, 3], [-6, 2], [-5, 2], [-4, 3], [-4, 2], [-6, 1], [-6, 3], [-6, -8], [-6, -7], [-6, -9], [-5, -6], [-4, -5], [-3, -5], [-2, -5], [-3, -6], [-2, -6], [-2, -7], [-3, -8], [-4, -8], [-5, -9], [-5, -8], [-5, -7], [-4, -6], [-4, -7], [-3, -7], [-4, -9]] }, { "c": "rgb(183,110,231)", "s": [[-1, 6], [-2, 6], [-3, 6], [-4, 6], [-5, 5], [-6, 4], [-7, 3], [-7, 2], [-8, 2], [-8, 3], [-7, 4], [-6, 5], [-5, 6], [-4, 7], [-3, 7], [-2, 7], [-1, 7], [0, 7], [-1, 5], [0, 6], [0, 5], [-1, 4], [-1, 3], [-1, 2], [-1, 1], [-1, 0], [0, 1], [0, 0], [-1, -1], [-8, -7], [-7, -7], [-8, -8], [-8, -9], [-7, -8], [-8, -10], [-7, -9], [-8, -11], [-7, -10], [-7, -11], [-7, -12], [-3, -11], [-5, -12], [-6, -12], [-4, -12], [-2, -10], [-2, -11], [-3, -12], [-1, -11], [0, -10], [-2, -12], [-1, -10], [-8, -12], [-8, -6], [-7, -6]] }, { "c": "rgb(245,162,146)", "s": [[-9, 0], [-8, 0], [-7, 0], [-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, 0], [-2, -1], [-2, -2], [-2, -3]] }, { "c": "rgb(211,237,238)", "s": [[-11, -8], [-10, -7], [-9, -6], [-8, -5], [-7, -4], [-6, -3], [-5, -3], [-4, -3], [-4, -4], [-3, -4]] }, { "c": "rgb(131,183,183)", "s": [[3, 5], [3, 6], [3, 7], [3, 8], [4, 9], [5, 10], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [10, 10], [10, 9], [10, 8], [10, 7], [10, 6], [10, 5], [10, 4], [10, 3], [10, 2], [10, 1], [10, 0], [10, -1], [10, -2], [9, -3], [8, -4], [7, -5], [4, -8], [3, -8], [3, -7], [3, -6], [3, -1], [3, 0], [3, 1], [3, -2], [3, -3], [3, -4], [3, -5], [6, -6], [5, -7]] }, { "c": "rgb(238,226,102)", "s": [[5, 3], [6, 3], [7, 3], [2, 6], [2, 5], [2, 7], [2, 8], [2, 9]] }] }, { "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(200, 187, 226)", "s": [[-5, -4], [-4, -4], [-4, -5], [-3, -5], [-2, -5], [-1, -5], [0, -5], [0, -4], [0, -3], [0, -2], [0, -1], [-1, -1]] }, { "c": "rgb(244, 253, 241)", "s": [[1, 3], [1, 2], [2, 2], [3, 2]] }, { "c": "rgb(205, 105, 149)", "s": [[-6, -2], [-7, -3], [-7, -4], [-6, -4], [-7, -5], [-6, -5], [-5, -5]] }, { "c": "rgb(162, 211, 158)", "s": [[-2, -4], [-1, -4], [-1, -3], [-1, -2]] }, { "c": "rgb(185, 209, 183)", "s": [[-4, -2], [-4, -3], [-3, -3], [-2, -3], [-2, -2], [-2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [1, -1], [1, -2], [1, -3], [1, -4], [2, -4], [3, -4]] }, { "c": "rgb(153, 100, 167)", "s": [[-3, -2], [-3, -1], [-3, 0], [-2, 1], [-1, 1], [0, 1]] }, { "c": "rgb(135, 200, 204)", "s": [[-3, 1], [-4, 0], [-4, -1], [-5, -2], [-5, -1], [-6, -1], [-6, 0]] }] },
    { "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(105, 225, 231)", "s": [[-5, 1], [-6, 0], [-7, -1], [-7, -2], [-7, -3], [-7, -4], [-7, -5], [-7, -6], [-7, -7], [-7, -8], [-6, -8], [-5, -8], [-4, -8], [-3, -8], [-2, -8], [-1, -8], [0, -7], [1, -6], [2, -5], [3, -4], [4, -3], [5, -2], [5, -1], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [4, 6], [3, 6], [2, 6]] }, { "c": "rgb(189, 134, 105)", "s": [[-6, -1], [-5, 0], [-4, 1], [-4, 2], [-5, 2], [-6, 1], [-7, 1], [-7, 2], [-7, 3], [-6, 4], [-5, 5], [-8, 3], [-9, 3], [-10, 3], [-4, 5], [-3, 5]] }, { "c": "rgb(194, 208, 248)", "s": [[3, 5], [2, 5], [1, 5], [1, 6], [2, 7], [2, 8], [2, 9], [1, 9], [0, 9], [-1, 9], [-1, 10], [-1, 11], [-1, 12], [-2, 8], [-3, 7], [-4, 6], [-3, 6], [-2, 6]] }, { "c": "rgb(203, 135, 128)", "s": [[0, 5], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 5], [2, 3], [2, 2], [1, 2], [0, 2]] }, { "c": "rgb(106, 212, 116)", "s": [[0, 1], [1, 1], [2, 1], [3, 1], [3, 2]] }, { "c": "rgb(200, 192, 125)", "s": [[-1, 1], [-1, 0], [-1, -1], [-1, -2], [-1, -3], [-1, -4], [-1, -5], [-1, -6], [0, -5], [1, -4], [2, -3], [2, -2]] }, { "c": "rgb(137, 138, 131)", "s": [[-5, 3], [-4, 3], [-3, 3], [-2, 3], [-2, 2], [-2, 1], [-2, 0]] }] },
    { "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(248,151,103)", "s": [[-8, 0], [-7, 0], [-6, 0], [-5, 0], [-3, 0], [-2, 0]] }, { "c": "rgb(146,142,188)", "s": [[-8, 1], [-7, 1], [-7, 2], [-6, 2], [-6, 3], [-5, 3], [-5, 4], [-4, 4]] }, { "c": "rgb(129,205,146)", "s": [[-9, 0], [-9, -1], [-8, -1], [-7, -1]] }, { "c": "rgb(123,174,110)", "s": [[-1, 1], [-1, 0], [-1, -1], [-1, -2], [-1, -3], [-1, -4], [-1, -5], [0, -5], [0, -6], [1, -6], [2, -6], [3, -6], [4, -6], [5, -5], [5, -4], [5, -3], [5, -2], [5, -1], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [4, 4], [3, 4], [2, 4], [1, 3], [0, 2]] }, { "c": "rgb(139,168,114)", "s": [[6, 4], [7, 5], [8, 6], [9, 7], [10, 8], [10, 9], [9, 9]] }, { "c": "rgb(183,201,225)", "s": [[6, -1], [7, 0], [8, 1], [9, 2], [10, 3], [11, 4], [11, 5]] }, { "c": "rgb(131,9,1)", "s": [[2, 1], [1, 1], [1, 0]] }, { "c": "rgb(65,29,28)", "s": [[0, 5], [-1, 4], [-2, 3], [-3, 2], [-4, 1], [-4, 0], [-4, -1], [-4, -2], [-4, -3], [-4, -4], [-3, -4], [-4, -5], [-3, -5], [-4, -6], [-3, -6], [-3, -7], [-4, -8], [-4, -7]] }, { "c": "rgb(112,114,128)", "s": [[-3, -3], [-2, -2]] }] }, { "g": { "c": [500, 500], "r": 15, "s": 15 }, "m": [{ "c": "rgb(184, 248, 181)", "s": [[4, -10], [5, -9], [6, -8], [7, -7], [8, -6], [9, -5], [10, -4], [11, -3], [11, -2], [11, -1], [11, 0], [8, 0], [9, 0], [4, -6], [4, -7], [4, -8], [4, -9]] }, { "c": "rgb(221, 100, 121)", "s": [[-8, -8], [-6, -9], [-6, -10], [-7, -10], [-5, -9], [-5, -10], [-7, -11], [-6, -11], [-9, -8], [-9, -7], [-8, -7], [-8, -6], [-7, -6], [-7, -7]] }, { "c": "#ed94ff", "s": [[3, -11], [0, -5], [0, -6], [0, -7], [0, -8], [0, -9], [0, -10], [0, -11], [1, -11], [2, -11], [-5, -5], [-4, -5], [-3, -5], [-2, -5], [-1, -5], [1, -4], [2, -3], [3, -2], [3, -1], [3, 0], [3, 1], [3, -10], [3, -9], [5, -7], [6, -6], [6, -5]] }, { "c": "#69b9f7", "s": [[-8, -14], [-9, -14], [-10, -14], [-11, -14], [-10, -13], [-9, -12], [-9, -11], [-9, -10]] }, { "c": "rgb(200, 120, 189)", "s": [[2, -2], [2, -1], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2], [0, 3], [-1, 3], [5, 1], [5, 2], [5, 3], [5, 4], [4, 4], [3, 4], [3, 5], [3, 6], [2, 6]] }, { "c": "rgb(106, 148, 157)", "s": [[-4, 1], [-3, 2], [-2, 3], [-1, 4], [0, 5], [1, 6], [2, 7], [3, 8], [3, 9]] }, { "c": "#f7df69", "s": [[-9, -13], [-8, -12], [-7, -12], [-6, -12], [-5, -11], [-4, -10], [-3, -9], [-2, -8], [-2, -7], [-2, -6], [-8, -11]] }, { "c": "#fb7489", "s": [[10, 10], [11, 11], [12, 12], [13, 13], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [8, 8], [9, 9]] }, { "c": "rgb(155, 247, 109)", "s": [[-4, -4], [-5, -4], [-6, -4], [-5, -3], [-5, -2], [-5, -1], [-7, -4], [-8, -5], [-9, -6], [-10, -7], [-10, -8], [-10, -9], [-10, -10], [-10, -11], [-11, -9], [-12, -9], [-13, -9], [-13, -8], [-13, -7], [-12, -6], [-4, 0], [-5, 1], [-4, 2], [-4, 3], [-4, 4], [-6, -5], [-6, -6]] }, { "c": "rgb(242, 173, 243)", "s": [[-6, 0], [-7, 0], [-8, 0], [-9, 0], [-10, 0], [-11, 0], [-11, 1], [-10, 3], [-9, 4], [-8, 5], [-7, 6], [-10, 2], [-5, 6], [-4, 6]] }, { "c": "rgb(107, 176, 134)", "s": [[2, 8], [2, 9], [4, 10], [5, 10], [6, 10], [3, 10], [2, 10], [1, 10], [0, 10], [-1, 10], [-2, 10], [-3, 9], [-4, 8], [-5, 7], [-6, 6], [-7, 5], [-7, 4], [-7, 3], [-7, 2]] }, { "c": "rgb(197, 150, 197)", "s": [[7, 10], [8, 11], [9, 11], [10, 11], [11, 10], [11, 9], [11, 8], [11, 7], [10, 6], [8, 6], [8, 5], [8, 4]] }, { "c": "rgb(179, 128, 222)", "s": [[9, 8], [9, 7], [9, 6], [9, 5], [4, -1], [5, 0], [6, 1], [7, 2], [8, 3], [9, 4], [10, 4], [11, 4], [11, 3], [11, 2], [11, 1], [9, -1], [10, 0], [8, -2]] }] },
];