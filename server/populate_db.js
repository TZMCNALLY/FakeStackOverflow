// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

/**
 * Extra code has been put in this file in order to implement users and comments.
 */
let User = require('./models/users')
let Comment = require('./models/comments')
let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')


let mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];

function userCreate(username, email, passwordHash) {
  userdetail = {
    username: username,
    email: email,
    passwordHash: passwordHash,
    role: 'USER',
    reputation: 0,
    timeJoined: new Date()
  }
  let user = new User(userdetail);
  return user.save();
}

function commentCreate(text, com_by) {
  commentDetail = {
    text: text,
    posted_by: com_by,
    com_date_time: new Date(),
    votes: 0
  }
  let comment = new Comment(commentDetail);
  return comment.save();
}

function tagCreate(name, creator) {
  let tag = new Tag({ name: name, created_by: creator});
  return tag.save();
}

function answerCreate(text, ans_by, ans_date_time, comments) {
  answerdetail = {text:text};
  if (ans_by != false) answerdetail.posted_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (comments != false) answerdetail.comments = comments;

  let answer = new Answer(answerdetail);
  return answer.save();
}

function questionCreate(title, summary, text, tags, answers, asked_by, ask_date_time, views, comments) {
  qstndetail = {
    title: title,
    summary: summary,
    text: text,
    tags: tags,
    posted_by: asked_by
  }
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if(views != false) qstndetail.views = views;
  if (comments != false) qstndetail.comments = comments;

  let qstn = new Question(qstndetail);
  return qstn.save();
}

const populate = async () => {
  let u1 = await userCreate('hamkalo', 'hamkalo@gmail.com', '123')
  let u2 = await userCreate('azad', 'azad@gmail.com', '123')
  let u3 = await userCreate('abaya', 'abaya@gmail.com', '123')
  let u4 = await userCreate('alia', 'alia@gmail.com', '123')
  let u5 = await userCreate('sana', 'sana@gmail.com', '123')
  let u6 = await userCreate('Joji John', 'jojijohn@gmail.com', '123')
  let u7 = await userCreate('saltyPeter', 'saltypeter@gmail.com', '123')
  let c1 = await commentCreate('This is a comment :)', u1)
  let c2 = await commentCreate('Good post! 1 Reddit Gold for you.', u7)
  let t1 = await tagCreate('react', u6);
  let t2 = await tagCreate('javascript', u7);
  let t3 = await tagCreate('android-studio', u7);
  let t4 = await tagCreate('shared-preferences', u7);
  let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.\nhistory for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.',
    u1, false);
  let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.',
    u2, false);
  let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.',
    u3, false);
  let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);',
    u4, false);
  let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own.',
    u5, false);
  await questionCreate('Programmatically navigate using React router', 'Need help with React router.', 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.',
    [t1, t2], [a1, a2], u6, false, false);
  await questionCreate('android studio save string shared preference, start activity and load the saved string', 'How do I use strings with android studio?', 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.',
    [t3, t4, t2], [a3, a4, a5], u7, false, 121, [c1, c2]);
  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');
