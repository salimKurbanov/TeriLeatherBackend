const jwt = {}

let AES = require("crypto-js/aes");
const token = '124seckret_key'

jwt.create = (req, user) => {

    const ip = (req.agent.headers["x-forwarded-for"] || "").split(",").pop() ||
                req.agent.connection.remoteAddress ||
                req.agent.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

    const data = {
        user_id: user.userid,
        role: user.role,
        ip: ip
    }

    return AES.encrypt(JSON.stringify(data), token).toString()
}

export default jwt;