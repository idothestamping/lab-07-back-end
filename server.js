'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const app = express();
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
app.use(cors());

const PORT = process.env.PORT || 3000;

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
      handleError(error, 'events');
    }
});

app.get('/weather', (request, response) => {
  try {
    let weatherURL = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
    superagent.get(weatherURL)
    .end((err, weatherURL) => {
      const weather = getWeather(weatherURL.body);
      response.status(200).send(weather);
    })
  } catch( error ) {
    handleError(error, 'events');
  }
});

app.get('/events', (request,response) => {
  console.log('dasf', request.query.data.longitude);
  try{
    let eventURL = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${request.query.data.longitude}&location.latitude=${request.query.data.latitude}&expand=venue`;
    superagent.get(eventURL)
      .set('Authorization', `Bearer ${process.env.EVENTBRITE_API_KEY}`)
      .end((err, eventURL) => {

        const event = getEvents(eventURL.body.events);

        response.send(event);
      });
  } catch(error){
    handleError(error, 'events');
  }
});

app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));

function Place (searchQuery, newgeodata) {
  this.search_query = searchQuery;
  this.formatted_query = newgeodata[0].formattedAddress;
  this.latitude = newgeodata[0].geometry.location.lat;
  this.longitude = newgeodata[0].geometry.location.lng;
}

function getWeather(weatherResponse) {
  return weatherResponse.daily.data.map(day => {
    return new Weather(day);
  });
}

function Weather (day) {
  this.forecast = day.summary;
  this.time = new Date(day.time*1000).toDateString();
}

function Event(eventInfo){
  this.link = eventInfo.url;
  this.name = eventInfo.name.text;
  this.event_date = new Date(eventInfo.start.local).toDateString();
  this.summary = eventInfo.summary;
}

function getEvents(eventResponse){
  let result = eventResponse.map(event => new Event(event));
  return result.splice(0,20);
}

function handleError(response, endpoint){
  response.status(500).send({status: 500 , responseText: `Error on ${endpoint}`});
}
