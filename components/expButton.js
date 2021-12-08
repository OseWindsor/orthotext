import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, TouchableWithoutFeedback, Dimensions  } from 'react-native';
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

    //function to run onMount
    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (<View></View>),
            headerRight: () => (<View style={{flexDirection:"row"}}>
                <Button onPress = {()=>navigation.goBack()} title = 'Quit' color = "#f11e"></Button>
                </View>)
        })
        let data = []
        //function to write testid data to db
        async function writeData() {
            console.log(typeof prod)
            const res1 = await db.execute("insert into summary (device, testProduct, testStatus, testType, pid) values (?, ?, ?, ?, ?)", [dev,prod,false,"tapping",pid])
            tid = res1.insertId
            console.log(res1)
        }
        writeData()

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
            clearTimeout(timer);
          };
    },[])

    const [position, setPosition] = useState(0)
    const [startTime, setStartTime] = useState(new Date() * 1)
    const [backColor, setBackColor] = useState("orange")
    //function to handle correct button press
    let changePosition = arg1 => async () => {
        console.log(xPos.length)
        console.log("Hello")
        let elapsedTime = (new Date() * 1) - startTime
        if(arg1 == 0){ //on accurate press condition
            //insert data to result table
            await db.execute("insert into tapResult (tid, yPos, xPos, rightClick, timeTaken) values (?, ?, ?, ?, ?)", [tid, parseFloat(xPos[position].bottom), parseFloat(xPos[position].right), true, elapsedTime/1000])
        }else{ //on inaccurate press condition
            await db.execute("insert into tapResult (tid, yPos, xPos, rightClick, timeTaken) values (?, ?, ?, ?, ?)", [tid, parseFloat(xPos[position].bottom), parseFloat(xPos[position].right), false, elapsedTime/1000])
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
                    params:  {tid: tid, device: dev, product: prod, pid:pid}
                },
                ],
            })
            );
        }else{
            if(arg1 == 1){
                setBackColor("#ff0000")
                timer = setTimeout(function(){
                    setBackColor("orange")
                }, 100);
            }else{
                setBackColor("#00ff00")
                timer = setTimeout(function(){
                    setBackColor("orange")
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
            <View style={styles.container}/>
            </TouchableWithoutFeedback>
            <TouchableOpacity onPress = {changePosition(0)} style={{...styles.roundButton, ...xPos[position], backgroundColor:backColor}}>
                <Text>{xPos.length}</Text>
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
        borderRadius: 30,
        width: Dimensions.get('window').width * 0.2,
        height: Dimensions.get('window').width * 0.2,
        backgroundColor: 'orange',
    },
  });