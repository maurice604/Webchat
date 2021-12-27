const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const moment = require('moment');
const path = require('path');
// const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const io = require('socket.io')(http, {
  cors: {
    origin: `http://localhost:${3000}`,
    methods: ['POST', 'GET'],
  },
});

app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const onUsers = {};
const date = moment().format('DD-MM-yyyy HH:mm:ss A');

io.on('connection', (socket) => {
   onUsers[socket.id] = socket.id.slice(0, 16);
    console.log(`Usuário conectado ${Object.values(onUsers)}!`);

  socket.on('message', ({ nickname, chatMessage }) => {
      io.emit('message', `${date} - ${nickname}: ${chatMessage}`);
    });

    socket.on('newName', (nickname) => {
      onUsers[socket.id] = nickname;
      io.emit('onlineUsersList', Object.values(onUsers));
    });

    socket.on('disconnect', () => {
      delete onUsers[socket.id];
      io.emit('onlineUsersList', Object.values(onUsers));
      console.log('Desconectou!');
    });
    io.emit('onlineUsersList', Object.values(onUsers));
});

app.get('/', (_req, res) => {
  res.render('chat', {});
});

http.listen(PORT, () => console.log('App listening on PORT %s', PORT));
