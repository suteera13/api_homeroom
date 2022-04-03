const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const knex = require('knex')

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '',
    database: process.env.MYSQL_DB || 'visithome',
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
  console.log(req.query.code_id)
  console.log(req.query.password)
  try {
    let row = await db('user')
      .where({ code_id: req.query.code_id, password: req.query.password })

    if (row.length === 0) {
      res.send({
        check: 0,
      })
    } else {
      res.send({
        check: 1,
        data: row,
      })
    }
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      check: 0,
      error: e.message,
    })
  }
})
// ======================================================================
// ======================================================================

// show data student
app.get('/list_std', async (req, res) => {
  console.log('student=', req.query)
  let row = await db('user')
    .join('student', 'user.id_group', 'student.id_group')
    .where({'user.id': req.query.id })
  res.send({
    datas: row,
  })
})
// ======================================================================
// show student
app.get('/show', async (req, res) => {
  console.log('student=', req.query)
  let row = await db('student').where({ std_id: req.query.std_id })
  res.send({
    datas: row,
  })
})
app.get('/list_std', async (req, res) => {
  console.log('home_std=', req.query)
  let row = await db('user')
    .join('student', 'user.id_group', 'student.id_group')
    .where({'user.id': req.query.id })
  res.send({
    datas: row,
  })
})
app.get('/show_me', async (req, res) => {
  console.log('home_std=', req.query)
  let row = await db('user')
    .join('student', 'user.id', 'student.id')
    .where({'user.id': req.query.id })
  res.send({
    datas: row,
  })
})
// ======================================================================
// edit
app.post('/edit_data', async (req, res) => {
  console.log('data=', req.body)
  try {
    let row = await db('student').where({id: req.body.id })
      .update({
        std_code: req.body.std_code,
        fname: req.body.fname,
        lname: req.body.lname,
        address: req.body.address,
        std_phone: req.body.std_phone,
        dad_name: req.body.dad_name,
        mom_name: req.body.mom_name,
      })
    res.send({
      status: 1,
      data: row,
    })
  } catch (e) {
    console.error(e)
    res.send({
      status: 0,
    })
  }
})
// ======================================================================
// show student
app.get('/show', async (req, res) => {
  console.log('home_std=', req.query)
  let row = await db('home_std').where({ std_id: req.query.std_id })
  res.send({
    datas: row,
  })
})
// ======================================================================
// insert check status
app.get('/save_check', async (req, res) => {
  console.log('home_std=', req.query)
  let row = await db('home_std')
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

app.listen(7001, () => {
  console.log('ready:7001')
})
