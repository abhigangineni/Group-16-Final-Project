/* eslint-disable max-len */

/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/

/*
  ## Utility Functions
    Under this comment place any utility functions you need - like an inclusive random number selector
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
*/

function getRandomIntInclusive(min, max) {
    const newMin = Math.ceil(min);
    const newMax = Math.floor(max);
    return Math.floor(Math.random() * (newMax - newMin + 1) + newMin); // The maximum is inclusive and the minimum is inclusive
  }
  
  function injectHTML(list) {
    console.log('fired injectHTML');
    const target = document.querySelector('#restaurant_list');
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
  
  function processRestaurants(list) {
    console.log('fired restaurants list');
    const range = [...Array(15).keys()]; // Special notation to create an array of 15 elements
    const newArray = range.map((item) => {
      const index = getRandomIntInclusive(0, list.length);
      return list[index];
    });
    return newArray;
    /*
          ## Process Data Separately From Injecting It
            This function should accept your 1,000 records
            then select 15 random records
            and return an object containing only the restaurant's name, category, and geocoded location
            So we can inject them using the HTML injection function
            You can find the column names by carefully looking at your single returned record
            https://data.princegeorgescountymd.gov/Health/Food-Inspection/umjn-t2iz
          ## What to do in this function:
          - Create an array of 15 empty elements (there are a lot of fun ways to do this, and also very basic ways)
          - using a .map function on that range,
          - Make a list of 15 random restaurants from your list of 100 from your data request
          - Return only their name, category, and location
          - Return the new list of 15 restaurants so we can work on it separately in the HTML injector
        */
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

  // function shapeData(array) {
  //   return array.reduce((collection, item) => {
  //       if(!collection[item.posted_speed]) {
  //           collection[item.posted_speed] = [item];
  //       } else {
  //           collection[item.posted_speed].push(item);
  //       }
  //       return collection;
  //   }, {});
  // } 

  // function initChart(chart, object) {
  //   const labels = Object.keys(object);

  //   const info = Object.keys(object).map((item) => object[item].length);
  
  //   const data = {
  //     labels: labels,
  //     datasets: [{
  //       label: 'Number of Speeding Cameras per Posted Speed Limit',
  //       backgroundColor: [
  //         'rgba(255, 99, 132, 0.4)',
  //         'rgba(255, 159, 64, 0.4)',
  //         'rgba(255, 205, 86, 0.4)',
  //         'rgba(75, 192, 192, 0.4)',
  //         'rgba(54, 162, 235, 0.4)',
  //         'rgba(153, 102, 255, 0.4)',
  //         'rgba(201, 203, 207, 0.4)'
  //       ],
  //       borderColor: [
  //         'rgb(255, 99, 132)',
  //         'rgb(255, 159, 64)',
  //         'rgb(255, 205, 86)',
  //         'rgb(75, 192, 192)',
  //         'rgb(54, 162, 235)',
  //         'rgb(153, 102, 255)',
  //         'rgb(201, 203, 207)'
  //       ],
  //       borderWidth: 1,
  //       data: info,
  //     }]
  //   };
  
  //   const config = {
  //     type: 'bar',
  //     data: data,
  //     options: {}
  //   };

  //   return new Chart(
  //     chart,
  //     config
  //   );
  // }
  
  async function mainEvent() {
    /*
          ## Main Event
            Separating your main programming from your side functions will help you organize your thoughts
            When you're not working in a heavily-commented "learning" file, this also is more legible
            If you separate your work, when one piece is complete, you can save it and trust it
        */
    
    // the async keyword means we can make API requests
    const form = document.querySelector('.main_form'); // get your main form so you can do JS with it
    const submit = document.querySelector('#get-resto'); // get a reference to your submit button
    const loadAnimation = document.querySelector('.lds-ellipsis');
    //const chartTarget = document.querySelector('#myChart');
    submit.style.display = 'none'; // let your submit button disappear
  
    const results = await getData();

    //const shapedData = shapeData(results);
    //initChart(chartTarget, shapedData);
    const pageMap = initMap();
    /*
    
          Below this comment, we log out a table of all the results using "dot notation"
          An alternate notation would be "bracket notation" - arrayFromJson["data"]
          Dot notation is preferred in JS unless you have a good reason to use brackets
          The 'data' key, which we set at line 38 in foodServiceRoutes.js, contains all 1,000 records we need
        */
    // console.table(arrayFromJson.data);
  
    // in your browser console, try expanding this object to see what fields are available to work with
    // for example: arrayFromJson.data[0].name, etc
    console.log(results[0]);
  
    // this is called "string interpolation" and is how we build large text blocks with variables
    console.log(`${results[0].object_id} ${results[0].street_address}`);
  
    // This IF statement ensures we can't do anything if we don't have information yet
    if (results?.length > 0) { // the question mark in this means "if this is set at all"
      submit.style.display = 'block'; // let's turn the submit button back on by setting it to display as a block when we have data available
  
      loadAnimation.classList.remove('lds-ellipsis');
      loadAnimation.classList.add('lds-ellipsis_hidden');
  
      let currentList = [];
  
      form.addEventListener('input', (event) => {
        console.log('input', event.target.value);
        const filteredList = filterList(currentList, event.target.value);
        injectHTML(filteredList);
        markerPlace(filteredList, pageMap);
      });
  
      // And here's an eventListener! It's listening for a "submit" button specifically being clicked
      // this is a synchronous event event, because we already did our async request above, and waited for it to resolve
      form.addEventListener('submit', (submitEvent) => {
        // This is needed to stop our page from changing to a new URL even though it heard a GET request
        submitEvent.preventDefault();
  
        // This constant will have the value of your 15-restaurant collection when it processes
        currentList = processRestaurants(results);
        console.log(currentList);
  
        // And this function call will perform the "side effect" of injecting the HTML list for you
        injectHTML(currentList);
        markerPlace(currentList, pageMap);
  
        // By separating the functions, we open the possibility of regenerating the list
        // without having to retrieve fresh data every time
        // We also have access to some form values, so we could filter the list based on name
      });
    }
  }
  
  /*
        This last line actually runs first!
        It's calling the 'mainEvent' function at line 57
        It runs first because the listener is set to when your HTML content has loaded
      */
  document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests