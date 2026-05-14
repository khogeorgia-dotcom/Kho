import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'

function adminSavePlugin() {
  const handler = async (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
      return
    }

    const raw = await new Promise((resolve, reject) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
      })
      req.on('end', () => resolve(data))
      req.on('error', reject)
    })

    const payload = JSON.parse(raw || '{}')
    const items = Array.isArray(payload.items) ? payload.items : null
    if (!items) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ ok: false, error: 'items must be array' }))
      return
    }

    const byType = {
      land: items.filter((x) => x?.type === 'Земельный участок'),
      house: items.filter((x) => x?.type === 'Дом'),
      apartment: items.filter((x) => x?.type === 'Квартира / студия'),
      commercial: items.filter((x) => x?.type === 'Коммерческая'),
    }

    const dataDir = path.resolve(process.cwd(), 'public/data/properties')
    await fs.mkdir(dataDir, { recursive: true })
    await Promise.all([
      fs.writeFile(path.join(dataDir, 'land.json'), JSON.stringify(byType.land, null, 2), 'utf8'),
      fs.writeFile(path.join(dataDir, 'house.json'), JSON.stringify(byType.house, null, 2), 'utf8'),
      fs.writeFile(path.join(dataDir, 'apartment.json'), JSON.stringify(byType.apartment, null, 2), 'utf8'),
      fs.writeFile(path.join(dataDir, 'commercial.json'), JSON.stringify(byType.commercial, null, 2), 'utf8'),
    ])

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: true }))
  }

  const mount = (server) => {
    server.middlewares.use('/api/admin/save-properties', async (req, res) => {
      try {
        await handler(req, res)
      } catch (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Save failed' }))
      }
    })
  }

  return {
    name: 'admin-save-json',
    configureServer(server) {
      mount(server)
    },
    configurePreviewServer(server) {
      mount(server)
    },
  }
}

export default defineConfig({
  plugins: [adminSavePlugin()],
})
