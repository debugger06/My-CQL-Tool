var request = require('request');
var assert  = require('assert');

var port = process.env.PORT || 3000;

var url = 'http://localhost:' + port + '/';
var keyspaceName = 'system'
suite('Tables', function() {
  test('This api call should Load Tables from the selected Keyspace', function(done) {
    request.get({
        url: url + 'tables'+'?keyspace='+keyspaceName
      }, function(err, res, body) {
        if (err) {
          done(err);
        }
        assert.equal(res.statusCode, 201);
        done();
    });
   });

  test('This api call should fail Loading  Tables from the Keyspace as provided keyspace is wrong', function(done) {
    request.get({
        url: url + 'keyspaces'+'?keyspace='+keyspaceName
      }, function(err, res, body) {
        if (err) {
          done(err);
        }
        assert.equal(res.statusCode, 400);
        done();
    });
   });

});