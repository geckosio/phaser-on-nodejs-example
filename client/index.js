const { SnapshotInterpolation } = Snap
const SI = new SnapshotInterpolation(30) // 30 FPS

class MainScene extends Phaser.Scene {
  constructor() {
    super()

    this.dudes = new Map()
    this.cursors

    this.socket = io('http://localhost:3000')
    this.socket.on('connect', () => {
      console.log('id:', this.socket.id)
    })
  }

  preload() {
    this.load.spritesheet('dude', 'assets/dude.png', {
      frameWidth: 32,
      frameHeight: 48
    })
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys()

    this.socket.on('snapshot', snapshot => {
      SI.snapshot.add(snapshot)
    })
  }

  update() {
    const snap = SI.calcInterpolation('x y')
    if (!snap) return

    const { state } = snap
    if (!state) return

    state.forEach(dude => {
      const exists = this.dudes.has(dude.id)

      if (!exists) {
        const _dude = this.add.sprite(dude.x, dude.y, 'dude')
        this.dudes.set(dude.id, { dude: _dude })
      } else {
        const _dude = this.dudes.get(dude.id).dude
        _dude.setX(dude.x)
        _dude.setY(dude.y)
      }
    })

    const movement = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    }

    this.socket.emit('movement', movement)
  }
}

const config = {
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [MainScene]
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
