import Elysia, { t } from "elysia";
import Views from "./views";


const products = new Elysia({prefix: '/api/products'})
    .get('/all', () => Views.getAllProducts())
    .get('/detail/:slug', ({params: {slug}}) => Views.getProductDetail(slug))
    .delete('/delete/product/:id', ({params: {id}}) => Views.deleteProduct(id))
    .delete('/delete/shade/:id', ({params: {id}}) => Views.deleteShade(id))
    .post('/create/product', ({body}) => Views.createProduct(body), {
        schema: {
            body: {
                title: t.String(),
                gender: t.Integer(), //1,2 or 3
                categories: t.String(),
                //Поля для оттенка
                description: t.String(),
                price: t.Integer(), 
                discount: t.Integer(),
                color: t.String(),
                color_name: t.String(),
                slug: t.String(),
                main_image: t.Files(),
                images: t.Array(),
                material: t.String(),
                work: t.String(),
                available: t.Boolean(),
                new: t.Boolean(),
                tags: t.Array(),
                datetime: t.Date(),
            }
        }
    })
    .post('/create/shade', ({body}) => Views.createShade(body), {
        schema: {
            body: {
                article: t.String(),
                description: t.String(),
                price: t.Integer(), 
                discount: t.Integer(),
                color: t.String(),
                color_name: t.String(),
                slug: t.String(),
                main_image: t.Files(),
                images: t.Array(),
                material: t.String(),
                work: t.String(),
                available: t.Boolean(),
                new: t.Boolean(),
                tags: t.Array(),
                datetime: t.Date()
            }
        }
    })

export default products;