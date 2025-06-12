import express from 'express'
import cors from 'cors'
import initSqlJs from 'sql.js'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize SQL.js
let db
const dbFile = join(__dirname, 'database.sqlite')

async function initDb() {
  const SQL = await initSqlJs()

  // Check if database file exists
  if (fs.existsSync(dbFile)) {
    const filebuffer = fs.readFileSync(dbFile)
    db = new SQL.Database(filebuffer)
  } else {
    db = new SQL.Database()
    // Create tables
    db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        screen_name TEXT,
        rebrickable_api_key TEXT,
        rebrickable_user_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    // Save the database
    const data = db.export()
    fs.writeFileSync(dbFile, Buffer.from(data))
  }
}

// Routes
app.post('/api/users', (req, res) => {
  const { id, email, name } = req.body

  try {
    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid UUID format' })
    }

    db.run(
      'INSERT OR REPLACE INTO users (id, email, name, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [id, email, name]
    )

    // Save changes to file
    const data = db.export()
    fs.writeFileSync(dbFile, Buffer.from(data))

    res.json({ success: true, id })
  } catch (error) {
    console.error('Error creating/updating user:', error)
    res.status(500).json({ error: 'Failed to create/update user' })
  }
})

app.get('/api/users', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM users ORDER BY created_at DESC')
    if (result.length > 0) {
      const users = result[0].values.map(row => ({
        id: row[0],
        email: row[1],
        name: row[2],
        screen_name: row[3],
        rebrickable_api_key: row[4],
        rebrickable_user_token: row[5],
        created_at: row[6],
        updated_at: row[7]
      }))
      res.json(users)
    } else {
      res.json([])
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params

  try {
    const result = db.exec(`SELECT * FROM users WHERE id = '${id}'`)
    if (result.length > 0 && result[0].values.length > 0) {
      const user = {
        id: result[0].values[0][0],
        email: result[0].values[0][1],
        name: result[0].values[0][2],
        screen_name: result[0].values[0][3],
        rebrickable_api_key: result[0].values[0][4],
        rebrickable_user_token: result[0].values[0][5],
        created_at: result[0].values[0][6],
        updated_at: result[0].values[0][7]
      }
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

app.patch('/api/users/:id', (req, res) => {
  const { id } = req.params
  const { screen_name, rebrickable_api_key, rebrickable_user_token } = req.body

  try {
    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid UUID format' })
    }

    db.run(
      'UPDATE users SET screen_name = ?, rebrickable_api_key = ?, rebrickable_user_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [screen_name, rebrickable_api_key, rebrickable_user_token, id]
    )

    // Save changes to file
    const data = db.export()
    fs.writeFileSync(dbFile, Buffer.from(data))

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Initialize database and start server
initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`)
    })
  })
  .catch(error => {
    console.error('Failed to initialize database:', error)
  })
