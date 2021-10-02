# Deploy db

This is a utility CLI to correctly init the db.

## Example

Recreate the tables from 0, loosing all the data.
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

To prevent the seeding of the table you can use the flag `--noseed` or `--ns`.