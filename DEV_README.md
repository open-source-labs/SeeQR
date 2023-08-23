<div align="center">

<img src="./assets/readmeImages/logo_readme.png" height=300/>

</div>

<b>`Developer's Read Me`</b>

<b>`** v12.0.0 **`</b>

<p>In this version our team focused on refactoring the broken code base from all previous versions. </p>

<p><b> WHAT YOU NEED TO DO FIRST: </b></p>

Run npm run dev twice if you do not manually run tsc to compile the files first. The ts files have to compile before electron-dev and webpack-dev can start.

<p><b> WHAT WE UPDATED: </b></p>

<p>1. trimmed dependency issues from 54 down to 1. this one cannot be resolved because it is from the 30 viewers</p>
<p>2. Broke backend into MVVM/MVC model</p>
<p>3. Made sure types are enforced in typescript</p>
<p>4. Fixed import and export local files</p>
<p>5. Fixed Authentication</p>

<p><b> WHAT NEEDS TO BE DONE: </b></p>

<p><b>1. Isolating Database</b> <br> One of the biggest tasks that we tried but <b>did not finish</b> is isolating the concerns of each database type (DBType). The current application has multiple</p>
<code>if (database === DBType.postgres) {}<br>
else if (database === DBType.mysql) {}<br>
else (database === DBType.sqlite) {}<br>
</code>
<br>
<p>situations and it is not good. instead we will use switch statements to preemptively throw operations into seperate functions to completely silo cases for Postgres, Mysql, and SqLite. This is a task for <b>BOTH THE FRONTEND AND BACKEND</b> and the <b>FRONTEND IS MUCH HARDER</b>. The work for backend is actually done and it is illustrated in the picture below </p>

<img src="./assets/readmeImages/erdArchitecture.png" height=500/>

<p>The road map is finish connecting the siloed pieces for postgres, then moving on to mysql</p>

<p><b>2. ERD Logic Update</b><br>Currently, previous wrote the frontend to send back a big bundle of all the operations done in the frontend ERD Table. This ERD table object is divided by add, drop, and alter. All the add operations will execute first then drop, then alter. This is <b>BAD</b>. <br><br> We need to redesign frontend to send back "sequental" operations instead of bundling operations by add, drop, alter because it takes care of multiple edge cases and users in the front can do as many operations they want to ensure <b>SAVE</b> works. I illustrated the problem below. The current backend is written out already. We just need to make sure the frontend is send back the appropriate logic</p>

<img src="./assets/readmeImages/ERD_before_after.png" height=500/>

<p><b>3. Async event emmiters between front/backend</b></p>
<p>Currently, the way the feedback modal works is by handling events that are emitted from both the frontend and the backend. Ideally, this should be refactored to be state dependent rather than event dependent, as it controls the display of the modal. This can be tied into the centralized async event emitter added to frontend/components/app.tsx, in conjunction with migration to reducers from state variables. The goal will be to house modal messages in the store tied to the main app reducer. From there, the async handler can send new messages to the state via main app dispatch, and any other front end feedback can do the same.<br><br>
The main roadblock in the way of finalizing the transfer of event handlers out of the frontend is the way the dblist (list of databases in the sidebar) gets updated. Many event handlers in the backend send a dblist update event out to update the front end. Ideally, this should be handled by returning the new dblist changes out of the handler and using that resolved value to update state whenever an action would cause a dblist change. Right now, app.tsx has a useEffect running that listens for those dblist updates every frame. This is inefficient as a frontend concern.<br><br>
The spinner currently works in a similar way to feedback. Once all async is completely migrated (including dblist update changes), this spinner can simply be tied to the loading property in the main app state.<br><br>
There are still some filesystem read/write calls in the front end. This should be refactored to an async call that requests the backend handle the file system read/write for proper separation of concerns.
</p>
<p>4. </p>
<p>5. </p>

<p><b> WHAT IS BROKEN: </b></p>
