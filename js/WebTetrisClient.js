/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'

class WebTetrisClient extends WebTetris {
  constructor (boardElement, url) {
    if (!(boardElement instanceof window.Element)) return

    super(boardElement)

    this._playing = false
    this._lockMessages = false

    this._webSocket = new WebSocket(url)
    this._webSocket.onerror = e => this._error(e)
    this._webSocket.onmessage = ({ data }) => {
      const message = JSON.parse(data)
      if (message.instruction)
        this.execInstruction(message.instruction)
      if (message.nextPieceType) {
        this._nextPieceType = message.nextPieceType
        if (!this._playing)
          this.start()
      }
    }
  }

  set onError (callback) {
    if (typeof callback !== 'function')
      return
    this._onErroCallback = callback
  }

  start () {
    this._addNewPiece()
    this._playing = true
  }

  _timerCallback () {
    this._lockMessages = true
    super._timerCallback()
    this._lockMessages = false
  }

  movePieceDown () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.DOWN })
    super.movePieceDown()
  }

  movePieceLeft () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.LEFT })
    super.movePieceLeft()
  }

  movePieceRight () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.RIGHT })
    super.movePieceRight()
  }

  rotatePiece () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.ROTATE })
    super.rotatePiece()
  }

  _sendData (data) {
    if (this._lockMessages) return
    this._webSocket.send(JSON.stringify(data))
  }

  _error (e) {
    if (this._onErroCallback)
      this._onErroCallback()
    else
      console.error(e)
  }
}