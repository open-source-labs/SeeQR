--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1
-- Dumped by pg_dump version 13.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: films; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.films (
    _id integer NOT NULL,
    title character varying NOT NULL,
    episode_id integer NOT NULL,
    opening_crawl character varying NOT NULL,
    director character varying NOT NULL,
    producer character varying NOT NULL,
    release_date date NOT NULL
);


ALTER TABLE public.films OWNER TO postgres;

--
-- Name: films__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.films__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.films__id_seq OWNER TO postgres;

--
-- Name: films__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.films__id_seq OWNED BY public.films._id;


--
-- Name: people; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.people (
    _id integer NOT NULL,
    name character varying NOT NULL,
    mass character varying,
    hair_color character varying,
    skin_color character varying,
    eye_color character varying,
    birth_year character varying,
    gender character varying,
    species_id bigint,
    homeworld_id bigint,
    height integer
);


ALTER TABLE public.people OWNER TO postgres;

--
-- Name: people__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.people__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.people__id_seq OWNER TO postgres;

--
-- Name: people__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.people__id_seq OWNED BY public.people._id;


--
-- Name: people_in_films; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.people_in_films (
    _id integer NOT NULL,
    person_id bigint NOT NULL,
    film_id bigint NOT NULL
);


ALTER TABLE public.people_in_films OWNER TO postgres;

--
-- Name: people_in_films__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.people_in_films__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.people_in_films__id_seq OWNER TO postgres;

--
-- Name: people_in_films__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.people_in_films__id_seq OWNED BY public.people_in_films._id;


--
-- Name: pilots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pilots (
    _id integer NOT NULL,
    person_id bigint NOT NULL,
    vessel_id bigint NOT NULL
);


ALTER TABLE public.pilots OWNER TO postgres;

--
-- Name: pilots__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pilots__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pilots__id_seq OWNER TO postgres;

--
-- Name: pilots__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pilots__id_seq OWNED BY public.pilots._id;


--
-- Name: planets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planets (
    _id integer NOT NULL,
    name character varying,
    rotation_period integer,
    orbital_period integer,
    diameter integer,
    climate character varying,
    gravity character varying,
    terrain character varying,
    surface_water character varying,
    population bigint
);


ALTER TABLE public.planets OWNER TO postgres;

--
-- Name: planets__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planets__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.planets__id_seq OWNER TO postgres;

--
-- Name: planets__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planets__id_seq OWNED BY public.planets._id;


--
-- Name: planets_in_films; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planets_in_films (
    _id integer NOT NULL,
    film_id bigint NOT NULL,
    planet_id bigint NOT NULL
);


ALTER TABLE public.planets_in_films OWNER TO postgres;

--
-- Name: planets_in_films__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planets_in_films__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.planets_in_films__id_seq OWNER TO postgres;

--
-- Name: planets_in_films__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planets_in_films__id_seq OWNED BY public.planets_in_films._id;


--
-- Name: species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species (
    _id integer NOT NULL,
    name character varying NOT NULL,
    classification character varying,
    average_height character varying,
    average_lifespan character varying,
    hair_colors character varying,
    skin_colors character varying,
    eye_colors character varying,
    language character varying,
    homeworld_id bigint
);


ALTER TABLE public.species OWNER TO postgres;

--
-- Name: species__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.species__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.species__id_seq OWNER TO postgres;

--
-- Name: species__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.species__id_seq OWNED BY public.species._id;


--
-- Name: species_in_films; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species_in_films (
    _id integer NOT NULL,
    film_id bigint NOT NULL,
    species_id bigint NOT NULL
);


ALTER TABLE public.species_in_films OWNER TO postgres;

--
-- Name: species_in_films__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.species_in_films__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.species_in_films__id_seq OWNER TO postgres;

--
-- Name: species_in_films__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.species_in_films__id_seq OWNED BY public.species_in_films._id;


--
-- Name: starship_specs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.starship_specs (
    _id integer NOT NULL,
    hyperdrive_rating character varying,
    "MGLT" character varying,
    vessel_id bigint NOT NULL
);


ALTER TABLE public.starship_specs OWNER TO postgres;

--
-- Name: starship_specs__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.starship_specs__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.starship_specs__id_seq OWNER TO postgres;

--
-- Name: starship_specs__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.starship_specs__id_seq OWNED BY public.starship_specs._id;


--
-- Name: vessels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vessels (
    _id integer NOT NULL,
    name character varying NOT NULL,
    manufacturer character varying,
    model character varying,
    vessel_type character varying NOT NULL,
    vessel_class character varying NOT NULL,
    cost_in_credits bigint,
    length character varying,
    max_atmosphering_speed character varying,
    crew integer,
    passengers integer,
    cargo_capacity character varying,
    consumables character varying
);


ALTER TABLE public.vessels OWNER TO postgres;

--
-- Name: vessels__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vessels__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vessels__id_seq OWNER TO postgres;

--
-- Name: vessels__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vessels__id_seq OWNED BY public.vessels._id;


--
-- Name: vessels_in_films; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vessels_in_films (
    _id integer NOT NULL,
    vessel_id bigint NOT NULL,
    film_id bigint NOT NULL
);


ALTER TABLE public.vessels_in_films OWNER TO postgres;

--
-- Name: vessels_in_films__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vessels_in_films__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vessels_in_films__id_seq OWNER TO postgres;

--
-- Name: vessels_in_films__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vessels_in_films__id_seq OWNED BY public.vessels_in_films._id;


--
-- Name: films _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.films ALTER COLUMN _id SET DEFAULT nextval('public.films__id_seq'::regclass);


--
-- Name: people _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people ALTER COLUMN _id SET DEFAULT nextval('public.people__id_seq'::regclass);


--
-- Name: people_in_films _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people_in_films ALTER COLUMN _id SET DEFAULT nextval('public.people_in_films__id_seq'::regclass);


--
-- Name: pilots _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pilots ALTER COLUMN _id SET DEFAULT nextval('public.pilots__id_seq'::regclass);


--
-- Name: planets _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planets ALTER COLUMN _id SET DEFAULT nextval('public.planets__id_seq'::regclass);


--
-- Name: planets_in_films _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planets_in_films ALTER COLUMN _id SET DEFAULT nextval('public.planets_in_films__id_seq'::regclass);


--
-- Name: species _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species ALTER COLUMN _id SET DEFAULT nextval('public.species__id_seq'::regclass);


--
-- Name: species_in_films _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_in_films ALTER COLUMN _id SET DEFAULT nextval('public.species_in_films__id_seq'::regclass);


--
-- Name: starship_specs _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.starship_specs ALTER COLUMN _id SET DEFAULT nextval('public.starship_specs__id_seq'::regclass);


--
-- Name: vessels _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vessels ALTER COLUMN _id SET DEFAULT nextval('public.vessels__id_seq'::regclass);


--
-- Name: vessels_in_films _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vessels_in_films ALTER COLUMN _id SET DEFAULT nextval('public.vessels_in_films__id_seq'::regclass);


--
-- Name: films films_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.films
    ADD CONSTRAINT films_pk PRIMARY KEY (_id);


--
-- Name: people_in_films people_in_films_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people_in_films
    ADD CONSTRAINT people_in_films_pk PRIMARY KEY (_id);


--
-- Name: people people_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pk PRIMARY KEY (_id);


--
-- Name: pilots pilots_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pilots
    ADD CONSTRAINT pilots_pk PRIMARY KEY (_id);


--
-- Name: planets_in_films planets_in_films_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planets_in_films
    ADD CONSTRAINT planets_in_films_pk PRIMARY KEY (_id);


--
-- Name: planets planets_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planets
    ADD CONSTRAINT planets_pk PRIMARY KEY (_id);


--
-- Name: species_in_films species_in_films_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_in_films
    ADD CONSTRAINT species_in_films_pk PRIMARY KEY (_id);


--
-- Name: species species_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pk PRIMARY KEY (_id);


--
-- Name: starship_specs starship_specs_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.starship_specs
    ADD CONSTRAINT starship_specs_pk PRIMARY KEY (_id);


--
-- Name: vessels_in_films vessels_in_films_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vessels_in_films
    ADD CONSTRAINT vessels_in_films_pk PRIMARY KEY (_id);


--
-- Name: vessels vessels_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vessels
    ADD CONSTRAINT vessels_pk PRIMARY KEY (_id);


--
-- Name: people people_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_fk0 FOREIGN KEY (species_id) REFERENCES public.species(_id);


--
-- Name: people people_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_fk1 FOREIGN KEY (homeworld_id) REFERENCES public.planets(_id);


--
-- Name: people_in_films people_in_films_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people_in_films
    ADD CONSTRAINT people_in_films_fk0 FOREIGN KEY (person_id) REFERENCES public.people(_id);


--
-- Name: people_in_films people_in_films_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people_in_films
    ADD CONSTRAINT people_in_films_fk1 FOREIGN KEY (film_id) REFERENCES public.films(_id);


--
-- Name: pilots pilots_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pilots
    ADD CONSTRAINT pilots_fk0 FOREIGN KEY (person_id) REFERENCES public.people(_id);


--
-- Name: pilots pilots_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pilots
    ADD CONSTRAINT pilots_fk1 FOREIGN KEY (vessel_id) REFERENCES public.vessels(_id);


--
-- Name: planets_in_films planets_in_films_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planets_in_films
    ADD CONSTRAINT planets_in_films_fk0 FOREIGN KEY (film_id) REFERENCES public.films(_id);


--
-- Name: planets_in_films planets_in_films_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planets_in_films
    ADD CONSTRAINT planets_in_films_fk1 FOREIGN KEY (planet_id) REFERENCES public.planets(_id);


--
-- Name: species species_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_fk0 FOREIGN KEY (homeworld_id) REFERENCES public.planets(_id);


--
-- Name: species_in_films species_in_films_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_in_films
    ADD CONSTRAINT species_in_films_fk0 FOREIGN KEY (film_id) REFERENCES public.films(_id);


--
-- Name: species_in_films species_in_films_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_in_films
    ADD CONSTRAINT species_in_films_fk1 FOREIGN KEY (species_id) REFERENCES public.species(_id);


--
-- Name: starship_specs starship_specs_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.starship_specs
    ADD CONSTRAINT starship_specs_fk0 FOREIGN KEY (vessel_id) REFERENCES public.vessels(_id);


--
-- Name: vessels_in_films vessels_in_films_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vessels_in_films
    ADD CONSTRAINT vessels_in_films_fk0 FOREIGN KEY (vessel_id) REFERENCES public.vessels(_id);


--
-- Name: vessels_in_films vessels_in_films_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vessels_in_films
    ADD CONSTRAINT vessels_in_films_fk1 FOREIGN KEY (film_id) REFERENCES public.films(_id);


--
-- PostgreSQL database dump complete
--

