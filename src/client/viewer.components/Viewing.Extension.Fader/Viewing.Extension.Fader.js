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

    var floor_mesh = fragIds.map((fragId) => {
      return this.viewer.impl.getFragmentProxy(this.viewer.model, fragId)
    })
    console.log(floor_mesh)

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
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  FaderExtension.ExtensionId,
  FaderExtension)

module.exports = 'Viewing.Extension.FaderExtension'
