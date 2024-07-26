/*
 * Der Server braucht node.js. Um den Server laufen zu lassen in das Verzeichnis
 * "src" wechseln und dann "node ../scripts/static_server.js". Wenn alles gut 
 * geht läuft der Server auf localhost:8888.
 */

var http = require("http"),
		url = require("url"),
		path = require("path"),
		fs = require("fs"),
		
		mime =
			{ lookup: function (filename)
				{
					return this.map[filename.split('.').pop()] || null;
				}
			, map:
				{ html: "text/html"
				, js: "text/javascript"
				, css: "text/css"
				, png: "image/png"
				, map: "text/plain"
				}
			},
		parseOpt = function (opt, ifnot)
			{
				var idx = process.argv.indexOf(opt);
				if (typeof(ifnot) === "undefined") ifnot = null;
				return (idx >= 0)
						? process.argv[idx+1]
						: ifnot;
			},
			
		dir = parseOpt("-d", process.cwd()),
		port = parseInt(parseOpt("-p", 8888));

if (dir[0] !== '/')
{
  dir = path.join(process.cwd(), dir);
}

http.createServer(function(request, response) {
    if (path.normalize(decodeURI(request.url)) !== decodeURI(request.url)) {
        response.statusCode = 403;
        response.end();
        return;
    }

	var uri = url.parse(request.url).pathname
		, filename = path.join(dir, uri)
		;
	
	fs.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}

		if (fs.statSync(filename).isDirectory())
			filename = path.join(filename, 'index.html');

		fs.readFile(filename, "binary", function(err, file) {
			var mimeType = mime.lookup(filename);
			
			if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}
			
			if(mimeType)
				response.writeHead(200, {"Content-Type": mimeType});
			else
				response.writeHead(200);
				
			response.write(file, "binary");
			response.end();
		});
	});
}).listen(parseInt(port, 10));

console.log("Static file server serving from '" + dir + "' to http://localhost:" + port);
