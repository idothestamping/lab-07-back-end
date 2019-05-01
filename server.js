'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const app = express();
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
app.use(cors());

const PORT = process.env.PORT || 3000;
var weatherArr = [];


app.get('/location', (request, response) => {
  try {
    let searchQuery = request.query.data;
    console.log('searchQuery', searchQuery);

    let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${GEOCODE_API_KEY}`;

    superagent.get(geocodeUrl)
      .end( (err, geocodeUrlRES) => {
          const newgeodata = new Place(searchQuery, geocodeUrlRES.body.results);
          console.log('adkafjdsajf', newgeodata);
          response.send(newgeodata);
        })
        
    } catch( err ) {
      console.log('Sorry, There was an Error:', err);
      response.status(500).send('Sorry, There was an Error');
    }
});


app.get('/weather', (request, response) => {
  try {
    const weatherData = require('./data/darksky.json');
    weatherArr = weatherData.daily.data.map(data => {
      let forecast =  data.summary;
      let time = data.time;
      return new Weather(forecast, time);
    })
    response.status(200).send(weatherArr);

  } catch( error ) {
    console.log('Sorry, There was an Error');
    response.status(500).send('Sorry, There was an Error');
  }
});

// app.get('/event', (request, response) => {
//   try {
//     const weatherData = require('./data/darksky.json');
//     weatherArr = weatherData.daily.data.map(data => {
//       let forecast =  data.summary;
//       let time = data.time;
//       return new Weather(forecast, time);
//     })
//     response.status(200).send(weatherArr);

//   } catch( error ) {
//     console.log('Sorry, There was an Error');
//     response.status(500).send('Sorry, There was an Error');
//   }
// });

app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));

function Place (searchQuery, newgeodata) {
  this.search_query = searchQuery;
  this.formatted_query = newgeodata[0].formattedAddress;
  this.latitude = newgeodata[0].geometry.location.lat;
  this.longitude = newgeodata[0].geometry.location.lng;
}

function Weather (forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time*1000).toDateString();
}
