const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const moment = require('moment');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['POST', 'GET'],
  },
});

const { getAll, create } = require('./models/chatModel');

app.use(cors());

const PORT = process.env.PORT || 3000;

const onUsers = {};
const date = moment().format('DD-MM-yyyy HH:mm:ss A');

io.on('connection', async (socket) => {
   onUsers[socket.id] = socket.id.slice(0, 16);

   socket.on('message', async ({ nickname, chatMessage }) => {
      io.emit('message', `${date} - ${nickname}: ${chatMessage}`);
      await create({ chatMessage, nickname, date });
    });

    socket.on('newName', (nickname) => {
      onUsers[socket.id] = nickname;
      io.emit('onlineUsersList', Object.values(onUsers));
    });

    socket.on('disconnect', () => {
      delete onUsers[socket.id];
      io.emit('onlineUsersList', Object.values(onUsers));
    });

    const messagesHistory = async () => {
      const messages = await getAll(); return messages;
    };
    io.emit('messagesHistory', await messagesHistory());
    
    io.emit('onlineUsersList', Object.values(onUsers));
});

app.get('/', (_req, res) => {
  res.render('chat', {});
});

http.listen(PORT, () => console.log('App listening on PORT %s', PORT));
