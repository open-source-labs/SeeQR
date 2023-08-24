Models write to databases and perform business logics. I want to point out "dbStateModel" is the special model here, becuse it encompasses the state of the backend, of which saves which users are currently logged in and which database is the "active one" for ERDtable.

configModel:

"connectionModel" deals with business logic of connetion actions. This file dealswith logining and connections to different kinds of databases.

FUNCTIONS: setBaseConnections, connectToDB, disconnectToDrop

"databaseModel" deals with business logic of connetion actions. This file dealswith logining and connections to different kinds of databases.

FUNCTIONS: getLists, getTableInfo, getDBNames, getColumnObjects, getDBLists
dbStateModel:

"queryModel" deals with business logic of any incoming queries from the query sidebar*?. Implement furthur query functionalities here NOT ERDtable

FUNCTIONS: query, sampler