var path   = require('path'),
    assert = require('assert'),
    fs     = require('fs'),
    exec   = require('child_process').exec,
    sass   = require(path.join(__dirname, '..', 'sass')),
    cli    = require(path.join(__dirname, '..', 'lib', 'cli')),

    cliPath = path.resolve(__dirname, '..', 'bin', 'node-sass'),
    sampleFilename = path.resolve(__dirname, 'sample.scss');

var expectedSampleCompressed = '#navbar {width:80%;height:23px;}\
#navbar ul {list-style-type:none;}\
#navbar li {float:left;}\
#navbar li a {font-weight:bold;}';

var expectedSampleNoComments = '#navbar {\n\
  width: 80%;\n\
  height: 23px; }\n\
\n\
#navbar ul {\n\
  list-style-type: none; }\n\
\n\
#navbar li {\n\
  float: left; }\n\
  #navbar li a {\n\
    font-weight: bold; }\n';

describe('cli', function() {
  it('should print help when run with no arguments', function(done) {
    exec(cliPath, function(err, stdout, stderr) {
      done(assert(stderr.indexOf('Compile .scss files with node-sass') === 0));
    });
  });

  it('should compile sample.scss as sample.css', function(done) {
    var resultPath = path.join(__dirname, 'sample.css');

    exec(cliPath + ' ' + sampleFilename, {
      cwd: __dirname
    }, function(err, stdout, stderr) {

      fs.exists(resultPath, function(exists) {
        assert(exists);
        fs.unlink(resultPath, done);
      });
    });
  });

  it('should compile sample.scss to  ../out.css', function(done) {
    var resultPath = path.resolve(__dirname, '..', 'out.css');

    exec(cliPath + ' ' + sampleFilename + ' ../out.css', {
      cwd: __dirname
    }, function(err, stdout, stderr) {

      fs.exists(resultPath, function(exists) {
        assert(exists);
        fs.unlink(resultPath, done);
      });
    });
  });

  it('should compile with --include-path option', function(done){
    var emitter = cli([
      '--include-path', __dirname + '/lib',
      '--include-path', __dirname + '/functions',
      __dirname + '/include_path.scss'
    ]);
    emitter.on('error', done);
    emitter.on('render', function(css){
      assert.equal(css.trim(), 'body {\n  background: red;\n  color: blue; }');
      fs.unlink(process.cwd() + '/include_path.css', done);
    });
  });

  it('should compile with the --output-style', function(done){
    var emitter = cli(['--output-style', 'compressed', __dirname + '/sample.scss']);
    emitter.on('error', done);
    emitter.on('render', function(css){
      assert.equal(css, expectedSampleCompressed);
      fs.unlink(process.cwd() + '/sample.css', done);
    });
  });

  it('should compile with the --source-comments option', function(done){
    var emitter = cli(['--source-comments', 'none', __dirname + '/sample.scss']);
    emitter.on('error', done);
    emitter.on('render', function(css){
      assert.equal(css, expectedSampleNoComments);
      fs.unlink(process.cwd() + '/sample.css', done);
    });
  });

  it('should write the output to the file specified with the --output option', function(done){
    var resultPath = path.resolve(__dirname, '..', 'output.css');
    var emitter = cli(['--output', resultPath, __dirname + '/sample.scss']);
    emitter.on('error', done);
    emitter.on('write', function(css){
      fs.exists(resultPath, function(exists) {
        assert(exists);
        fs.unlink(resultPath, done);
      });
    });
  });

});
