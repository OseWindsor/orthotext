import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, TouchableWithoutFeedback, Dimensions, Alert  } from 'react-native';
import { useNavigation, useRoute, CommonActions, NavigationContainer } from '@react-navigation/native';
import RNSwipeVerify from '../swipeVerify'
import {Database} from "../../Database.js"
import { LogBox } from 'react-native';
import { positionsData } from './positions';

const db = new Database("result.db");
let tid = 0;
var timer
var interval
const { width } = Dimensions.get('window')
//ignore nativeDriver warning logs
LogBox.ignoreLogs(['Animated: `useNativeDriver`']);

export const ExpScroll = (props) => {
    const navigation = useNavigation();
    const route = useRoute();
    const posi = JSON.parse(JSON.stringify(positionsData));
    const swipeComp = useRef(null)
    const [upd, setUpd] = useState(0)
    const [startTime, setStartTime] = useState(new Date() * 1)
    const [trials, setTrials] = useState(0)
    const [scrollWidth,setScrollWidth] = useState(Dimensions.get('window').height/2)
    const [btnSize,setBtnSize] = useState(Dimensions.get('window').width*0.2)
    const [positionArray, setPositionArray] = useState(posi)
    const [scrollText, setScrollText] = useState("Scroll to end and release. \n" + "Long press outside to quit.\n40 more trials.")
    let prod = route.params.product
    let dev = route.params.device
    let pid = route.params.PID
    let posture = route.params.posture
    let testHand = route.params.hand

    //create entry in swipe test summary table at start
    useEffect(() => {
        navigation.setOptions({
            headerShown:false,
            gestureEnabled:false
        })
        //function to write testid data to db
        async function writeData() {
            const res1 = await db.execute("insert into summary (device, testProduct, testStatus, testType, pid, posture, testHand) values (?, ?, ?, ?, ?, ?, ?)", [dev,prod,false,"scrolling",pid,posture,testHand])
            tid = res1.insertId
        }
        writeData()
        console.log(pid)
    },[])

    const createTwoButtonAlert = () =>
    Alert.alert(
      "Quit Test",
      "Are you sure you want to discard this test and quit?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Quit", onPress: navigation.goBack }
      ]
    );

    //cleanup to clear timeouts on component unmount
    useEffect(() => {
        return () => {
            clearTimeout(timer);
            clearInterval(interval)
            };
    },[])

    //function to execute on successful scroll
    async function handleVerify(clickResult){
        clearInterval(interval)
        clearTimeout(timer)
        setScrollText("Scroll to end and release. \nLong press outside to quit.\n" + (positionArray.length-1) + " more trials")
        //calculate time to scroll
        let timeElapsed = ((new Date() * 1) - startTime)/1000
        await db.execute("insert into scrollResult (tid, xPos, yPos, alignment, trials, timeTaken,rightClick) values (?,?,?,?,?,?,?)",[tid, positionArray[upd].left, positionArray[upd].bottom, positionArray[upd].alignment, trials, timeElapsed,clickResult])    
        positionArray.splice(upd,1)
        if(positionArray.length==0){
            await db.execute("update summary set testStatus = ? where id = ?", [true, tid])
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                    { name: 'Home' },
                    {
                        name: 'scrollResultPage',
                        params:  {tid: tid, device: dev, product: prod, pid: pid, posture:posture,testHand:testHand}
                    },
                    ],
                })
                );
        }else{
            let randIndex = Math.floor(Math.random() * positionArray.length)
            setUpd(randIndex)
            setPositionArray([...positionArray])
            swipeComp.current.reset()
            setTrials(0)
        }
    }

    //set btnSize on position update
    useEffect(() => {
        positionArray[upd].alignment == 90 || positionArray[upd].alignment == 270?setBtnSize(Dimensions.get('window').width*0.2):setBtnSize(Dimensions.get('window').height*0.1)
        positionArray[upd].alignment == 90 || positionArray[upd].alignment == 270?setScrollWidth(Dimensions.get('window').height/2):setScrollWidth(Dimensions.get('window').width)
    }, [upd,positionArray])

    //on start scroll, start timing
    function handleStart(){
        console.log(timer)
        if(trials == 0){
            let countDown = 5
            setScrollText(countDown +"s to complete")
            countDown=countDown - 1
            setStartTime(new Date() * 1)
            interval = setInterval(function(){
                if(countDown>-1){
                    setScrollText(countDown +"s to complete")
                    countDown=countDown - 1
                }
            }, 1000)
            timer = setTimeout(function(){
                Alert.alert("Trial skipped")
                handleVerify(false)
            }, 5000);
        }
        setTrials(trials+1)
    }

    return (
        <View style={{...styles.container, alignItems:"center",justifyContent:positionArray[upd].justify}}>
            <TouchableWithoutFeedback onPress = {()=>handleVerify(false)} onLongPress={createTwoButtonAlert}>
                <View style={{...styles.errorContainer,borderWidth:1,position:"absolute",height:"100%",width:"100%"}}/>
            </TouchableWithoutFeedback>
            <View style={{height:btnSize,width:scrollWidth ,left:positionArray[upd].left + "%",bottom:positionArray[upd].bottom, transform: [{ rotate: positionArray[upd].alignment + "deg" }]}}  onTouchStart={handleStart}>
            <RNSwipeVerify ref={swipeComp}

                buttonSize={btnSize}
                borderColor="#fff"
                backgroundColor="#ececec"
                textColor="#37474F"
                borderRadius = {30}
                alignment = {positionArray[upd].alignment}
                onVerified={()=>handleVerify(true)}
            >
                <Text>{scrollText}</Text>
            </RNSwipeVerify>
            </View>
        </View>
    )
  }

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: "#fff",
    },    
roundButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.2,
    height: Dimensions.get('window').width * 0.2,
    backgroundColor: 'orange',
    alignSelf:"center",
    },
errorContainer: {
        flex: 1,
        backgroundColor: "#DDDDDD",
        }, 
});