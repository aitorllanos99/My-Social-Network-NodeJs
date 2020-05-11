module.exports = function (app, swig, gestorBD) {

    app.get("/registrarse", function (req, res) {
        app.get('logger').info('Recibe formulario registro');
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });
    app.get("/identificarse", function (req, res) {
        app.get('logger').info('Usuario intentara identificarse');
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });
    app.post('/usuario', function (req, res) {
        app.get('logger').info('Inicio de registro');
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email: req.body.email,
            nombre: req.body.nombre,
            apellido: req.body.apellidos,
            password: seguro
        };
        let criterio = {};
        if (req.body.email != null) {
            criterio = {"email": req.body.email};
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                if (req.body.password !== req.body.repeatPassword) {
                    app.get('logger').error('Contraseñas coinciden en el registro');
                    res.redirect("/registrarse?mensaje=Las contraseñas no coinciden&tipoMensaje=alert-danger");
                } else if (req.body.nombre == "" || req.body.apellido == "" || req.body.email == "") {
                    app.get('logger').error('Campos vacios en el registro');
                    res.redirect("/registrarse?mensaje=No deje campos vacios&tipoMensaje=alert-danger");
                } else {
                    gestorBD.insertarUsuario(usuario, function (id) {
                        if (id == null) {
                            app.get('logger').error('Error al insertar el usuario');
                            res.send("Error al insertar el usuario");
                        } else {
                            req.session.usuario = usuarios.email;
                            res.send(swig.renderFile('views/main.html', {}));
                        }
                    });
                }
            } else {
                app.get('logger').error('Intento de registro con email existente');
                res.redirect("/registrarse?mensaje=Email existente&tipoMensaje=alert-danger");
            }
        })
    });

    app.post("/identificarse", function (req, res) {
        app.get('logger').info('Inicio intento identificacion');
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0 || req.body.email == "" || criterio.password == "") {
                req.session.usuario = null;
                app.get('logger').error('Fallo de inicio de Sesion');
                res.redirect("/identificarse?mensaje=Fallo de Identificacion&tipoMensaje=alert-danger");
            } else {
                req.session.usuario = usuarios[0].email;
                app.get('logger').error('Inicio de Sesion');
                res.redirect("/listUsers");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        app.get('logger').info('Desconexion');
        res.redirect("/?mensaje=Usuario Desconectado&tipoMensaje=alert-info");
    });


    app.get("/listUsers", function (req, res) {
        app.get('logger').info('Inicio de listado de usuarios');
            let criterio = {};
            if (req.query.busqueda != null) {
                criterio = {
                    $or: [
                        {"email": {$regex: ".*" + req.query.busqueda + ".*"}},
                        {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}},
                        {"apellido": {$regex: ".*" + req.query.busqueda + ".*"}}
                    ]
                }
            }
            let pg = parseInt(req.query.pg); // Es String !!!
            if (req.query.pg == null) { // Puede no venir el param
                pg = 1;
            }
            let criterioFriends = {
                $or: [
                    {"emailFrom": req.session.usuario},
                    {"emailTo": req.session.usuario}
                ]
            };
            gestorBD.obtenerFriendPg(criterioFriends, pg, function (friends, total) {
                if (friends == null) {
                    app.get('logger').error('Listado de amigos');
                    res.send("Error al listar ");
                } else {
                    let friendsFinales = [];
                    //TO Print them right we took those who arent the actual user
                    for (let i = 0; i < friends.length; i++) {
                        if (friends[i].emailFrom == req.session.usuario)
                            friendsFinales.push({
                                email: friends[i].emailTo,
                                nombre: friends[i].nombreTo,
                                apellido: friends[i].apellidoTo
                            });
                        else if (friends[i].emailTo == req.session.usuario)
                            friendsFinales.push({
                                email: friends[i].emailFrom,
                                nombre: friends[i].nombreFrom,
                                apellido: friends[i].apellidoFrom
                            });
                    }

                    gestorBD.obtenerFriendPetitionPg(criterioFriends, pg, function (friendPetitions, total) {
                        if (friendPetitions == null) {
                            app.get('logger').error('Error listando peticiones en listado de usuarios');
                            res.send("Error al listar ");
                        } else {
                            let friendPetitionsUser = [];
                            for (let i = 0; i < friendPetitions.length; i++) {
                                if (friendPetitions[i].emailFrom == req.session.usuario)
                                    friendPetitionsUser.push({
                                        email: friendPetitions[i].emailTo,
                                        nombre: friendPetitions[i].nombreTo,
                                        apellido: friendPetitions[i].apellidoTo
                                    });
                                else if (friendPetitions[i].emailTo == req.session.usuario)
                                    friendPetitionsUser.push({
                                        email: friendPetitions[i].emailFrom,
                                        nombre: friendPetitions[i].nombreFrom,
                                        apellido: friendPetitions[i].apellidoFrom
                                    });
                            }
                            gestorBD.obtenerUsersPg(criterio, pg, function (usuarios, total) {
                                if (usuarios == null) {
                                    app.get('logger').error('Error obteniendo usuarios para listarlos');
                                    res.send("Error al listar ");
                                } else {
                                    let ultimaPg = total / 5;
                                    if (total % 5 > 0) { // Sobran decimale
                                        ultimaPg = ultimaPg + 1;
                                    }
                                    let paginas = []; // paginas mostrar
                                    for (let i = pg - 2; i <= pg + 2; i++) {
                                        if (i > 0 && i <= ultimaPg) {
                                            paginas.push(i);
                                        }
                                    }
                                    usuarios = usuarios.filter(x => x.email != req.session.usuario);

                                    usuarios.forEach(u => u.allowed = true);
                                    for (let i = 0; i < usuarios.length; i++)
                                        for (let j = 0; j < friendsFinales.length; j++)
                                            if (usuarios[i].email == friendsFinales[j].email)
                                                usuarios[i].allowed = false;

                                    for (let i = 0; i < usuarios.length; i++)
                                        for (let j = 0; j < friendPetitionsUser.length; j++)
                                            if (usuarios[i].email == friendPetitionsUser[j].email)
                                                usuarios[i].allowed = false;

                                    let respuesta = swig.renderFile('views/blistUsers.html', {
                                        user: req.session.usuario,
                                        usuarios: usuarios,
                                        paginas: paginas,
                                        actual: pg
                                    });
                                    app.get('logger').info('Fin listado usuarios');
                                    res.send(respuesta);
                                }
                            });
                        }
                    });
                }
            });

        }
    )
    ;

    app.get('/sendPetition/:email', function (req, res) {
        app.get('logger').info('Inicio envio de peticion');
        let peticion = {
            from: req.session.usuario,
            to: req.params.email
        };
        //Lets obtain all the data from the actual user
        gestorBD.obtenerUsuarios({}, function (usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                app.get('logger').error('Obtencion de usuarios fallida');
                res.send("Error al listar ");
            } else {
                let from = usuarios.find(x => x.email == req.session.usuario);
                let to = usuarios.find(x => x.email == req.params.email);
                peticion = {
                    emailFrom: from.email,
                    nombreFrom: from.nombre,
                    apellidoFrom: from.apellido,
                    emailTo: to.email,
                    nombreTo: to.nombre,
                    apellidoTo: to.apellido
                };
                gestorBD.insertarPeticion(peticion, function (id) {
                    if (id == null) {
                        app.get('logger').error('Fallo de envio de peticion de amistad');
                        res.redirect("/listUsers?mensaje=Error enviando peticion de amistad a" + peticion.emailTo + "&tipoMensaje=alert-danger");
                    } else {
                        app.get('logger').info('Peticion enviada con exito');
                        res.redirect("/listUsers?mensaje=Enviada peticion de amistad a " + peticion.emailTo + "&tipoMensaje=alert-success");
                    }
                })
            }
        });

    });

    app.get("/listFriendPetition", function (req, res) {
        app.get('logger').info('Inicio listado peticiones');
            let criterio = {"emailTo": req.session.usuario};
            let pg = parseInt(req.query.pg); // Es String !!!
            if (req.query.pg == null) { // Puede no venir el param
                pg = 1;
            }
            gestorBD.obtenerFriendPetitionPg(criterio, pg, function (friendPetitions, total) {
                if (friendPetitions == null) {
                    app.get('logger').error('Error listado peticiones');
                    res.send("Error al listar ");
                } else {
                    let ultimaPg = total / 5;
                    if (total % 5 > 0) { // Sobran decimale
                        ultimaPg = ultimaPg + 1;
                    }
                    let paginas = []; // paginas mostrar
                    for (let i = pg - 2; i <= pg + 2; i++) {
                        if (i > 0 && i <= ultimaPg) {
                            paginas.push(i);
                        }
                    }
                    let respuesta = swig.renderFile('views/blistFriendPetitions.html', {
                        user: req.session.usuario,
                        friendPetitions: friendPetitions,
                        paginas: paginas,
                        actual: pg
                    });
                    app.get('logger').info('Fin listado peticiones');
                    res.send(respuesta);
                }
            });
        }
    );
    app.get('/acceptPetition/:email', function (req, res) {
        app.get('logger').info('Inicio envio amigo');
        //Lets obtain all the data from the actual user
        gestorBD.obtenerUsuarios({}, function (usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                app.get('logger').error('Fallo obtencion de datos');
                res.send("Error al listar ");
            } else {
                let from = usuarios.find(x => x.email == req.session.usuario);
                let to = usuarios.find(x => x.email == req.params.email);
                let amigo = {
                    emailFrom: from.email,
                    nombreFrom: from.nombre,
                    apellidoFrom: from.apellido,
                    emailTo: to.email,
                    nombreTo: to.nombre,
                    apellidoTo: to.apellido
                };
                gestorBD.insertarAmigo(amigo, function (id) {
                    if (id == null) {
                        app.get('logger').error('Error aceptando peticion de amistad');
                        res.redirect("/listFriendPetition?mensaje=Error aceptando la peticion de amistad a" + amigo.emailTo + "&tipoMensaje=alert-danger");
                    } else {
                        app.get('logger').info('Peticion de amistad aceptada');
                        res.redirect("/listFriendPetition?mensaje=Aceptada la peticion de amistad a " + amigo.emailTo + "&tipoMensaje=alert-success");
                    }
                });
                //Borramos las peticiones

                let criterio = {
                    emailFrom: from.email,
                    nombreFrom: from.nombre,
                    apellidoFrom: from.apellido,
                    emailTo: to.email,
                    nombreTo: to.nombre,
                    apellidoTo: to.apellido
                };
                let peticion = {};
                gestorBD.obtenerPeticion(criterio, function (peticion) {
                    if (peticion == null) {
                    } else {
                    }
                });
                gestorBD.borrarPeticion(peticion, function (id) {
                    if (id != null) {
                    } else {
                    }
                })
                app.get('logger').info('Peticion de amistad borrada');
                app.get('logger').info('Fin aceptacion peticion amistad amigo guardado');
            }
        });

    });
    app.get("/listFriends", function (req, res) {
        app.get('logger').info('Inicio listado amigos');
            let criterio = {
                $or: [
                    {"emailFrom": req.session.usuario},
                    {"emailTo": req.session.usuario}
                ]
            };
            let pg = parseInt(req.query.pg); // Es String !!!
            if (req.query.pg == null) { // Puede no venir el param
                pg = 1;
            }
            gestorBD.obtenerFriendPg(criterio, pg, function (friends, total) {
                if (friends == null) {
                    app.get('logger').error('Error listando amigos');
                    res.send("Error al listar ");
                } else {
                    let ultimaPg = total / 5;
                    if (total % 5 > 0) { // Sobran decimale
                        ultimaPg = ultimaPg + 1;
                    }
                    let paginas = []; // paginas mostrar
                    for (let i = pg - 2; i <= pg + 2; i++) {
                        if (i > 0 && i <= ultimaPg) {
                            paginas.push(i);
                        }
                    }

                    //TO Print them right we took those who arent the actual user
                    let friendsFinales = [];
                    for (let i = 0; i < friends.length; i++)
                        if (friends[i].emailFrom == req.session.usuario)
                            friendsFinales.push({
                                email: friends[i].emailTo,
                                nombre: friends[i].nombreTo,
                                apellido: friends[i].apellidoTo
                            });
                        else if (friends[i].emailTo == req.session.usuario)
                            friendsFinales.push({
                                email: friends[i].emailFrom,
                                nombre: friends[i].nombreFrom,
                                apellido: friends[i].apellidoFrom
                            });
                    let respuesta = swig.renderFile('views/blistFriends.html', {
                        user: req.session.usuario,
                        friends: friendsFinales,
                        paginas: paginas,
                        actual: pg
                    });
                    app.get('logger').info('Fin listado amigos');
                    res.send(respuesta);
                }
            });
        }
    );


};
