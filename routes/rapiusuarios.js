module.exports = function (app, swig, gestorBD) {

    app.get("/api/listFriends", function (req, res) {
        let criterio = {
            $or: [
                {"emailFrom": res.usuario},
                {"emailTo": res.usuario}
            ]
        };
        gestorBD.obtenerAmigo(criterio, function (amigos) {
            if (amigos == null) {
                res.status(500);
                res.json({
                    error: "Error listando los usuarios"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(amigos));
            }
        });
    });

    app.post("/api/crearMensaje", function (req, res) {
        var mensaje = {
            de: res.usuario,
            para: req.body.to,
            texto: req.body.texto,
            leido: false
        }
        // Validar parametros
        if (mensaje.de == null || mensaje.texto == "" ||
            mensaje.de == "" || mensaje.texto == null) {
            res.status(400);
            res.json({
                error: "datos incorrectos"
            });
        } else {
            gestorBD.insertarMensaje(mensaje, function (id) {
                if (id == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    });
                } else {
                    res.status(201);
                    res.json({
                        mensaje: "Mensaje insertado",
                        _id: id
                    });
                }
            });
        }
    });

    app.post("/api/identificate", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        };
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado: false
                });
            } else {
                var token = app.get('jwt').sign({
                    usuario: criterio.email,
                    tiempo: Date.now() / 1000
                }, "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }
        });
    });
    app.get("/api/verMensajes", function (req, res) {
        let criterio = {
            $or: [
                {"de": res.usuario},
                {"para": res.usuario}
            ]
        };
        gestorBD.obtenerMensaje(criterio, function (mensajes) {
            if (mensajes == null) {
                res.status(501);
                res.json({error: "Se ha producido un error listando los mensajes"})
            } else {
                res.status(201);
                res.send(JSON.stringify(mensajes));
            }
        });
    });

    app.put("/api/leerMensaje/:id", function (req, res) {
        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let mensaje ={};
        mensaje.leido = true;
        gestorBD.modificarMensaje(criterio, mensaje, function (result) {
            if (result == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                res.status(200);
                res.json({mensaje: "Mensaje leido", _id: req.params.id})
            }
        });
    });
};