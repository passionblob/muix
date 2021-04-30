import {Command, flags} from '@oclif/command'
import path from "path"
import fs from "fs"
import ora from "ora"
import { promisify } from 'util'
import {exec} from "child_process"

import {createSlimPackage} from "../utils/bundle"

export default class SlimPackage extends Command {
  static description = 'rollup single package'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    main: flags.string({
      char: 'm',
      required: true
    })
  }

  async run() {
    const {flags} = this.parse(SlimPackage)
    const cwd = process.cwd()

    const tsconfig = await promisify(fs.readFile)(path.resolve(cwd, "tsconfig.json"), {encoding: "utf-8"})
    .then((data) => {
      const pure = data
      .replace(/\s+\/\*.+|\/\/.+/g, "")
      .replace(/(\,)(\n?\s+)}/g, "}")

      return JSON.parse(pure)
    })

    if (!tsconfig.compilerOptions.outDir) throw Error("plz specify outDir")

    const packageInput = path.resolve(cwd, "package.json")
    const packageOutput = path.resolve(cwd, `${tsconfig.compilerOptions.outDir}/package.json`)
    const slimPackage = await createSlimPackage(packageInput, flags.main)
    fs.writeFileSync(packageOutput, slimPackage)
  }
}
