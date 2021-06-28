(() => {
    const App = {
        variables: {
          arrayLength: 0,
          taskId: 0
        },
        htmlElements: {
          btnSave: document.getElementById('btn-save'),
          btnUpdate: document.getElementById('btn-update'),
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
                App.variables.arrayLength = data.count;
                const tasks = data.data;
                tasks.forEach(task => {
                    App.events.addTask(task);
                });
            },
        },
        events: {
            addTask: ({id, name, category, status }) => {
              App.htmlElements.mainTaskList.innerHTML += `<div class="task-list">
                                                            <div class="checkbox-container">
                                                              <input ${(status) === true ? "checked" : ""} type="checkbox" class="checkbox" data-status="${status}" id="${id}" name="${name}">
                                                              <div class="label-container">
                                                                <label for="${id}" style="text-decoration:${(status) === true ? "line-through" : "none"}">
                                                                  ${name}
                                                                </label>
                                                                <span style="text-decoration:${(status) === true ? "line-through" : "none"}" class="category"><i class="fas fa-tags"></i> ${category}</span>
                                                                <hr class="hr-lista">
                                                              </div>
                                                            </div>
                                                            <button class="botones btn-delete far fa-trash-alt" id="btn-delete-${id}" type="button"></button>
                                                            <button ${(status) === true ? "disabled" : ""} class="botones btn-edit far fa-edit" id="btn-edit-${id}" type="button"></button>
                                                          </div>`
            },
            // <hr class="hr-lista">`
            onCompletedTask: async (event) => {
              if (event.target.nodeName === "INPUT") {
                const idInput = event.target.id;
                const completedInput = event.target.getAttribute("data-status") === "false";
                const editButton = document.getElementById(`btn-edit-${idInput}`);
                if (Boolean(completedInput) === false) {
                  event.target.parentElement.children[1].style.textDecoration = "none";
                  editButton.disabled = false;
                } else {
                  event.target.parentElement.children[1].style.textDecoration = "line-through";
                  editButton.disabled = true;
                }
                const data = { status: completedInput };
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
            },
            onUpdateTask: async (event) => {
              App.variables.taskId = event.target.parentElement.children[0].children[0].id;
              let task = {};
              if(event.target.id === `btn-edit-${App.variables.taskId}`) {
                task = await App.utils.getTask(`http://localhost:4000/api/v1/task/`, App.variables.taskId);
                App.htmlElements.inputTask.value = task.name;
                App.htmlElements.selectCategories.value = task.category;
                App.htmlElements.btnUpdate.addEventListener("click", () => {
                  async function execute() {
                    const data = {
                      id: Number(App.variables.taskId),
                      name: App.htmlElements.inputTask.value,
                      category: App.htmlElements.selectCategories.value,
                      status: Boolean(false)
                    }
                    const update = await App.utils.updateTask(`http://localhost:4000/api/v1/tasks/update/`, data, Number(App.variables.taskId))
                    App.htmlElements.mainTaskList.innerHTML = '';
                    const tasks = update.data;
                    tasks.forEach(task => {
                      App.events.addTask(task);
                    });
                  }
                  execute();
                  
                });
                App.htmlElements.btnSave.disabled = true;
                App.htmlElements.btnUpdate.disabled = false;
              }
            },
            onTaskFormSubmit: async (event) => {
              event.preventDefault();
              const {
                task: { value: taskValue },
              } = event.target.elements;
              const category = App.htmlElements.selectCategories.value;
              App.events.addTask({id: App.variables.arrayLength+1, name: taskValue, category, status: "false" });
              // Guardar en el servidor
              await App.utils.postData("http://localhost:4000/api/v1/tasks/", {
                id: Number(App.variables.arrayLength+1),
                name: taskValue,
                category,
                status: Boolean(false),
              });
              document.getElementById("task-form").reset();
            },
          },
          utils: {
            getData: async (url = "") => {
              const response = await fetch(url);
              return response.json();
            },
            getTask: async (url = "", id) => { 
              const response = await fetch(url + id);
              return response.json();
            },
            postData: async (url = "", data = {}) => {
              const response = await fetch(url, {method: "POST",mode: "cors",cache: "no-cache", credentials: "same-origin", 
                headers: {
                  "Content-Type": "application/json"
                },redirect: "follow", referrerPolicy: "no-referrer", body: JSON.stringify(data)
              });
              return response.json(); // parses JSON response into native JavaScript objects
            },
            updateData: async (url = "", data = {}, id) => {
              const response = await fetch(url + id, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              });
              return response.json();
            },
            updateTask: async (url = "", data = {}, id) => {
              const update = await fetch(url + id, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                }, body: JSON.stringify(data)
              });
              App.htmlElements.btnSave.disabled = false;
              App.htmlElements.btnUpdate.disabled = true;
              return update.json();
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