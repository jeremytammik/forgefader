# ForgeFader

A Forge viewer extension to calculate and display signal attenuation caused by distance and obstacles in a building model with a floor plan containing walls.

It implements a functionality similar to [RvtFader](https://github.com/jeremytammik/RvtFader):

Two signal attenuation values in decibels are defined in the application settings:

- Attenuation per metre in air
- Attenuation by a wall

Given a source point, calculate the attenuation in a widening circle around it and display that as a heat map.

This app is based on Philippe Leefsma's [Forge React boilerplate sample](https://github.com/Autodesk-Forge/forge-react-boiler.nodejs).

Please refer to that for more details on the underlying architecture and components used.


## Running the sample

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


## Loading custom models in the Forge Viewer

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

[http://localhost:3000/viewer?urn=YOUR_URN_HERE](http://localhost:3000/viewer?urn=YOUR_DESIGN_URN_HERE)


## Deploy to Heroku

Use your **Forge ClientId & ClientSecret** obtained while
[Creating a new Forge App](https://developer.autodesk.com/myapps/create)

And Press Deploy button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Wait for a while once the Heroku App has been deployed as the client needs to be built **after the first run**

## More about Autodesk Forge Platform and Web Applications of the future?

Check it out at [https://developer.autodesk.com](https://developer.autodesk.com).
Look at our [Quickstarts guide](https://developer.autodesk.com/en/docs/quickstarts/v1/overview/)
to find the Forge SDK's for the programming language of your choice

## About the Author

[https://twitter.com/F3lipek](https://twitter.com/F3lipek)


