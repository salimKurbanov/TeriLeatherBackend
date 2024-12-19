import pool from "../db";
import jwt from "../jwt";
import utils from "../utils";


const Views = {}

Views.init = async (headers, ip) => {
    try {

        let user = utils.getToken(headers)
        
        if(user.ip !== ip) {
            return {success: false, status: 401, message: 'Токен не действителен'}
        }

        let res = await pool.query(`SELECT * FROM users WHERE userid = \$1`, [user.user_id])

        res = res.rows[0]

        if(!res) {
            return {success: false, status: 401}
        }

        return {success: true, status: 200, data: res}

    } catch(e) {
        return {success: false, message: e.message, status: 500}
    }
}

Views.getAllUsers = async () => {
    try {
        let res = await pool.query(`SELECT * FROM users ORDER BY datetime DESC`)
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

Views.signIn = async (user, ip) => {
    try {

        let res = await pool.query(`SELECT * FROM users WHERE email = \$1`, [user.email])
        res = res.rows[0]

        if(!res) {
            return {success: false, status: 400, message: 'Неверный логин или пароль'}
        }

        if(!res.active) {
            return {success: false, status: 400, message: 'Ваш аккаунт не активирован'}
        }

        if(res.banned) {
            return {success: false, status: 400, message: 'Ваш аккаунт заблокирован'}
        }
        
        let password = new Bun.CryptoHasher("sha256").update(user.password).digest("hex")
        if(res.password !== password) {
            return {success: false, status: 400, message: 'Неверный логин или пароль'}
        }

        const accessToken = jwt.create(res, ip)

        return {success: true, accessToken: accessToken, status: 200}

    } catch(e) {
        return {success: false, message: e.message, status: 500}
    }
}

Views.bannedUser = async (id, headers, ip) => {
    try {
        let token = utils.getToken(headers)

        if(token.ip !== ip) {
            return  {success: false, status: 401, message: 'Токен не действителен'}
        }

        if(token.role !== 'admin') {
            return {success: false, message: 'Недостаточно прав', status: 401}
        }
        
        await pool.query(`UPDATE users SET banned = \$1 WHERE userid = \$2`, [true, id])
        return {success: true, status: 200, message: 'Аккаунт заблокирован'}

    } catch(e) {
        return {success: false, message: e.message, status: 500}
    }
}

Views.deleteUser = async (headers, id, ip) => {
    try {
        
        let token = utils.getToken(headers)

        if(token.ip !== ip) {
            return  {success: false, status: 401, message: 'Токен не действителен'}
        }

        if(token.role !== 'admin') {
            return {success: false, message: 'Недостаточно прав', status: 401}
        }

        let user = await pool.query(`SELECT * FROM users WHERE userid = \$1`, [id])

        user = user.rows[0]

        if(!user) {
            return {success: false, message: 'Не удалось удалить пользователя', status: 400}
        }

        await pool.query(`DELETE FROM users WHERE userid = \$1`, [id])

        return {success: true, status: 200}

    } catch(e) {
        return {success: false, message: e.message, status: 500}
    }
}

export default Views;