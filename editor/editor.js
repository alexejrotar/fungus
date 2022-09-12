class Editor {
  constructor(molecules = []) {
    this.molecules = molecules
    this.drawing = false
    this.selectedIndex = molecules.length
    this.deleteMode = false

    reactive.setListeners({
      mousedown: this.handleMousedown.bind(this),
      mousemove: this.handleMousemove.bind(this),
      mouseup: this.handleMouseup.bind(this),
      left: this.handleLeft.bind(this),
      right: this.handleRight.bind(this),
      special: () => (this.deleteMode = !this.deleteMode),
    })
    this.updateOutput()

    shareButton.addEventListener('click', () => this.share())
    colorInput.addEventListener('change', () => {
      if (this.selectedIndex < this.molecules.length) {
        this.molecules[this.selectedIndex].color = colorInput.value
      }
    })
  }

  handleMousedown(position) {
    let molecule = this.molecules.find((molecule) => molecule.isAt(position))

    if (molecule !== undefined) {
      if (
        this.selectedIndex < this.molecules.length &&
        this.molecules[this.selectedIndex] === molecule
      ) {
        molecule.shape = molecule.shape.filter(
          (other) => !other.equals(position)
        )
      } else if (this.deleteMode) {
        this.molecules = this.molecules.filter((other) => other !== molecule)
        this.selectedIndex = this.molecules.length
      }
    } else if (this.selectedIndex < this.molecules.length) {
      this.drawing = true
      this.molecules[this.selectedIndex].shape.push(position)
    } else {
      const color = randomColor()
      colorInput.value = color
      molecule = new HighlightedMolecule([position], color)
      this.molecules.push(molecule)
      this.selectedIndex = this.molecules.length - 1
      this.drawing = true
    }
    this.updateOutput()
  }

  handleMousemove(position) {
    if (!this.drawing) return
    if (this.molecules.some((molecule) => molecule.isAt(position))) return
    this.molecules[this.selectedIndex].shape.push(position)
    this.updateOutput()
  }

  handleMouseup() {
    this.drawing = false
    this.updateOutput()
  }

  updateOutput() {
    this.molecules = this.molecules.filter(
      (molecule) => molecule.shape.length > 0
    )
    const output = {
      m: this.molecules.map((molecule) => molecule.output()),
    }
    console.log(JSON.stringify(output))
  }

  handleLeft() {
    if (this.selectedIndex < this.molecules.length) {
      this.molecules[this.selectedIndex] =
        this.molecules[this.selectedIndex].unhighlighted()
    }
    this.selectedIndex = Math.max(0, this.selectedIndex - 1)
    if (this.selectedIndex < this.molecules.length) {
      this.molecules[this.selectedIndex] =
        this.molecules[this.selectedIndex].highlighted()
    }
  }
  handleRight() {
    if (this.selectedIndex < this.molecules.length) {
      this.molecules[this.selectedIndex] =
        this.molecules[this.selectedIndex].unhighlighted()
    }
    this.selectedIndex = Math.min(this.molecules.length, this.selectedIndex + 1)
    if (this.selectedIndex < this.molecules.length) {
      this.molecules[this.selectedIndex] =
        this.molecules[this.selectedIndex].highlighted()
    }
  }
  share() {
    const output = {
      m: this.molecules.map((molecule) => molecule.output()),
    }
    const json = JSON.stringify(output)
    const b64 = window.btoa(json)
    const url = new URL('/', window.location.origin)
    url.searchParams.set('level', b64)
    window.open(url, '_blank')
  }

  start() {
    window.setInterval(() => this.render(), 10)
  }

  render() {
    ctx.save()
    ctx.fillStyle = this.deleteMode ? '#322' : '#222'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    grid.render()
    this.molecules.forEach((molecule) => molecule.render())
  }
}

let shareButton
let colorInput

function startEditor() {
  setupGlobals()
  shareButton = document.getElementById('share')
  colorInput = document.getElementById('color')
  const b64 = new URLSearchParams(window.location.search).get('level')
  let molecules = []
  if (b64) {
    const json = window.atob(b64)
    const { m } = JSON.parse(json)
    molecules = m.map((m) => Molecule.from(m, grid))
  }
  const editor = new Editor(molecules)
  editor.start()
}

function randomColor() {
  const random = (lower, upper) =>
    Math.floor(Math.random() * (upper - lower)) + lower
  const red = random(100, 256)
  const green = random(100, 256)
  const blue = random(100, 256)
  return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`
}
