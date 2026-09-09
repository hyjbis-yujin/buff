import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 개발 전용: Vercel Serverless Function(api/*.js)을 vite dev 서버에서 실행
 *
 * 운영(Vercel)에서는 플랫폼이 api/ 디렉터리를 직접 실행하지만,
 * `vite` 개발 서버는 이를 알지 못해 /api/detail 요청에 api/detail.js의
 * "소스 코드"를 그대로 응답한다. 그래서 response.json() 파싱이 실패했다.
 * 이 플러그인이 /api/* 요청을 가로채 해당 핸들러를 직접 호출해준다.
 *
 * apply: 'serve' 이므로 빌드 산출물에는 아무 영향이 없다.
 */
function vercelApiDevPlugin(env) {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      // api/*.js 및 src/services/server/*는 process.env로 키를 읽는다.
      // vite는 .env를 import.meta.env에만 주입하므로 여기서 별도로 넣어준다.
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }

      // 주의: configureServer에서 직접 use()로 등록해야 vite의 모듈 변환
      // 미들웨어보다 먼저 실행되어 /api/* 를 가로챌 수 있다.
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.slice('/api/'.length).replace(/\.js$/, '')

        // 경로 탈출 및 중첩 경로 차단 (핸들러는 모두 api/ 바로 아래에 평평하게 존재)
        if (!name || name.includes('/') || name.includes('.')) return next()

        try {
          const mod = await loadApiHandler(server, name)
          const handler = mod.default

          if (typeof handler !== 'function') return next()

          // Vercel의 req/res 인터페이스를 최소한으로 맞춘 shim
          req.query = Object.fromEntries(url.searchParams)
          req.body = await readJsonBody(req)

          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (data) => {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
            }
            res.end(JSON.stringify(data))
            return res
          }
          res.send = (data) => {
            res.end(typeof data === 'string' ? data : JSON.stringify(data))
            return res
          }

          await handler(req, res)
        } catch (error) {
          console.error(`[api dev] /api/${name} 처리 중 오류:`, error)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ message: error.message }))
          }
        }
      })
    },
  }
}

/**
 * api/<name>.js 모듈을 로드한다.
 * ssrLoadModule이 있으면 vite 모듈 그래프를 태워 파일 수정이 즉시 반영되고,
 * 없으면(향후 vite 버전에서 제거될 경우) Node의 동적 import로 폴백한다.
 * api/*.js와 src/services/server/*는 JSX 없는 순수 ESM이라 변환 없이도 로드된다.
 */
async function loadApiHandler(server, name) {
  if (typeof server.ssrLoadModule === 'function') {
    return await server.ssrLoadModule(`/api/${name}.js`)
  }

  const filePath = path.resolve(server.config.root, 'api', `${name}.js`)
  // 쿼리로 모듈 캐시를 무효화해야 파일 수정이 반영된다
  return await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`)
}

function readJsonBody(req) {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return Promise.resolve(undefined)
  }

  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // prefix '' : VITE_ 접두사가 없는 키까지 모두 읽어온다
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), vercelApiDevPlugin(env)],
  }
})
