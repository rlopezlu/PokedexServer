var express = require('express');
var router = express.Router();
var axios = require('axios')
var memCache = require('memory-cache')

let baseUrl = "https://pokeapi.co/api/v2/"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/pokeList/:start/:amount', function(req, res, next){
  let startIndex = req.params.start || 1;
  let amount = req.params.amount || 10;
  let promises = []

  for (let i = parseInt(startIndex); i < parseInt(amount) + parseInt(startIndex); i++){
    let cachedItem = memCache.get((`pokeId${i}`));
    if(cachedItem){
      console.log("in cache: id ",i);
      promises.push(cachedItem)
    } else{
      console.log("NOT in cache: id ",i);
      promises.push(axios.get(`${baseUrl}pokemon/${i}`))
    }
  }

  // TODO: currently storing entire response into cachedItem
  //TODO: change so only response.data is being stored
  Promise.all(promises) //returns a value for each promise as an array of values
    .then(responses => {
      return responses.map( response => {
        let key = `pokeId${response.data.id}`
        let cachedItem = memCache.get(key);

        if(cachedItem){
          console.log("found in cache: ", response.data.id);
          return cachedItem.data
        } else{
          console.log("saved into cache: ", response.data.id);
          memCache.put(key, response)
          return response.data
        }
      })
    })
    .then(response => {
      console.log("got data");
      res.json(response)
    })
    .catch(error =>{
      console.log("error getting data");
      console.log(error.request);
    })
})

router.get('/singlePoke', function(req, res, next){
  axios.get(`${baseUrl}pokemon/321`)
  .then(response =>{
    // console.log(response);
    res.json(response.data)
  })
  .catch(err => {
    console.log("unable to get data");
    console.log(err);
  })
})
module.exports = router;
