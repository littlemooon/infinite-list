import React, { Component, PropTypes } from 'react'
import shouldPureComponentUpdate from 'utils/shouldPureComponentUpdate'
import { OrderedMap } from 'immutable'
import classnames from 'classnames'

import { throttle } from 'utils/throttle'

import { InfiniteListItem, Loader } from 'components/_base'

export default class InfiniteList extends Component {

  static propTypes = {
    // the component to render for each in data
    itemComponent: PropTypes.func.isRequired,
    // height of each item
    itemHeight: PropTypes.number,
    // margin between each item
    itemMargin: PropTypes.number,
    // props to pass to each item along with the data
    itemProps: PropTypes.object,
    // array of item specific props
    itemsData: PropTypes.instanceOf(OrderedMap).isRequired,
    // number of items in total if known
    itemsTotal: PropTypes.number,
    // additional class for list
    listClassName: PropTypes.string,
    // width of list required for correct rendering
    listWidth: PropTypes.number.isRequired,
    // the number of pixels from the end to call onEndList
    onEndBuffer: PropTypes.number,
    // called when approaching the end of the list
    onEndList: PropTypes.func,
    // the number of pixels rendered above and below the visible area
    viewBuffer: PropTypes.number,
  }

  static defaultProps = {
    itemHeight: 44,
    itemMargin: 0,
    itemProps: {},
    itemsTotal: null,
    listClassName: '',
    onEndBuffer: 600,
    onEndList: () => {},
    viewBuffer: 3000,
  }

  state = {
    containerHeight: 1000,
    loaderHeight: 120,
    scrollTop: 0,
  }

  componentDidMount() {
    const node = this.getScrollableAncestor()
    node.addEventListener('scroll', this.throttledOnScroll(node))
    global.addEventListener('resize', this.onResize())

    requestAnimationFrame(this.updateContainerHeight)
    this.mounted = true
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  componentWillUnmount() {
    const node = this.getScrollableAncestor()
    node.removeEventListener('scroll', this.throttledOnScroll(node))
    global.removeEventListener('resize', this.onResize())
    this.mounted = false
  }

  updateContainerHeight = () => {
    if (!this.mounted) return
    const listNode = this.refs.list
    const height = listNode && listNode.parentNode.offsetHeight
    this.setState({containerHeight: height})
  }

  scrollToTop() {
    this.getScrollableAncestor().scrollTop = 0
  }

  atEndOfData() {
    const { itemsData, itemsTotal } = this.props
    return itemsData.size === itemsTotal
  }

  throttledOnScroll(node) {
    return throttle(this.onScroll(node), 100)
  }

  isInView(distanceFromTop) {
    const { viewBuffer } = this.props
    const { scrollTop, containerHeight } = this.state

    const belowTop = distanceFromTop >= (scrollTop - viewBuffer)
    const aboveBottom = distanceFromTop < (scrollTop + containerHeight + viewBuffer)

    return belowTop && aboveBottom
  }

  getScrollableAncestor() {
    let node = this.refs.list
    while (node.parentNode) {
      node = node.parentNode
      if (node === document) continue
      if (node === document.documentElement) continue

      const style = window.getComputedStyle(node)
      const overflowY = style.getPropertyValue('overflow-y') || style.getPropertyValue('overflow')

      if (overflowY === 'auto' || overflowY === 'scroll') return node
    }
    return window
  }

  getListHeight() {
    const { itemHeight, itemsData, itemMargin } = this.props
    const { loaderHeight } = this.state
    const listHeight = itemsData.size * (itemHeight + itemMargin)
    return listHeight + loaderHeight
  }

  onResize = () => {
    return throttle(() => this.updateContainerHeight(), 100)
  }

  onScroll = node => () => {
    const { containerHeight } = this.state
    const { onEndList, onEndBuffer } = this.props

    const scrollTop = node.scrollTop

    const nearEnd = this.getListHeight() - containerHeight - scrollTop < onEndBuffer

    this.setState({scrollTop})
    if (nearEnd && !this.atEndOfData()) onEndList()
  }

  renderItems() {
    const { itemsData, itemMargin, itemHeight } = this.props

    let accumulatedHeight = -itemHeight
    let i = -1

    const items = itemsData.map(item => {
      accumulatedHeight = accumulatedHeight + itemMargin
      const isInView = this.isInView(accumulatedHeight)

      accumulatedHeight = accumulatedHeight + itemHeight
      i = i + 1
      if (isInView) {
        return this.renderItem({
          positionInArray : i,
          item,
          distanceFromTop: accumulatedHeight,
        })
      }
    }).toList()

    return [...items, this.renderLoader(accumulatedHeight)]
  }

  renderItem({positionInArray, item, distanceFromTop}) {
    const { itemHeight, itemComponent, itemProps } = this.props
    const ItemComponent = itemComponent

    return (
      <InfiniteListItem
        key={positionInArray}
        distanceFromTop={distanceFromTop}
        height={itemHeight}>
        <ItemComponent data={item} positionInArray={positionInArray} {...itemProps}/>
      </InfiniteListItem>
    )
  }

  renderLoader(distanceFromTop) {
    const { itemMargin, itemHeight } = this.props
    const { loaderHeight } = this.state

    return !this.atEndOfData() && (
      <InfiniteListItem
        key='loader'
        distanceFromTop={distanceFromTop + itemHeight + itemMargin}
        height={loaderHeight}>
        <Loader/>
      </InfiniteListItem>
    )
  }

  render() {
    const { listClassName, listWidth } = this.props

    const style = {
      width: listWidth || 0,
    }

    const classes = classnames(listClassName, {
      'infinite-list': true,
    })

    return (
      <div
        ref='list'
        style={style}
        className={classes}>
        {this.renderItems()}
      </div>
    )
  }
}
