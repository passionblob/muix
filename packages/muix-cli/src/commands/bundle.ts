import {Command, flags} from '@oclif/command'
import path from "path"
import fs from "fs"
import ora from "ora"
import { promisify } from 'util'
import {exec} from "child_process"

import {createSlimPackage} from "../utils/bundle"

export default class Bundle extends Command {
  static description = 'bundle single package'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    main: flags.string({
      char: 'm',
      required: true
    })
  }

  async run() {
    const {flags} = this.parse(Bundle)
    const spinner = ora(`started bundling`).start();
    const cwd = process.cwd()

    const tsconfig = await promisify(fs.readFile)(path.resolve(cwd, "tsconfig.json"), {encoding: "utf-8"})
    .then((data) => {
      const pure = data
      .replace(/\s+\/\*.+|\/\/.+/g, "")
      .replace(/(\,)(\n?\s+)}/g, "}")

      return JSON.parse(pure)
    })

    if (!tsconfig.compilerOptions.outDir) throw Error("plz specify outDir")

    await promisify(exec)("yarn tsc")

    const packageInput = path.resolve(cwd, "package.json")
    const packageOutput = path.resolve(cwd, `${tsconfig.compilerOptions.outDir}/package.json`)
    const slimPackage = await createSlimPackage(packageInput, flags.main)
    fs.writeFileSync(packageOutput, slimPackage)
    spinner.succeed("bundling success")
  }
}
