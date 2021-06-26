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
        category: 'universidad',
        completed: false
    },
    {
        id: 2,
        name: 'Hacer laboratorio de programación',
        category: 'universidad',
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
        res.json(Data[req.params.id-1]);
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
    completeTask: (req, res) => {
        const id = Number(req.params.id);
        const body = Boolean(req.body.completed);
        const task = Data.findIndex((data) => data.id === Number(id));
        Data[task].completed = body;
        return res.status(200).json({ model: "Tasks", data: Data, message: `Estado de la tarea actualizado a ${body}`});
    },
    updateTask: (req, res) => {
        Data.forEach((item, index) => {
            if (item.id === Number(req.params.id)) Data[index] = req.body;
        });
        return res.status(200).json({model: "Tasks", data: Data, message: 'Tarea actualizada.'});
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
app.get('/api/v1/task/:id', Tasks.getTask);
app.post('/api/v1/tasks/', TasksValidations.createTask, Tasks.createTask);
app.patch('/api/v1/tasks/complete/:id', Tasks.completeTask);
app.put('/api/v1/tasks/update/:id', Tasks.updateTask);
app.delete('/api/v1/tasks/delete/:id', Tasks.deleteTask);


app.listen(port, () => {
    console.log(`Servidor BACKEND en puerto: ${port}`)
});