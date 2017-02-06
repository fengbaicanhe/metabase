/* @flow */

import React, { Component, PropTypes } from "react";

import { MinRowsError, ChartSettingsError } from "metabase/visualizations/lib/errors";

import { formatValue } from "metabase/lib/formatting";
import { getSettings } from "metabase/lib/visualization_settings";

import FunnelNormal from "./components/FunnelNormal";
import FunnelBar from "./components/FunnelBar";
import LegendHeader from "./components/LegendHeader";

import _ from "underscore";
import cx from "classnames";

import type { VisualizationProps } from ".";

export default class Funnel extends Component<*, VisualizationProps, *> {
    static uiName = "Funnel";
    static identifier = "funnel";
    static iconName = "funnel";

    static noHeader = true;

    static minSize = {
        width: 5,
        height: 4
    };

    static isSensible(cols, rows) {
        return cols.length === 2;
    }

    static checkRenderable(cols, rows, settings) {
        if (rows.length < 1) { throw new MinRowsError(1, rows.length); }
        if ((rows.length > 1 || cols.length > 2) && (!settings["funnel.dimension"] || !settings["funnel.metric"])) {
            throw new ChartSettingsError("Which fields do you want to use for the X and Y axes?", "Data", "Choose fields");
        }
    }

    static transformSeries(series) {
        let [{ card, data: { rows, cols }}] = series;
        if (!card._transformed && series.length === 1 && rows.length > 1) {
            const settings = getSettings(series);
            const dimensionIndex = _.findIndex(cols, (col) => col.name === settings["funnel.dimension"]);
            const metricIndex = _.findIndex(cols, (col) => col.name === settings["funnel.metric"]);
            return rows.map(row => ({
                card: {
                    ...card,
                    name: formatValue(row[dimensionIndex], { column: cols[dimensionIndex] }),
                    _transformed: true
                },
                data: {
                    rows: [[row[dimensionIndex], row[metricIndex]]],
                    cols: [cols[dimensionIndex], cols[metricIndex]]
                }
            }));
        } else {
            return series;
        }
    }

    render() {
        const { settings } = this.props;

        if (settings["funnel.type"] === "bar") {
            return <FunnelBar {...this.props} />
        } else {
            const { actionButtons, className, linkToCard, series } = this.props;
            return (
                <div className={cx(className, "flex flex-column p1")}>
                    <LegendHeader
                        className="flex-no-shrink"
                        series={series._raw || series}
                        actionButtons={actionButtons}
                        linkToCard={linkToCard}
                    />
                    <FunnelNormal {...this.props} className="flex-full" />
                </div>
            )
        }
    }
}
