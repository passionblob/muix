import Command, { flags } from "@oclif/command";
import path from "path"
import fs from "fs"
import stringify from "json-stringify-pretty-compact"

export default class SyncVersion extends Command {
  static flags = {
    input: flags.string({char: "i", required: true})
  }

  async run() {
    const {flags} = this.parse(SyncVersion)
    const cwd = process.cwd()
    const targetPackage = path.resolve(cwd, flags.input)
    const packageInDist = fs.readFileSync(targetPackage, {encoding: "utf-8"})
    const packageJson = JSON.parse(packageInDist)
    const packageInRoot = fs.readFileSync(path.resolve(cwd, "package.json"), {encoding: "utf-8"})
    const rootPackage = JSON.parse(packageInRoot)
    rootPackage.version = packageJson.version
    fs.writeFileSync(path.resolve(cwd, "package.json"), stringify(rootPackage))
  }
}