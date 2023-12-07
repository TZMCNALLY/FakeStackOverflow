import { useState, useEffect } from "react";
import { DateMetadata, splitArray } from "./QuestionsPage";
import { ErrorMessage } from "./PostQuestionPage";
import { Text } from "./SeeAnswers";
import axios from "axios";

let commentChunkInd = 0;

/*
    TODO:
    Fix issue: When there are multiple pages for a comments section, clicking on Next will show the next
    page of comments for a split second and then go back to the first page.
*/
export default function Comments(props) {
    let question = props.question;
    let answer = props.answer;
    const emptyFieldStr = "This field must be filled out.";
    const [comments, setComments] = useState([]);
    const [currDisplayedComments, setDisplayedComments] = useState([]);
    const [insertComment, showInsertComment] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [userInfo, setUserInfo] = useState(0);

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await axios.get('http://localhost:8000/userProfile')
            setUserInfo(userInfo.data)
        }
        getUserInfo()
    }, [])

    useEffect(() => {
        let isMounted = true;
        const getComments = async () => {
            try {
                let res;
                if(question) res = await axios.get(`http://localhost:8000/questions/${question.qid}/comments`);
                if(answer) res = await axios.get(`http://localhost:8000/answers/${answer.aid}/comments`);
                if(isMounted) {
                    setComments(res.data.reverse());
                    setDisplayedComments(res.data.slice(0, 3));
                    commentChunkInd = 0;
                }
            } catch(error) { console.log(error) }
        }
        getComments();
        return () => { isMounted = false; }
    }, [question, answer, comments])

    const handleSubmit = async (event) => {
        event.preventDefault();
        const commentText = event.target.commenttext.value.trim();
        const errors = validateForm({commentText});
        if(Object.keys(errors).length === 0) {
            try {
                event.target.reset();
                setFormErrors({});
                showInsertComment(!insertComment);
                if(question) {
                    let comment = {
                        text: commentText,
                        com_by: userInfo.username,
                        com_date_time: new Date(),
                        votes: 0,
                        qid: question.qid
                    }
                    
                    await axios.post('http://localhost:8000/postQComment', comment)
                    setComments([comment, ...comments])
                }
                if(answer) {
                    let comment = {
                        text: commentText,
                        com_by: userInfo.username,
                        com_date_time: new Date(),
                        votes: 0,
                        aid: answer.aid
                    }
                    await axios.post('http://localhost:8000/postAComment', comment)
                    setComments([comment, ...comments])
                }
            } catch { console.log(errors); }
        } else setFormErrors(errors);
    }

    const validateForm = ({commentText}) => {
        const errors = {};
        if(commentText.length === 0) errors.commentText = emptyFieldStr;
        const tokens = commentText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\(\s*(https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        if(tokens) {
            for(let token of tokens) if(!regex.test(token))
                errors.ansText = "Hyperlink in answer text invalid. Must be of the form [text](link).";
        }
        return errors;
    }

    return (
        <div className="comment-container">
            <div className="comments">{currDisplayedComments.map((c) => <Comment key={c.cid} comment={c} />)}</div>
            {insertComment
                ? <form id='post-comment' onSubmit={handleSubmit}>
                    <input type='text' name='commenttext' />
                    {formErrors.commentText && <ErrorMessage errMsg={formErrors.commentText} />}
                    <input type='submit' value="Post Comment" />
                </form>
                : <div id="add-comment-container"><button id="add-comment" type="button" onClick={() => {showInsertComment(!insertComment)}}>Add Comment</button></div>
            }
            {comments.length > 3 && <CommentNav coms={comments} setDisplayedComments={setDisplayedComments} />}
        </div>
    )
}

function Comment({comment}) {
    return (
        <div className="comment">
            <div className="votes">
                    <p className="upvote" onClick={() => {
                        const incQVote = async() => {
                            try { await axios.post('http://localhost:8000/incCVote', comment) }
                            catch(error) { console.log(error) }
                        }
                        incQVote();
                    }}>🡅</p>
                    {comment.votes}
                    <p className="downvote" onClick={() => {
                        const decQVote = async() => {
                            try { await axios.post('http://localhost:8000/decCVote', comment) }
                            catch(error) { console.log(error) }
                        }
                        decQVote();
                    }}>🡇</p>
                </div>
            <div><Text text={comment.text} /></div>
            <DateMetadata comment={comment} />
        </div>
    )
}

function CommentNav(props) {
    const commentChunks = splitArray(props.coms, 3);
    const setDisplayedComments = props.setDisplayedComments;

    return (
        <div id="nav-button-container">
            {commentChunkInd !== 0 && 
                <div id="prev-button" onClick={() => {
                    if(commentChunkInd > 0) {
                        commentChunkInd--;
                        setDisplayedComments(commentChunks[commentChunkInd]);
                    }
                }}>◄ Prev</div>
            }
            {commentChunkInd === 0 && <div />}
            {commentChunkInd !== commentChunks.length - 1 &&
                <div id="next-button" onClick={() => {
                    if(commentChunkInd < commentChunks.length - 1) {
                        commentChunkInd++;
                        setDisplayedComments(commentChunks[commentChunkInd]);
                    }
                }}>Next ►</div>
            }
        </div>
    )
}