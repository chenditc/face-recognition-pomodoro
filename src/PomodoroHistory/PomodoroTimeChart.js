import Chart from "react-apexcharts";
import {PomodoroCard} from "./PomodoroTimeCard";
import {renderToString} from 'react-dom/server'

function PomodoroHistoryTimeChart(props) {
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
              const pomoCard = <PomodoroCard record={timeSlotInfo} />
              return renderToString(pomoCard)
            }
        },
    };

    const dataSeries = props.mergedTimeTable.filter(
        (timeSlot) => (new Date(timeSlot.startTime).toDateString() === new Date().toDateString())
    ).map(
        (timeSlot) => {
            return {
            x: "Time Line",
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
          name: "focus",
          data: focusSession,
        }
    ];

    return (
        <Chart options={options} series={series} type="rangeBar" height={100} />
    )
}

export default PomodoroHistoryTimeChart;