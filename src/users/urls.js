import Elysia, { t } from "elysia";
import Views from "./views";


const users = new Elysia({prefix: '/api/users'})
    .get('/all', () => Views.getAllUsers())
    .get('/activate', () => Views.userActivation())
    .delete('/delete/:id', ({params: {id}}) => Views.deleteUser(id))
    .post('/signin', ({body, ip}) => Views.signIn(body, ip), {
        schema: {
            body: {
                email: t.String(),
                password: t.String()
            }
        }
    })
    .post('/create', ({body}) => Views.createUser(body), {
        schema: {
            body: {
                email: t.String(),
                name: t.String(),
                surname: t.String(),
                middlename: t.String(),
                password: t.String(),
                phone: t.String(),
            }
        }
    })

export default users;