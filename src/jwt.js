import utils from "./utils";

const jwt = {}

jwt.create = (user, ip) => {
    
    const data = {
        user_id: user.userid,
        role: user.role,
        ip: ip
    }

    return utils.AES.encrypt(JSON.stringify(data), utils.token).toString()
}

export default jwt;