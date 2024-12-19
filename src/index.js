import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import upload from "./upload";
import categories from "./categories/urls";
import products from "./products/urls";
import notes from "./notes/urls";
import users from "./users/urls";
import { ip } from "elysia-ip";


const app = new Elysia()
    .use(cors())
    .use(ip())
    .get('/images/:name', ({params: {name}}) => upload.getImage(name))
    .use(categories)
    .use(products)
    .use(notes)
    .use(users)
    .listen(4000);
