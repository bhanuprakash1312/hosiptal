--
-- PostgreSQL database dump
--

\restrict 28g8XSlYZgAIbizpRZMLsnrnYewRAoHzM9wq9pc7lsPzy53AKmuA7ZoFGCPeeOO

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.patients DROP CONSTRAINT IF EXISTS patients_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.doctors DROP CONSTRAINT IF EXISTS doctors_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blocked_slots DROP CONSTRAINT IF EXISTS blocked_slots_doctor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;
DROP INDEX IF EXISTS public.ix_users_id;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_patients_id;
DROP INDEX IF EXISTS public.ix_doctors_id;
DROP INDEX IF EXISTS public.ix_departments_id;
DROP INDEX IF EXISTS public.ix_blocked_slots_id;
DROP INDEX IF EXISTS public.ix_appointments_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.patients DROP CONSTRAINT IF EXISTS patients_user_id_key;
ALTER TABLE IF EXISTS ONLY public.patients DROP CONSTRAINT IF EXISTS patients_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.doctors DROP CONSTRAINT IF EXISTS doctors_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_appointment_id_key;
ALTER TABLE IF EXISTS ONLY public.blocked_slots DROP CONSTRAINT IF EXISTS blocked_slots_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.patients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.doctors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.blocked_slots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appointments ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.patients_id_seq;
DROP TABLE IF EXISTS public.patients;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.doctors_id_seq;
DROP TABLE IF EXISTS public.doctors;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.conversations_id_seq;
DROP TABLE IF EXISTS public.conversations;
DROP SEQUENCE IF EXISTS public.blocked_slots_id_seq;
DROP TABLE IF EXISTS public.blocked_slots;
DROP SEQUENCE IF EXISTS public.appointments_id_seq;
DROP TABLE IF EXISTS public.appointments;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    appointment_date date NOT NULL,
    time_slot character varying NOT NULL,
    visit_type character varying NOT NULL,
    status character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: blocked_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_slots (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    date date NOT NULL,
    time_slot character varying
);


ALTER TABLE public.blocked_slots OWNER TO postgres;

--
-- Name: blocked_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blocked_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blocked_slots_id_seq OWNER TO postgres;

--
-- Name: blocked_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blocked_slots_id_seq OWNED BY public.blocked_slots.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    appointment_id integer,
    patient_id integer,
    doctor_id integer,
    created_at timestamp with time zone
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO postgres;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    name character varying NOT NULL,
    specialization character varying NOT NULL,
    experience_years integer NOT NULL,
    consultation_fee integer NOT NULL,
    department_id integer
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer,
    sender_id integer,
    sender_role character varying,
    message text,
    created_at timestamp with time zone
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    user_id integer NOT NULL,
    gender character varying NOT NULL,
    date_of_birth date NOT NULL,
    address character varying NOT NULL,
    city character varying NOT NULL,
    state character varying NOT NULL,
    pincode character varying NOT NULL,
    blood_group character varying,
    emergency_contact character varying NOT NULL,
    existing_conditions text
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    password character varying,
    role character varying,
    otp character varying(6),
    otp_expires_at timestamp with time zone,
    is_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: blocked_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_slots ALTER COLUMN id SET DEFAULT nextval('public.blocked_slots_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, patient_id, doctor_id, appointment_date, time_slot, visit_type, status, created_at) FROM stdin;
3	8	11	2026-01-24	10:00 AM	New Consultation	BOOKED	2026-01-17 11:05:17.830705
5	1	10	2026-04-21	09:30 AM	Follow-up	BOOKED	2026-04-20 11:38:55.044086
6	1	10	2026-05-15	10:30 AM	Follow-up	BOOKED	2026-05-02 08:53:45.214003
\.


--
-- Data for Name: blocked_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked_slots (id, doctor_id, date, time_slot) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, appointment_id, patient_id, doctor_id, created_at) FROM stdin;
1	5	1	10	2026-05-01 20:38:22.515999+05:30
3	6	1	10	2026-05-02 14:24:33.819214+05:30
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name) FROM stdin;
1	Cardiology
2	Orthopedics
3	Dermatology
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, name, specialization, experience_years, consultation_fee, department_id) FROM stdin;
10	Dr. Anil Kumar	Cardiologist	12	500	1
11	Dr. Priya Sharma	Cardiologist	8	400	1
12	Dr. Ravi Teja	Orthopedic	10	600	2
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, sender_role, message, created_at) FROM stdin;
1	1	1	PATIENT	hi	2026-05-01 20:38:29.763639+05:30
2	1	10	DOCTOR	hi sir	2026-05-01 20:38:38.152641+05:30
3	1	10	DOCTOR	how can we help you	2026-05-01 20:39:41.849035+05:30
4	1	1	PATIENT	naaku sanka noppi ga undi	2026-05-01 20:39:53.352009+05:30
5	1	1	PATIENT	hi	2026-05-01 20:41:39.413695+05:30
6	1	10	DOCTOR	hi sir	2026-05-01 20:41:46.540308+05:30
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, user_id, gender, date_of_birth, address, city, state, pincode, blood_group, emergency_contact, existing_conditions) FROM stdin;
1	1	Male	2004-12-13	24 Th Ward	Repalle	Andhra Pradesh	522265	O+	08247233697	\N
2	2	Male	2004-12-13	24 Th Ward	Repalle	Andhra Pradesh	522265	\N	08247233697	\N
8	3	Male	2004-12-13	24 Th Ward	Repalle	Andhra Pradesh	522265	O+	08247233697	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, phone, password, role, otp, otp_expires_at, is_verified) FROM stdin;
2	Bhanu Prakash	vk0557339@gmail.com	8247233697	$2b$12$C0VArW540e1r/mCtdyeRFO1G2kBB16cSm4/IIClK5C4sEiz1vIu5G	PATIENT	\N	\N	t
3	P Bhanuprakash	pulibhanu70@gmail.com	8247233697	$2b$12$UrJaGFhTszzK1RMtN5Ziu.4ktKojoVL0bpWcZwtStHRwQJgIsHa1i	PATIENT	\N	\N	t
10	Dr. Anil Kumar	anil@hospital.com	0000000000	$2b$12$xDmWMu4ELE3k/Bvqa61LuOl6Ykt4E1wBsdoqbI/nQxVmoDolH1tV6	DOCTOR	\N	\N	t
11	Dr. Priya Sharma	priya@hospital.com	0000000000	$2b$12$jFghsFyG3VD4R7C3uPkBOu9YFAJF2ZwjaGiNMEJiPTJex5PnZjkYe	DOCTOR	\N	\N	t
12	Dr. Ravi Teja	ravi@hospital.com	0000000000	$2b$12$cYa6gzYVIU0Xohy21/X7n.fciOrZLAZXX2N4xz.8CZ9IyhUp9oPEi	DOCTOR	\N	\N	t
1	Bhanu Prakash	bp136897@gmail.com	8247233697	$2b$12$eEUma2/ns06HiGG2PGMUGeSPNVw80r.DKl3jPdmfe77eOZv8HsfYu	PATIENT	\N	\N	t
13	Super Admin	admin@hospital.com	1234567890	$2b$12$pOXfplh69H73P8D2mXk/ne9yVvrkD4H3hi9NNBJgc8pmFq8Y2fZDC	ADMIN	\N	\N	t
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 6, true);


--
-- Name: blocked_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blocked_slots_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversations_id_seq', 3, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 4, true);


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_id_seq', 3, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 6, true);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 8, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: blocked_slots blocked_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_slots
    ADD CONSTRAINT blocked_slots_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_appointment_id_key UNIQUE (appointment_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: patients patients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_appointments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_appointments_id ON public.appointments USING btree (id);


--
-- Name: ix_blocked_slots_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blocked_slots_id ON public.blocked_slots USING btree (id);


--
-- Name: ix_departments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_departments_id ON public.departments USING btree (id);


--
-- Name: ix_doctors_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_doctors_id ON public.doctors USING btree (id);


--
-- Name: ix_patients_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_patients_id ON public.patients USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: blocked_slots blocked_slots_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_slots
    ADD CONSTRAINT blocked_slots_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: conversations conversations_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: conversations conversations_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.users(id);


--
-- Name: doctors doctors_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: patients patients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 28g8XSlYZgAIbizpRZMLsnrnYewRAoHzM9wq9pc7lsPzy53AKmuA7ZoFGCPeeOO

