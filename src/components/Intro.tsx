import * as React from 'react'

export function Intro() {
  return (
    <>
      <p>
        How many houses do we actually need per year? 50,000 a year as per RTE and the housing commission in 2023? 
        62,000 as reported here? 50,000 as per the housing commission in mid 2024? Or a massive 93,000 as suggested by Davy stockbrokers
        in X.
      </p>
      <p>
        We see different figures quoted in the media all the time. Some from ESRI, some from the Central Bank, some from industry bodies that could have strong conflicts of interest.
        A little variance might not seem important - they're all <strong>depressingly</strong> far
        above what's delivered regardless. But whether we fail to meet demand by 20k, or 30k definitely impacts how much 
        worse the situation will get. And personally I find it frustrating to have figures and little snapshots of info thrown at me by the media with little real context.
      </p>
      <p>
        So what I'd like to dig into is <em>what these figures mean</em>. When RTE report that "we need 60k houses a year", does that mean
        that would solve the rental crisis? Start bringing prices down? Does it mean the pent up demand of the last ten years will be met?
        Or does it just maintain the current status quo - keeping our heads barely above water (if you can say that we're not already drowning).
      </p>

      <h3>Irish housing requirement models</h3>

      <p>In 2025 alone, we see news articles quoting figures from 62,000 to 93,000 for the amount of housing required. </p>
      <p>
        The most comprehensive (and most open) projections we have come from ESRI and the Central Bank. 
        They rely primarily on a combination of three variables:
        
      </p>
      <ul className="list-disc list-inside mb-3">
        <li className="list-item">Population estimates</li>
        <li className="list-item">Obsolescence rates<br/>the rate at which old housing falls <i>out</i> of the market</li>
        <li>Headship rates<br/> - another way of measuring household sizes, while accounting for changing demographics</li>
      </ul>

      <p>
        Headship rates are considered the <strong>target</strong>, i.e. when we say X houses are needed per year, that's to reach or maintain specific headship rates, so they're worth understanding.
      </p>
      <p>
        They represent the number of people who're considered the head of a household. If one out of every four 25-29 year-olds is the head of a house (main-tenant or owner), then 24-29 year-olds have a headship rate of 0.25.
      </p>
      <p>
        Headship rates per age group are more useful than overall household size, because they let us account for changing demographics. 
        The headship rate for children is almost zero, and as people move through different stages of life it changes significantly.
      </p>
      <p>
      If we have a very young population, and know that in five years' time we will have an increased number of 20-24 year-olds, 
      we can project the amount of housing required for that cohort based on their current headship rates. 
      </p>
    </>
  )
}