import {Elysia, t} from "elysia";
import Views from "./views";


const categories = new Elysia({prefix: '/api/categories'})
    .get('/all', () => Views.getAllCategories())
    .get('/detail/:id', () => Views.getCategoryDetail(id))
    .post('/create', ({body}) => Views.createCategories(body), {
    schema: {
        body: t.Object({
        categories_plural: t.String(),
        categories: t.String(),
        for_men: t.Boolean(),
        for_women: t.Boolean(),
        image: t.Files()
        }),
    }
    })
    .put('/update/:id', ({body}) => Views.updateCategories(id, body))
    .delete('/delete/:id', ({params: {id}}) => Views.categoriesDelete(id))

export default categories;