let currentGroup = null; // Para saber si estamos editando un grupo existente

// Función para guardar un nuevo grupo o editar uno existente
function saveGroup() {
  const groupName = document.getElementById('groupName').value;
  const rut = document.getElementById('rut').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  if (!groupName || !rut || !email || !phone) {
    // agregar clase de error bs4 a los campos vacios
    if (!groupName) {
      document.getElementById('groupName').classList.add('is-invalid');
    } else {
      document.getElementById('groupName').classList.remove('is-invalid');
    }
    if (!rut) {
      document.getElementById('rut').classList.add('is-invalid');
    } else {
      document.getElementById('rut').classList.remove('is-invalid');
    }
    if (!email) {
      document.getElementById('email').classList.add('is-invalid');
    } else {
      document.getElementById('email').classList.remove('is-invalid');
    }
    if (!phone) {
      document.getElementById('phone').classList.add('is-invalid');
    } else {
      document.getElementById('phone').classList.remove('is-invalid');
    }    
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
    groups[groupName] = { rut, email, phone };

    // Guardar el grupo actualizado
    browser.storage.local.set({ testGroups: groups }).then(() => {
      alert("Grupo guardado con éxito.");
      currentGroup = null; // Reiniciar el estado de edición
      clearForm(); // Limpiar el formulario
      loadGroups(); // Recargar los grupos en la interfaz
    });
  });
}

// Función para cargar los grupos y mostrarlos en la interfaz
function loadGroups() {
  const groupsDiv = document.getElementById('groups');
  groupsDiv.innerHTML = ''; // Limpiar los grupos actuales en la interfaz

  browser.storage.local.get('testGroups').then((data) => {
    const groups = data.testGroups || {};

    for (let groupName in groups) {
      const group = groups[groupName];
      const groupElement = document.createElement('div');
      groupElement.classList.add('col-12');
      groupElement.innerHTML = `
        <button class="btn btn-primary btn-block fill-button mb-1" data-group="${groupName}">${groupName}</button>
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
      });
    });
  });
}

// Función para llenar el formulario con los datos de un grupo (edición)
function editGroup(groupName) {
  browser.storage.local.get('testGroups').then((data) => {
    const groups = data.testGroups || {};
    const group = groups[groupName];

    if (group) {
      // Cargar los datos del grupo en el formulario
      document.getElementById('groupName').value = groupName;
      document.getElementById('rut').value = group.rut;
      document.getElementById('email').value = group.email;
      document.getElementById('phone').value = group.phone;

      currentGroup = groupName; // Guardar el grupo actual para la edición
    }
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
  document.getElementById('rut').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  currentGroup = null; // Reiniciar el estado de edición
}

// Cargar los grupos al iniciar la extensión
document.addEventListener('DOMContentLoaded', loadGroups);

// abrir la nueva pestaña con el formulario
document.getElementById('openInTab').addEventListener('click', () => {
  browser.tabs.create({ url: 'options.html' });
});