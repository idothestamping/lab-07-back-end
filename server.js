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
        console.log('data is:', geocodeUrlRES);

        let newgeodata = geocodeUrlRES.body.results.map(data => {
          let formattedAddress = data.formatted_address;
          let latitude = data.geometry.location.lat;
          let longitude = data.geometry.location.lng;
          return new Place(searchQuery, formattedAddress, latitude, longitude);
        })
        response.send(newgeodata);
      });
    // const locationData = require('./data/geo.json');
    // let searchQuery = request.query.data;
    // let formattedAddress = locationData.results[0].formatted_address;
    // let latitude = locationData.results[0].geometry.location.lat;
    // let longitude = locationData.results[0].geometry.location.lng;

    // let locationInstance = new Place(searchQuery, formattedAddress, latitude, longitude);
    // // response.status(200).send(locationInstance);
    // response.send(locationInstance);
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


app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));

function Place (searchQuery, formattedAddress, latitude, longitude) {
  this.search_query = searchQuery;
  this.formatted_query = formattedAddress;
  this.latitude = latitude;
  this.longitude = longitude;
}

function Weather (forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time*1000).toDateString();
}