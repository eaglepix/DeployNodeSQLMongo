# Node - Python integration
## Option 1
https://stackoverflow.com/questions/39897505/python-and-node-js-on-heroku

### Under python
import duolingo
import simplejson as json

lingo  = duolingo.Duolingo('harleyrowland')
print json.dumps(lingo.get_user_info())

### Under Node
var python = require('python-shell');

module.exports = {
  getData: function(callback){
    python.run('duoScript.py', function (err, results) { 
      console.log(err);
      console.log(results);
      var res = JSON.parse(results);
      var language = res.language_data.es.language_string;
      var streak = res.language_data.es.streak;
      var level = res.language_data.es.level;
      var levelPerecentage = res.language_data.es.level_percent;
      var fluency = res.language_data.es.fluency_score;
      var nextLesson = res.language_data.es.next_lesson.skill_title;
      return callback({language, streak, level, levelPerecentage, fluency, nextLesson});
    });
  }
}

- Heroku API
duolingo-api==0.3
simplejson==3.8.2

.buildpacks file
heroku buildpacks:add --index 1 heroku/nodejs
$ heroku buildpacks:add --index 2 heroku/python

- Procfile 
web: node index.js
pipinstall: pip install -r requirements.txt


## Option 2
### NodeJS spawn Python child_process
Python script :
    import sys
    # Takes first name and last name via command 
    # line arguments and then display them
    print("Output from Python")
    print("First name: " + sys.argv[1])
    print("Last name: " + sys.argv[2])
    
    # save the script as hello.py

Node JS server code :
    // import express JS module into app
    // and creates its variable.
    var express = require('express');
    var app = express();
    
    // Creates a server which runs on port 3000 and 
    // can be accessed through localhost:3000
    app.listen(3000, function() {
        console.log('server running on port 3000');
    } )
    
    // Function callName() is executed whenever 
    // url is of the form localhost:3000/name
    app.get('/name', callName);
    
    function callName(req, res) {
        
        // Use child_process.spawn method from 
        // child_process module and assign it
        // to variable spawn
        var spawn = require("child_process").spawn;
        
        // Parameters passed in spawn -
        // 1. type_of_script
        // 2. list containing Path of the script
        //    and arguments for the script 
        
        // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will
        // so, first name = Mike and last name = Will
        var process = spawn('python',["./hello.py",
                                req.query.firstname,
                                req.query.lastname] );

        // Takes stdout data from script which executed
        // with arguments and send this data to res object
        process.stdout.on('data', function(data) {
            res.send(data.toString());
        } )
    }
    
    // save code as start.js

#### Starting up:
node start.js
localhost:3000/name?firstname="Enter first name"&lastname="Enter last name"
For e g. : localhost:3000/name?firstname=Ram&lastname=Sharma
