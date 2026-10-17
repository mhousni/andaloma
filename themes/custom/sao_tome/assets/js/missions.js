const center = { x: 325, y: 175 };
const serv_dist = 250;
const pointer_dist = 172;
const pointer_time = 2;
const icon_size = 42;
const circle_radius = 38;
const text_top_margin = 18;
const tspan_delta = 16;
const pointer_position = { progress: 0 };
let service_pointer;

//name is used as the title for the bubble
//icon is the id of the corresponding svg symbol
const services_data = [
{ name: "Industries", icon: "pvmh-industries" },
{ name: "Validation\n(C&Q and CSV)", icon: "pvmh-validation" },
{ name: "Engineering", icon: "pvmh-engineering" },
{ name: "Project\nManagement", icon: "pvmh-management" },
{ name: "Manufacturing\nIT", icon: "pvmh-manufacturing" },
{ name: "Technical\nServices", icon: "pvmh-technical" },
{ name: "Process\nAutomation", icon: "pvmh-process" }];


const services = document.getElementById("pvmh-service-collection");
const nav_container = document.getElementById("pvmh-circle-nav-services");
const symbol_copy = document.getElementById("pvmh-circle-nav-copy");
const use_copy = document.querySelector("use.pvmh-nav-copy");

//Keeps code DRY avoiding namespace for element creation
function createSVGElement(el) {
  return document.createElementNS("http://www.w3.org/2000/svg", el);
}

//Quick setup for multiple attributes
function setAttributes(el, options) {
  Object.keys(options).forEach(function (attr) {
    el.setAttribute(attr, options[attr]);
  });
}

//Service bubbles are created dynamically
function addService(serv, index) {
  let group = createSVGElement("g");
  group.setAttribute("class", "pvmh-service pvmh-serv-" + index);

  /* This group is needed to apply animations in
    the icon and its background at the same time */
  let icon_group = createSVGElement("g");
  icon_group.setAttribute("class", "pvmh-icon-wrapper");

  let circle = createSVGElement("circle");
  setAttributes(circle, {
    r: circle_radius,
    cx: center.x,
    cy: center.y });

  let circle_shadow = circle.cloneNode();
  setAttributes(circle, {
    class: 'pvmh-shadow' });

  icon_group.appendChild(circle_shadow);
  icon_group.appendChild(circle);

  let symbol = createSVGElement("use");
  setAttributes(symbol, {
    'x': center.x - icon_size / 2,
    'y': center.y - icon_size / 2,
    'width': icon_size,
    'height': icon_size });

  symbol.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + serv.icon);
  icon_group.appendChild(symbol);

  group.appendChild(icon_group);

  let text = createSVGElement("text");
  setAttributes(text, {
    x: center.x,
    y: center.y + circle_radius + text_top_margin });


  let tspan = createSVGElement("tspan");
  if (serv.name.indexOf('\n') >= 0) {

    let tspan2 = tspan.cloneNode();
    let name = serv.name.split('\n');
    jQuery(tspan).text(name[0]);
    jQuery(tspan2).text(name[1]);

    setAttributes(tspan2, {
      x: center.x,
      dy: tspan_delta });


    text.appendChild(tspan);
    text.appendChild(tspan2);
  } else
  {
    jQuery(tspan).text(serv.name);
    text.appendChild(tspan);
  }

  group.appendChild(text);
  services.appendChild(group);

  let service_bubble = jQuery(".pvmh-serv-" + index);

  const angle = Math.PI - Math.PI * index / (services_data.length - 1);
  gsap.set(service_bubble, {
    x: serv_dist * Math.cos(angle),
    y: serv_dist * Math.sin(angle),
    transformOrigin: "center center" });


  service_bubble.click(serviceClick);
}

//Creates pointer
function createPointer() {
  service_pointer = createSVGElement("circle");

  setAttributes(service_pointer, {
    cx: center.x - pointer_dist,
    cy: center.y,
    r: 12,
    class: "pvmh-pointer" });


  nav_container.appendChild(service_pointer);

  updatePointerPosition();
}

function updatePointerPosition() {
  const angle = Math.PI - Math.PI * pointer_position.progress;
  setAttributes(service_pointer, {
    cx: center.x + pointer_dist * Math.cos(angle),
    cy: center.y + pointer_dist * Math.sin(angle) });
}

//Defines behavior for service bubbles
function serviceClick(ev) {

  //There's always an active service
  jQuery(".pvmh-service.pvmh-active").removeClass("pvmh-active");

  let current = jQuery(ev.currentTarget);
  current.addClass("pvmh-active");

  //There's a "pvmh-serv-*" class for each bubble
  let current_class = current.attr("class").split(" ")[1];
  const class_index = Number(current_class.split('-')[2]);

  //Hides current text of the main bubble
  jQuery(use_copy).addClass("pvmh-changing");

  const target_progress = class_index / (services_data.length - 1);
  gsap.to(pointer_position, {
    progress: target_progress,
    duration: Math.abs(target_progress - pointer_position.progress) * pointer_time / 2,
    ease: "none",
    overwrite: "auto",
    onUpdate: updatePointerPosition });

  //After it's completely hidden, the text changes and becomes visible
  setTimeout(() => {
    let viewBoxY = 300 * class_index;
    symbol_copy.setAttribute("viewBox", "0 " + viewBoxY + " 300 300");
    jQuery(use_copy).removeClass("pvmh-changing");
  }, 250);
}

services_data.reduce((count, serv) => {
  addService(serv, count);
  return ++count;
}, 0);

createPointer();

//Adding it immediately triggers a bug for the transform
setTimeout(() => jQuery("#pvmh-service-collection .pvmh-serv-0").addClass("pvmh-active"), 200);