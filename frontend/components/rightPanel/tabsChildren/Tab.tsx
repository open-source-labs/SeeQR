import React, { Component } from "react";
import PropTypes from "prop-types";

type TabProps = {
    onClickTabItem: any,
    activeTab: string,
    label: string,
};
export class Tab extends Component<TabProps> {

    render() {
        const {
            onClickTabItem,
            activeTab,
            label,
        } = this.props;

        let className = "tab-list-item";

        if (activeTab === label) {
            className += " tab-list-active";
        }

        return (
            <li className={className} onClick={() => onClickTabItem(label)}>
                {label}
            </li>
        );
    }
}
