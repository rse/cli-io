
CLIio
=====

Command-Line Interdace I/O

<p/>
<img src="https://nodei.co/npm/cli-io.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/cli-io.png" alt=""/>

About
-----

CLIio is a small JavaScript library for Node.js, providing three
reusable functionalities every Command-Line Interface (CLI) usually
requires: reading input data, writing output data and logging verbose
messages. The crux of CLIio is its encapsulated flexibility:

-  reading input data is supported from `stdin` (with filenames `-` or `stdin:`),
   from URLs with HTTP (with filenames starting with `http:` or `https:`)
   and from local files (with filenames starting with `file:` or no scheme);

-  writing output data is supported to `stdout` (with filenames `-` or `stdout:`),
   to URLs with HTTP/WebDAV (with filenames starting with `http:` or `https:`)
   and to local files (with filenames starting with `file:` or no scheme).

Installation
------------

```shell
$ npm install cli-io
```

Usage
-----

```js
const CLIio = require("cli-io")

const cli = new CLIio()

cli.log("info", "sample")

let data = await cli.input(inputURL)

...work on data...

await cli.output(outputURL)
```

License
-------

Copyright (c) 2020-2021 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

