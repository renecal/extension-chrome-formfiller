let currentGroup = null; // Para saber si estamos editando un grupo existente

// Función para guardar un nuevo grupo o editar uno existente
function saveGroup(e) {
  e.preventDefault();
  const groupName = document.getElementById('groupName').value;
  const groupUrl = document.getElementById('groupUrl').value;
  const id_contenedor_grupo = document.getElementById('id_contenedor_grupo').value;
  const rut = document.getElementById('rut').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  // atributos
  const rut_attributes = document.getElementById('rut_attributes').value;
  const email_attributes = document.getElementById('email_attributes').value;
  const phone_attributes = document.getElementById('phone_attributes').value;

  // verificar que los inputs dentro del formulario no esten vacios, si no agregar clase de error
  //form id formGroupData
  //leer form y verificar inputs vacios

  if (!groupName || !rut || !email || !phone || !rut_attributes || !email_attributes || !phone_attributes) {
    document.getElementById('messageErrorForm').innerHTML = '<span class="alert alert-danger mb-1">Todos los campos son obligatorios</span>';
    return;
  }

  // Cargar los grupos actuales desde el almacenamiento local
  browser.storage.local.get('testGroups').then((data) => {
    let groups = data.testGroups || {};

    // Si estamos editando un grupo existente, borrar el antiguo si se renombró
    if (currentGroup && currentGroup !== groupName) {
      delete groups[currentGroup];
    }

    // Agregar o actualizar el grupo
    groups[groupName] = { rut, email, phone, rut_attributes, email_attributes, phone_attributes, url: groupUrl, id_contenedor_grupo };

    // Guardar el grupo actualizado
    browser.storage.local.set({ testGroups: groups }).then(() => {
      
      //mostrar alert success en div messageSuccessSave y que desaparezca en 3 segundos
      document.getElementById('messageSuccessSave').innerHTML = '<span class="alert alert-success mb-1">Grupo guardado correctamente</span>';
      setTimeout(() => {
        document.getElementById('messageSuccessSave').innerHTML = '';
      }, 3000);
      



      currentGroup = null; // Reiniciar el estado de edición
      clearForm(); // Limpiar el formulario
      loadGroups(); // Recargar los grupos en la interfaz
      document.getElementById('card-body-form').style.display = 'none';
    });
  });
}

// Función para cargar los grupos y mostrarlos en la interfaz
function loadGroups() {
  const groupsDiv = document.getElementById('groups');
  groupsDiv.innerHTML = ''; // Limpiar los grupos actuales en la interfaz

  browser.storage.local.get('testGroups').then((data) => {
    const groups = data.testGroups || {};
    console.log(groups)
    for (let groupName in groups) {
      // si existen group.rut_attributes separar por | agregar join vacio y llenar con un span badge

      const atributos_rut = groups[groupName].rut_attributes ? '<span class="badge badge-success">' + groups[groupName].rut_attributes.split('|').join('</span> <span class="badge badge-success">') + '</span>' : '';

      const atributos_email = groups[groupName].email_attributes ? '<span class="badge badge-success">' + groups[groupName].email_attributes.split('|').join('</span> <span class="badge badge-success">') + '</span>' : '';

      const atributos_phone = groups[groupName].phone_attributes ? '<span class="badge badge-success">' + groups[groupName].phone_attributes.split('|').join('</span> <span class="badge badge-success">') + '</span>' : '';



      
      
      const group = groups[groupName];
      const groupElement = document.createElement('div');
      //agregar clase de bootstrap cols
      groupElement.classList.add('col-md-6', 'col-sm-6', 'col-12');

      groupElement.innerHTML = /*html*/ `
        <div class="card mb-2 shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title" style="display: inline-block;">${groupName}</h5> 
            <button class="btn btn-warning edit-button" data-group="${groupName}">
              <img src="https://cdn-icons-png.flaticon.com/512/84/84380.png" style="width:15px;" alt="Edit">
            </button>
            <!-- boton trash-->
            <button class="btn btn-danger delete-button" data-group="${groupName}">
              <img src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png" style="width:15px;" alt="Delete">
            </button>
          </div>
          <div class="card-body card-body-group d-flex flex-column">            
            <div class="info-card">
              <p>RUT: ${group.rut}</p>
              ${atributos_rut}
            </div>        
            <div class="info-card">
              <p>Email: ${group.email}</p>
              ${ atributos_email}
            </div>
            <div class="info-card">
              <p>Teléfono: ${group.phone}</p>
              ${ atributos_phone}
            </div>
          </div>
        </div>
      `;
      groupsDiv.appendChild(groupElement);
    }

    // Agregar listeners para los botones de "Rellenar Formulario"
    document.querySelectorAll('.fill-button').forEach(button => {
      button.addEventListener('click', () => {
        const groupName = button.getAttribute('data-group');
        fillForm(groupName);
      });
    });

    // Agregar listeners para los botones de "Editar Grupo"
    document.querySelectorAll('.edit-button').forEach(button => {
      button.addEventListener('click', () => {
        const groupName = button.getAttribute('data-group');
        editGroup(groupName);
        document.getElementById('messageErrorForm').innerHTML = ''; // limpiar mensaje de error
        // cambiar nombre a boton de guardar "Guardar cambios"
        document.getElementById('saveGroup').innerHTML = 'Guardar edición';
        document.getElementById('saveGroup').classList.remove('btn-primary');
        document.getElementById('saveGroup').classList.add('btn-warning');
        document.getElementById('card-body-form').style.display = 'block';
      });
    });

    // Agregar listeners para los botones de "Eliminar Grupo"
    document.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', () => {
        // mostrar confirmacion de eliminar
        const groupName = button.getAttribute('data-group');
        if (confirm(`¿Estás seguro de eliminar el grupo "${groupName}"?`)) {
          deleteGroup(groupName);
        }
      });
    });
  });
}

//al presionar en btnNewGroup mostrar card-body-form

document.getElementById('btnNewGroup').addEventListener('click', () => {
  currentGroup = null; 
  document.getElementById('card-body-form').style.display = 'block';
  clearForm();
  document.getElementById('messageErrorForm').innerHTML = ''; // limpiar mensaje de error
  // cambiar nombre a boton de guardar "Guardar Grupo"
  document.getElementById('saveGroup').innerHTML = 'Crear nuevo grupo';
  document.getElementById('saveGroup').classList.remove('btn-warning');
  document.getElementById('saveGroup').classList.add('btn-success');
});

// Función para llenar el formulario con los datos de un grupo (edición)
function editGroup(groupName) {
  browser.storage.local.get('testGroups').then((data) => {
    const groups = data.testGroups || {};
    const group = groups[groupName];

    if (group) {
      // Cargar los datos del grupo en el formulario
      document.getElementById('groupName').value = groupName;
      document.getElementById('groupUrl').value = group.url || '';
      document.getElementById('id_contenedor_grupo').value = group.id_contenedor_grupo || '';
      document.getElementById('rut').value = group.rut;
      document.getElementById('email').value = group.email;
      document.getElementById('phone').value = group.phone;
      document.getElementById('rut_attributes').value = group.rut_attributes;
      document.getElementById('email_attributes').value = group.email_attributes;
      document.getElementById('phone_attributes').value = group.phone_attributes;

      currentGroup = groupName; // Guardar el grupo actual para la edición
    }
  });
}

//Funcion para eliminar un grupo
function deleteGroup(groupName) {
  browser.storage.local.get('testGroups').then((data) => {
    const groups = data.testGroups || {};
    delete groups[groupName];
    browser.storage.local.set({ testGroups: groups }).then(() => {
      loadGroups();
    });
  });
}

// Función para llenar el formulario usando el grupo seleccionado
function fillForm(groupName) {
  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { action: 'fillForm', group: groupName });
  });
}

// Función para limpiar el formulario
function clearForm() {
  document.getElementById('groupName').value = '';
  document.getElementById('groupUrl').value = '';
  document.getElementById('id_contenedor_grupo').value = '';
  document.getElementById('rut').value = '';
  document.getElementById('email').value = 'test@test.cl';
  document.getElementById('phone').value = '';
  currentGroup = null; // Reiniciar el estado de edición
}

// Función para exportar grupos a CSV
function exportGroupsToCSV() {
  browser.storage.local.get('testGroups').then((data) => {
    let groups = data.testGroups || {};

    if (Object.keys(groups).length === 0) {
      alert("No hay nada que exportar. Crea tu primer grupo");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "GroupName,RUT,rut_name,Email,email_name,Phone,telefono_name\n"; // Encabezados CSV

    for (let groupName in groups) {
      let group = groups[groupName];
      csvContent += `${groupName},${group.rut},${group.rut_attributes},${group.email},${group.email_attributes},${group.phone},${group.phone_attributes}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "groups.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// Función para importar grupos desde CSV
function importGroupsFromCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split("\n");
    const groups = {};

    for (let i = 1; i < lines.length; i++) { // Saltar encabezados
      const line = lines[i].trim();
      if (!line) continue;
      const [groupName, rut, rut_attributes, email, email_attributes,  phone, phone_attributes] = line.split(",");
      groups[groupName] = { rut, rut_attributes, email, email_attributes,  phone, phone_attributes, url: '', id_contenedor_grupo: '' };
    }

    browser.storage.local.set({ testGroups: groups }).then(() => {
      location.reload(); // Recargar la página después de importar los datos
    });;
  };
  reader.readAsText(file);
}

// Agregar eventos a los botones de importación y exportación
document.getElementById('exportCSV').addEventListener('click', exportGroupsToCSV);
document.getElementById('importCSV').addEventListener('change', importGroupsFromCSV);

// abrir modal de importacion


// Cargar los grupos al iniciar la extensión
document.addEventListener('DOMContentLoaded', loadGroups);

// Guardar el grupo al hacer clic en el botón "Guardar Grupo"
document.getElementById('saveGroup').addEventListener('click', saveGroup);
