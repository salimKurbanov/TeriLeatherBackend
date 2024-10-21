import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import upload from "./upload";
import categories from "./categories/urls";
import products from "./products/urls";
import notes from "./notes/urls";

const app = new Elysia()
    .use(cors())
    .get('/images/:name', ({params: {name}}) => upload.getImage(name))
    .use(categories)
    .use(products)
    .use(notes)
    .listen(4000);
