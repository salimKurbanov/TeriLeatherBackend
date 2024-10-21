import { error } from "elysia"
import pool from "../db"
import upload from "../upload"

const Views = {}

Views.getAllProducts = async () => {

    try {

        let res = await pool.query(`
            SELECT * 
            FROM products 
            LEFT OUTER JOIN shades 
            ON products.article = shades.article 
            ORDER BY shades.datetime
        `)

        return {success: true, status: 200, data: res.rows}

    } catch(e) {
        return {success: false, status: 500, error: e}
    }
}

Views.getProductDetail = async (slug) => {
    try {
        
        let res = await pool.query(`
            SELECT * 
            FROM products 
            LEFT OUTER JOIN shades 
            ON products.article = shades.article 
            WHERE shades.slug = $1`, [slug]
        );
            
        return {success: true, status: 200, data: res.rows[0]}
            
    } catch(e) {
        return {success: false, status: 500, message: 'Не удалось выполнить запрос, попробуйте ещё раз'}
    }
}

Views.createProduct = async (body) => {
    try {

        const article = Date.now()

        let product = await pool.query(
            `INSERT INTO products (title, gender, categories, article)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [body.title, body.gender, body.categories, article]
        );

        body.article = article
        const shade = await Views.createShade(body)

        if(!shade.success) {
            return {success: false, status: shade.status, message: shade.message}
        }

        return {success: true, status: 200, message: `Товар ${product.rows[0].title} успешно создан`, data: product.rows[0]}

    } catch(e) {
        return {success: false, status: 500, error: e.message}
    }
}

Views.createShade = async (body) => {
    try {
        let images_list = []

        const slug = await utils.slug(`${body.categories}-${body.title}-${body.color_name}`)
        if(!slug.success) {
            return {success: false, status: 400, message: "Не удалось сохранить slug"}
        }

        await upload.image(slug.str, body.main_image)
        
        if (body.images && body.images.length > 0) {
            const imageUploadPromises = body.images.map((el, i) => {
                const imageName = `${slug.str}${i}`;
                images_list.push(imageName);
                return upload.image(imageName, el);
            });

            await Promise.all(imageUploadPromises);
        }
        
        let shade = await pool.query(
            `INSERT INTO shades (description, price, discount, color, color_name, slug, main_image, images, material, work, available, new, tags, article)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [body.description, body.price, body.discount, body.color, body.color_name, slug.str, slug.str, images_list, body.material, body.work, body.available, body.new, body.tags, body.article]
        )

        return {success: true, status: 200, data: shade.rows[0]}

    } catch(e) {
        return {success: false, status: 500, message: 'Ошибка при создании оттенка', error: e.message}
    }
}

Views.deleteProduct = async (id) => {
    try {
        let item = await pool.query('SELECT * FROM products WHERE productid = \$1', [id])

        // upload.deleteImage(item.rows[0].main_image)

        // if(item.rows[0].images?.length) {
        //     item.rows[0].images.map((el) => {
        //         upload.deleteImage(el)
        //     })
        // }

        // await pool.query('DELETE FROM products WHERE productid = \$1', [id])

        return {success: true, status: 200, message: `Товар ${item.rows[0].title} успешно удалён`}
    } catch(e) {
        console.log(e)
        return {success: false, status: 400, message: 'Не удалось выполнить запрос, попробуйте ещё раз'}
    }
}

Views.deleteShade = async (id) => {
    try {
        let item = await pool.query('SELECT * FROM shades WHERE shadeid = $1', [id])

        upload.deleteImage(item.rows[0].main_image)

        if(item.rows[0].images?.length) {
            item.rows[0].images.map((el) => {
                upload.deleteImage(el)
            })
        }

        await pool.query('DELETE FROM shades WHERE shadeid = $1', [id])

    } catch(e) {
        return {success: false, status: 500, message: 'Не удалось выполнить запрос, попробуйте ещё раз', error: e.message}
    }
}

export default Views