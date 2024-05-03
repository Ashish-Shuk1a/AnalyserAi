import React from 'react'
import {ResponsivePie} from "@nivo/pie"
const V4 = () => {
  return (

    <div className='border shadow-xl'>
        <h1 className='font-bold ml-2'>Sentiment Analysis Data</h1> 
        <div >
        <LabelledpieChart className="w-full h-[200px]" />
            </div></div>
  )
}

export default V4

function LabelledpieChart(props) {
    return (
      <div {...props}>

        <ResponsivePie
          data={[
            { id: "Positive", value: 111 },
            { id: "Negative", value: 157 },
            { id: "None", value: 15 },
          ]}
          sortByValue
          margin={{ top: 30, right: 50, bottom: 30, left: 50 }}
          innerRadius={0.5}
          padAngle={1}
          cornerRadius={3}
          activeOuterRadiusOffset={2}
          borderWidth={1}
          arcLinkLabelsThickness={1}
          enableArcLabels={false}
          colors={["#2563eb", "#f87171", "#d1d5db", "#007171", "#febe10"]}
          theme={{
            tooltip: {
              chip: {
                borderRadius: "9999px",
              },
              container: {
                fontSize: "12px",
                textTransform: "capitalize",
                borderRadius: "6px",
              },
            },
          }}
          role="application"
        />
      </div>
    );
  }