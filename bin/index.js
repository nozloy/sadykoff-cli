#!/usr/bin/env node

const [,, cmd, subcmd] = process.argv

if (cmd === 'add' && subcmd === 'metrica') {
  require('../commands/add/metrica')()
} else {
  console.log(`Команда "${cmd} ${subcmd}" не найдена.`)
}
