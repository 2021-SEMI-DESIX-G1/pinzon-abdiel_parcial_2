(() => {
    const App = {
      // NUEVO: Almacena la longitud de Data
        variables: {
          arrayLength: 0,
          taskId: 0
        },
        htmlElements: {
            taskForm: document.getElementById('task-form'),
            mainTaskList: document.querySelector('.main-task-list'),
            mainTittleMassage: document.getElementById('main-tittle-massage'),
            inputTask: document.getElementById('input-task'),
            selectCategories: document.getElementById('select-categories')
        },
        init: () => {
            App.bindEvents();
            App.initializeData.users();
        },
        bindEvents: () => {
            App.htmlElements.taskForm.addEventListener("submit",App.events.onTaskFormSubmit),
            App.htmlElements.mainTaskList.addEventListener("change",App.events.onCompletedTask);
            App.htmlElements.mainTaskList.addEventListener("click",App.events.onDeleteTask);
            App.htmlElements.mainTaskList.addEventListener("click",App.events.onUpdateTask);
          },
        initializeData: {
            users: async () => {
                const data = await App.utils.getData('http://localhost:4000/api/v1/tasks/');
                // NUEVO: almacenar la longitud de la data ('ID');
                App.variables.arrayLength = data.count;
                const tasks = data.data;
                tasks.forEach(task => {
                    App.events.addTask(task);
                });
            },
        },
        events: {
          // NUEVO: Recibe el id
            addTask: ({id, name, category, status }) => {
              App.htmlElements.mainTaskList.innerHTML += `<div class="task-list">
                                                            <div class="checkbox-container">
                                                              <input ${status === true ? "checked" : ""} type="checkbox" class="checkbox" data-status="${status}" id="${id}" name="${name}">
                                                              <label for="${id}" style="text-decoration:${status === true ? "line-through" : ""}">
                                                                ${name}
                                                              </label>
                                                              <span class="category">${category}</span>
                                                            </div>
                                                            <button class="botones far fa-trash-alt" id="btn-delete-${id}" type="button"></button>
                                                            <button class="botones far fa-edit" id="btn-edit-${id}" type="button"></button>
                                                          </div>`;
            // App.htmlElements.mainTaskList.innerHTML += `<div class="task-list">
            //                                                 <div class="checkbox-container">
            //                                                   <input ${status === true ? "checked" : ""} type="checkbox" class="checkbox" name="rendered-task" data-status="${status}" id="${name}" >
            //                                                   <label for="${name}" style="text-decoration:${status === true ? "line-through" : "" }">${name}</label>
            //                                                 </div>
            //                                                 <div class="btns-container">
            //                                                   <button class="btn-delete" type="button"><i class="far fa-trash-alt"></i></button>
            //                                                   <button class="btn-update" type="button"><i class="far fa-edit"></i></button>
            //                                                 </div>
            //                                               </div>`;
            },
            onCompletedTask: async (event) => {
              if (event.target.nodeName === "INPUT") {
                const idInput = event.target.id
                // const nameInput = event.target.name;
                const completedInput = event.target.getAttribute("data-status") === "false";
                const deleteButton = document.getElementById(`btn-delete-${idInput}`);
                // App.utils.completedTask(completedInput, event.target.parentElement.children[1])
                if (completedInput) {
                  event.target.parentElement.children[1].style.textDecoration = "none";
                  deleteButton.disabled = false;
                } else {
                  event.target.parentElement.children[1].style.textDecoration ="line-through";
                  deleteButton.disabled = true;
                }
                const data = { completed: completedInput };
                document.getElementById(event.target.id).setAttribute("data-status", completedInput);
                await App.utils.updateData(`http://localhost:4000/api/v1/tasks/complete/`, data, idInput);
              }
            },
            onDeleteTask: async (event) => {
              App.variables.taskId = event.target.parentElement.children[0].children[0].id;
              if(event.target.id === `btn-delete-${App.variables.taskId}`) {
                event.target.parentElement.remove();
                await App.utils.deleteData(`http://localhost:4000/api/v1/tasks/delete/`, App.variables.taskId);
              };
              // if (event.target.nodeName === "BUTTON") {
              //   event.target.parentElement.remove();
              //   await App.utils.deleteData(
              //     "http://localhost:4000/api/v1/tasks/",
              //     event.target.parentElement.children[0].children[0].id
              //   );
              // }
            },
            onUpdateTask: async (event) => {
              App.variables.taskId = event.target.parentElement.children[0].children[0].id;
              let task = [];
              if(event.target.id === `btn-edit-${App.variables.taskId}`) {
                task = await App.utils.getTask(`http://localhost:4000/api/v1/task/`, App.variables.taskId);
                console.log(task);
                App.htmlElements.inputTask.value = task.name;
                App.htmlElements.selectCategories.value = task.category;
              }
            },
            onTaskFormSubmit: async (event) => {
              event.preventDefault();
              const {
                task: { value: taskValue },
              } = event.target.elements;
              // NUEVO: id+1
              App.events.addTask({id: App.variables.arrayLength+1, name: taskValue, status: "false" });
              // Guardar en el servidor
              await App.utils.postData("http://localhost:4000/api/v1/tasks/", {
                id: App.variables.arrayLength+1,
                name: taskValue,
                completed: false,
              });
              document.getElementById("task-form").reset();
            },
          },
          utils: {
            getData: async (url = "") => {
              const response = await fetch(url);
              return response.json();
            },
            // Obtiene 1 task por el ID
            getTask: async (url = "", id) => { 
              const response = await fetch(url + id);
              return response.json();
            },
            // Ejemplo implementando el metodo POST:
            postData: async (url = "", data = {}) => {
              // Opciones por defecto estan marcadas con un *
              const response = await fetch(url, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "same-origin", // include, *same-origin, omit
                headers: {
                  "Content-Type": "application/json",
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(data), // body data type must match "Content-Type" header
              });
              return response.json(); // parses JSON response into native JavaScript objects
            },
            updateData: async (url = "", data = {}, id) => {
              const response = await fetch(url + id, {
                method: "PATCH", // < ---------------- devolver a patch
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              });
              return response.json();
            },
            deleteData: async (url = "", id) => {
              const response = await fetch(url + id, {
                method: "DELETE",
              });
              return response.json();
            }
          },
        };
        App.init();
      })();