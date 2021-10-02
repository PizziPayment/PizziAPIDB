# Deploy db

This is a utility CLI to correctly init the db.

## Example

Recreate the tables from scratch, losing all the data.
```
$> yarn start table recreate
Table created.
Table seeded.
```

Altering existing tables (or creating new ones).
```
$> yarn start table alter
Table synchronized.
Table seeded.
```

To prevent the seeding of the table you can use the flag `--noseed` or `-n`.

## Config

All the information for db connection is located in `config.json`. If you want to
use your own configuration use the flag `--config <path>` or `-c <path>`. You can
dump the config file with `--verbose` or `-v`.
