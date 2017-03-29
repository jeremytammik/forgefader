# ForgeFader

A Forge viewer extension to calculate and display signal attenuation caused by distance and obstacles in a building model with a floor plan containing walls.

It implements a functionality similar to [RvtFader](https://github.com/jeremytammik/RvtFader):

Given a source point, calculate the attenuation in a widening circle around it and display that as a heat map.

Two signal attenuation values in decibels are defined in the application settings:

- Attenuation per metre in air
- Attenuation by a wall

The extension expects an RVT model with a floor element, e.g., [little_house_floor.rvt](test/little_house_floor.rvt). You can translate it in Forge using your credentials and pass in its resulting `URN` to the viewer as described [below](#loading-custom-models-in-the-forge-viewer).

This app is based on Philippe Leefsma's [Forge React boilerplate sample](https://github.com/Autodesk-Forge/forge-react-boiler.nodejs).

Please refer to that for more details on the underlying architecture and components used.


## Implementation

The ForgeFader implementation lives
in [Viewing.Extension.Fader.js](https://github.com/jeremytammik/forgefader/blob/master/src/client/viewer.components/Viewing.Extension.Fader/Viewing.Extension.Fader.js).

On loading, in `onGeometryLoaded`, it determines the Revit BIM wall fragments for subsequent ray tracing.

On picking a point on a floor in the model, in `onSelection`, it launches the `attenuationCalculator` function to do the work.

That fiddles a round a bit to determine the picked floor top faces and add a new mesh to the model on which to draw the attenuation map.

Once the mesh has been added, it in turn calls `rayTraceToFindWalls` to create a bitmap representing the signal attenuation to be displayed by a custom shader.


## Adding Custom Geometry to the Forge Viewer

When debugging any kind of geometrical programming task, it is of utmost importance to be able to comfortably visualise the situation.

In this app, I adding threee different kinds of geomtry dynamically to model dispalyed by the Forge viewer:

- Points and lines representing the top face of the floor and the picked source point.
- A mesh representing the top face of the floor to be equipped with a custom shader and offset slighly above and away from the floor element surface.
- Points and lines representing the raytracing rays.

Three example screen snapshots illustrate what I mean.

Display points and lines for debugging using `drawVertex` and `drawLine`:

![Line and vertex debug markers](img/line_vertex_debug_marker_300.png "Line and vertex debug markers")

Create a mesh to represent the floor top face and offset it up slightly above the floor surface:

![Floor top face mesh](img/floor_top_face_mesh_250.png "Floor top face mesh")

Todo: Create a custom fragment shader to display the heat map, e.g., a concentric colour gradient around uv centre.

A debug helper displaying lines in the model representing the ray tracing rays:

![Ray tracing rays](img/ray_trace_rays_250.png "Ray tracing rays")


## Running the Sample

Configuration is controlled by **NODE_ENV**
[environment variable](https://www.google.com/webhp?q=set+environment+variable&gws_rd=cr&ei=tum2WMaSF4SdsgHruLrIDg),
make sure to set it properly to **development** or **production**,
based on the configuration type you want to run.

In **development**, the client is dynamically built by the
[webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware), so just run:

 - `npm install`    *(downloads project dependencies locally)*

 - `npm start`      *(builds client on the fly and run server)*

 - open [http://localhost:3000](http://localhost:3000) in your favorite browser

In **production**, the client requires a build step, so run:

 - `npm install` *(not required if you already run at previous step)*

 - `npm run build-prod && npm start` *(builds client and run server)*

 - open [http://localhost:3000](http://localhost:3000) in your favorite browser


## Loading Custom Models in the Forge Viewer

The project contains a default model located in **/resources/models/seat** that can be loaded with no further
setup and will also work offline.

If you want to load a model from **Autodesk Cloud**, you first need to generate a viewable **URN** as documented in the
[Prepare a File for the Viewer](https://developer.autodesk.com/en/docs/model-derivative/v2/tutorials/prepare-file-for-viewer/) tutorial.

Using the same Forge ClientId & ClientSecret used to upload the model,
populate environment variables used by the config files (in **/config**):

  - development:

    `FORGE_DEV_CLIENT_ID`

    `FORGE_DEV_CLIENT_SECRET`

  - production:

    `FORGE_CLIENT_ID`

    `FORGE_CLIENT_SECRET`


Restart the server, you can then directly load your model by specifying design **URN** as query parameter in the url of the viewer page:

    `[http://localhost:3000/viewer?urn=YOUR_URN_HERE](http://localhost:3000/viewer?urn=YOUR_DESIGN_URN_HERE)`


## Deploy to Heroku

Using your **Forge ClientId and ClientSecret** obtained while
[Creating a new Forge App](https://developer.autodesk.com/myapps/create),
press this button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


## More about the Autodesk Forge Platform and Web Applications of the Future

Check it out at [developer.autodesk.com](https://developer.autodesk.com).

Look at our [Quickstarts guide](https://developer.autodesk.com/en/docs/quickstarts/v1/overview/)
to find the Forge SDK's for the programming language of your choice.



## Author

Jeremy Tammik,
[The Building Coder](http://thebuildingcoder.typepad.com),
[ADN](http://www.autodesk.com/adn)
[Open](http://www.autodesk.com/adnopen),
[Autodesk Inc.](http://www.autodesk.com)


## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for full details.
