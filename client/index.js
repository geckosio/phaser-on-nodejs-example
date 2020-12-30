class MainScene extends Phaser.Scene {
  dudes = new Map()
  dudeUpdates = []
  cursors

  constructor() {
    super()
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

    this.socket.on('dudes', dudes => {
      dudes.forEach(dude => {
        const exists = this.dudes.has(dude.id)

        if (!exists) {
          const _dude = this.add.sprite(dude.x, dude.y, 'dude')
          this.dudes.set(dude.id, { dude: _dude })
        }

        this.dudeUpdates.push(dude)
      })
    })
  }

  update() {
    this.dudeUpdates.forEach(dude => {
      const _dude = this.dudes.get(dude.id).dude
      _dude.setX(dude.x)
      _dude.setY(dude.y)
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
