const express = require('express');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(express.json()); // REMPLAZA BODY-PARSER??
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const Data = [
    {
        id: 1,
        name: 'Terminar clase de metodologías',
        completed: false
    },
    {
        id: 2,
        name: 'Hacer laboratorio de programación',
        completed: false
    }
]

const Tasks = {
    getTasks: (req, res) => {
        res.json({
            model: 'Tasks',
            count: Data.length,
            data: Data,
        });
    },
    getTask: (req, res) => {
        res.json(Data[req.params.id]);
    },
    createTask: (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){ return res.json(errors);}
        // NUEVO: id
        const { id, name, completed } = req.body;
        Data.push({id, name, completed });
        res.json({
            model: 'Tasks',
            count: Data.length,
            data: Data,
        });
    },
    updateTask: (req, res) => {
        Data.forEach((item, index) => {
            if (item.id === Number(req.params.id)) Data[index] = req.body;
        });
        res.json({model: "Tasks", data: Data});
    },
    deleteTask: (req, res) => {
        Data.splice(req.params.id-1, 1);
        res.json({msg: 'Tarea eliminada', tasks:Data});
    }
}

const TasksValidations = {
    createTask: [
        body('name', 'El nombre es incorrecto.').exists({checkNull: true, checkFalsy: true}),
        body('completed', 'La edad es incorrecto.').isBoolean(),
    ]
}

app.get('/api/v1/tasks/', Tasks.getTasks);
app.post('/api/v1/tasks/', TasksValidations.createTask, Tasks.createTask);
app.post('/api/v1/tasks/update/:id', Tasks.updateTask);
app.delete('/api/v1/tasks/delete/:id', Tasks.deleteTask);


app.listen(port, () => {
    console.log(`Servidor BACKEND en puerto: ${port}`)
});