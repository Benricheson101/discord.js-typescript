/* eslint no-useless-constructor: "off" */
import { CommandOptions, CommandFunction } from '@types'

export default class {
  constructor (
    public config: CommandOptions,
    public run: CommandFunction
  ) {}
}
