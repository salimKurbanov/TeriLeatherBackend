import pool from "../db";
import jwt from "../jwt";
import upload from "../upload";
import utils from "../utils";

const Views = {}

Views.getAllUsers = async () => {
    try {
        let res = await pool.query(`SELECT * FROM users ORDER BY date DESC`)
        return {success: true, data: res.rows, status: 200}
    } catch(e) {
        return {success: false, error: e.message, status: 400, message: 'Не удалось получить пользователей'}
    }
}

Views.createUser = async (body) => {
    try {
        let password = new Bun.CryptoHasher("sha256").update(body.password).digest("hex");
        
        let res = await pool.query(`INSERT INTO users (email, name, surname, middlename, password, phone) VALUES (\$1, \$2, \$3, \$4, \$5, \$6) RETURNING *`, [body.email, body.name, body.surname, body.middlename, password, body.phone])

        // Отправить смс на почту с ссылкой

        return {success: true, status: 200}

    } catch(e) {
        return {success: false, error: e, status: 400}
    }
}

Views.userActivation = async () => {
    try {

    } catch(e) {
        return {success: false, error: e, status: 400}
    }
}

Views.signIn = async (req, user) => {
    console.log('hi')
    try {

        let res = await pool.query(`SELECT * FROM users WHERE email = \$1`, [user.email])
        res = res.rows[0]

        if(!res) {
            return {success: false, status: 401, message: 'Неверный логин или пароль'}
        }

        if(!res.user.active) {
            return {success: false, status: 401, message: 'Ваш аккаунт не активирован'}
        }

        if(res.password !== user.password) {
            return {success: false, status: 401, message: 'Неверный логин или пароль'}
        }

        const accessToken = jwt.create(req, user)

        return {success: true, accessToken: accessToken, status: 200}

    } catch(e) {
        return {success: false, error: e.message, status: 401}
    }
}

Views.deleteUser = async (id) => {
    try {

        await pool.query(`DELETE FROM users WHERE userid = \$1`, [id])

        return {success: true, status: 200}

    } catch(e) {
        return {success: false, error: e.message, status: 400}
    }
}

export default Views;