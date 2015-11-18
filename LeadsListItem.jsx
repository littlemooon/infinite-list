import React, { Component, PropTypes } from 'react'
import shouldPureComponentUpdate from 'utils/shouldPureComponentUpdate'
import { Record, OrderedMap } from 'immutable'
import classnames from 'classnames'

import { Cell, CellScore, CellDate, CellTags, CellTime,
  CellInterests, CellCheckbox, CellNumber } from 'components/cells'

import 'styles/leadsListItem.scss'

export default class LeadsListItem extends Component {

  static propTypes = {
    checkedLeads: PropTypes.object.isRequired,
    columnWidths: PropTypes.object.isRequired,
    columns: PropTypes.object.isRequired,
    data: PropTypes.instanceOf(Record).isRequired,
    isActive: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    positionInArray: PropTypes.number,
    removeTagFromLead: PropTypes.func.isRequired,
    selectTag: PropTypes.func.isRequired,
    tags: PropTypes.instanceOf(OrderedMap).isRequired,
    toggleCheckedLead: PropTypes.func.isRequired,
  }

  static defaultProps = {
    positionInArray: 0,
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  handleCheckbox = () => {
    const { toggleCheckedLead, data } = this.props
    toggleCheckedLead({id: data.id})
  }

  handleClick = (e) => {
    e && e.stopPropagation()
    const { data, onClick } = this.props
    onClick(data)
  }

  isChecked(itemId) {
    const { allChecked, hasBeenAllChecked, checkList, exceptionsList } = this.props.checkedLeads
    const checked = allChecked || hasBeenAllChecked || checkList.includes(itemId)
    const inExceptionList = exceptionsList.includes(itemId)

    return checked && !inExceptionList
  }

  isVisible = id => this.props.columns.get(id)

  isActive() {
    const { isActive, data } = this.props
    return isActive(data.id)
  }

  renderCell(id) {
    const { columnWidths, data } = this.props
    return this.isVisible(id) && (
      <Cell
        id={id}
        width={columnWidths[id]}
        value={data[id]}
      />
    )
  }

  renderNumber(id) {
    const { columnWidths, data } = this.props
    return this.isVisible(id) && (
      <CellNumber
        id={id}
        width={columnWidths[id]}
        value={data[id]}
      />
    )
  }

  renderCheckbox() {
    const { data, columnWidths } = this.props
    return (
      <CellCheckbox
        onChange={this.handleCheckbox}
        checked={this.isChecked(data.id)}
        width={columnWidths.checkbox}
      />
    )
  }

  renderScore() {
    const { data, columnWidths } = this.props
    const id = 'score'
    return this.isVisible(id) && (
      <CellScore
        id={id}
        score={data[id]}
        isActive={this.isActive()}
        width={columnWidths[id]}
      />
    )
  }

  renderDate(id) {
    const { columnWidths, data } = this.props
    return this.isVisible(id) && (
      <CellDate
        id={id}
        date={data[id]}
        width={columnWidths[id]}
      />
    )
  }

  renderMinutes(id) {
    const { data, columnWidths } = this.props
    return this.isVisible(id) && (
      <CellTime
        id={id}
        amount={data[id]}
        width={columnWidths[id]}
      />
    )
  }

  renderTags() {
    const { data, selectTag, columnWidths, removeTagFromLead, tags } = this.props
    const id = 'tags'
    const leadTags = tags && tags.filter(t => data[id].includes(t.id))
    return this.isVisible(id) && (
      <CellTags
        id={id}
        leadId={data.id}
        leadTags={leadTags}
        removeTagFromLead={removeTagFromLead}
        selectTag={selectTag}
        width={columnWidths[id]}
      />
    )
  }

  render() {
    const { positionInArray } = this.props

    const classes = classnames({
      'leads__list__item': true,
      'leads__list__item--active': this.isActive(),
      'leads__list__item--even': positionInArray % 2 === 0
    })

    return (
      <div ref='item' className={classes} onClick={this.handleClick}>
        {this.renderCheckbox()}
        {this.renderScore()}
        {this.renderCell('name')}
        {this.renderDate('firstVisit')}
        {this.renderDate('lastVisit')}
        {this.renderNumber('visitors')}
        {this.renderNumber('visits')}
        {this.renderMinutes('duration')}
        {this.renderCell('country')}
        {this.renderTags()}
      </div>
    )
  }
}
