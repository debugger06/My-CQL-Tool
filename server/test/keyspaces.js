var request = require('request');
var assert  = require('assert');

var port = process.env.PORT || 3000;

var url = 'http://localhost:' + port + '/';

suite('Keyspaces', function() {
  test('this api call should Get Keyspaces from the DB', function(done) {
    request.get({
        url: url + 'keyspaces'+'?keyspace='+'schema_keyspaces'
      }, function(err, res, body) {
        if (err) {
          done(err);
        }
        assert.equal(res.statusCode, 201);
        done();
    });
   });

  test('this api call should fail Get Keyspaces from the DB as provided keyspace is wrong', function(done) {
    request.get({
        url: url + 'keyspaces'+'?keyspace='+'schema_keyspace'
      }, function(err, res, body) {
        if (err) {
          done(err);
        }
        assert.equal(res.statusCode, 400);
        done();
    });
   });

});