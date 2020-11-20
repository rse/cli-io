
const CLIio = require(".")

;(async () => {
    const cli = new CLIio()
    cli.log("error", "sample")
    const input = await cli.input(process.argv[2], { encoding: "utf8" })
    await cli.output(process.argv[3], input, { encoding: "utf8" })
})().catch((err) => {
    console.log(`sample: ERROR: ${err.stack}`)
})

