import pool from "../db";
import upload from "../upload";
import utils from "../utils";

const Views = {}

Views.getAllNotes = async () => {
    try {
        let res = await pool.query('SELECT * FROM notes ORDER BY date DESC')
        return {success: true, data: res.rows, status: 200}
    } catch(e) {
        return {success: false, error: e, status: 400}
    }
}

Views.getNoteDetail = async (id) => {
    try {
        let item = await pool.query('SELECT * FROM notes WHERE notes_id = \$1', [id])
        return {success: true, status: 200, data: item.rows[0]}
    } catch(e) {
        return {success: false, status: 400, message: 'Не удалось выполнить запрос, попробуйте ещё раз'}
    }
}

Views.createNotes = async (body) => {
    try {
        if(body.title.length <= 3) {
            return {success: false, status: 404, message: 'Тема не может быть короче трёх символов'}
        }
        const slug = await utils.slug(body.title, 'notes')
        if(!slug.success) {
            return {success: false, status: 400, message: "Не удалось сохранить имя"}
        }
        await upload.image(slug.str, body.image)
        const date = new Date()
        let res = await pool.query(`INSERT INTO notes (title, description, image, date, slug) VALUES (\$1, \$2, \$3, \$4, \$5) RETURNING *`, [body.title, body.description, slug.str, date, slug.str])
        return {success: true, status: 200, message: `Заметка успешна создана`, data: res.rows[0]}
    } catch(e) {
        console.log(e)
        return {success: false, error: e, status: 400, message: 'Не удалось сохранить заметку'}
    }
}

Views.deleteNote = async (id) => {
    try {
        let item = await pool.query('SELECT * FROM notes WHERE notesid = \$1', [id])

        await pool.query('DELETE FROM notes WHERE notesid = \$1', [id]);

        upload.deleteImage(item.rows[0].image)
        
        return {success: true, status: 200, message: `Заметка ${item.rows[0].title} успешно удалена`}
    } catch(e) {
        return {success: false, status: 400, message: 'Не удалось выполнить запрос, попробуйте ещё раз'}
    }
}
export default Views;