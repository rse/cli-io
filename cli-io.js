/*
**  CLI-IO -- Command-Line Interface I/O
**  Copyright (c) 2020-2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  built-in requirements  */
const path       = require("path")
const fs         = require("fs")

/*  external requirements  */
const getStream  = require("get-stream")
const jsYAML     = require("js-yaml")
const stripAnsi  = require("strip-ansi")
const got        = require("got")
const webdav     = require("webdav")
const chalk      = require("chalk")
const dayjs      = require("dayjs")

/*  internal requirements  */
const my         = require("./package.json")

/*  the API class  */
class CLIio {
    constructor (options = {}) {
        let program = path.basename(process.argv[1])
        program = program.replace(/\.[a-zA-Z]+$/, "")
        this.options = {
            encoding:  "utf8",
            logLevel:  "info",
            logTime:   true,
            logPrefix: program,
            ...options
        }
        this.logLevels = {
            none:    { level: 0 },
            error:   { level: 1, tag: "ERROR",   color: "red" },
            warning: { level: 2, tag: "WARNING", color: "yellow" },
            info:    { level: 3, tag: "INFO" },
            debug:   { level: 4, tag: "DEBUG",   color: "blue" }
        }
    }

    /*  reading CLI input  */
    async input (url, options = {}) {
        /*  provide option defaults  */
        options = {
            encoding: this.options.encoding,
            agent:    `${my.name}/${my.version}`,
            ...options
        }

        /*  read input data  */
        let data
        if (url === "-" || url === "stdin:") {
            /*  read data from stdin  */
            data = await getStream(process.stdin, {
                encoding: options.encoding
            })
        }
        else if (url.match(/^https?:\/\/.+/)) {
            /*  read data from URL with HTTP  */
            data = await got({
                url,
                encoding: options.encoding,
                headers:  { "User-Agent": options.agent }
            })
        }
        else {
            /*  read data from file  */
            url = url.replace(/^file:(?:\/\/)?/, "")
            data = await fs.promises.readFile(url, {
                encoding: options.encoding
            })
        }
        return data
    }

    /*  write CLI output  */
    async output (url, data, options = {}) {
        /*  provide option defaults  */
        options = {
            dump:            false,
            format:          "json",
            trailingNewline: false,
            noColor:         false,
            encoding:        this.options.encoding,
            mode:            0o666,
            flag:            "w",
            ...options
        }

        /*  optionally dump object  */
        if (options.dump) {
            if (options.format === "json")
                data = JSON.stringify(data, null, "    ")
            else if (options.format === "yaml")
                data = jsYAML.dump(data)
            else
                throw new Error(`invalid output format "${options.format}"`)
        }

        /*  optionally ensure a trailing newline  */
        if (options.trailingNewline && !data.match(/\n$/))
            data += "\n"

        /*  optionally remove all colors  */
        if (!options.dump && options.noColor)
            data = stripAnsi(data)

        if (url === "-" || url === "stdout:") {
            /*  write output data to stdout  */
            await new Promise((resolve, reject) => {
                process.stdout.write(data, options.encoding, (err) => {
                    if (err) reject(err)
                    else     resolve()
                })
            })
        }
        else if (url.match(/^https?:\/\/.+/)) {
            /*  write data to URL with HTTP/WebDAV  */
            const options = {}
            const urlParsed = new URL(url)
            if (urlParsed.username)
                options.username = urlParsed.username
            if (urlParsed.password)
                options.password = urlParsed.password
            const baseurl = `${urlParsed.protocol}://${urlParsed.hostname}:${urlParsed.port}`
            const pathname = urlParsed.pathname
            const client = webdav.createClient(baseurl, options)
            await client.putFileContents(pathname, data, { overwrite: true })
        }
        else {
            /*  write output data to file  */
            url = url.replace(/^file:(?:\/\/)?/, "")
            await fs.promises.writeFile(url, data, {
                encoding: options.encoding,
                mode:     options.mode,
                flag:     options.flag
            })
        }
    }

    /*  write CLI log message  */
    async log (level, msg) {
        /*  check target level  */
        const levelThis = this.logLevels[level]
        if (levelThis === undefined)
            throw new Error("invalid log level")

        /*  check maximum level  */
        const levelMax = this.logLevels[this.options.logLevel]
        if (levelThis.level > levelMax.level)
            return

        /*  prefix the message with current level tag  */
        let tag = ""
        if (levelThis.tag)
            tag = levelThis.tag
        if (levelThis.color && process.stderr.isTTY)
            tag = chalk[levelThis.color](tag)
        msg = `${tag}: ${msg}`

        /*  prefix the message with current timestamp  */
        if (this.options.logTime) {
            const time = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS")
            msg = `[${time}] ${msg}`
        }

        /*  prefix the message with program name  */
        if (this.options.logPrefix !== "")
            msg = `${this.options.logPrefix}: ${msg}`

        /*  ensure a trailing newline  */
        if (!msg.match(/\n$/))
            msg += "\n"

        /*  optionally remove all colors for redirected stderr  */
        if (!process.stderr.isTTY)
            msg = stripAnsi(msg)

        /*  write log information  */
        await new Promise((resolve) => {
            process.stderr.write(msg, "utf8", () => {
                /*  intentionally ignore write errors, as there is
                    no way to deal with it in a reasonable way and
                    it is not necessary at all, too  */
                resolve()
            })
        })
    }
}

/*  export API class  */
module.exports = CLIio

