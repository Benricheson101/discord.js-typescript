## Discord.js TypeScript Template

### Quick Start

1. Clone this repo
    ```bash
    $ git clone git@github.com:Benricheson101/discord.js-typescript.git
    ```
2. Install the dependencies
    ```bash
    $ yarn install
    ```
3. Setup the bot
    ```ts
    // src/setup.ts
    export const clientOptions: ClientOptions = {
      ...
      admins: ['your id'],
      ...
    }
    // <project root>/.env.development
    // see the 'Environment Variables' section for more info
    TOKEN='your-token'
    ```
4. Start the bot!
    ```bash
    $ yarn tsc 
    $ node build/index.js
    ```

### Adding Commands

Adding commands is easy! Simply make a new TypeScript file anywhere in the `src/cmds` directory (there can even be subfolders in `src/cmds`!) and add the following:
```ts
import Command from '@command'

export default new Command({
  name: 'your-command-name'
}), (client, message, args) => {
  // your code goes here!
})
```

> For a full list of command options, consult the `CommandOptions` interface in `src/types/index.d.ts`

### Adding Event Listeners

Adding event listeners is easy, too! Make a new file in the `src/events` directory. The name of the file is case sensative and must be the name of the event. Add the following to your file to get started:
```ts
export = (client, ...params) => {
  // your code goes here!
}
```
> Unlike commands, events must be all be in the `src/events` directory. There cannot be subfolders due to the way events are loaded.
> You can always look at the existing event files for reference

### Environment Variables

The way the bot is setup now, the only environment variable is the token. If you do not want to use environment variables, you can put the token into the `token` variable in `src/setup.ts` and remove the line `import '@util/dotenv'` from `src/setup.ts`.

Dotenv setup to read from a different `.env.*` file depending on the `NODE_ENV` environment variable. Currently, if `NODE_ENV` is `test` or `testing`, it will read from `.env.test`. If `NODE_ENV` is `production`, it will read from `.env.production`. Otherwise, `.env.development` is used. If you would prefer to use different files or environment names, you can edit the file `src/util/dotenv.ts` to your liking.
