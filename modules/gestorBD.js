module.exports = {
    mongo: null, app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    }, obtenerPeticion: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('peticionesAmistad');
                collection.find(criterio).toArray(function (err, friendPetition) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(friendPetition);
                    }
                    db.close();
                });
            }
        });
    },
    borrarPeticion: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('peticionesAmistad');
                collection.deleteOne(criterio).catch(function (err, friendPetition) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(friendPetition);
                    }
                    db.close();
                });
            }
        });
    },
    insertarPeticion: function (peticion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('peticionesAmistad');
                collection.insert(peticion, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }
    ,
    insertarMensaje: function (peticion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.insert(peticion, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }
    ,  obtenerMensaje: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.find(criterio).toArray(function (err, mensaje) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(mensaje);
                    }
                    db.close();
                });
            }
        });
    },modificarMensaje: function (criterio, mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('mensajes');
                collection.update(criterio, {$set: mensaje}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }
    ,insertarAmigo: function (confirmacion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('amigos');
                collection.insert(confirmacion, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },obtenerAmigo: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('amigos');
                collection.find(criterio).toArray(function (err, amigos) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(amigos);
                    }
                    db.close();
                });
            }
        });
    }, obtenerUsersPg: function (criterio, pg, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.count(function (err, count) {
                    collection.find(criterio).skip((pg - 1) * 4).limit(4).toArray(function (err, users) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(users, count);
                        }
                        db.close();
                    });
                });
            }
        });
    }, obtenerFriendPg: function (criterio, pg, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('amigos');
                collection.count(function (err, count) {
                    collection.find(criterio).skip((pg - 1) * 4).limit(4).toArray(function (err, friends) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(friends, count);
                        }
                        db.close();
                    });
                });
            }
        });
    },
    obtenerFriendPetitionPg: function (criterio, pg, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('peticionesAmistad');
                collection.count(function (err, count) {
                    collection.find(criterio).skip((pg - 1) * 4).limit(4).toArray(function (err, friendPetitions) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(friendPetitions, count);
                        }
                        db.close();
                    });
                });
            }
        });
    },
    obtenerUsuarios: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.find(criterio).toArray(function (err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    }, modificarCancion: function (criterio, cancion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('canciones');
                collection.update(criterio, {$set: cancion}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }, insertarUsuario: function (usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.insert(usuario, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }
};