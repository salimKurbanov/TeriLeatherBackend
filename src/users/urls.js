import Elysia, { t } from "elysia";
import Views from "./views";


const users = new Elysia({prefix: '/api/users'})
    .get('/all', () => Views.getAllUsers())

export default users;