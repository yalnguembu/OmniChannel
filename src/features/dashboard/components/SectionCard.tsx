// import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
// const data = [{ name: "Page A", uv: 400, pv: 2400, amt: 2400 }]

// export const SectionCards = () => (
//   <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
//     <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
//     <Line type="monotone" dataKey="uv" stroke="purple" strokeWidth={2} name="My data series name" />
//     <XAxis dataKey="name" />
//     <YAxis width={600} label={{ value: "UV", position: "insideLeft", angle: -90 }} />
//     <Legend align="right" />
//   </LineChart>
// )
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie } from "recharts"
const data = [{ name: "Page A", uv: 400, pv: 2400, amt: 2400 }]
const data01 = [
  {
    name: "Group A",
    value: 400,
  },
  {
    name: "Group B",
    value: 300,
  },
  {
    name: "Group C",
    value: 300,
  },
  {
    name: "Group D",
    value: 200,
  },
  {
    name: "Group E",
    value: 278,
  },
  {
    name: "Group F",
    value: 189,
  },
]
const data02 = [
  {
    name: "Group A",
    value: 2400,
  },
  {
    name: "Group B",
    value: 4567,
  },
  {
    name: "Group C",
    value: 1398,
  },
  {
    name: "Group D",
    value: 9800,
  },
  {
    name: "Group E",
    value: 3908,
  },
  {
    name: "Group F",
    value: 4800,
  },
]

export const SectionCards = () => (
  <PieChart width={730} height={250}>
    {/* <Pie data={data01} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" /> */}
    <Pie data={data02} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" label />
  </PieChart>
)
// export default MyChart
