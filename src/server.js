const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const socketio =require('socket.io');
const http = require('http');

const routes = require('./routes');
const config = require('../config');

// inicia express
const app = express();
const server = http.Server(app);
const io = socketio(server);

// conectando ao banco de dados
mongoose.connect(config.test.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const connectedUsers = {};
io.on('connection', socket => {
  const { user_id }= socket.handshake.query;

  connectedUsers[user_id] = socket.id;
});


app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;

  return next();
});

app.use(cors());

// informa ao express que serão requisições via JSON
app.use(express.json());

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));

// importando as rotas
app.use(routes);

// porta do serviço
server.listen(config.test.PORT);