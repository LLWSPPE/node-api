const request = require('supertest');
const assert = require('assert');
const express = require('express');
const app = require('../app')

/*
    TESTS UNITAIRES : AUTHENTIFICATION
 */

describe('POST /login', function() {
    it('Réponds avec une erreur en format json (Aucun utilisateur trouvé)', function(done) {
        request(app)
            .post('/login')
            .send({email: 'ddddd', password: 'ddddd'})
            .set('Accept', 'application/json')
            .expect(200, {
                status: 'ERROR',
                message: "Aucun utilisateur n'a été trouvé."
            }, done)
    });
});

describe('POST /login', function() {
    it('Réponds avec une erreur en format json (Les deux champs sont obligatoires)', function(done) {
        request(app)
            .post('/login')
            .send({email: '', password: ''})
            .set('Accept', 'application/json')
            .expect(200, {
                status: 'ERROR',
                message: "Les deux champs sont obligatoires"
            }, done)
    });
});
