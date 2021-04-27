import fs from "fs"
import path from "path"

const glyphmaps = path.resolve(__dirname, "../node_modules/react-native-vector-icons/glyphmaps")
const files = fs.readdirSync(glyphmaps)

const output = path.resolve(__dirname, `../types/icon-names.ts`)
if (fs.existsSync(output)) fs.rmSync(output)
fs.writeFileSync(output, "")

files.forEach((file) => {
  if (file.match("_meta")) return;
  const purename = path.basename(file).replace(/\..+$/, "");
  const input = path.resolve(glyphmaps, `${purename}.json`)

  const json = fs.readFileSync(input, {encoding: "utf-8"})

  const obj = JSON.parse(json)
  const iconNames = Object.keys(obj)
  const data = iconNames.map((name) => `"${name}"`).join("|")
  fs.appendFileSync(output, `export type ${purename}IconNames = ${data};\n\n`)
})