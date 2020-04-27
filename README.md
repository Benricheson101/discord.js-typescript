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
> Unlike commands, events must be all be in the `src/events` directory. There cannot be subfolders due to the way events are loaded.\
> You can always look at the existing event files for reference

### Environment Variables

The way the bot is setup now, the only environment variable is the token. If you do not want to use environment variables, you can put the token into the `token` variable in `src/setup.ts` and remove the line `import '@util/dotenv'` from `src/setup.ts`.

Dotenv setup to read from a different `.env.*` file depending on the `NODE_ENV` environment variable. Currently, if `NODE_ENV` is `test` or `testing`, it will read from `.env.test`. If `NODE_ENV` is `production`, it will read from `.env.production`. Otherwise, `.env.development` is used. If you would prefer to use different files or environment names, you can edit the file `src/util/dotenv.ts` to your liking.

### Database

This bot uses [MongoDB](https://www.mongodb.com) as its primary database.
> MongoDB is a cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with schema. [Wikipedia](https://en.wikipedia.org/wiki/MongoDB)

What this mesans is that you do not have to know any SQL commands to use it.

I have setup this bot in such a way that the Client and Guild structures have a database property. Almost all of the database methods in `src/util/Database.ts` follow the same general usage: `operation('collection', query, [...params])`. For example, if I wanted to first find the database document for the guild with the id `12345`, I could do:
```ts
const guildDocument: GuildDocument = await client.db.find('guilds', { id: '12345' })
```
Update, insert and delete all work in a similar way:
```ts
// insert a document
await client.db.insert('guilds', { id: '12345', config: { prefix: '/' } })
// update a document
await client.db.update('guilds', { id: '12345' }, { config: { prefix: '!' } })
// delete a document
await client.db.delete('guilds', { id: '12345' })
```
I mentioned earlier that you could access the database through the Guild object. Accessing the `db` property of a guild will return its document in the database. It will return it as an object, so you will not be able to use any of the methods I mentioned above on it. It is essentially a shorter way of using `client.db.find('guilds', { id: 'guild-id' })`
> Remember, Snowflake IDs are strings, NOT numbers.\
> These are likely the four methods you will use the most. There are more than just these methods, like `drop()`, `updateRaw()` and `replace()`, but they will probably not get used as much as these four. For a full list of database methods, consult the database class (`src/util/Database.ts`) and the [MongoDB documentation](http://mongodb.github.io/node-mongodb-native/3.5/api/)\
> All of the database mentions return a promise, so be sure to either await them or chain a `.then()` function.

### Misc. Functions

There is a file that contains some extra functions that you may find useful. `src/util/misc.ts` contains the following function(s):
  - Pagination
  - Near Strings
  - Wait for Confirmation

#### Pagination

With this pagination function, you can easily paginate messages. The function has several options that make the function very customizable. Here's an example usage:
```ts
const content: string[] = [
  'This is the first page!',
  'This is the second page!',
  'This is the thrid page!'
]

const options: PageOptions = {
  time: 150000,
  emojis: {
    left: '579468510158389258',
    right: '➡'
  }
}

pages(message, content, options)
```

#### Matching Strings

This function will find the closest matching string from an array of strings. A lot of bots use it for a role command, for example. If you had a role called `Administrator`, it could find that role using `Admin` as input. Here's an example of its usage:
```ts
const search: string = 'Admin'

const roleNames: string[] = ['Member', 'Moderator', 'Administrator']

const options: MatchStringOptions = {
  minRating: 0.4
}

const match: Nullable<string> = matchString(search, roleNames, options)
```

#### Confirmation

The confirmation function allow you to ask for confirmation before continuing execution. It's extremely simple to use:
```ts
const confirmationMessage: string = 'Are you sure you would like to stop the bot?'

const options: ConfirmationOptions = {
  confirmMessage: 'Shutting down...',
  denyMessage: 'Shutown cancelled.',
  time: 10000,
}

const continue: boolean = await confirmation(message, confirmationMessage, options)
if (continue) process.exit(0)
```

### Final Remarks and Helpful Advice

* There are typings for all or almost all of the functions I've used to make this bot, so use them!
* The Guild database document has an interface, too! It's called `GuildDocument` and you can import it from `src/types/index.d.ts`
* Use the module aliases that I have setup! The aliases I have setup right now are `@types`: `src/types/index.d.ts`, `@command`:`src/util/Command.ts` and `@util`: `src/util/*`. You can use them in any `import` or `require` statement. *NOTE*: The aliases do NOT work with other modules. They only work with imports
* If you want to add additional items to the `CommandOptions`, you can! Just add them to the interface in `src/types/index.d.ts`!
* Keep all of your database logic in one file. That way, if you ever have to change to a different database, you only have to change one file, instead of multiple times arcoss all of your files. I have a lot of important database interaction methods in `src/util/Database.ts`. If you use those and later decide to switch to an SQL database, you will only have to edit the methods in `src/util/Database.ts` so you will have to change nothing or very little in other files.
