const koa = require('koa');
const app = new koa();
const Router = require('koa-router');
const parser = require('./ISBN-parser');
const router = new Router();
const {port} = require('./config');

router.get('/isbn/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let result = await parser.parseTitleFromISBN(id);
    ctx.body = result;
});
app.use(router.routes());

app.listen(port, function () {
    console.log(`isbn parse service listen in ${port}`);
});