import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, TouchableWithoutFeedback, Dimensions,StatusBar  } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import {Database} from "../Database"

const db = new Database("result.db");
let tid = 0;
let timer

export const ExpButton = (props) => {
    const navigation = useNavigation();
    const route = useRoute();
    const [xPos, setXPos] = useState([])
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
            console.log(typeof prod)
            const res1 = await db.execute("insert into summary (device, testProduct, testStatus, testType, pid, posture, testHand) values (?, ?, ?, ?, ?, ?, ?)", [dev,prod,false,"tapping",pid, posture, testhand])
            tid = res1.insertId
            console.log(res1)
        }
        writeData()
        StatusBar.setHidden(true)

        //generate position data and set to array
        for(let i=0;i<100;i+=10){
            for(let j=0;j<100;j+=20){
                data.push({bottom: String(i) + "%", right: String(j) + "%"})
            }
        }
        return setXPos([...data , ...data]);
    },[])

    //cleanup to clear timeouts on component unmount
    useEffect(() => {
        return () => {
            StatusBar.setHidden(false,'slide')
            clearTimeout(timer);
          };
    },[])

    const [position, setPosition] = useState(0)
    const [startTime, setStartTime] = useState(new Date() * 1)
    const [backColor, setBackColor] = useState("#0F4C75")
    //function to handle correct button press
    let changePosition = arg1 => async () => {
        let elapsedTime = (new Date() * 1) - startTime
        let tapZone
        if(testhand=='Left'){
            console.log(parseFloat(xPos[position].right))
            if(parseFloat(xPos[position].bottom)<45 && parseFloat(xPos[position].right)<45){
                tapZone = 1
                console.log("zone 1")
            }else{
                tapZone = 2
                console.log("zone 2")
            }
        }else{
            console.log(parseFloat(xPos[position].right))
            if(parseFloat(xPos[position].bottom)<45 && parseFloat(xPos[position].right)>35){
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
            let randIndex = Math.floor(Math.random() * xPos.length)
            setPosition(randIndex)
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
        width: Dimensions.get('window').width * 0.2,
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