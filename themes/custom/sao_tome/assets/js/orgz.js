(function() {
  const root = document.getElementById('anda-org-chart');
  if (!root || root.dataset.initialized === 'true') return;

  root.dataset.initialized = 'true';

  const canvas = root.querySelector('.org-canvas');
  const svg = root.querySelector('.connector-layer');
  const pathsGroup = root.querySelector('.connector-paths');

  function point(element, position) {
    const r = element.getBoundingClientRect();
    const base = canvas.getBoundingClientRect();

    return {
      x: position === 'left' ? r.left - base.left :
         position === 'right' ? r.right - base.left :
         r.left - base.left + r.width / 2,

      y: position === 'top' ? r.top - base.top :
         position === 'bottom' ? r.bottom - base.top :
         r.top - base.top + r.height / 2
    };
  }

  function addPath(d) {
    const path = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    path.setAttribute('d', d);
    pathsGroup.appendChild(path);
  }

  function drawConnectors() {
    const width = canvas.scrollWidth;
    const height = canvas.scrollHeight;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    pathsGroup.innerHTML = '';

    const top = root.querySelector('.top');
    const direction = root.querySelector('.direction');
    const topContent = root.querySelector('.top-content');
    const departments = root.querySelector('.departments');

    if (top.classList.contains('collapsed')) return;

    const regionalNodes = Array.from(
      root.querySelectorAll('.top-content .regional')
    ).filter(node => node.getBoundingClientRect().width > 0);

    const columns = Array.from(
      root.querySelectorAll('.department-column')
    );

    /* DIRECTION VERS LES SERVICES REGIONAUX */
    if (regionalNodes.length) {
      const start = point(direction, 'bottom');
      const regionalPoints = regionalNodes.map(node => {
        const side = node.classList.contains('left') ? 'right' : 'left';
        return point(node, side);
      });

      const trunkX = start.x;
      const trunkTop = start.y + 12;
      const trunkBottom = Math.max(...regionalPoints.map(p => p.y));

      addPath(`M ${start.x} ${start.y} V ${trunkTop} V ${trunkBottom}`);

      regionalPoints.forEach(p => {
        addPath(`M ${trunkX} ${p.y} H ${p.x}`);
      });
    }

    /* DIRECTION VERS LE DEPARTEMENT CENTRAL */
    const middleColumn = columns[1];
    const middleDepartment = middleColumn
      ? middleColumn.querySelector('.department')
      : null;

    if (middleDepartment && middleDepartment.getBoundingClientRect().width > 0) {
      const start = point(direction, 'bottom');
      const end = point(middleDepartment, 'top');

      // Liaison verticale directe, alignée sur le centre des deux blocs
      addPath(`M ${start.x} ${start.y} V ${end.y}`);
    }

    /* LIGNE HORIZONTALE ENTRE LES TROIS DEPARTEMENTS */
    const visibleDepartments = columns
      .map(column => column.querySelector('.department'))
      .filter(node => node && node.getBoundingClientRect().width > 0);

    if (visibleDepartments.length) {
      const points = visibleDepartments.map(node => point(node, 'top'));
      const branchY = point(departments, 'top').y - 15;

      const firstX = Math.min(...points.map(p => p.x));
      const lastX = Math.max(...points.map(p => p.x));

      addPath(`M ${firstX} ${branchY} H ${lastX}`);

      points.forEach(p => {
        addPath(`M ${p.x} ${branchY} V ${p.y}`);
      });
    }

    /* DEPARTEMENTS VERS SERVICES */
    columns.forEach(column => {
      const department = column.querySelector('.department');
      const services = column.querySelector('.services');

      if (!department || !services) return;
      if (column.classList.contains('collapsed')) return;

      const items = Array.from(
        services.querySelectorAll('.service-item')
      ).filter(item => item.getBoundingClientRect().height > 0);

      if (!items.length) return;

      const start = point(department, 'bottom');
      const servicePoints = items.map(item =>
        point(item.querySelector('.service'), 'top')
      );

      const lastY = Math.max(...servicePoints.map(p => p.y));

      addPath(`M ${start.x} ${start.y} V ${lastY}`);

      servicePoints.forEach(p => {
        addPath(`M ${start.x} ${p.y} H ${p.x}`);
      });
    });
  }

  /* BOUTONS OUVRIR / FERMER */
  root.querySelectorAll('.toggle').forEach(button => {
    button.addEventListener('click', function(event) {
      event.stopPropagation();

      const parent = button.closest('.top, .department-column');
      if (!parent) return;

      const collapsed = parent.classList.toggle('collapsed');

      button.textContent = collapsed ? '+' : '−';
      button.setAttribute(
        'aria-expanded',
        collapsed ? 'false' : 'true'
      );

      requestAnimationFrame(drawConnectors);
      setTimeout(drawConnectors, 150);
      setTimeout(drawConnectors, 450);
    });
  });

  /* ACTUALISATION AUTOMATIQUE DES LIGNES */
  let timer;

  function scheduleDraw() {
    clearTimeout(timer);
    timer = setTimeout(drawConnectors, 60);
  }

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleDraw);
    observer.observe(canvas);
  }

  window.addEventListener('resize', scheduleDraw);
  window.addEventListener('load', function() {
    drawConnectors();
    setTimeout(drawConnectors, 300);
  });

  root.querySelectorAll('.node, .collapsible').forEach(element => {
    element.addEventListener('transitionend', scheduleDraw);
  });

  requestAnimationFrame(drawConnectors);
  setTimeout(drawConnectors, 200);

})();