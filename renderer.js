// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog } = require('electron').remote
const { Howl, Howler } = require('howler')

const path = require('path')

const streamUrl = document.getElementById('streamUrl')
const playBtn = document.getElementById('play')
const stopBtn = document.getElementById('stop')
const downBtn = document.getElementById('down')
const upBtn = document.getElementById('up')

let sound
let volume = 0.5

playBtn.addEventListener('click', (event) => {
    sound = new Howl({
        src: streamUrl.value,
        html5: true, 
        format: ['mp3', 'aac'],
        volume: volume
    })

    sound.play();
})

stopBtn.addEventListener('click', (event) => {
    if (sound) {
        sound.unload()
    }
})

downBtn.addEventListener('click', (event) => {
    volume -= 0.1
    Howler.volume(volume)
})

upBtn.addEventListener('click', (event) => {
    volume += 0.1
    Howler.volume(volume)
})