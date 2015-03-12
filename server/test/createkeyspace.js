var request = require('request');
var assert  = require('assert');

var port = process.env.PORT || 3000;

var url = 'http://localhost:' + port + '/';

suite('Create keyspace', function() {
  test('this api call should create a new Keyspace', function(done) {
    request.post({
        url: url + 'create/keyspace',
        json: {
          keyspace: 'test_space',
        }
      }, function(err, res, body) {
        if (err) {
          done(err);
        }
        assert.equal(res.statusCode, 201);
        done();
    });
   });

  test('this api call should fail creating a new Keyspace since the Keyspace name is not Valid', function(done) {
    request.post({
        url: url + 'create/keyspace',
        json: {
          keyspace: 'test space',
        }
      }, function(err, res, body) {
        if (err) {
          done(err);
        }
        assert.equal(res.statusCode, 400);
        done();
    });
   });

});