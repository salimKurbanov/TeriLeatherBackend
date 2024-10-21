import pool from "../db";
import upload from "../upload";
import utils from "../utils";

const Views = {}

Views.getCategoryDetail = async (id) => {
    try {
        let item = await pool.query('SELECT * FROM categories WHERE categoryid = \$1', [id])
        return {success: true, status: 200, data: item.rows[0]}
    } catch(e) {
        return {success: false, status: 400, message: 'Не удалось выполнить запрос, попробуйте ещё раз'}
    }
}

Views.createCategories = async (body) => {
    try {
        const slug = await utils.slug(body.categories_plural)
        if(!slug.success) {
            return {success: false, status: 400, message: "Не удалось сохранить имя"}
        } 
        const image = await upload.image(slug.str, body.image)
        
        if (!image.success) {
            return {success: false, status: 400, message: "Не удалось сохранить изображение"}
        } else {
            let res = await pool.query(
                'INSERT INTO categories (categories_plural, categories, for_men, for_women, slug, image) VALUES (\$1, \$2, \$3, \$4, \$5, \$6) RETURNING *',
                [body.categories_plural, body.categories, body.for_men, body.for_women, slug.str, slug.str]
            );
            return {success: true, status: 200, message: `Категория ${res.rows[0].categories_plural} успешно создана`, data: res.rows[0]}
        }
    }
    catch(e) {
        console.log(e)
        return {success: false, status: 400, error: e}
    }
}

Views.updateCategories = async (id, body) => {
    try {
        let res = await pool.query('UPDATE categories SET categories_pluraL = \$1, categories = \$2, for_men = \$3, for_women = \$4, slug = \$5, image = \&6 WHERE id = \$7', [body.categories_plural, body.categories, body.for_men, body.for_women, slug, body.categories_plural, id]);
        return {success: true, data: res.rows[0], status: 200}
    }
    catch (e) {
        return {success:false, error: e, status: 400}
    }
}

Views.categoriesDelete = async (id) => {
    try {
        let item = await pool.query('SELECT * FROM categories WHERE categoryid = \$1', [id])

        upload.deleteImage(item.rows[0].image)

        await pool.query('DELETE FROM categories WHERE categoryid = \$1', [id]);
        return {success: true, status: 200, message: `Категория ${item.rows[0].categories_plural} успешно удалена`}
    } catch(e) {
        console.log(e)
        return {success: false, status: 400, message: 'Не удалось выполнить запрос, попробуйте ещё раз'}
    }
}

Views.getAllCategories = async () => {
    try {
        let res = await pool.query('SELECT * FROM categories')
        return {success: true, status: 200, data: res.rows}
    }
    catch(e) {
        console.log(e)
        return {success: false, status: 400, error: e}
    }
}

export default Views;