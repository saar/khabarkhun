import React from "react";
import Post from "./Posts";

const App = () => (
  <div className="row mt-5">
    <div className="col-md-4 offset-md-1">
      <h2>posts</h2>
      <Post/>
    </div>
  </div>
);

export default App;
