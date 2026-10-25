var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}


// TEAM
 const btnF1 = document.getElementById('popupF1Btn');
const targetF1 = document.getElementById('sectionPopupF1');
const btnCloseF1 = document.getElementById('popupTeamF1Close');
const btnF1BG = document.getElementById('popupF1BG');

btnF1.addEventListener('click', (e) => {
    e.preventDefault()

    targetF1.classList.toggle('d-none');
    btnF1BG.style.width = (screen.width + 1000)+'px';
    btnF1BG.classList.toggle('d-none');
    disableScroll();
    const element = document.querySelector('body');

element.addEventListener('wheel', function(event) {
  event.preventDefault();
}, { passive: false });
});
btnCloseF1.addEventListener('click', (e) => {
    e.preventDefault()

    targetF1.classList.toggle('d-none');
    btnF1BG.classList.toggle('d-none');
    enableScroll();
});

// TEAM F2
const btnF2 = document.getElementById('popupF2Btn');
const targetF2 = document.getElementById('sectionPopupF2');
const btnCloseF2 = document.getElementById('popupTeamF2Close');
const btnF2BG = document.getElementById('popupF2BG');
btnF2.addEventListener('click', (e) => {
    e.preventDefault()

    targetF2.classList.toggle('d-none');
    btnF2BG.style.width = (screen.width + 1000)+'px';
    btnF2BG.classList.toggle('d-none');
    disableScroll();
    const element = document.querySelector('body');

    element.addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });
});
btnCloseF2.addEventListener('click', (e) => {
    e.preventDefault()

    targetF2.classList.toggle('d-none');
    btnF2BG.classList.toggle('d-none');
    enableScroll();
});


// TEAM F3
const btnF3 = document.getElementById('popupF3Btn');
const targetF3 = document.getElementById('sectionPopupF3');
const btnCloseF3 = document.getElementById('popupTeamF3Close');
const btnF3BG = document.getElementById('popupF3BG');
btnF3.addEventListener('click', (e) => {
    e.preventDefault()

    targetF3.classList.toggle('d-none');
    btnF3BG.style.width = (screen.width + 1000)+'px';
    btnF3BG.classList.toggle('d-none');
    disableScroll();
    const element = document.querySelector('body');

    element.addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });
});
btnCloseF3.addEventListener('click', (e) => {
    e.preventDefault()

    targetF3.classList.toggle('d-none');
    btnF3BG.classList.toggle('d-none');
    enableScroll();
});


// TEAM F4
const btnF4 = document.getElementById('popupF4Btn');
const targetF4 = document.getElementById('sectionPopupF4');
const btnCloseF4 = document.getElementById('popupTeamF4Close');
const btnF4BG = document.getElementById('popupF4BG');

btnF4.addEventListener('click', (e) => {
    e.preventDefault()

    targetF4.classList.toggle('d-none');
    btnF4BG.style.width = (screen.width + 1000)+'px';
    btnF4BG.classList.toggle('d-none');
    disableScroll();
    const element = document.querySelector('body');

    element.addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });
});
btnCloseF4.addEventListener('click', (e) => {
    e.preventDefault()

    targetF4.classList.toggle('d-none');
    btnF4BG.classList.toggle('d-none');
    enableScroll();
});


// TEAM F5
const btnF5 = document.getElementById('popupF5Btn');
const targetF5 = document.getElementById('sectionPopupF5');
const btnCloseF5 = document.getElementById('popupTeamF5Close');
const btnF5BG = document.getElementById('popupF5BG');
btnF5.addEventListener('click', (e) => {
    e.preventDefault()

    targetF5.classList.toggle('d-none');
    btnF5BG.style.width = (screen.width + 1000)+'px';
    btnF5BG.classList.toggle('d-none');
    disableScroll();
    const element = document.querySelector('body');

    element.addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });
});
btnCloseF5.addEventListener('click', (e) => {
    e.preventDefault()

    targetF5.classList.toggle('d-none');
    btnF5BG.classList.toggle('d-none');
    enableScroll();
});



