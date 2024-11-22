import { Pool } from 'pg'

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'teri_leather',
    password: 'admin',
    port: 5432,
})

const createtables = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS categories (
            categoryId SERIAL PRIMARY KEY,
            categories_plural TEXT,
            categories TEXT,
            for_men BOOLEAN,
            for_women BOOLEAN,
            slug TEXT UNIQUE,
            image TEXT
        )`)

        await pool.query(`CREATE TABLE IF NOT EXISTS products (
            productid SERIAL PRIMARY KEY, 
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            gender INT NOT NULL, -- 1, 2 or 3
            categories TEXT,
            article TEXT UNIQUE
        )`)

        await pool.query(`CREATE TABLE IF NOT EXISTS shades (
            shadeid SERIAL PRIMARY KEY,
            price INT NOT NULL, 
            discount SMALLINT,
            color TEXT NOT NULL,
            color_name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            main_image TEXT,
            images TEXT[],
            material TEXT NOT NULL,
            available BOOLEAN DEFAULT false,
            new BOOLEAN DEFAULT false,
            tags TEXT[],
            datetime TIMESTAMP DEFAULT LOCALTIMESTAMP,
            article TEXT
        )`)

        await pool.query(`CREATE TABLE IF NOT EXISTS notes (
            notesid SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            image TEXT,
            date TIMESTAMP NOT NULL,
            slug TEXT UNIQUE NOT NULL
        )`)

        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            userid SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            middlename TEXT NOT NULL,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            role TEXT NOT NULL,
            active BOOLEAN DEFAULT false,
            datetime TIMESTAMP DEFAULT CURRENT_DATE 
        )`)
        
        console.log('database init')
    }
    catch (e) {
        console.log(e)
    }
}

createtables()

export default pool;