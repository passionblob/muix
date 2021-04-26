import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"
import { omit, pick } from "@monthem/utils"
import prettyJson from "json-stringify-pretty-compact"

/**
 * @param input package.json path
 * @param main package.main value
 * @returns 
 */
export const createSlimPackage = async(input: string, main: string) => {
  const data = await promisify(fs.readFile)(input, {encoding: "utf-8"})
  const obj = JSON.parse(data)
  const modified = pick(obj, [
    "name",
    "version",
    "main",
    "dependencies",
    "peerDependencies",
    "publishConfig",
    "description",
    "author",
  ])
  
  modified.main = main
  
  const prettified = prettyJson(modified, {
    indent: 2,
    maxLength: 50,
  })
  
  return prettified
}