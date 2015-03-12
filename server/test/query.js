var request = require('request');
var assert  = require('assert');

var port = process.env.PORT || 3000;

var url = 'http://localhost:' + port + '/';

suite('Execute Query', function() {
  test('This api call should execute a query', function(done) {
    request.post({
        url: url + 'query',
        json: {
          query: 'Select * from batchlog;',
          keyspace: 'system',
        }
      }, function(err, res, body) {
        if (err) {
          done(err);
        }
        assert.equal(res.statusCode, 201);
        done();
    });
   });

  test('This api call should fail executing a query since the CQL Query is not Valid', function(done) {
    request.post({
        url: url + 'query',
        json: {
          query: 'Select nothing from batchlog;',
          keyspace: 'system',
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