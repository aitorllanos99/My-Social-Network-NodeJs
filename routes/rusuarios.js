module.exports = function (app, swig, gestorBD) {

    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/usuarios", function (req, res) {
        res.send("ver usuarios");
    });
    app.get("/identificarse", function (req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });
    app.post('/usuario', function (req, res) {
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
                    res.redirect("/registrarse?mensaje=Las contraseñas no coinciden&tipoMensaje=alert-danger");
                } else {
                    gestorBD.insertarUsuario(usuario, function (id) {
                        if (id == null) {
                            res.send("Error al insertar el usuario");
                        } else {
                            req.session.usuario = usuarios.email;
                            res.send(swig.renderFile('views/main.html', {}));
                        }
                    });
                }
            } else {
                res.redirect("/registrarse?mensaje=Email existente&tipoMensaje=alert-danger");
            }
        })
    });

    app.post("/identificarse", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse?mensaje=Fallo de Identificacion&tipoMensaje=alert-danger");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/listUsers");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/?mensaje=Usuario Desconectado&tipoMensaje=alert-info");
    });


    app.get("/listUsers", function (req, res) {
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
        //Para no mostrar el boton tenemos que ver que no sean amigos o halla peticiones pendientes
        let friendsFinales = [];
        gestorBD.obtenerFriendPg(criterio, pg, function (friends, total) {
            if (friends == null) {
                res.send("Error al listar ");
            } else {
                //TO Print them right we took those who arent the actual user
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
            }
    });
    let friendPetitionsUser = [];
    gestorBD.obtenerFriendPetitionPg(criterio, pg, function (friendPetitions, total) {
        if (friendPetitions == null) {
            res.send("Error al listar ");
        } else {
            friendPetitionsUser = friendPetitions;
        }
    });

    gestorBD.obtenerUsersPg(criterio, pg, function (usuarios, total) {
        if (usuarios == null) {
            res.send("Error al listar ");
        } else {
            let ultimaPg = total / 4;
            if (total % 4 > 0) { // Sobran decimale
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
            usuarios.forEach(u =>
                friendPetitionsUser.filter(fp => {
                    if (fp.from == u.email || fp.to == u.email) u.allowed = false;
                })
            );
            // console.log(friends);
            usuarios.forEach(u =>
                friends.filter(f => f.friend == u.email)
            );
            //  console.log(usuarios);
            let respuesta = swig.renderFile('views/blistUsers.html', {
                user: req.session.usuario,
                usuarios: usuarios,
                paginas: paginas,
                actual: pg
            });
            res.send(respuesta);
        }
    });
}
)
;

app.get('/sendPetition/:email', function (req, res) {
    let peticion = {
        from: req.session.usuario,
        to: req.params.email
    };
    //Lets obtain all the data from the actual user
    gestorBD.obtenerUsuarios({}, function (usuarios) {
        if (usuarios == null || usuarios.length === 0) {
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
                    res.redirect("/listUsers?mensaje=Error enviando peticion de amistad a" + peticion.emailTo + "&tipoMensaje=alert-danger");
                } else {
                    res.redirect("/listUsers?mensaje=Enviada peticion de amistad a " + peticion.emailTo + "&tipoMensaje=alert-success");
                }
            })
        }
    });

});

app.get("/listFriendPetition", function (req, res) {
        let criterio = {"emailTo": req.session.usuario};
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerFriendPetitionPg(criterio, pg, function (friendPetitions, total) {
            if (friendPetitions == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimale
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
                res.send(respuesta);
            }
        });
    }
);
app.get('/acceptPetition/:email', function (req, res) {

    //Lets obtain all the data from the actual user
    gestorBD.obtenerUsuarios({}, function (usuarios) {
        if (usuarios == null || usuarios.length === 0) {
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
                    res.redirect("/listFriendPetition?mensaje=Error aceptando la peticion de amistad a" + amigo.emailTo + "&tipoMensaje=alert-danger");
                } else {
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
        }
    });

});
app.get("/listFriends", function (req, res) {
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
                res.send("Error al listar ");
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimale
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
                res.send(respuesta);
            }
        });
    }
);

}
;
