//Modulos
//--Express--
let express = require('express');
let app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token"); // Debemos especificar todas las headers que se aceptan.// Content-Type , token
    next();
});
var jwt = require('jsonwebtoken');
app.set('jwt', jwt);

// routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function (req, res, next) { // obtener el token, vía headers (opcionalmente GET y/o POST)
    var token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 240) {
                res.status(403); // Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                // También podríamos comprobar que intoToken.usuario existe
                return;
            } else { // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });
    } else {
        res.status(403); // Forbidden
        res.json({acceso: false, mensaje: 'No hay Token'});
    }
});
// Aplicar routerUsuarioToken
app.use('/api/listFriends', routerUsuarioToken);
app.use('/api/crearMensaje', routerUsuarioToken);
app.use('/api/verMensajes', routerUsuarioToken);
app.use('/api/leerMensaje/:id', routerUsuarioToken);

let expressSession = require('express-session');
let fs = require('fs');
let https = require('https');
app.use(expressSession({secret: 'abcdefg', resave: true, saveUninitialized: true}));

// routerUsuarioSession
let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) { // dejamos correr la petición
        next();
    } else {
        console.log("va a : " + req.session.destino)
        res.redirect("/identificarse");
    }
});
app.use(express.static('public'));
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
let swig = require('swig');
let mongo = require('mongodb');
let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);
let fileUpload = require('express-fileupload');
app.use(fileUpload());
let crypto = require('crypto');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);


//Variables de entorno
app.set('port', 8081);
app.set('db', 'mongodb://admin:admin@cluster0-shard-00-00-ftswg.mongodb.net:27017,cluster0-shard-00-01-ftswg.mongodb.net:27017,cluster0-shard-00-02-ftswg.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority');

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rapiusuarios.js")(app, swig, gestorBD);

//Portada
app.get("/", function (req, res) {
    let respuesta = swig.renderFile('views/main.html', {});
    res.send(respuesta);
});


//Lanzar el servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function () {
    console.log("Servidor activo");
});
