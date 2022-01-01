const {createTables, syncTables} = require('./generate')
const {seedTables} = require("./seed");
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const fs = require('fs')

yargs(hideBin(process.argv))
    .scriptName('pizzi-deploy-db')
    .command('table <procedure>', 'Initialize tables.', (yargs) => {
            return yargs
                .positional('procedure', {
                    describe: 'Procedure to execute',
                    choices: ['recreate', 'alter'],
                })
        }, run
    )
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Add more verbosity'
    })
    .option('noseed', {
        alias: 'n',
        type: 'boolean',
        description: 'Don\'t seed the tables'
    })
    .option('config', {
        alias: 'c',
        type: "string",
        description: 'Use specific config file',
        default: './config.json'
    })
    .parse()

async function run(argv) {
    const procedure = []
    const config = JSON.parse(fs.readFileSync(argv.config))

    if (argv.procedure === 'recreate') {
        procedure.push(createTables)
    } else if (argv.procedure === 'alter') {
        procedure.push(syncTables)
    }
    if (!argv.noseed) {
        procedure.push(seedTables)
    }
    if (argv.verbose) {
        console.log(config)
    }
    await executeProcedure(procedure, config)
}

async function executeProcedure(procedure, config) {
    for (const task of procedure) {
        await task(config)
    }
}