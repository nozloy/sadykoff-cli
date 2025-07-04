const fs = require('fs')
const path = require('path')

module.exports = function addMetrica() {
  const log = msg => console.log('🟢', msg)
  const projectRoot = process.cwd()

  const isNext = fs.existsSync(path.join(projectRoot, 'next.config.js'))
  if (!isNext) {
    console.error('❌ Это не проект Next.js.')
    process.exit(1)
  }

  // .env и .env.local
  const ensureEnv = (filename) => {
    const filepath = path.join(projectRoot, filename)
    const key = 'NEXT_PUBLIC_YANDEX_METRIKA_ID'
    const value = '0000000'
    let content = fs.existsSync(filepath) ? fs.readFileSync(filepath, 'utf8') : ''
    if (!content.includes(key)) {
      content += (content.trim() ? '\n' : '') + `${key}=${value}\n`
      fs.writeFileSync(filepath, content)
      log(`Добавлено в ${filename}`)
    }
  }

  ensureEnv('.env')
  ensureEnv('.env.local')

  // global.d.ts
  const globalPath = path.join(projectRoot, 'types/global.d.ts')
  const globalDecl = `\ndeclare global {
  interface Window {
    ym: (id: number, type: string, target: string) => void
  }
}
`
  let globalContent = ''
  if (fs.existsSync(globalPath)) {
    globalContent = fs.readFileSync(globalPath, 'utf8')
    if (!globalContent.includes('interface Window')) {
      globalContent += globalDecl
      fs.writeFileSync(globalPath, globalContent)
      log('Добавлен интерфейс Window в global.d.ts')
    }
  } else {
    fs.mkdirSync(path.dirname(globalPath), { recursive: true })
    fs.writeFileSync(globalPath, `export {}\n${globalDecl}`)
    log('Создан файл types/global.d.ts')
  }

  // lib/yandex-metrica.tsx
  const ymPath = path.join(projectRoot, 'lib/yandex-metrica.tsx')
  if (!fs.existsSync(ymPath)) {
    fs.mkdirSync(path.dirname(ymPath), { recursive: true })
    fs.writeFileSync(ymPath, `/* eslint-disable @next/next/no-img-element */
'use client'
import React from 'react'
import Script from 'next/script'

export const YandexMetrica: React.FC = () => {
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
  return (
    <>
      <Script
        id='yandex-metrika'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: \`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(\${counterId}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
            });
          \`,
        }}
      />
      <noscript>
        <div>
          <img
            src={\`https://mc.yandex.ru/watch/\${counterId}\`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=''
          />
        </div>
      </noscript>
    </>
  )
}
`)
    log('Создан lib/yandex-metrica.tsx')
  }

  // lib/reach-goal.tsx
  const rgPath = path.join(projectRoot, 'lib/reach-goal.tsx')
  if (!fs.existsSync(rgPath)) {
    fs.writeFileSync(rgPath, `export const reachGoal = (goal: string) => {
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    const id = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID)
    if (id) {
      window.ym(id, 'reachGoal', goal)
    }
  }
}
`)
    log('Создан lib/reach-goal.tsx')
  }

  // layout.tsx
  const layoutPath = path.join(projectRoot, 'app/layout.tsx')
  if (fs.existsSync(layoutPath)) {
    let content = fs.readFileSync(layoutPath, 'utf-8')
    if (!content.includes('<YandexMetrica')) {
      content = content.replace(/<body[^>]*>/, match => `${match}\n<YandexMetrica />`)
      if (!content.includes("YandexMetrica")) {
        content = `import { YandexMetrica } from '@/lib/yandex-metrica'\n` + content
      }
      fs.writeFileSync(layoutPath, content)
      log('Изменен app/layout.tsx: вставлен <YandexMetrica />')
    }
  } else {
    log('❗ Файл app/layout.tsx не найден. Вставьте <YandexMetrica /> вручную.')
  }

  log('✅ Метрика добавлена')
}
