const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

function convertToChinese(str) {
    if (!str) {
        return str;
    }
    return unescape(str.replace(/&#x/g, '%u').replace(/;/g, ''))
}

function createSearchUrl(sn) {
    return `http://search.dangdang.com/?key=${sn}&act=input`;
}


function createRequestOption(url) {
    return {
        url: url,
        headers: {
            'User-Agent': 'request',
        }
    };
}

async function parseList(sn) {
    return new Promise((resolve, reject) => {
        request.get(createRequestOption(createSearchUrl(sn))).pipe(iconv.decodeStream('gb2312')).collect(function (err, decodedBody) {
            if (err) {
                reject(err);
            } else {
                let result = [];
                let $ = cheerio.load(decodedBody);
                $("#search_nature_rg").children('ul').children().each((i, e) => {
                    let s = cheerio.load(e);
                    if (!s('.search_shangjia').html()) {
                        let children = s('.name').children('a');
                        let title = children.attr('title');
                        let url = children.attr('href');
                        let object = {
                            title: title,
                            url: url
                        };
                        result.push(object);
                    }
                });
                resolve(result);
            }
        });
    });
}

async function parseTitle(url) {
    return new Promise((resolve, reject) => {
        request.get(createRequestOption(url)).pipe(iconv.decodeStream('gb2312')).collect(function (err, decodedBody) {
            if (err) {
                reject(err);
            } else {
                let $ = cheerio.load(decodedBody);
                let title = $('.name_info').children('h1').attr('title');
                resolve(title);
            }

        });
    });
}

function createResult(code = -1, data = 'Not found', success = false) {
    return {
        code: code,
        data: data,
        success: success
    }
}

async function parseTitleFromISBN(isbn) {
    try {
        let result = await parseList(isbn);
        if (result.length > 0) {
            let title = await parseTitle(result[0].url);
            return JSON.stringify(createResult(0, title, true));
        } else {
            return JSON.stringify(createResult());
        }
    } catch (e) {
        return JSON.stringify(createResult(-2, "Parse Error", false));
    }
}

module.exports = {
    parseTitleFromISBN
};