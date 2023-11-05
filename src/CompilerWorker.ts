import * as fengari from 'fengari-web'
import TealError from '@/TealError'

const tl = `
package.path = "${import.meta.env.VITE_TL_PACKAGE_PATH_URL}"
os = {
  getenv = function(var)
    if var == "TL_DEBUG" then
      return nil
    else
      return ''
    end
  end
}
local tl = require('tl')

local env = tl.init_env(false, false, true)
local output, result = tl.gen(%input%, env)

return { output, result.syntax_errors, result.type_errors }
`

const convertErrorArray = (tbl) => {
  if (tbl == null) {
    return null
  }

  let array: [TealError] = []
  let i = 1
  while (tbl.has(i)) {
    let obj = tbl.get(i)
    let error: TealError = {
      y: obj.get('y'),
      x: obj.get('x'),
      msg: obj.get('msg')
    }
    array[i - 1] = error;
    i++;
  }

  return array
}

onmessage = (msg) => {
  if (msg.data[0] == "compile") {
    const newValue = msg.data[1]

    try {
      const out = fengari.load(tl.replace('%input%', JSON.stringify(newValue)))()

      const output = out.get(1) || null
      const syntaxErrors = convertErrorArray(out.get(2))
      const typeErrors = convertErrorArray(out.get(3))

      postMessage(["compiled", output, syntaxErrors, typeErrors])
    } catch (err) {
      postMessage(["error", err])
    }
  }
}
