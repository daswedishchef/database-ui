var mysql = require('mysql');
var pool = mysql.createPool({
        host  :  'classmysql.engr.oregonstate.edu',
        user  :  'cs290_carlsosp',
        password  :  '4772',
        database  :  'cs290_carlsosp'
    });
module.exports.pool = pool;