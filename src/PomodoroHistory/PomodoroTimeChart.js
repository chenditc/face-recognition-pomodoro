import { formatSeconds, PomodoroCard} from "./PomodoroTimeCard";
import {renderToString} from 'react-dom/server';
import React from "react";
import { useI18n } from "../i18n";

const Chart = React.lazy(() => import("react-apexcharts"));

function PomodoroHistoryTimeChart(props) {
    const { locale, t } = useI18n();
    const mergedTimeTable = props.mergedTimeTable.filter(
        (timeSlot) => (new Date(timeSlot.startTime).toDateString() === new Date().toDateString())
    )
    const focusTime = mergedTimeTable.filter((x) => x.detected).reduce((total, curr) => {
        return total + curr.timePeriod;
    } ,0)
    const chartSessionName = t('history.totalFocus', { duration: formatSeconds(focusTime, false, locale) })

    const options = {
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "100%"
            },
        },
        colors : [
            "#b0003a"
        ],
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false
            }
        },
        tooltip: {
            custom: function(opts) {
              const timeSlotInfo = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].info;
              const pomoCard = <PomodoroCard record={timeSlotInfo} locale={locale} t={t} />
              return renderToString(pomoCard)
            }
        },
    };

    const dataSeries = mergedTimeTable.map(
        (timeSlot) => {
            return {
            x: chartSessionName,
            y: [
              new Date(timeSlot.startTime).getTime(),
              new Date(timeSlot.endTime).getTime()
            ],
            info: timeSlot
          }
        }
    )

    const focusSession = dataSeries.filter((data) => data.info.detected);

    const series = [
        {
          name: t('history.focusSeriesName'),
          data: focusSession,
        }
    ];

    return (
        <Chart options={options} series={series} type="rangeBar" height={100} />
    )
}

export default PomodoroHistoryTimeChart;
