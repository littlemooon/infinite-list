import React, { Component, PropTypes } from 'react'
import shouldPureComponentUpdate from 'utils/shouldPureComponentUpdate'

import 'styles/infinite.scss'

export default class InfiniteListItem extends Component {

  static propTypes = {
    distanceFromTop: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  render() {
    const { children, height, distanceFromTop } = this.props

    const style = {
      transform: `translate(0px, ${distanceFromTop}px)`,
      height,
    }

    return (
      <div style={style} className='infinite-list__item'>
        {children}
      </div>
    )
  }
}
