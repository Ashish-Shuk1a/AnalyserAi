import { ResponsivePie } from "@nivo/pie";
import { useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import V4 from "./V4";
import V2 from "./V2";

export default function V1() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataloaded, setDataloaded] = useState(true);
  const [obj, setObj] = useState({
    avg_rating: 2.22,
    csat_rate: 22.22,
    rating_counts: [{ 1: 9 }, { 2: 4 }, { 3: 1 }, { 4: 0 }, { 5: 4 }],
    rating_trend: [
      ["2023-06-08", 5.0],
      ["2023-06-18", 2.0],
      ["2023-06-23", 5.0],
      ["2023-07-04", 2.0],
      ["2023-07-13", 1.0],
      ["2023-07-19", 5.0],
      ["2023-07-25", 1.0],
      ["2023-08-03", 1.0],
      ["2023-08-05", 2.0],
      ["2023-09-07", 2.0],
      ["2023-09-12", 1.0],
      ["2023-09-20", 1.0],
      ["2023-10-01", 1.0],
      ["2023-10-12", 5.0],
      ["2023-10-30", 1.0],
      ["2023-11-14", 3.0],
      ["2023-11-26", 1.0],
      ["2024-02-15", 1.0],
    ],
    total_reviews: 18,
    total_verified_count: 11,
  });
  const fetchData = () => {
    setLoading(true);
    setDataloaded(false);

    let data = JSON.stringify({
      url: url,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://djsanghvi.pythonanywhere.com/scrape",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(response.data);
        setObj(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };
  return (
    <div className="  my-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Analyser.ai
      </h1>
      <div className="flex gap-4 mb-4 first-letter justify-center">
        <input
          placeholder="Enter product URL..."
          className="border-2 shadow-md rounded-lg ml-3"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          variant="outline "
          onClick={fetchData}
          className="bg-black text-white p-2 rounded-lg"
        >
          Search
        </button>
      </div>
      <div className="flex gap-4 mb-4 justify-center">
        <span>Source: Amazon</span>
        {/* <button className="flex items-center" variant="ghost">
          <DownloadIcon className="w-5 h-5 mr-2" />
          Download{"\n          "}
        </button>
        <button className="flex items-center" variant="ghost">
          <UploadIcon className="w-5 h-5 mr-2" />
          Upload{"\n          "}
        </button> */}
        {/* <button variant="ghost">Filters</button>
        <button variant="ghost">All Time</button> */}
      </div>
      {url === "" || dataloaded ? null : loading ? (
        <Loader />

      ): (
        <>
        
        
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="w-full p-3 border-2 rounded-lg shadow-md ">
          <div>
            <div>Total Reviews</div>
          </div>
          <div>
            <p className="text-4xl font-bold">{obj.total_reviews}</p>
            <p className="text-sm text-gray-500">Previous Period</p>
          </div>
        </div>
        <div className="w-full p-3 border-2 rounded-lg shadow-md">
          <div>
            <div>Average Review Rating</div>
          </div>
          <div>
            <p className="text-2xl font-bold">{obj.avg_rating}</p>
          </div>
        </div>
        <div className="w-full p-3 border-2 rounded-lg shadow-md">
          <div>
            <div>CSAT rating</div>
          </div>
          <div>
            <p className="text-2xl font-bold">{obj.csat_rate}</p>
          </div>
        </div>
      </div>

      {/* <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PRODUCTS</TableHead>
            <TableHead>CHANNEL</TableHead>
            <TableHead>RECORDS</TableHead>
            <TableHead>AVER</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              Samsung Wired Headset Earphone for 3.5mm Jack - White
            </TableCell>
            <TableCell>Amazon US</TableCell>
            <TableCell>100</TableCell>
            <TableCell>
              <div className="flex items-center">
                3
                <StarIcon className="w-4 h-4 ml-1 text-yellow-400" />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table> */}

      <LabelledpieChart obj={obj} className="w-full h-[200px]" />
      <V4/>
      <V2/>
      </>
      )}
    </div>
  );
}

function LabelledpieChart({ className, obj }) {
  return (
    <div className={className}>
      <ResponsivePie
        data={obj.rating_counts.map((rating) => {
          const [key, value] = Object.entries(rating)[0]; // Destructure key and value
          return { id: key, value }; // Return object with id and value
        })}
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

function DownloadIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function MessageCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}

function StarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UploadIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
