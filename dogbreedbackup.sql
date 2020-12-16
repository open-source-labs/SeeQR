--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1
-- Dumped by pg_dump version 13.0

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
-- Name: dog_breeds; Type: TABLE; Schema: public; Owner: jennifercourtner
--

CREATE TABLE public.dog_breeds (
    id integer NOT NULL,
    breed character varying(50)
);


ALTER TABLE public.dog_breeds OWNER TO jennifercourtner;

--
-- Name: dog_breeds_id_seq; Type: SEQUENCE; Schema: public; Owner: jennifercourtner
--

CREATE SEQUENCE public.dog_breeds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dog_breeds_id_seq OWNER TO jennifercourtner;

--
-- Name: dog_breeds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jennifercourtner
--

ALTER SEQUENCE public.dog_breeds_id_seq OWNED BY public.dog_breeds.id;


--
-- Name: dog_breeds id; Type: DEFAULT; Schema: public; Owner: jennifercourtner
--

ALTER TABLE ONLY public.dog_breeds ALTER COLUMN id SET DEFAULT nextval('public.dog_breeds_id_seq'::regclass);


--
-- Data for Name: dog_breeds; Type: TABLE DATA; Schema: public; Owner: jennifercourtner
--

COPY public.dog_breeds (id, breed) FROM stdin;
1	shih-tzu
\.


--
-- Name: dog_breeds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jennifercourtner
--

SELECT pg_catalog.setval('public.dog_breeds_id_seq', 1, true);


--
-- Name: dog_breeds dog_breeds_pkey; Type: CONSTRAINT; Schema: public; Owner: jennifercourtner
--

ALTER TABLE ONLY public.dog_breeds
    ADD CONSTRAINT dog_breeds_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

