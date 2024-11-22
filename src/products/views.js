import { error } from "elysia"
import pool from "../db"
import upload from "../upload"
import utils from "../utils"

const Views = {}

Views.getAllProducts = async (query) => {
    try {

        let order = query.order || 'datetime'
        let sort = query.sort || 'DESC'
        let filters = ''

        if(query.colors) {
            filters += `AND shades.color_name IN ${query.colors}`
        }

        if(query.material) {
            filters += `AND shades.material IN ${query.material}`
        }

        if(query.priceMin && query.priceMax) {
            filters += `AND shades.price BETWEEN ${query.priceMin} AND ${query.priceMax}`
        }

        if(filters[0] === 'A') {
            filters = filters.slice(3)
        }

        let res = await pool.query(`
            SELECT * 
            FROM products 
            LEFT OUTER JOIN shades 
            ON products.article = shades.article
            ${filters ? `WHERE ${filters}` : ''}
            ORDER BY shades.${order} ${sort}
        `, )

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
            `INSERT INTO products (title, gender, categories, article, description)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [body.title, body.gender, body.categories, article, body.description]
        );

        body.article = article
        const shade = await Views.createShade(body)

        if(!shade.success) {
            await pool.query('DELETE FROM products WHERE productid = $1', [product.rows[0].productid])
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
        
        const slug = await utils.slug(`${body.categories}-${body.title}-${body.color_name}`, 'shades')
        if(!slug.success) {
            return {success: false, status: 400, message: "Не удалось сохранить slug"}
        }
        
        await upload.image(slug.str, body.main_image)
        if (body.images && body.images.length > 0) {
            const imageUploadPromises = body.images.map(async (el, i) => {
                const imageName = `${slug.str}${i}`;
                images_list.push(imageName);
                upload.image(imageName, el);
            });

            await Promise.all(imageUploadPromises);
        }
        
        let shade = await pool.query(
            `INSERT INTO shades (price, discount, color, color_name, slug, main_image, images, material, available, new, tags, article)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [body.price, body.discount, body.color, body.color_name, slug.str, slug.str, images_list, body.material, body.available, body.new, body.tags, body.article]
        )

        return {success: true, status: 200, data: shade.rows[0]}

    } catch(e) {
        console.log(e)
        return {success: false, status: 500, message: 'Ошибка при создании оттенка', error: e}
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

        return {success: true, status: 200}

    } catch(e) {
        return {success: false, status: 500, message: 'Не удалось выполнить запрос, попробуйте ещё раз', error: e.message}
    }
}

export default Views