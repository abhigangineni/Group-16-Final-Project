function getRandomIntInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1) + newMin); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#camera_list');
  target.innerHTML = '';

  const listEl = document.createElement('ol');
  target.appendChild(listEl);
  list.forEach((item) => {
    const el = document.createElement('li');
    el.innerText = item["street_address"]+" -> Posted Speed: "+ item["posted_speed"];
    listEl.appendChild(el);
  });
}

function filterList(array, filterInputValue) {
  const newArray = array.filter((item) => {
    const lowercaseAddress = item.street_address.toLowerCase();
    const lowercaseQuery = filterInputValue.toLowerCase();
    return lowercaseAddress.includes(lowercaseQuery);
  });
  return newArray;
}

function processCameras(list) {
  console.log('fired cameras list');
  const range = [...Array(15).keys()]; // Special notation to create an array of 15 elements
  const newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length);
    return list[index];
  });
  return newArray;
}

async function getData() {
  const url = 'https://data.princegeorgescountymd.gov/resource/mnkf-cu5c.json'; // remote URL! you can test it in your browser
  const data = await fetch(url); // We're using a library that mimics a browser 'fetch' for simplicity
  const json = await data.json(); // the data isn't json until we access it using dot notation

  const reply = json.filter((item) => Boolean(item.location_1)).filter((item) => Boolean(item.street_address));

  return reply;
}

function initMap() {
  console.log('initMap');
  const map = L.map('map').setView([38.9869, -76.9426], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
  
}

function markerPlace(array, map) {
  console.log('markerPlace', array);
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  array.forEach((item, index) => {
    const {latitude} = item.location_1;
    const {longitude} = item.location_1;
    console.log(latitude,longitude);
    L.marker([Number(latitude), Number(longitude)]).addTo(map);
    if (index === 0) {
      map.setView([Number(latitude), Number(longitude)], 9.5);
    }
  });
}


async function mainEvent() {

  const form = document.querySelector('.main_form'); 
  const submit = document.querySelector('#get-resto'); 


  const results = await getData();

  const pageMap = initMap();

  console.log(results[0]);

  console.log(`${results[0].object_id} ${results[0].street_address}`);

  if (results?.length > 0) { 
    submit.style.display = 'block'; 


    let currentList = [];

    form.addEventListener('input', (event) => {
      console.log('input', event.target.value);
      const filteredList = filterList(currentList, event.target.value);
      injectHTML(filteredList);
      markerPlace(filteredList, pageMap);
    });

    form.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault();

      currentList = processCameras(results);
      console.log(currentList);

      injectHTML(currentList);
      markerPlace(currentList, pageMap);

    });
  }
}

document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
