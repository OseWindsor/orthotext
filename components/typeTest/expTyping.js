import React from "react";
import {SafeAreaView, StyleSheet, TextInput, View, Text } from "react-native";
import { useNavigation, useRoute, CommonActions, NavigationContainer } from '@react-navigation/native';
import {sampleSentences} from './sentences'
import {Database} from "../../Database.js"
let wrongIndexes
let accurateStrokes, inaccurateStrokes, startTime, completedIndex, accuracyIndex, wordLength, wordMistakes, nextWordLength, arr, trialCount, rawwpm
const db = new Database("result.db");
let tid = 0;
let timer

export const ExpType = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [text, setText] = React.useState('');
  const [trialState, setTrialState] = React.useState(0);
  const [inputText, setInputText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [sentence, setSentence] = React.useState(sampleSentences[6].sentence)
  const [chars,setChars] = React.useState([...sentence])
  const [charColor,setCharColor] = React.useState([])
  const [prevCount,setPrevCount] = React.useState(0)
  const [typingAccuracy, setAccuracy] = React.useState(0)
  const [wordspm, setWPM] = React.useState(0)
  const [rawwordsPM, setrawWPM] = React.useState(0)
  let clr = charColor
  let chrs = chars
  const inputBox = React.useRef();
  let prod = route.params.product
  let dev = route.params.device
  let testType = route.params.testMode 
  let pid = route.params.PID

  //function to record results
  async function recordData(){
    let timeNow = Date.now()*1
    let timeElapsed = startTime==0?0:((timeNow - startTime)/1000)
    let rec = await db.execute("insert into typeResult (tid,trialNumber,wpm,accuracy,timeElapsed) values (?,?,?,?,?)",[tid,trialCount,wordspm,typingAccuracy,timeElapsed])
    let result = await db.execute("select timeElapsed, accuracy, trialNumber from typeResult where tid = ?",[tid])
    console.log(result.rows)
  }

  async function updateStatus(){
    await db.execute("update summary set testStatus = ? where id = ?", [true, tid])
  }

  function navigateHome(){
    navigation.dispatch(
      CommonActions.reset({
          index: 1,
          routes: [
          { name: 'Home' },
          {
              name: 'typeResultPage',
              params:  {tid: tid, device: dev, product: prod, pid: pid}
          },
          ],
      })
      );
  }

  //initialize values on first render
  React.useEffect(() => {
    async function writeData() {
      const res1 = await db.execute("insert into summary (device, testProduct, testStatus, testType, testMode, pid) values (?, ?, ?, ?, ?, ?)", [dev,prod,false,"typing",testType,pid])
      tid = res1.insertId
      console.log(tid)
    }
    writeData()
    trialCount = 0
    arr = [];
    while(arr.length < 5){
        var r = Math.floor(Math.random() * (50 - 1 + 1) + 1)
        if(arr.indexOf(r) === -1) arr.push(r);
    }
    console.log(arr)
    setSentence(sampleSentences[arr[trialCount]].sentence)
    trialCount = trialCount + 1
    setTrialState(trialCount)
    wrongIndexes = []
    accurateStrokes = 0
    inaccurateStrokes = 0
    completedIndex = 0
    startTime = 0
    accuracyIndex = 0
    wordLength = 0
    rawwpm = 0
    let j=0
    nextWordLength = 0
    while(chars[j] != " "){
      nextWordLength = nextWordLength + 1
      j++
    }
  },[])

  //re-initialize values on trial update
  React.useEffect(()=>{
    wrongIndexes = []
    accurateStrokes = 0
    inaccurateStrokes = 0
    completedIndex = 0
    startTime = 0
    accuracyIndex = 0
    wordLength = 0
    console.log(trialCount)
    setChars([...sentence])
    setCharColor([])
    setPrevCount(0)
    setAccuracy(0)
    setWPM(0)
    setCurrentIndex(0)
    setInputText('')
    setText('')
    setTickState(false)
    clearInterval(timer)
  },[sentence])

  //record data every 3 seconds
  const [timerTick, setTimerTick] = React.useState(0)
  const [tickState, setTickState] = React.useState(false)
  React.useEffect(()=>{
    if(tickState){
      timer = setInterval(() => {
        setTimerTick((timerTick)=>timerTick+1)
      }, 3000);
    }
  return () => clearInterval(timer);
  },[tickState])

  React.useEffect(()=>{
    //console.log(timerTick)
    recordData()
  },[timerTick])


  const pressTrigger = (text) =>{
    //console.log(text)
    if(startTime == 0){
      startTime = Date.now()*1
      setTickState(true)
      console.log(startTime)
    }
    setPrevCount(text?.length)
    if(prevCount>text?.length){
      console.log('Backspace')
      //keyPressEvent('Backspace')
    }
    else{
      if(text){
        keyPressEvent(text[text?.length-1])
      }
    }
  }

  const keyPressEvent = (enteredChar) =>{
      if(enteredChar != 'Backspace'){
        //if trial count < 5, move to next trial or navigate home
        if(currentIndex+1==sentence.length && (testType == 'noDelete' || testType == 'skip')){
          recordData()
          if(trialCount == 5){
            updateStatus()
            navigateHome()
          }else{
            setSentence(sampleSentences[arr[trialCount]].sentence)
            trialCount = trialCount + 1
            setTrialState(trialCount)
          }
        }else if(currentIndex-wrongIndexes.length+1==sentence.length){
          recordData()
          if(trialCount == 5){
            updateStatus()
            navigateHome()
          }else{
            setSentence(sampleSentences[arr[trialCount]].sentence)
            trialCount = trialCount + 1
            setTrialState(trialCount)
          }
        }

        //if correct character is entered =>
        if (chars[currentIndex] == " " && testType == 'skip'){
          if(wrongIndexes.length > 0){
            completedIndex = wrongIndexes[0]
          }else{
            completedIndex = currentIndex+1
          }
        }
        if(enteredChar==chars[currentIndex]){
          //when space is pressed, if no inaccuacies in completed word, prevent backspace
          console.log(chars[currentIndex])
          if (chars[currentIndex] == " " && testType == 'insert'){
            if(wrongIndexes.length > 0){
              completedIndex = wrongIndexes[0]
            }else{
              completedIndex = currentIndex+1
            }
          }

          //calculate and set accuracy
          if(currentIndex==accuracyIndex){
            accuracyIndex = currentIndex +1 
            accurateStrokes = accurateStrokes + 1
            let acc = (accurateStrokes/(accurateStrokes+inaccurateStrokes)*100).toFixed(2)
            setAccuracy(acc)
          }
          //calculate and set WPM
          let timeNow = Date.now()*1
          let timeElapsed = (timeNow - startTime)/60000
          let wpm = (accurateStrokes/5)/timeElapsed
          setWPM(wpm.toFixed(2))
          //set char bgColor to green
          clr[currentIndex]="#1C7947"
          setCharColor([...clr])
          setCurrentIndex(currentIndex+1)
        }else{
          if(currentIndex-wrongIndexes.length+1>sentence.length){
            return null
          }
          //calculate and set accuracy
          if(currentIndex==accuracyIndex){
            accuracyIndex = currentIndex +1
            inaccurateStrokes = inaccurateStrokes + 1
            let acc = (accurateStrokes/(accurateStrokes+inaccurateStrokes)*100).toFixed(2)
            setAccuracy(acc)
          }
          //calculate and set WPM
          let timeNow = Date.now()*1
          let timeElapsed = (timeNow - startTime)/60000
          let wpm = (accurateStrokes/5)/timeElapsed
          setWPM(wpm.toFixed(2))
          //set char bgColor to red
          clr[currentIndex]="#E94560"
          if(testType=='insert'){
            chrs.splice(currentIndex,0,enteredChar)
            setChars([...chrs])
            setCharColor([...clr])
            wrongIndexes.push(currentIndex)
          }else{
            wrongIndexes.push(currentIndex)
          }
          setCurrentIndex(currentIndex+1)
        }
      }else{
        //prevent backspace to completed word
        if(currentIndex == completedIndex){
          return null
        }
        if(testType!='noDelete'){
          //console.log(currentIndex)
          setText(text.slice(0, -1))
          //console.log(wrongIndexes)
          if(testType=='insert'){
            if(wrongIndexes.includes(currentIndex-1)){
              chrs.splice(currentIndex-1,1)
              setChars([...chrs])
              wrongIndexes.splice(wrongIndexes.indexOf(currentIndex-1), 1);
              accuracyIndex = accuracyIndex - 1
            }
          }else{
            if(wrongIndexes.includes(currentIndex-1)){
              wrongIndexes.splice(wrongIndexes.indexOf(currentIndex-1), 1);
            }
          }
          clr[currentIndex-1]="#393E46"
          setCharColor([...clr])
          currentIndex>0?setCurrentIndex(currentIndex-1):0
        }
      }
  }

  return (
    <SafeAreaView style={{flex:1, backgroundColor: "#393E46"}}>
        <View style = {{flexDirection: "row", height: "10%", justifyContent: "space-evenly", alignItems: "stretch", marginTop: 20}}>
          <View style={{borderWidth: 1, width: "30%", alignItems: "center", justifyContent: "space-evenly", borderRadius: 20, backgroundColor: "white"}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Trial</Text>
            <Text>{trialState} of 5</Text>
          </View>
          <View style={{borderWidth: 1, width: "30%", alignItems: "center", justifyContent: "space-evenly", borderRadius: 20, backgroundColor: "white"}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Accuracy</Text>
            <Text>{typingAccuracy} %</Text>
          </View>
          <View style={{borderWidth: 1, width: "30%", alignItems: "center", justifyContent: "space-evenly", backgroundColor: "white", borderRadius: 20}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>WPM</Text>
            <Text>{wordspm}</Text>
          </View>
        </View>
        <View style={{paddingHorizontal:20, position: "absolute",top:"20%",flex:1,  backgroundColor: "#393E46"}}>
          <Text style={{fontSize:20, textAlign: "left", lineHeight: 30}}>
          {chars.map((char, index) => (
            <Text key = {index} style={{color: "white", textDecorationLine:currentIndex==index?"underline":"none", backgroundColor: charColor[index]?charColor[index]:"#393E46"}}>{char}</Text>
          ))}
          </Text>
        </View>  
        <View style={{position: "absolute",top:"0%", padding:0, flex:1, width: "100%", height: "100%"}}>
        <TextInput style={{ fontSize:20, ...styles.input }} value = {inputText}
            onChangeText = {inputText => setInputText(inputText)}
            onChange = {e => {
              pressTrigger(e.nativeEvent.text)
            }}
            autoCorrect = {false}
            autoCapitalize = {'none'}
            autoComplete = {'off'}
            caretHidden = {true}
            onKeyPress = {e => {
              if(e.nativeEvent.key == 'Backspace'){
                keyPressEvent('Backspace')
              }
            }}
            ref = {inputBox}
            keyboardType = 'default'/>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: "100%",
    margin: 0,
    borderWidth: 0,
    color:'rgba(52, 52, 52, 0)'
    
  },
});
