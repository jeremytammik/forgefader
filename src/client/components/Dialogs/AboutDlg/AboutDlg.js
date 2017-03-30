import React, { PropTypes } from 'react'
import Modal from 'react-modal'
import './AboutDlg.scss'

export default class AboutDlg extends React.Component {

  constructor() {
    super()
  }

  close () {
    this.props.close()
  }

  render() {
    const style = {
      overlay: {
        backgroundColor: 'rgba(201, 201, 201, 0.50)'
      }
    }
    return (
      <div>
        <Modal className="dialog about"
          contentLabel=""
          style={style}
          isOpen={this.props.open}
          onRequestClose={() => {this.close()}}>

          <div className="title">
            <img/>
            <b>About ForgeFader...</b>
          </div>

          <div className="content">
             <div>
               Written by Jeremy Tammik
               <br/>
               <a href="http://thebuildingcoder.typepad.com" target="_blank">
               The Building Coder
               </a>
               &nbsp;- March 2017
               <br/>
               <br/>
               Source on github:
               <br/>
               <a href="https://github.com/jeremytammik/forgefader" target="_blank">
               Forge React Boiler
               </a>
             </div>
          </div>
        </Modal>
      </div>
    )
  }
}
