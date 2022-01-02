# Pizzi Database Service

This package isolates the abstraction around Pizzi's DB, it uses Sequelize to
generate the tables and their relations.

# How to add Pizzi-DB as a dependency to your project ? 

You need to add this repository as a dependency. This is only tested on the berry (>= 2) version of yarn.

```sh
> yarn add 'git@github.com:PizziPayment/PizziAPIDB.git#workspace=pizzi-db&commit=<commit>'
```

# How it works ?

You have to init the whole ORM before using any of the methods.

Here's the configuration class:

```ts
export interface OrmConfig {
    // user's password
    password: string;

    // user's name
    user: string;

    // database's name
    name: string;

    // database's port
    port: number;

    // database's host
    host: string;

    // sequelize logging
    logging: boolean;
}
```

```ts
import { initOrm } from 'pizzi-db'

initOrm(
  {
    user: 'dbuser', 
    name: 'dbname', 
    host: 'dbhost', 
    port: 'dbport', 
    password: 'dbpassword',
    logging: false
  })
  .then(() => console.log('Database synchronised'))
  .catch((e) => throw e)

// The rest of your code
```

# Using Example

```ts
import { TokensService } from 'pizzi-db'

async function toto(): void {
    const token = await TokensService.getTokenFromValue("tokenstring")

    if (token.isOk()) {
        console.log(token.value) // it will log the whole token object
        ///
    } else {
        console.log(token.error) // it will log the error object
        ///
    }
}
```
