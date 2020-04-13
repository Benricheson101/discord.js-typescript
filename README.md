## Discord.js TypeScript

### How to use

1. Clone this repo\
    ```bash
    $ git clone git@github.com:Benricheson101/discord.js-typescript.git
    ```
2. Install the dependencies\
    ```bash
    $ yarn install
    ```
3. Start the bot!\
    ```bash
    $ yarn tsc 
    $ TOKEN="your-token" node build/index.js
    ```

### Adding Commands

Adding commands is easy! Simply make a new TypeScript file anywhere in the `src/cmds` directory (there can even be subfolders in `src/cmds`!) and add the following:
```ts
import Command from '@command'

export defaut new Command({
  name: 'your-command-name'
}), (client, message, args) => {
  // your code goes here!
})
```

> For a full list of command options, consult the `CommandOptions` interface in `src/types/index.d.ts`
