var Hapi = require('hapi');
var server = new Hapi.Server(3000);
var Handlebars = require('handlebars')

var fs = require('fs');

var gamelibPath = 'gamelib/';

var logic = require('./logic');

function tag(name, attribs, contents) 
{
    return '<' + name + ' ' + attribs + '>' + contents + '</' + name + '>';
}
function scriptTag(path) {
    return tag('script', 'type="text/javascript"', fs.readFileSync(gamelibPath + path));
}

function returnApp() {

    var gameScriptSrc = fs.readFileSync(gamelibPath + "js/states/Level1.template.js", {encoding: 'utf8'});
    var gameScriptTemplate = Handlebars.compile(gameScriptSrc);
    var gameScript = gameScriptTemplate(logic);

    var scripts = ""
        + scriptTag("phaser.min.js")
        + scriptTag("js/states/Boot.js")
        + scriptTag("js/states/Preload.js")
        + scriptTag("js/states/MainMenu.js")
        + tag('script', 'type="text/javascript"', gameScript)
    ;

    var head = ""
        + fs.readFileSync('gamelib/meta.html')
        + scripts
        + '<title>Mario</title>'
    ;

    var body = ""
        + '<div id="gameDiv"></div>'
        + scriptTag("js/main.js")
    ;

    var appTemplateSrc = 
    '<!doctype html>\n'
    +'<html>\n'
    +'<head>\n{{{head}}}\n</head>\n'
    +'<body>\n{{{body}}}\n</body>\n'
    +'</html>';

    var appTemplate = Handlebars.compile(appTemplateSrc);
    var app = appTemplate({
        head : head,
        body : body
    });

    return app;
}

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/app',
    handler: function (request, reply) {
        var app = returnApp();
        reply(app);
    }
});

server.route({
    method: 'GET',
    path: '/images/{name}',
    handler: function (request, reply) {
        reply.file('data/images/' + request.params.name)
    }
});

server.route({
    method: 'GET',
    path: '/tilemaps/{name}',
    handler: function (request, reply) {
        reply.file('data/tilemaps/' + request.params.name)
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});