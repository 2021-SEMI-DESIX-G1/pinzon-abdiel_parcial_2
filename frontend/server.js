const express = require('express')
const app = express()
const port = 3000

// Configuration for PUG Template engine
app.set('views', './views');
app.set('view engine', 'pug');

// Configuration for static files
app.use('/static', express.static('public'));

app.get('/', (req, res) => {
  res.render('index.pug', { nombre: 'Erick Agrazal' });
});

app.listen(port, () => {
  console.log(`Servidor FRONTEND en puerto: ${port}`)
})