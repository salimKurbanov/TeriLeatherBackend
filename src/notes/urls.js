import Elysia, { t } from "elysia";
import Views from "./views";


const notes = new Elysia({prefix: '/api/notes'})
    .get('/all', () => Views.getAllNotes())
    .get('/detail/:id', ({params: {id}}) => Views.getNoteDetail(id))
    .post('/create', ({body}) => Views.createNotes(body), {
        schema: {
            body: {
                title: t.String(),
                description: t.String(),
                image: t.Files()
            }
        }
    })
    .delete('/delete/:id', ({params: {id}}) => Views.deleteNote(id))

export default notes;