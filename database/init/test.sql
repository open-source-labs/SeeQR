
CREATE DATABASE dbb;

CREATE TABLE email(
    _id serial NOT NULL,
    email varchar(200) NOT NULL UNIQUE,
    CONSTRAINT "email_pk" PRIMARY KEY ("_id")
);
CREATE TABLE student(
    _id serial NOT NULL,
    name varchar(100) NOT NULL,
    course varchar(100) NOT NULL,
    email_id serial REFERENCES email (_id),
    CONSTRAINT "student_pk" PRIMARY KEY ("_id")
);



-- --

-- CREATE TABLE "Days"
-- (
--  "day_id" serial NOT NULL,
--  "day"    varchar(9) NOT NULL,
--  "color"  varchar(50) NOT NULL,
--  CONSTRAINT "PK_days" PRIMARY KEY ( "day_id" )
-- );
-- CREATE TABLE "Manager"
-- (
--  "manager_id"    serial NOT NULL,
--  "mgr_firstname" varchar(50) NOT NULL,
--  "mgr_lastname"  varchar(50) NOT NULL,
--  "hire_date"     date NOT NULL,
--  "years_as_mgr"  smallint NOT NULL,
--  "email"         varchar(50) NOT NULL,
--  "phone"         varchar(15) NOT NULL,
--  CONSTRAINT "PK_manager" PRIMARY KEY ( "manager_id" )
-- );
-- CREATE TABLE "Markets"
-- (
--  "market_id"   serial NOT NULL,
--  "market_name" varchar(20) NOT NULL,
--  "state"       char(2) NOT NULL,
--  "day_id"      integer NOT NULL,
--  "manager_id"  integer NOT NULL,
--  CONSTRAINT "PK_markets" PRIMARY KEY ( "market_id" ),
--  CONSTRAINT "FK_175" FOREIGN KEY ( "day_id" ) REFERENCES "Days" ( "day_id" ),
--  CONSTRAINT "FK_185" FOREIGN KEY ( "manager_id" ) REFERENCES "Manager" ( "manager_id" )
-- );
-- CREATE INDEX "fkIdx_175" ON "Markets"
-- (
--  "day_id"
-- );
-- CREATE INDEX "fkIdx_185" ON "Markets"
-- (
--  "manager_id"
-- );
-- CREATE TABLE "Users"
-- (
--  "_id"       serial NOT NULL,
--  "username"  varchar(20) NOT NULL,
--  "firstname" varchar(50) NOT NULL,
--  "lastname"  varchar(50) NOT NULL,
--  "phone"     varchar(15) NOT NULL,
--  "email"     varchar(50) NOT NULL,
--  "market_id" integer NOT NULL,
--  CONSTRAINT "PK_users" PRIMARY KEY ( "_id" ),
--  CONSTRAINT "FK_162" FOREIGN KEY ( "market_id" ) REFERENCES "Markets" ( "market_id" )
-- );
-- CREATE INDEX "fkIdx_162" ON "Users"
-- (
--  "market_id"
-- );