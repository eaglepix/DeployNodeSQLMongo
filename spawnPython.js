const express = require('express')
const app = express()

app.get('/name', (req, res) => {

    const { spawn } = require('child_process');
    const pyProg = spawn('C:/Users/kl/anaconda3/envs/quant/python', 
    ['py38/helloWorld.py',req.query.firstname,req.query.lastname]);  //./py38/QM_selectstk1_2node.py

    pyProg.stdout.on('data', function(data) {

        console.log(data.toString());
        res.write(data);
        res.end('end');
    });
})

app.listen(3030, () => console.log('listening on port 3030'))