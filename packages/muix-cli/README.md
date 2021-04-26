@monthem/muix-cli
=================

command-line interface for muix

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@monthem/muix-cli.svg)](https://npmjs.org/package/@monthem/muix-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@monthem/muix-cli.svg)](https://npmjs.org/package/@monthem/muix-cli)
[![License](https://img.shields.io/npm/l/@monthem/muix-cli.svg)](https://github.com/monthem/muix/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @monthem/muix-cli
$ muix COMMAND
running command...
$ muix (-v|--version|version)
@monthem/muix-cli/0.0.0 linux-x64 node-v14.16.1
$ muix --help [COMMAND]
USAGE
  $ muix COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`muix hello [FILE]`](#muix-hello-file)
* [`muix help [COMMAND]`](#muix-help-command)

## `muix hello [FILE]`

describe the command here

```
USAGE
  $ muix hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ muix hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/monthem/muix/blob/v0.0.0/src/commands/hello.ts)_

## `muix help [COMMAND]`

display help for muix

```
USAGE
  $ muix help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->
