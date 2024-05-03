import React from 'react'
import Wordcloud from './Wordcloud'

const V2 = () => {
  return (
    <div className="w-full mt-3  border rounded-xl p-3 flex flex-col  justify-center items-center shadow-xl ">
        <h1 className="text-xl font-bold items-start w-full ml-9">
          Word Cloud{" "}
        </h1>
        <Wordcloud />
      </div>
  )
}

export default V2