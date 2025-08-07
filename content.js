function fillForm(groupName) {
  // Recuperar los grupos desde el almacenamiento local
  browser.storage.local.get('testGroups').then((data) => {
    const groups = data.testGroups || {};
    const fields = groups[groupName];

    if (!fields) {
      console.error(`El grupo ${groupName} no existe.`);
      return;
    }

    // Recorrer todos los inputs de la página y llenar los que correspondan
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      const name = input.getAttribute('name');
      if (name) {
        if (new RegExp(fields.rut_attributes, 'i').test(name)) {
          input.value = fields.rut;
          triggerEvents(input);
        } else if (new RegExp(fields.email_attributes, 'i').test(name)) {
          input.value = fields.email;
          triggerEvents(input);
        } else if (new RegExp(fields.phone_attributes, 'i').test(name)) {
          input.value = fields.phone;
          triggerEvents(input);
        }
      }
    });
  });
}

// Función para disparar eventos manualmente (input, change)
function triggerEvents(element) {
  const events = ['input', 'change'];
  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  });
}

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'fillForm') {
    fillForm(message.group);
  }
});

// Mostrar botones de grupo si la URL coincide
function showGroupButtonsForUrl() {
  browser.storage.local.get('testGroups').then((data) => {
    const groups = (data && data.testGroups) ? data.testGroups : {};
    const currentUrl = window.location.href;
    // Buscar grupos que tengan url y coincidan (inclusión parcial)
    const matchingGroups = [];
    for (const [groupName, group] of Object.entries(groups)) {
      if (
        group &&
        typeof group === 'object' &&
        group.url &&
        typeof group.url === 'string' &&
        group.url.trim() !== '' &&
        currentUrl.includes(group.url.trim())
      ) {
        matchingGroups.push([groupName, group]);
      }
    }
    if (!Array.isArray(matchingGroups) || matchingGroups.length === 0) return;

    // Buscar el primer input visible del formulario
    const firstInput = document.querySelector('input:not([type=hidden]):not([disabled])');
    // Determinar si hay algún grupo con id_contenedor_grupo válido
    let customContainerId = null;
    for (const [groupName, group] of matchingGroups) {
      if (group.id_contenedor_grupo && typeof group.id_contenedor_grupo === 'string' && group.id_contenedor_grupo.trim() !== '') {
        const cont = document.getElementById(group.id_contenedor_grupo.trim());
        if (cont) {
          customContainerId = group.id_contenedor_grupo.trim();
          break;
        }
      }
    }

    let btnContainer = document.getElementById('fastform-group-btns');
    if (!btnContainer) {
      btnContainer = document.createElement('div');
      btnContainer.id = 'fastform-group-btns';
      btnContainer.style.display = 'flex';
      btnContainer.style.gap = '8px';
      btnContainer.style.position = 'absolute';
      btnContainer.style.top = '10px';
      btnContainer.style.left = '10px';
      btnContainer.style.zIndex = '9999';
      btnContainer.style.background = 'rgba(255,255,255,0.95)';
      btnContainer.style.padding = '8px 12px';
      btnContainer.style.borderRadius = '8px';
      btnContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      btnContainer.style.transition = 'opacity 0.3s, transform 0.3s';

      // Drag handle
      const dragHandle = document.createElement('span');
      dragHandle.style.cursor = 'move';
      dragHandle.style.marginRight = '10px';
      dragHandle.title = 'Mover';
      dragHandle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>';
      btnContainer.appendChild(dragHandle);

      // Botón ocultar/mostrar
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.title = 'Ocultar/Mostrar';
      toggleBtn.style.background = 'none';
      toggleBtn.style.border = 'none';
      toggleBtn.style.cursor = 'pointer';
      toggleBtn.style.marginRight = '10px';
      toggleBtn.style.fontSize = '18px';
      toggleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 13c-3.87 0-7.19-2.54-8.48-6C4.81 8.04 8.13 5.5 12 5.5s7.19 2.54 8.48 6c-1.29 3.46-4.61 6-8.48 6zm0-10A4 4 0 1 0 12 16a4 4 0 0 0 0-8z"/></svg>';
      btnContainer.appendChild(toggleBtn);

      let visible = true;
      toggleBtn.onclick = function() {
        visible = !visible;
        if (!visible) {
          btnContainer.style.opacity = '0.2';
          btnContainer.style.pointerEvents = 'none';
          btnContainer.style.transform = 'scale(0.95)';
        } else {
          btnContainer.style.opacity = '1';
          btnContainer.style.pointerEvents = 'auto';
          btnContainer.style.transform = 'scale(1)';
        }
      };

      // Drag and drop funcionalidad básica
      let offsetX, offsetY, dragging = false;
      dragHandle.addEventListener('mousedown', function(e) {
        dragging = true;
        offsetX = e.clientX - btnContainer.getBoundingClientRect().left;
        offsetY = e.clientY - btnContainer.getBoundingClientRect().top;
        document.body.style.userSelect = 'none';
      });
      document.addEventListener('mousemove', function(e) {
        if (dragging) {
          btnContainer.style.left = (e.clientX - offsetX) + 'px';
          btnContainer.style.top = (e.clientY - offsetY) + 'px';
        }
      });
      document.addEventListener('mouseup', function() {
        dragging = false;
        document.body.style.userSelect = '';
      });

      if (customContainerId) {
        document.getElementById(customContainerId).appendChild(btnContainer);
      } else if (firstInput) {
        let parent = firstInput.closest('form') || firstInput.parentNode;
        if (parent && parent.style) {
          parent.style.position = parent.style.position || 'relative';
        }
        parent.insertBefore(btnContainer, parent.firstChild);
      } else {
        return;
      }
    } else {
      btnContainer.innerHTML = '';
    }

    // Crear un botón por cada grupo coincidente
    matchingGroups.forEach(([groupName, group]) => {
      const btn = document.createElement('button');
      btn.textContent = groupName;
      btn.type = 'button';
      btn.className = 'btn btn-info btn-sm';
      btn.style.fontWeight = 'bold';
      btn.onclick = () => fillForm(groupName);
      btnContainer.appendChild(btn);
    });
  });
}

// Ejecutar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showGroupButtonsForUrl);
} else {
  showGroupButtonsForUrl();
}

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'showGroupButtons') {
    showGroupButtonsForUrl();
  }
  if (message.action === 'fillForm') {
    fillForm(message.group);
  }
});