/* eslint-disable no-undef */
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
// const multer = require('multer')
const knex = require('knex')

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB || 'homeroom',
    supportBigNumber: true,
    timezone: '+7:00',
    dateStrings: true,
    charset: 'utf8mb4_unicode_ci',
  },
})
const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({ ok: 1 })
})

// ======================================================================
// login
app.get('/login_next', async (req, res) => {
  console.log(req.query.email)
  console.log(req.query.password)
  try {
    let row = await db('users')
      .where({ email: req.query.email, password: req.query.password })

    if (row.length === 0) {
      res.send({
        status: 0,
        message: 'ชื่อหรือรหัสผ่าน ไม่ถูกต้อง',
      })
    } else {
      res.send({
        status: 1,
        data: row,
      })
    }
  } catch (error) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }
})
// ======================================================================
// ======================================================================

app.get('/list_std', async (req, res) => {
  console.log('student=', req.query)
  // SELECT *
  // FROM users
  // JOIN advisors_groups
  //   ON users.id = advisors_groups.advisor_id
  // JOIN users_student
  //   ON users_student.group_id = advisors_groups.group_id;
  // where users.id = 246 AND advisors_groups.group_id = 199
  let row = await db('users')
    .join('advisors_groups', 'users.id', 'advisors_groups.advisor_id')
    .join('users_student', 'users_student.group_id', 'advisors_groups.group_id')
    .where({'users.id': req.query.id })
  res.send({
    datas: row,
    status: 1,
  })
})

app.get('/group_name', async (req, res) => {
  console.log('check=', req.query)
  let row = await db('users')
    .join('advisors_groups', 'users.id', 'advisors_groups.advisor_id')
    .join('users_student', 'users_student.group_id', 'advisors_groups.group_id')
    .join('groups', 'groups.id', 'advisors_groups.group_id')
    .where({'users.id': req.query.id })
    // .where({std_id: users_student.id})
  res.send({
    datas: row,
  })
})

// insert check status
app.get('/save_check', async (req, res) => {
  console.log('std_id=', req.query)
  let row = await db('act_details')
    .insert({
      terms: req.body.terms,
      week: req.body.week,
      d_time: req.body.d_time,
      std_id: req.body.std_id,
      t_id: req.body.t_id,
      status: req.body.cstatus,
    })
  res.send({
    datas: row,
  })
})

// ======================================================================
// show user techer
app.get('/list_tch', async (req, res) => {
  console.log('techer=', req.query)
  let row = await db('users').where({id: req.query.id })
  res.send({
    datas: row,
  })
})
// edit profile email
app.post('/edit_mail', async (req, res) => {
  console.log('mail=', req.body)
  try {
    let row = await db('users').where({password: req.body.password })

    if (row.length === 0) {
      res.send({
        status: 0,
      })
    } else {
      let row = await db('users').where({id: req.body.id })
        .where({ password: req.body.password })
        .update({ email: req.body.email })

      res.send({
        status: 1,
        data: row,
      })
    }
  } catch (e) {
    console.error(e)
    res.send({
      status: 0,
    })
  }
})

// ======================================================================
// show signature
app.get('/list_sig', async (req, res) => {
  console.log('techer=', req.query)
  let row = await db('users')
    .join('users_advisor', 'users.id', 'users_advisor.user_id')
    .where({'users.id': req.query.id })
  res.send({
    datas: row,
  })
})
// edit profile signature
// app.post('/edit_sig', async (req, res) => {
//   console.log('signature=', req.body)
//   try {
//     let row = await db('users').where({password: req.body.password })

//     if (row.length === 0) {
//       res.send({
//         status: 0,
//       })
//     } else {
//       let row = await db('users_advisor').where({id: req.body.user_id })
//         .update({ signature: req.body.signature })

//       res.send({
//         status: 1,
//         data: row,
//       })
//     }
//   } catch (e) {
//     console.error(e)
//     res.send({
//       status: 0,
//     })
//   }
// })

// ======================================================================
// ======================================================================
// insert and update signature
// let storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads')
//   },
//   filename: (req, file, cb) => {
//     let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
//     cb(null, 'e1-' + Date.now() + ext)
//   },
// })
// let upload = multer({ storage: storage })

// app.use((req, res, next) => {
//   let header = { 'Access-Control-Allow-Origin': '*'}
//   for (let i in req.headers) {
//     if (i.toLowerCase().substr(0, 15) === 'access-control-') {
//       header[i.replace(/-request-/g, '-allow-')] = req.headers[i]
//     }
//   }
//   // res.header(header)  // แบบเก่า
//   res.set(header) // แบบใหม่
//   next()
// })
// app.post('/imgup', upload.any(), async (req, res) => {
//   console.log(req.files[0].filename)
//   console.log('คุณสมบัติของfile:', req.files)
//   let row = await db('users_advisor').insert({
//     signature: req.files[0].filename,
//   })
//   res.send({ status: true, filesname: req.files[0].filename })
// })
// app.post('/multi', upload.any(), (req, res) => {
//   console.log('multi')
//   const files = req.files
//   console.log('file:', files)
//   if (!files) {
//     const error = new Error('Please choose files')
//     error.httpStatusCode = 400
//     // eslint-disable-next-line no-undef
//     return next(error)
//   }

//   res.send({
//     'files=>': files,
//     status: 'ok',
//   })
// })
// app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//   console.log('คุณสมบัติของfile:', req.file)

//   //  let ext = req.file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
//   console.log('req.file.originalname=', req.file.originalname)
//   console.log('req.file.originalname.lastIndexOf(.)', req.file.originalname.lastIndexOf('.'))
//   console.log('file.originalname.length=', req.file.originalname.length)

//   if (!req.file) {
//     const error = new Error('Please upload a file')
//     error.httpStatusCode = 400
//     return next(error)
//   }
//   res.send(req.file)
// })
// ======================================================================

app.listen(7000, () => {
  console.log('ready:7000')
})
