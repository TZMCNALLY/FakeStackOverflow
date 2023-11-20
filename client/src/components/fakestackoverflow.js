import { createContext, useEffect, useState } from 'react';
import * as Global from './global.js';
import Body from './body.js';
import Model from '../models/model.js';
import * as Constants from '../constants'
import axios from 'axios'

export const model = new Model(); // Create a singleton representing the model that all files will modify and query from.

export const QuestionsInfo = createContext();

export default function FakeStackOverflow() {
  const [currPage, setCurrPage] = useState(Constants.QUESTIONS_PAGE);
  const [currFilter, setCurrFilter] = useState(Constants.NEWEST_FILTER);
  const [currDisplayedQuestions, setDisplayedQuestions] = useState([]) // For Questions Page
  const [numQuestions, setNumQuestions] = useState(currDisplayedQuestions.length);
  const [typeResults, setTypeResults] = useState("All Questions");
  const [currDisplayedQuestion, setDisplayedQuestion] = useState([model.get]) // For See Answers Page

  /*
    By using useEffect, the GET request for questions will always be done after every rendering.
    So, since it's initially set to an empty array, it'll render no questions, but the effect
    will go through, rendering the newest questions last :) - Torin
  */
    useEffect(() => {

      // Define the requests to make based on the current filter to be applied
      const getNewestQuestions = async () => {
          await axios.get('http://localhost:8000/newestQuestions')
          .then(res => {
            const questions = res.data;
            setDisplayedQuestions(questions);
            setNumQuestions(questions.length)
          })
      }

      const getActiveQuestions = async () => {
        await axios.get('http://localhost:8000/activeQuestions')
          .then(res => {
            const questions = res.data;
            setDisplayedQuestions(questions);
            setNumQuestions(questions.length)
          })
      }

      const getUnansweredQuestions = async () => {
        await axios.get('http://localhost:8000/unansweredQuestions')
          .then(res => {
            const questions = res.data;
            setDisplayedQuestions(questions);
            setNumQuestions(questions.length)
          })
      }

      switch(currFilter) {
        case Constants.NEWEST_FILTER:
          if(currPage !== Constants.TAGS_PAGE) getNewestQuestions()
          break;

        case Constants.ACTIVE_FILTER:
          getActiveQuestions()
          break;

        case Constants.UNANSWERED_FILTER:
          getUnansweredQuestions()
          break;

        default:
      }
    }, [currFilter, currPage])

  return (
    <>
        <QuestionsInfo.Provider value = {
          {
            currPage,
            setCurrPage, 
            currFilter,
            setCurrFilter,
            currDisplayedQuestions,
            setDisplayedQuestions,
            numQuestions,
            setNumQuestions,
            typeResults,
            setTypeResults,
            currDisplayedQuestion,
            setDisplayedQuestion
          }
        }>
          <div id="header" className="header">
            <Global.FakeSoTitle />
            <Global.SearchBar />
          </div>
          <Body />
        </QuestionsInfo.Provider>
    </>
  );
}
