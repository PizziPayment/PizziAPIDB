const { rewriteTables, alterTables } = require("pizzi-db");

async function createTables(config) {
    await rewriteTables(config)
    console.log("Tables created.")
}

async function syncTables(config) {
    await alterTables(config)
    console.log("Table synchronized.")
}

exports.createTables = createTables
exports.syncTables = syncTables
