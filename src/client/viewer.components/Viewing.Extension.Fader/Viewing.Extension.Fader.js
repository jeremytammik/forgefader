/////////////////////////////////////////////////////////////////
// Configurator Extension
// By Philippe Leefsma, February 2016
//
/////////////////////////////////////////////////////////////////

import ExtensionBase from 'Viewer.ExtensionBase'
import EventTool from 'Viewer.EventTool'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'


class FaderExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onGeometryLoaded = this.onGeometryLoaded.bind(this)

    this.onSelection = this.onSelection.bind(this)
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.eventTool = new EventTool(this.viewer)

    this.eventTool.activate()

    this.eventTool.on('singleclick', (event) => {

      this.pointer = event
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.viewer.addEventListener(
      //Autodesk.Viewing.GEOMETRY_LOADED_EVENT, // non-Revit
      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, // Revit
      () => this.onGeometryLoaded())

    // this.viewer.setProgressiveRendering(true)
    // this.viewer.setQualityLevel(false, true)
    // this.viewer.setGroundReflection(false)
    // this.viewer.setGroundShadow(false)
    // this.viewer.setLightPreset(1)

    console.log('Viewing.Extension.Fader')

    //this.wallIds=[] // initialise in onGeometryLoaded

    _lineMaterial = createLineMaterial();

    _vertexMaterial = createVertexMaterial();

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Fader'
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.viewer.removeEventListener(
      //Autodesk.Viewing.GEOMETRY_LOADED_EVENT, // non-Revit
      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, // Revit
      this.onGeometryLoaded)

    return true
  }

  /////////////////////////////////////////////////////////////////
  // onGeometryLoaded - retrieve all wall meshes
  //
  /////////////////////////////////////////////////////////////////
  onGeometryLoaded (event) {
    console.log('onGeometryLoaded')
    const instanceTree = this.viewer.model.getData().instanceTree
    var rootId = instanceTree.getRootId()
    instanceTree.enumNodeChildren(rootId, async(childId) => {
      const nodeName = instanceTree.getNodeName(childId)
      if (nodeName === 'Walls') {

        const fragIds = await Toolkit.getFragIds(this.viewer.model, childId)

        console.log(fragIds)

        this.wallProxies = fragIds.map((fragId) => {

          return this.viewer.impl.getFragmentProxy(this.viewer.model, fragId)
        })
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSelection (event) {

    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

      const dbIds = selection.dbIdArray

      const data = this.viewer.clientToWorld(
        this.pointer.canvasX,
        this.pointer.canvasY,
        true)

      this.attenuationCalculator(data)
    }
  }

  /////////////////////////////////////////////////////////////////
  // attenuationCalculator - given a picked source point on a face
  //
  // determine face shape
  // draw a heat map on it
  // initially, just use distance from source to target point
  // later, add number of walls intersected by ray between them
  /////////////////////////////////////////////////////////////////
  async attenuationCalculator(data)
  {
    console.log(data)

    // from the selected THREE.Face, extract the normal

    var floor_normal = data.face.normal
    console.log(floor_normal)

    // find all the other floor fragments with the same normal

    var instanceTree = this.viewer.model.getData().instanceTree
    console.log(instanceTree)
    const fragIds = await Toolkit.getFragIds(this.viewer.model, data.dbId)
    console.log(fragIds)

    var floor_mesh_fragment = fragIds.map((fragId) => {
      return this.viewer.impl.getFragmentProxy(this.viewer.model, fragId)
    })
    console.log(floor_mesh_fragment)

    // in Philippe's Autodesk.ADN.Viewing.Extension.MeshData.js
    // function drawMeshData, the fragment proxy is ignored and 
    // the render proxy is used instead:

    var floor_mesh_render = fragIds.map((fragId) => {
      return this.viewer.impl.getRenderProxy(this.viewer.model, fragId)
    })
    console.log(floor_mesh_render)

    floor_mesh_render = floor_mesh_render[0]

    var matrix = floor_mesh_render.matrixWorld;

    var geometry = floor_mesh_render.geometry;

    //not working
    //geometry.applyMatrix(matrix);

    var attributes = geometry.attributes;

    var vA = new THREE.Vector3();
    var vB = new THREE.Vector3();
    var vC = new THREE.Vector3();

    if (attributes.index !== undefined) {

      var indices = attributes.index.array || geometry.ib;
      var positions = geometry.vb ? geometry.vb : attributes.position.array;
      var stride = geometry.vb ? geometry.vbstride : 3;
      var offsets = geometry.offsets;

      if (!offsets || offsets.length === 0) {

        offsets = [{start: 0, count: indices.length, index: 0}];
      }

      for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {

        var start = offsets[oi].start;
        var count = offsets[oi].count;
        var index = offsets[oi].index;

        for (var i = start, il = start + count; i < il; i += 3) {

          var a = index + indices[i];
          var b = index + indices[i + 1];
          var c = index + indices[i + 2];

          vA.fromArray(positions, a * stride);
          vB.fromArray(positions, b * stride);
          vC.fromArray(positions, c * stride);

          vA.applyMatrix4(matrix);
          vB.applyMatrix4(matrix);
          vC.applyMatrix4(matrix);

          this.drawVertex (vA, 0.05);
          this.drawVertex (vB, 0.05);
          this.drawVertex (vC, 0.05);

          this.drawLine(vA, vB);
          this.drawLine(vB, vC);
          this.drawLine(vC, vA);
        }
      }
    }
    else {

      var positions = geometry.vb ? geometry.vb : attributes.position.array;
      var stride = geometry.vb ? geometry.vbstride : 3;

      for (var i = 0, j = 0, il = positions.length; i < il; i += 3, j += 9) {

        var a = i;
        var b = i + 1;
        var c = i + 2;

        vA.fromArray(positions, a * stride);
        vB.fromArray(positions, b * stride);
        vC.fromArray(positions, c * stride);

        vA.applyMatrix4(matrix);
        vB.applyMatrix4(matrix);
        vC.applyMatrix4(matrix);

        this.drawVertex (vA, 0.05);
        this.drawVertex (vB, 0.05);
        this.drawVertex (vC, 0.05);

        this.drawLine(vA, vB);
        this.drawLine(vB, vC);
        this.drawLine(vC, vA);
      }
    }    

    // from floor mesh, access all faces and use only those wwith the same normal

    if(0){
      // code from setMaterial function in michael ge's Using Shaders to Generate Dynamic Textures in the Viewer API
      // https://forge.autodesk.com/cloud_and_mobile/2016/07/using-shaders-to-generate-dynamic-textures.html
      var material = new THREE.ShaderMaterial({
        uniforms: eval('('+uniformDocument.getValue()+')'),
        vertexShader: vertexDocument.getValue(),
        fragmentShader: fragmentDocument.getValue(),
        side: THREE.DoubleSide
      });

      viewer.impl.matman().removeMaterial("shaderMaterial");
      viewer.impl.matman().addMaterial("shaderMaterial", material, true);
      viewer.model.getFragmentList().setMaterial(floor_mesh, material);
      viewer.impl.invalidate(true);
    }
  }


  ///////////////////////////////////////////////////////////////////////////
  // vertex material
  //
  ///////////////////////////////////////////////////////////////////////////
  createVertexMaterial() {

    var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    viewer.impl.matman().addMaterial(
      'adn-material-vertex',
      material,
      true);

    return material;
  }

  ///////////////////////////////////////////////////////////////////////////
  // line material
  //
  ///////////////////////////////////////////////////////////////////////////
  createLineMaterial() {

    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
      linewidth: 2
    });

    viewer.impl.matman().addMaterial(
      'adn-material-line',
      material,
      true);

    return material;
  }

  ///////////////////////////////////////////////////////////////////////////
  // draw a line
  //
  ///////////////////////////////////////////////////////////////////////////
  drawLine(start, end) {

    var geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(
      start.x, start.y, start.z));

    geometry.vertices.push(new THREE.Vector3(
      end.x, end.y, end.z));

    var line = new THREE.Line(geometry, this._lineMaterial);

    this.viewer.impl.scene.add(line);
  }

  ///////////////////////////////////////////////////////////////////////////
  // draw a vertex
  //
  ///////////////////////////////////////////////////////////////////////////
  drawVertex (v, radius) {

    var vertex = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 20),
      this._vertexMaterial);

    vertex.position.set(v.x, v.y, v.z);

    this.viewer.impl.scene.add(vertex);
  }  
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  FaderExtension.ExtensionId,
  FaderExtension)

module.exports = 'Viewing.Extension.FaderExtension'
