import Lottie from "lottie-react";
import Animation_fetch from "../Animation_fetch.json"
import React from 'react'
import TextTransition, { presets } from 'react-text-transition';
const Loader = () => {
  const TEXTS = [
    "Analyzing reviews... This might take a few moments as we gather insights from a vast amount of data.",
    "Sit back and relax! We're using advanced algorithms to uncover valuable information from customer reviews.",
    "Unveiling the voice of the customer... Please wait as we process thousands of opinions.",
    "Getting ready to deliver key takeaways from the reviews. Stay tuned!",
    "Patience is a virtue! The wait will be worth it as we reveal hidden trends and patterns.",
  ];

    
      const [index, setIndex] = React.useState(0);
    
      React.useEffect(() => {
        const intervalId = setInterval(
          () => setIndex((index) => index + 1),
          3000, // every 3 seconds
        );
        return () => clearTimeout(intervalId);
    }, []);
  

  return (
    
    <div >

        <Lottie animationData={Animation_fetch} className="h-[50px] w-[50px]"/>
        <h1 className="p-10 text-cente">
      <TextTransition className="flex justify-center text-center " springConfig={presets.wobbly}>{TEXTS[index % TEXTS.length]}</TextTransition>
    </h1>
    </div>
  )
}

export default Loader