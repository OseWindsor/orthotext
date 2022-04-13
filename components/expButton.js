import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, TouchableWithoutFeedback, Dimensions,StatusBar,Alert  } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { Orientation } from 'expo-orientation-sensor'
import {Database} from "../Database"

const db = new Database("result.db");
let tid = 0;
let timer
let interval

export const ExpButton = (props) => {
    const navigation = useNavigation();
    const [testID, setTestID] = useState(0)
    const [time, setTime] = React.useState(0);
    const route = useRoute();
    const [xPos, setXPos] = useState([])
    const [angles, setAngles] = useState({
        yaw: 0,
        pitch: 0,
        roll: 0,
      })
    let prod = route.params.product
    let dev = route.params.device
    let pid = route.params.PID
    let posture = route.params.posture
    let testhand = route.params.hand

    //function to run onMount
    useEffect(() => {
        navigation.setOptions({
            headerShown:false,
            headerLeft: () => (<View></View>),
            headerRight: () => (<View style={{flexDirection:"row"}}>
                <Button onPress = {()=>navigation.goBack()} title = 'Quit' color = "#f11e"></Button>
                </View>)
        })
        let data = []
        //function to write testid data to db
        async function writeData() {
            //console.log(typeof prod)
            const res1 = await db.execute("insert into summary (device, testDate, testProduct, testStatus, testType, pid, posture, testHand) values (?, DateTime('now', 'localtime'), ?, ?, ?, ?, ?, ?)", [dev,prod,false,"tapping",pid, posture, testhand])
            tid = res1.insertId
            setTestID(tid)
            console.log(res1)
        }
        writeData()
        StatusBar.setHidden(true)

        //generate position data and set to array
        for(let j=0;j<100;j+=25){
            for(let i=90;i>=0;i-=10){
                data.push({bottom: String(i) + "%", right: String(j) + "%"})
            }
        }
        //console.log(data)
        return setXPos([...data]);
    },[])

    //cleanup to clear timeouts on component unmount
    useEffect(() => {
        const subscriber = Orientation.addListener(angleData => {
            setAngles(angleData)
          })
        return () => {
            StatusBar.setHidden(false,'slide')
            clearTimeout(timer);
            subscriber.remove()
          };
    },[])

    //one second clock tick
    useEffect(() => {
        interval = setInterval(() => {
        if(testID>0){
            setTime(prevTime => prevTime + 1);
        } 
        }, 500);
        return () => clearInterval(interval);
    }, [testID]);

    //function to write angles data to db
    async function writeAngles(testid,roll,pitch,yaw){
        const res1 = await db.execute("insert into deviceAngles (tid,pitch,roll,yaw) values (?,?,?,?)", [testid,pitch,roll,yaw])
        const res2 = await db.execute("select * from deviceAngles where tid = ?", [testid])
        console.log(res2.rows[res2.rows.length-1])
    }

    //initiate angleswrite function on tick
    useEffect(() => {
        if(time==1){
            Orientation.setUpdateInterval(200)
        }
        let pitch = ((((angles.pitch*180)/Math.PI)+180).toFixed(0))
        if(pitch>180){
            pitch = pitch - 360
        }
        let roll = ((((angles.roll*180)/Math.PI)).toFixed(0))
        let yaw = ((((angles.yaw*180)/Math.PI)).toFixed(0))
        if(testID>0){
            if(Orientation.listenerCount>0){
                writeAngles(testID,roll,pitch,yaw)
            }
            else{
                clearInterval(interval)
                Alert.alert(
                    "No listerners",
                    "No sensor listeners - Restart test to try again",
                    [
                      { text: "OK", onPress: navigation.goBack }
                    ]
                  );
            }
        }
    }, [time]);


    const [position, setPosition] = useState(0)
    const [startTime, setStartTime] = useState(new Date() * 1)
    const [backColor, setBackColor] = useState("#0F4C75")
    //function to handle correct button press
    let changePosition = arg1 => async () => {
        let elapsedTime = (new Date() * 1) - startTime
        let tapZone
        if(testhand=='Left'){
            console.log(parseFloat(xPos[position].right))
            if(parseFloat(xPos[position].right)>45){
                tapZone = 1
                //console.log("zone 1")
            }else{
                tapZone = 2
                //console.log("zone 2")
            }
        }else{
            //console.log(parseFloat(xPos[position].right))
            if(parseFloat(xPos[position].right)<45){
                tapZone = 1
                console.log("zone 1")
            }else{
                tapZone = 2
                console.log("zone 2")
            }
        }
        if(arg1 == 0){ //on accurate press condition
            //insert data to result table
            await db.execute("insert into tapResult (tid, yPos, xPos, rightClick, timeTaken, tapZone) values (?, ?, ?, ?, ?, ?)", [tid, parseFloat(xPos[position].bottom), parseFloat(xPos[position].right), true, elapsedTime/1000,tapZone])
        }else{ //on inaccurate press condition
            await db.execute("insert into tapResult (tid, yPos, xPos, rightClick, timeTaken, tapZone) values (?, ?, ?, ?, ?, ?)", [tid, parseFloat(xPos[position].bottom), parseFloat(xPos[position].right), false, elapsedTime/1000,tapZone])
        }

        //after db update remove element from positions array
        xPos.splice(position,1)

        //perform state updates depending on array length and touch accuracy
        if(xPos.length == 0){
            //navigate to resultPage and reset navaigation states -- done to ensure correct back button behavior from results page
            await db.execute("update summary set testStatus = ? where id = ?",[true, tid])
            navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                { name: 'Home' },
                {
                    name: 'resultPage',
                    params:  {tid: tid, device: dev, product: prod, pid:pid, testhand:testhand,posture:posture}
                },
                ],
            })
            );
        }else{
            if(arg1 == 1){
                setBackColor("#ff0000")
                timer = setTimeout(function(){
                    setBackColor("#0F4C75")
                }, 100);
            }else{
                setBackColor("#00ff00")
                timer = setTimeout(function(){
                    setBackColor("#0F4C75")
                }, 100);
            }
            setStartTime(new Date() * 1)
            if(xPos.length>20){
                let randIndex = Math.floor(Math.random() * (xPos.length-20))
                setPosition(randIndex)
            }else{
                let randIndex = Math.floor(Math.random() * xPos.length)
                setPosition(randIndex)
            }
        }
    }

    return (

         <View style={{...styles.container}}>
            <TouchableWithoutFeedback onPress = {changePosition(1)}>
            <View style={styles.errorContainer}/>
            </TouchableWithoutFeedback>
            <TouchableOpacity onPress = {changePosition(0)} style={{...styles.roundButton, ...xPos[position], backgroundColor:backColor}}>
                <Text style={{fontWeight:"bold",color:"white"}}>{xPos.length}</Text>
            </TouchableOpacity>
        </View>

    )
  }

  const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
 
    roundButton: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: Dimensions.get('window').width * 0.25,
        height: Dimensions.get('window').height * 0.1,
        backgroundColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 7,
    },
    errorContainer: {
        flex: 1,
        backgroundColor:"#DDDDDD"
      },
  });