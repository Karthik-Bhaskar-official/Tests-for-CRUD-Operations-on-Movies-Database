const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "moviesData.db");
// console.log(dbPath);
const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running http://localhost/3000/");
    });
  } catch (err) {
    console.log(`DB Error is ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET

app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT
      movie_name
    FROM
      movie;`;
  const dbResponse = await db.all(getMovies);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovie = `
    INSERT INTO
      movie(director_id, movie_name, lead_actor)
    VALUES
      ('${directorId}', '${movieName}', '${leadActor}');
    `;
  const dbResponse = await db.run(postMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieId = `
  SELECT 
    *
  FROM 
    movie
  WHERE movie_id = '${movieId}';`;
  const dbResponse = await db.get(getMovieId);
  response.send({
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  });
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putMovie = `
    UPDATE 
      movie
    SET
      director_id = '${directorId}',
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE 
      movie_id = '${movieId}';`;
  await db.run(putMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
  DELETE FROM 
    movie
  WHERE 
    movie_id = '${movieId}';`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirector = `
    SELECT
      director_id,
      director_name
    FROM
      director;`;
  const dbResponse = await db.all(getDirector);
  response.send(
    dbResponse.map((eachMovie) => ({
      directorId: eachMovie.director_id,
      directorName: eachMovie.director_name,
    }))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorId = `
  SELECT 
    movie_name
  FROM 
    movie 
  WHERE 
    director_id = '${directorId}';`;
  const dbResponse = await db.all(getDirectorId);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
