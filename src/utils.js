import pool from "./db";

const utils = {}
utils.AES = require("crypto-js/aes");
utils.token = '463746376kfglskjg9w45pgkfdsjgbksfb2904309134'
utils.CryptoJS = require("crypto-js");

const a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"A","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"};

utils.transliterate = (word) => {
  return word.split('').map(function (char) {
    return a[char] || char;
  }).join("");
}

utils.slug = async (str, db) => {
    try {
        str = utils.transliterate(str)
        str = str.replace(/^\s+|\s+$/g, '');
        str = str.toLowerCase();
        str = str.replace(/[^a-z0-9 -]/g, '') 
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-'); 
        let res = await pool.query(`SELECT * FROM ${db}`)
        res = res.rows

        if(res?.length) {
            res.forEach(element => {
                if(element.slug === str) {
                    str = str + '-' + Date.now()
                }
            })
        }
        
        return {success: true, str: str}
    }
    catch(e) {
        console.log(e)
        return {success: false}
    }
}

utils.getToken = (headers) => {

    let user = utils.AES.decrypt(headers.ssid, utils.token) 
    user = JSON.parse(user.toString(utils.CryptoJS.enc.Utf8)) 

    return user
}

export default utils;