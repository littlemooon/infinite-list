import React, { Component, PropTypes } from 'react'
import shouldPureComponentUpdate from 'utils/shouldPureComponentUpdate'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'
import { OrderedMap } from 'immutable'

import * as leadActions from 'actions/lead-actions'
import * as tagActions from 'actions/tag-actions'

import { InfiniteList, Loader } from 'components/_base'
import { LeadsListItem } from 'components/leads'

import 'styles/leadsList.scss'

@connect(
  state => ({
    activeLead: state.activeLead,
    leads: state.leads.get('list'),
    loaded: state.apiStatus.get('leads').loaded,
    tags: state.tags,
  })
)

export default class LeadsList extends Component {

  static propTypes = {
    activeLead: PropTypes.object,
    checkedLeads: PropTypes.object.isRequired,
    columnWidths: PropTypes.object.isRequired,
    columns: PropTypes.object.isRequired,
    leadActions: PropTypes.object.isRequired,
    leads: PropTypes.instanceOf(OrderedMap).isRequired,
    leadsSort: PropTypes.object.isRequired,
    listWidth: PropTypes.number.isRequired,
    loaded: PropTypes.bool,
    tagActions: PropTypes.object.isRequired,
    tags: PropTypes.instanceOf(OrderedMap).isRequired,
  }

  componentWillMount() {
    const { leadActions, tagActions } = this.props
    leadActions.fetchLeads()
    tagActions.fetchTags()
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  componentWillUpdate(nextProps) {
    this.fetchLeads(nextProps)
    this.scrollTop(nextProps)
  }

  scrollTop(nextProps) {
    const { columns, leadsSort } = this.props
    const columnsChanged = nextProps.columns !== columns
    const sortChanged = nextProps.leadsSort !== leadsSort
    if (columnsChanged || sortChanged) this.refs.list.scrollToTop()
  }

  fetchLeads(nextProps) {
    const { leadActions, leadsSort, leads } = this.props

    const hasChanges = leadsSort !== nextProps.leadsSort
    if (hasChanges) leadActions.fetchLeads()
  }

  loadMoreData = () => this.props.leadActions.fetchMoreLeads()

  onItemClick = (lead) => {
    const { activeLead, leadActions } = this.props
    const isActive = lead.id === (activeLead && activeLead.id)

    if (isActive) {
      leadActions.setActiveLead(null)
    } else {
      leadActions.setActiveLead(lead)
    }
  }

  renderList() {
    const { leadActions, columns, checkedLeads, listWidth,
      activeLead, leads, tagActions, columnWidths, tags } = this.props

    const isActive = x => activeLead && activeLead.id === x

    const itemProps = {
      isActive,
      checkedLeads,
      columns,
      columnWidths,
      onClick: this.onItemClick,
      selectTag: tagActions.selectTag,
      removeTagFromLead: leadActions.removeTagFromLead,
      toggleCheckedLead: leadActions.toggleCheckedLead,
      tags,
    }

    return (
      <InfiniteList
        ref='list'
        itemComponent={LeadsListItem}
        itemHeight={44}
        itemProps={itemProps}
        itemsData={leads}
        listClassName='leads__list__infinite'
        listWidth={listWidth}
        onEndList={this.loadMoreData}
      />
    )
  }

  render() {
    const { loaded } = this.props
    return loaded ? this.renderList() : <Loader large/>
  }
}
