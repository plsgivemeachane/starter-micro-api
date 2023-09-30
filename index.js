const express = require('express');
const app = express();
const cors = require("cors")
const serverLimit = 9;

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

//arr.sort((a,b) => (a[3] > b[3] ? 1 : -1))

let locker = false;

let somefrek = [
  ["4189cf8e-a925-4a73-9051-88b4798ec5df", "s5MZ8h57Od6mhQbs0sstuyRMGumQrMEB4FaMNnZY", 0],
  ["08e39cd1-e942-4682-81e1-46ecb124c5a7", "sbblyyEImYDaCayJ1G9BkbscgYx4KlhKwdVn4s9T", 0],
  ["61bca84c-f3e6-447b-b71c-29d2abe30f7e", "sWUT9x2UAynDZU9nNyArDV3hljctMj461iPEw5iq", 0],
  ["eb73e10f-1a68-4979-9e30-a564dda495ac", "sn27OeHSuySQPnQyiNw9h5eFewEm8hSQwjqiaQRf", 0],
  ["d84506c8-4756-4d67-ab3a-8b1ec53121a6", "szSjtVFYQTiafmxg4RKhKMct32AWD7dnWKGQZFmb", 0]
]

let timeouts = []

app.use(cors({
  origins: "*"
}))

app.get('/', (req, res) => {
  res.sendStatus(401)
});

app.get("/status", (req, res) => {
  res.send(somefrek)
})

app.get("/get", async (req, res) => {
  while (locker) await sleep(100)
  locker = true;
  somefrek.sort((a, b) => (a[3] > b[3] ? 1 : -1))
  for (var server of somefrek) {
    if (server[2] < serverLimit) {
      server[2]++;
      console.log("using server : " + server[0] + " with the usage of " + server[2])
      locker = false;
      timeouts.push({
        id: server[0],
        timeout: setTimeout(() => {
          server[2]--;
          console.log("Server " + server[0] + " has timed out")
        }, 60000)
      })
      res.send(server)
      return;
    }
  }
  locker = false;
});

app.use("/done/:id", async (req, res) => {
  while (locker) await sleep(100)
  locker = true;
  for (var server of somefrek) {
    if (server[0] == req.params.id) {
      for (var t of timeouts) {
        if (t.id == server[0]) {
          // console.log("finde timeout " + t)
          clearTimeout(t.timeout)
        }
      }
      server[2]--;
      if (server[2] < 0) server[2] = 0;
      console.log("releasing server : " + server[0] + " with the usage of " + server[2])
      locker = false;
      res.send(server);
      return;
    }
  }
  locker = false;
})

app.listen(3000, () => {
  console.log('server started');
});
