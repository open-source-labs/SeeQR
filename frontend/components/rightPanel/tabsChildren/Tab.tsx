import React, { Component } from "react";

type TabProps = {
    onClickTabItem: any,
    currentSchema: string,
    label: string,
};
export class Tab extends Component<TabProps> {

    render() {
        const {
            onClickTabItem,
            currentSchema,
            label,
        } = this.props;

        let className = "tab-list-item";
        if (currentSchema === label) {
            className += " tab-list-active";
        }

        return (
            <li className={className} onClick={() => onClickTabItem(label)}>
                {label}
            </li>
        );
    }
}
