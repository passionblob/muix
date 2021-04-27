import fs from "fs"
import path from "path"

const glyphmaps = path.resolve(__dirname, "../node_modules/react-native-vector-icons/glyphmaps")
const files = fs.readdirSync(glyphmaps)

const output = path.resolve(__dirname, `../index.tsx`)
if (fs.existsSync(output)) fs.rmSync(output)
fs.writeFileSync(output, "")

const importIconProps = `import {IconProps} from "react-native-vector-icons/Icon"\n`
fs.appendFileSync(output, importIconProps)

files.forEach((file) => {
  if (file.match("_meta")) return;
  const writerQueue: string[] = []
  const purename = path.basename(file).replace(/\..+$/, "");
  const nameType = `${purename}IconNames`
  const importNameType = `import {${nameType}} from "./types/icon-names"`

  const modified = purename === "FontAwesome5Free"
    ? "FontAwesome5"
    : purename 

  const importIcon = `import {default as _${modified}} from "react-native-vector-icons/${modified}"`
  const writeWrappedComponent = [
    `export const ${modified} = (props: Omit<IconProps, "name"> & {name: ${nameType}}) => {`,
    `\treturn <_${modified} {...props} />`,
    `}\n\n`,
  ].join("\n")

  writerQueue.push(
    importNameType,
    importIcon,
    writeWrappedComponent
  )

  const code = writerQueue.join("\n\n")
  fs.appendFileSync(output, code)
})