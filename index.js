const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const knex = require('knex')

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB || 'datactc',
    supportBigNumber: true,
    timezone: '+7:00',
    dateStrings: true,
    charset: 'utf8mb4_unicode_ci',
  },
})
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))

// =====================multer================================multer=======================

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
    cb(null, 'e1-' + Date.now() + ext)
  },
})
let upload = multer({ storage: storage })

app.use((req, res, next) => {
  let header = { 'Access-Control-Allow-Origin': '*'}
  for (let i in req.headers) {
    if (i.toLowerCase().substr(0, 15) === 'access-control-') {
      header[i.replace(/-request-/g, '-allow-')] = req.headers[i]
    }
  }
  // res.header(header)  // แบบเก่า
  res.set(header) // แบบใหม่
  next()
})
// ================ input upload img ====================
app.post('/imgup', upload.any(), async (req, res) => {
  console.log(req.files[0].filename)
  console.log('คุณสมบัติของfile:', req.files)
  let row = await db('register').insert({
    fullname: 'IMG',
    baccount: 'Bank',
    tel: req.files[0].filename,
    email: 'email',
    passwd: 'password',
  })
  res.send({ status: true, filesname: req.files[0].filename })
})
// uploading multiple images together
app.post('/multi', upload.any(), (req, res) => {
  console.log('multi')
  const files = req.files
  console.log('file:', files)
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    // eslint-disable-next-line no-undef
    return next(error)
  }

  res.send({
    'files=>': files,
    status: 'ok',
  })
})
app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  console.log('คุณสมบัติของfile:', req.file)

  //  let ext = req.file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
  console.log('req.file.originalname=', req.file.originalname)
  console.log('req.file.originalname.lastIndexOf(.)', req.file.originalname.lastIndexOf('.'))
  console.log('file.originalname.length=', req.file.originalname.length)

  if (!req.file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(req.file)
})
// =====================multer===============================multer=======================

app.get('/', (req, res) => {
  res.send({ ok: 1 })
})

app.post('/Save', async (req, res) => {
  console.log('data=', req.body)
  try {
    let row = await db('register').insert({
      fullname: req.body.username,
      baccount: req.body.baccount,
      tel: req.body.tel,
      email: req.body.email,
      passwd: req.body.password,
    })
    res.send({
      status: 1,
    })
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }
})

app.get('/list', async (req, res) => {
  console.log(req.query.fullname)
  let row = await db('register').where({r_id: req.query.rid})
  res.send({
    datas: row[0],
    status: 1,
  })
})

app.get('/lists', async (req, res) => {
  let row = await db('register')
  res.send({
    datas: row,
    status: 1,
  })
})

app.get('/list_user', async (req, res) => {
  console.log(req.query.user)
  console.log(req.query.pass)
  try {
    let row = await db('users_student')
      .where({ student_id: req.query.user, major_id: req.query.pass })
      .then(rows => rows[0])
    if (!row) {
      throw new Error('user / pass ไม่ถูกต้อง')
    }
    res.send({
      status: 1,
      data: row,
    })
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }
})

app.listen(7000, () => {
  console.log('ready:7000')
})
