import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, TouchableWithoutFeedback, Dimensions  } from 'react-native';
import { useNavigation, useRoute, CommonActions, NavigationContainer } from '@react-navigation/native';
import RNSwipeVerify from '../swipeVerify'
import {Database} from "../../Database.js"
import { LogBox } from 'react-native';
import { positionsData } from './positions';

const db = new Database("result.db");
let tid = 0;
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
    const scrollWidth = Dimensions.get('window').width
    var btnSize = Dimensions.get('window').width*0.2
    const [positionArray, setPositionArray] = useState(posi)
    let prod = route.params.product
    let dev = route.params.device
    let pid = route.params.PID

    //create entry in swipe test summary table at start
    useEffect(() => {
        //function to write testid data to db
        async function writeData() {
            const res1 = await db.execute("insert into summary (device, testProduct, testStatus, testType, pid) values (?, ?, ?, ?, ?)", [dev,prod,false,"scrolling",pid])
            tid = res1.insertId
        }
        writeData()
        console.log(pid)
        },[])

    //function to execute on successful scroll
    async function handleVerify(){
        //calculate time to scroll
        let timeElapsed = ((new Date() * 1) - startTime)/1000
        await db.execute("insert into scrollResult (tid, xPos, yPos, alignment, trials, timeTaken) values (?,?,?,?,?,?)",[tid, positionArray[upd].left, positionArray[upd].bottom, positionArray[upd].alignment, trials, timeElapsed])    
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
                        params:  {tid: tid, device: dev, product: prod, pid: pid}
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
        btnSize = positionArray[upd].alignment == 90 || positionArray[upd].alignment == 270?Dimensions.get('window').width*0.2:Dimensions.get('window').height*0.1
    }, [upd,positionArray])

    //on start scroll, start timing
    function handleStart(){
        if(trials == 0){
            setStartTime(new Date() * 1)
        }
        setTrials(trials+1)
    }

    return (
        <View style={{...styles.container}}>
            <View style={{height:btnSize, bottom:positionArray[upd].bottom+"%" ,left:positionArray[upd].left+"%",width:scrollWidth ,position: "absolute", transform: [{ rotate: positionArray[upd].alignment + "deg" }]}}  onTouchStart={handleStart}>
            <RNSwipeVerify ref={swipeComp}
                width={scrollWidth}
                buttonSize={btnSize}
                borderColor="#fff"
                backgroundColor="#ececec"
                textColor="#37474F"
                borderRadius = {30}
                alignment = {positionArray[upd].alignment}
                onVerified={handleVerify}
            >
                <Text>scroll button to end and release</Text>
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
});