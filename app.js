require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const session = require('express-session');

const Item = require('./models/Items');
const app = express();


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abdukarimov.05@gmail.com', // Замените на ваш реальный email
    pass: 'lmth nldk qnoq vklp' // Замените на ваш пароль или пароль приложения
  }
});


const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Убедитесь, что этот каталог существует
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });



// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your_secret_key', // Замените 'your_secret_key' на длинную, случайную строку для безопасности
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Установите в true, если вы используете HTTPS
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// User Registration Endpoint
app.post('/register', async (req, res) => {
  try {
    // Проверка наличия пользователя с таким же email
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const user = new User(req.body);
    await user.save();

    // Отправка email после успешной регистрации
    const mailOptions = {
      from: 'PLATFORM',
      to: req.body.email,
      subject: 'Welcome to Our Website',
      text: `Hi ${req.body.firstName}, welcome to our website! Your registration was successful.`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.redirect('/login');
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// User Login Endpoint
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).send('Authentication failed');
    }
    
    // Сохранение информации о пользователе в сессии
    req.session.userId = user.id;
    req.session.role = user.role;

    res.redirect('/main');
    
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Authorization Middleware
const authorize = (req, res, next) => {
  if (req.session.userId && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).send('Unauthorized: Access is denied');
  }
};

// Protected Route for Admin Page
app.get('/admin', authorize, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
  });

  // Endpoint для проверки статуса аутентификации пользователя
app.get('/auth/status', (req, res) => {
    const isLoggedIn = !!req.session.userId;
    const role = req.session.role || 'guest';
    res.json({ isLoggedIn, role });
});


// Logout endpoint
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/main.html'); // Измените на нужный путь, если отличается
    });
});

//CREATION
app.post('/admin/add-item', upload.array('images', 3), async (req, res) => {
    try {
        const { name, description } = req.body;
        const images = req.files.map(file => file.path); // Получаем пути к изображениям

        // Создание и сохранение нового элемента в базу данных
        const newItem = new Item({
            name,
            description,
            images
        });

        await newItem.save(); // Сохраняем новый элемент в базе данных

        res.redirect('/admin'); // Перенаправление обратно в панель администратора
    } catch (error) {
        console.error('Error adding new item:', error);
        res.status(500).send('Error adding new item');
    }
});

//UPDATE
app.post('/admin/update-item', async (req, res) => {
    try {
        const { id, name, description } = req.body;
        
        // Обновляем элемент в базе данных
        await Item.findByIdAndUpdate(id, {
            name: name,
            description: description
        });

        res.redirect('/admin'); // Перенаправление обратно в панель администратора
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Error updating item');
    }
});

//DELETE
app.get('/admin/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items); // Отправляем элементы в формате JSON
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});

app.post('/admin/delete-item', async (req, res) => {
    try {
        const { id } = req.body;
        await Item.findByIdAndDelete(id);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Error deleting item');
    }
});

//-------
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});



app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
