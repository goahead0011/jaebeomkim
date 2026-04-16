(function () {
  var routes = {
    'RUNNING': '../running/running.html',
    'POLKA DOT': '../polka%20dot/polkadot.html',
    'CIVIC DRIFT': '../civic%20drift/civicdrift.html',
    'BURNOUT': '../burnout/burnout.html',
    'PLAYBOY': '../play%20boy/playboy.html',
    'THE GAP': '../the%20gap/thegap.html',
    'CONTACT': '../contact/contact.html'
  };

  function normalizeLabel(text) {
    return text.replace(/\s+/g, ' ').trim().toUpperCase();
  }

  Array.prototype.forEach.call(document.querySelectorAll('div'), function (node) {
    var label = normalizeLabel(node.textContent || '');
    var route = routes[label];

    if (!route) {
      return;
    }

    node.style.cursor = 'pointer';
    node.setAttribute('role', 'link');

    if (!node.hasAttribute('tabindex')) {
      node.setAttribute('tabindex', '0');
    }

    node.addEventListener('click', function () {
      window.location.href = route;
    });

    node.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = route;
      }
    });
  });
})();
