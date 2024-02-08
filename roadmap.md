# Improvements

## view previous versions roadmap commits for older improvement goals

### v13 roadmap for future iterators

- General

    - Refactor codebase to elimiate <strong>prop-drilling</strong> allowing for future iterability. 

        - Continue working on state management (usereducer, usecontext, etc)

    - Update UI of the initial landing page of application with cloud database instructions

    - Fix outdated dependencies, currently packages must be force installed

- Mac vs Windows:

    - In the '../backend/src/models/configModel.ts' on line 9 - 11 specifies where the configFile will be downloaded. The 'home' variable will be different for Mac and Windows users. Utilize an if conditional statement here to prevent the need for maintaining two branches (main and devosx) for windows and mac.

    - For Windows set `home = process.cwd()` on line 10 and for Mac set <br>`home  = ${os.homedir()}/Documents/SeeQR` </br>

- Database management

    - Currently postgres imports/duplicates only works for either windows.

        - Perhaps use .pgpass file instead of pgpassword environment variable for security (for postgresql imports/duplicates)

        - Found in backend/helperFunctions.ts

    - Fix importing MySQL databases (currently creating an extra hollow copy or not working at all)
      
        - Currently importing MySQL databases will work when only MySQL server is up on MAC OS.
        
        - MySQL databases that are imported will only show data type, but not column name. 

    - Fix sqlite and RDS databases (currently only Postgres and MySQL are working)
    
    - Support for amazon aurora (beware of billing)


- Queries page

    - Fix query execution plan table view, likely broke while updating frontend dependencies

    - Utilize local storage to save query history. Currently the history disappears when we reload application.

    - Work on explain function for mysql and sqlite, may have different metadata from existing postgres implementation, display whatever you can get 

- 2D visualization / ER tables: 

    - Fix react flow bugs (tables moving on save, weird auto zooming, etc), maybe rewrite layout save functionality

    - Fix bugs for MySQL and SQLite (they work differently from PostgreSQL which is the basis for all current ERtable functionality)

        - i.e. SQLite doesn't support changing column names/data types after building them, but the ERtable currently creates columns and then alters them on the backend

    - Redesign the ER table query strategy in order to make users able to run queries with less overhead. (i.e. currently, if you add a table then delete it, and press save, instead of doing nothing, the backend will create and delete the table)

    - Fix the occasional bug with selecting

    - Add support for more column datatypes (according to the limitations of each database)

    - queued backendObj changes are still there even when switching between different dbs in sidebar

    - account for different constraint naming conventions (mostly mysql)

    - resolve issue of creating additional columns for each constraint (mostly mysql)

    - rds pg cloud queries not set up

    - rds my sql cloud queries wont let you create multiple tables at once. as in you have to create one table, then make another query to make your second table.

    - when you create a new cloud pg database, it seems to have all the other databases tables as well.
 

- 3D visualization: 

    - Change the way the 3D page is rendered, to allow switching directly between different databases through the sidebar (currently you need to leave the 3D page before switching to a new database).

    - Make the camera auto rotate when initially opening the 3D page

    - Better cache/memory management to speed up animations/rendering

    - Make the green table in the 3D view always face the user's camera

    - Implement ER table functions

    - Add VR functionality?


