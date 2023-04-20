# Improvements

## view previous versions roadmap commits for older improvement goals

### v10 roadmap for future iterators

- fix outdated dependencies, currently packages must be force installed

- small bugs need to be ironed out, will find through testing

- account for different constraint naming conventions

- resolve issue of creating additional collumns for each constraint

- rewrite get columns query to only query relevant column names and constraints

- duplicate database names conflict

- sqlite support

- support for amazon aurora (beware of billing)

- fix dummy data generation

- delete database stops working after you delete one or two databases, or create one or two before

- when creating new databases, state seems to be creating phantom copies of databases aswell.

- rds pg cloud queries seem to be creating the tables in more than just the selected database.

- rds my sql cloud queries wont let you create multiple tables at once. as in you have to create one table, then make another query to make your second table.

- when you create a new cloud pg database, it seems to have all the other databases tables aswell.

- update ui of the initial landing page of application with cloud database instructions aswell

- queued backendObj changes are still there even when switching between different dbs in sidebar
