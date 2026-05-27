const { Pool } = require("pg");

const pool = new Pool({
    user:"postgres",
    password:"flowers",
    host:"localhost",
    port:5432,
    database:"sweet_gifts",
});

module.export=pool;