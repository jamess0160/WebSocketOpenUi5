const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const app = express()
const cors = require('cors')

app.use(cors())
const server = http.createServer(app)
const socket = socketIO(server)
app.use(express.static('./public'))

let mensagens = []
let pessoasConectadas = []

socket.on('connection', (stream) => {
	var streamObj = {
		id: stream.id
	}
	pessoasConectadas.push({ id: stream.id })
	socket.emit("nomes", pessoasConectadas)

	console.log(new Date().toLocaleString(), ">> nova conexão:", stream.id)
	stream.emit('attMensagem', mensagens)

	stream.on("msg", payload => {
		mensagens.push({ origem_id: stream.id, origem: payload.nome, msg: payload.msg, hora: payload.hora })
		if (payload.msg == "/clear") {
			mensagens = []
		}
		socket.emit('attMensagem', mensagens)
	})

	stream.on("attName", (payload) => {
		streamObj.nome = payload.nome
		pessoasConectadas.forEach((item, index) => {
			if (item.id == streamObj.id) {
				pessoasConectadas[index].nome = payload.nome
			}
		})
		socket.emit("nomes", pessoasConectadas)
	})

	stream.on("disconnect", () => {
		pessoasConectadas.forEach((item, index) => {
			if (item.id == streamObj.id) {
				pessoasConectadas[index].nome = null
			}
		})
		pessoasConectadas = pessoasConectadas.filter(item => item !== null)
		socket.emit("nomes", pessoasConectadas)
		console.log(new Date().toLocaleString(), ">> sessão desconectada:", stream.id)
	})
})

server.listen(4001, () => {
	console.log("servidor iniciado em: http://localhost:4001")
})